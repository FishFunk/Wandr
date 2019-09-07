import { Component } from '@angular/core';
import { IChat, IMessage } from '../models/chat';
import { LoadingController, Events, NavController, AlertController, IonItemSliding } from '@ionic/angular';
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
  private user_name: string;
  private user_roomkeys: string[] = [];

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
      this.user_name = user.first_name;
      this.user_roomkeys = user.roomkeys;
      await this.queryChats(user.roomkeys);
    } else {
      this.chats = [];
    }

    this.events.publish(Constants.updateChatBadgeCountEventName, this.determineBadgeCount());

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

  onClickDeleteChat(slidingItem: IonItemSliding, chat: IChat){
    this.showConfirmationPrompt(async ()=>{

      let isUserA = this.userId == chat.userA_id;
      let message = `${this.user_name} has left the chat.`;
      let dateInMillis = new Date().getTime().toString();

      let messageData = {};
      messageData[dateInMillis] = <IMessage> {
          roomkey: chat.roomkey,
          to_uid: '', // Leave ID blank so notification isn't triggered
          from_uid: '', // Leave ID blank so message gets styled correctly
          name: 'Wandr Bot', 
          text: message, 
          timestamp: dateInMillis
      }

      // Update chat summary
      let chatUpdate = <IChat> {
          lastMessage: message,
          timestamp: dateInMillis
      }

      if(isUserA){
        chatUpdate.userA_deleted = true;
      } else {
        chatUpdate.userB_deleted = true;
      }

      const new_roomkeys = this.user_roomkeys.filter((key)=>{
        return key !== chat.roomkey;
      });

      await this.dbHelper.UpdateUser(this.userId, { roomkeys: new_roomkeys })
        .catch(error => this.logger.Error(error));

      await this.dbHelper.SendMessage(chat.roomkey, messageData, chatUpdate)
        .catch(error => this.logger.Error(error));

      await this.loadChats();
    },
    ()=> {
      slidingItem.close();
    });
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

  private determineBadgeCount(): number{
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

  private async showConfirmationPrompt(confirmHandler: ()=>any, cancelHandler: ()=>any){
    const prompt = await this.alertCtrl.create({
      header: "Are you sure you want to delete and leave this chat?",
      buttons: [{
        text: "Nevermind",
        handler: ()=>{
          cancelHandler();
        }
      },{
        text: "Yes, I'm sure",
        handler: ()=>{
          confirmHandler();
        }
      }]
    });

    prompt.present();
  }
}
