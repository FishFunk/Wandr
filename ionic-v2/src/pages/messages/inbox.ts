import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { MessagesPage } from './messages';
import { Constants } from '../../helpers/constants';
import { IUser } from '../../models/user';
import { IChat } from '../../models/chat';

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
    private firestore: AngularFirestore) {
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

    this.loading.dismiss();
  }

  onClickChat(chat: IChat){
    this.navCtrl.push(MessagesPage, { chat: chat }, { animate: true, direction: 'forward' });
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
    
    this.chats = [];
    snapshots.forEach((snapshot)=> {
      if(snapshot.exists){
        this.chats.push(<IChat> snapshot.data());
      }
    });

    return Promise.resolve();
  }
}