import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading, Content } from 'ionic-angular';
import { WebDataService } from '../../helpers/webDataService';
import { IMessage, Message } from '../../models/chat';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})

export class MessagesPage {

  @ViewChild(Content) content: Content;

  textInput: string = "";
  messages: any[] = [];
  loading: Loading;
  uid: string;

  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private webDataService: WebDataService) {
      
      this.uid = window.sessionStorage.getItem(Constants.firebaseUserIdKey);
  }

  ionViewDidLoad(){
    this.loadMessages();
  }

  scrollToBottom(){
    this.content.scrollToBottom(0);
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
    var trimmedText = this.textInput.trim();
    if(trimmedText.length > 0){
      var msg = new Message(this.uid, '', trimmedText, new Date().toString());
      this.webDataService.sendMessage(msg)
        .subscribe(returnData=>{
          this.loadMessages()
            .catch(error=>{
              console.error(error);
              alert("Failed to fetch message list!");
            });
        },
        error =>{
          console.error(error);
          alert("Failed to send message!");
        });
    }
  }
}