import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { MessagesPage } from './messages';
import _ from 'underscore';
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
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController,
    private firebase: AngularFireDatabase) {
      this.userId = window.sessionStorage.getItem(Constants.firebaseUserIdKey);
  }

  ionViewDidEnter(){
    this.loadChats();
  }

  async loadChats(){
    this.loading = this.loadingCtrl.create();
    
    var snapshot = await this.firebase.database.ref('/users/' + this.userId).once('value');
    var user = <IUser> snapshot.val();
    
    if(user.roomkeys && user.roomkeys.length > 0){
      await this.queryChats(user.roomkeys);
    } else {
      this.chats = [];
    }

    this.loading.dismiss();
  }

  onClickChat(chat: IChat){
    this.navCtrl.push(MessagesPage, { roomkey: chat.roomkey }, { animate: true, direction: 'forward' });
  }

  private async queryChats(roomkeys: string[]): Promise<any>{

    var promises = roomkeys.map((key)=> {
      return this.firebase.database.ref("/chats/").child(key).once("value");
    });

    var snapshots = await Promise.all(promises).catch((error)=> {
      console.error(error);
      return Promise.reject(error);
    });
    
    this.chats = [];
    snapshots.forEach((snapshot)=> {
      this.chats.push(snapshot.val());
    });

    return Promise.resolve();
  }
}