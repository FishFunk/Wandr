import { Component, ViewChild, ViewChildren } from '@angular/core';
import { Content, LoadingController } from 'ionic-angular';
import { Message, IMessage } from '../../models/chat';
import { Constants } from '../../helpers/constants';
import { WebDataService } from '../../helpers/webDataService';
import _ from 'underscore';
import { Keyboard } from '@ionic-native/keyboard';

 
@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html'
})
export class MessagesPage {
 
    @ViewChild(Content) contentArea: Content;
    @ViewChildren('messageListItems') messageListItems;
 
    uid: string;
    messages: Array<Message> = [];
    message: string = '';

    constructor(
        private loadingCtrl: LoadingController,
        private webDataService: WebDataService,
        private keyboard: Keyboard) {
        
        this.uid = window.sessionStorage.getItem(Constants.firebaseUserIdKey);

        this.keyboard.onKeyboardShow().subscribe(()=>{
            this.scrollToBottom(500);
        });
    }

    ionViewDidLoad(){
        this.messageListItems.changes.subscribe(t => {
            this.scrollToBottom(500);
        });

        this.loadMessages();
    }

    ionViewDidEnter() {
        this.scrollToBottom(300);
    }

    async loadMessages(){
        let loading = this.loadingCtrl.create();
        this.messages = await this.webDataService.readMessages();
        
        this.messages = _.sortBy(this.messages, (msg: IMessage)=>{
            return new Date(msg.timeStamp);
        });

        this.messages.forEach((msg: any)=>{
            // add received property for UI
            msg.received = msg.uid != this.uid;
        });

        loading.dismiss();
    }

    sendMessage() {
        if (this.message !== '') {
            var trimmedText = this.message.trim();
            if(trimmedText.length > 0){
                var msg = new Message(this.uid, '', trimmedText, new Date().toString());
                this.webDataService.sendMessage(msg)
                    .subscribe(returnData=>{
                        this.messages.push(msg);
                        this.message = '';
                    },
                    error =>{
                        console.error(error);
                        alert("Failed to send message!");
                    });
            }
        }
    }

    scrollToBottom(duration){
        this.contentArea.scrollToBottom(duration);
    }
 
    getClass(messageUid){
        return this.uid == messageUid  ? 'outgoing' : 'incoming';
    }
}