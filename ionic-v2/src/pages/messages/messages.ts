import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, Keyboard, Tabs } from 'ionic-angular';
import { WebDataService } from '../../helpers/webDataService';
import { IMessage } from '../../models/chat';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})

export class MessagesPage {

  @ViewChild('appTabs') tabRef: Tabs;

  messages: any[] = [];
  loading: Loading;
  uid: string;

  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private webDataService: WebDataService,
    public keyboard: Keyboard) {
      
      this.uid = window.sessionStorage.getItem(Constants.firebaseUserIdKey);

      //TODO: FAB button doesn't hide when keyboard is shown
      this.keyboard.willShow.subscribe(()=>{
        this.tabRef.setTabbarHidden(true);
      });

      this.keyboard.willHide.subscribe(()=>{
        this.tabRef.setTabbarHidden(false);
      });
  }

  ionViewDidLoad(){
    this.loadMessages();
  }

  async loadMessages(){
    this.loading = this.loadingCtrl.create();
    this.messages = await this.webDataService.readMessages();
    
    this.messages = _.sortBy(this.messages, (msg: IMessage)=>{
      return new Date(msg.timeStamp);
    });

    this.messages.forEach((msg: any)=>{
      // add received property for UI
      msg.received = msg.uid != this.uid;
    });

    this.loading.dismiss();
  }

  onClickSendMessage(){
    alert("not yet implemented");
  }
}