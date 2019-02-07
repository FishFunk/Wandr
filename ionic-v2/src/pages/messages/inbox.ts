import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, Events } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { MessagesPage } from './messages';
import { Constants } from '../../helpers/constants';
import { IUser } from '../../models/user';
import { IChat } from '../../models/chat';
import _ from 'underscore';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class InboxPage {

  userId: string;
  chats:  IChat[] = [];
  loading: Loading;
  
  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private firestore: AngularFirestore,
    private events: Events) {
      this.userId = window.localStorage.getItem(Constants.firebaseUserIdKey);
  }

  ionViewDidEnter(){
    this.loadChats();
  }

  async loadChats(){
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    
    var snapshot = await this.firestore.collection('users').doc(this.userId).get().toPromise();
    var user = <IUser> snapshot.data();
    
    if(user.roomkeys && user.roomkeys.length > 0){
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

  private async queryChats(roomkeys: string[]): Promise<any>{

    var promises = roomkeys.map((key)=> {
      return this.firestore.collection('chats').doc(key).get().toPromise();
    });

    var snapshots = await Promise.all(promises)
      .catch((error)=> {
        console.error(error);
        return Promise.reject(error);
      });
    
    let temp: IChat[] = [];
    this.chats = [];
    snapshots.forEach((snapshot)=> {
      if(snapshot.exists){
        const chatObj = <IChat> snapshot.data();
        temp.push(chatObj);
      }
    });

    this.chats = _.sortBy(temp, (chat)=> +chat.timestamp * -1);
    return Promise.resolve();
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