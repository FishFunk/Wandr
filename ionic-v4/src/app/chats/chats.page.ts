import { Component } from '@angular/core';
import { IChat } from '../models/chat';
import { LoadingController, Events, NavController, AlertController } from '@ionic/angular';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import _ from 'underscore';
import { Constants } from '../helpers/constants';
import { FacebookApi } from '../helpers/facebookApi';

@Component({
  selector: 'app-chats',
  templateUrl: 'chats.page.html',
  styleUrls: ['chats.page.scss']
})
export class ChatsPage {
  
  chats:  IChat[] = [];
  private userId: string;

  constructor(
    private dbHelper: FirestoreDbHelper,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private logger: Logger,
    private events: Events,
    private navCtrl: NavController
  ){
    this.userId = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.events.subscribe(Constants.refreshChatDataEvent, this.loadChats.bind(this));
  }

  ionViewDidEnter(){
    this.loadChats();
  }

  async loadChats(){
    const spinner = await this.loadingCtrl.create({
      spinner: 'dots'
    });
    spinner.present();
    
    var user = await this.dbHelper.ReadUserByFirebaseUid(this.userId)
      .catch(async error=>{
        await spinner.dismiss();
        await this.showLoadFailurePrompt();
        await this.logger.Error(error);
      });
    
    if(user && user.roomkeys && user.roomkeys.length > 0){
      await this.queryChats(user.roomkeys);
    } else {
      this.chats = [];
    }

    this.events.publish(Constants.updateBadgeCountEventName, this.getBadgeCount());

    spinner.dismiss();
  }

  onClickChat(chat: IChat){
    const showProfileButton = true;
    this.navCtrl.navigateForward(`/messages/${chat.roomkey}/${showProfileButton}`);
  }

  onClickExplore(){
    this.navCtrl.navigateForward('/tabs/map');    
  }

  onClickInvite(){
    this.navCtrl.navigateForward('/tabs/social');
  }

  getClass(chat: IChat){
    if(this.userId == chat.userA_id){
      return chat.userA_unread ? 'unread' : '';
    }
    else if (this.userId == chat.userB_id){
      return chat.userB_unread ? 'unread' : '';
    } 
    else {
      return '';
    }
  }

  private async showLoadFailurePrompt(){
    const alert = await this.alertCtrl.create({
      message: "Hmm, looks like something went wrong loading your chats.",
      buttons: [
        {
          text: "Not Now",
          handler: ()=>{}
        },
        {
        text: "Retry?",
        handler: ()=>{
          this.loadChats();
        }
      }]
    });

    alert.present();
  }

  private async queryChats(roomkeys: string[]): Promise<any>{

    this.chats = await this.dbHelper.ReadUserChats(roomkeys)
      .catch(async error=>{
        await this.logger.Error(error);
        await this.showLoadFailurePrompt();
        return Promise.resolve([]);
      });
  }

  private getBadgeCount(): number{
    let badgeCount = 0;

    _.each(this.chats, (chatObj)=>{
      if(this.userId == chatObj.userA_id && chatObj.userA_unread) {
        badgeCount++;
      } else if (this.userId == chatObj.userB_id && chatObj.userB_unread) {
        badgeCount++;
      }
    });
    
    return badgeCount;
  }
}
