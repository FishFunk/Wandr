import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, Events, AlertController, ItemSliding } from 'ionic-angular';
import { MessagesPage } from './messages';
import { Constants } from '../../helpers/constants';
import { IChat, IMessage } from '../../models/chat';
import _ from 'underscore';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class InboxPage {

  userId: string;
  chats:  IChat[] = [];
  loading: Loading;

  private user_roomkeys: string[] = [];
  
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private dbHelper: FirestoreDbHelper,
    private logger: Logger,
    private events: Events) {
      this.userId = window.localStorage.getItem(Constants.firebaseUserIdKey);
  }

  ionViewWillEnter(){
    this.loadChats();
  }

  async loadChats(){
    this.loading = this.loadingCtrl.create({
      spinner: 'hide',
      content:`<img src="../../assets/ring-loader.gif"/>`,
      cssClass: 'my-loading-class'
    });
    this.loading.present();
    
    var user = await this.dbHelper.ReadUserByFirebaseUid(this.userId)
      .catch(error=>{
        this.logger.Error(error);
      });
    
    if(user && user.roomkeys && user.roomkeys.length > 0){
      this.user_roomkeys = user.roomkeys;
      await this.queryChats(user.roomkeys);
    } else {
      this.chats = [];
    }

    this.events.publish(Constants.updateBadgeCountEventName, this.getBadgeCount());

    this.loading.dismiss();
  }

  onClickChat(chat: IChat){
    this.navCtrl.push(MessagesPage, 
      { chat: chat, showProfileButton: true }, 
      { animate: true, direction: 'forward' });
  }

  onClickDeleteChat(slidingItem: ItemSliding, chat: IChat){
    this.showConfirmationPrompt(async ()=>{

      let isUserA = this.userId == chat.userA_id;
      let message = `${isUserA ? chat.userA_name : chat.userB_name} has left the chat.`;
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

  private showConfirmationPrompt(confirmHandler: ()=>any, cancelHandler: ()=>any){
    const prompt = this.alertCtrl.create({
      title: "Are you sure you want to delete and leave this chat?",
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

  private showLoadFailurePrompt(){
    const prompt = this.alertCtrl.create({
      title: "Hmm, looks like something went wrong loading your chats.",
      buttons: [{
        text: "Retry?",
        handler: ()=>{
          this.loadChats();
        }
      }]
    });

    prompt.present();
  }

  private async queryChats(roomkeys: string[]): Promise<any>{

    this.chats = await this.dbHelper.ReadUserChats(roomkeys)
      .catch(error=>{
        this.showLoadFailurePrompt();
        this.logger.Error(error);
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

  onClickExplore(){
    let tab = this.navCtrl.parent;
    tab.select(2);
  }

  onClickInvite(){
    let tab = this.navCtrl.parent;
    tab.select(3);
  }
}