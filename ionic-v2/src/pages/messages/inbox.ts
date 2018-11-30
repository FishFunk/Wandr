import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { WebDataService } from '../../helpers/webDataService';
import { MessagesPage } from './messages';
import { IChat } from '../../models/chat';
import _ from 'underscore';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class InboxPage {

  chats:  any[] = [];
  loading: Loading;
  
  constructor(public navCtrl: NavController, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController,
    private webDataService: WebDataService) {
  }

  ionViewDidLoad(){
    this.loadChats();
  }

  async loadChats(){
    this.loading = this.loadingCtrl.create();
    this.chats = await this.webDataService.readChatList();
    this.chats = _.sortBy(this.chats, (chat: IChat)=>{
      return new Date(chat.timeStamp);
    });

    this.loading.dismiss();
  }

  onClickChat(){
    this.navCtrl.push(MessagesPage, {}, { animate: true, direction: 'forward' });
  }
}