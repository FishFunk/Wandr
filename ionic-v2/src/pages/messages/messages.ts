import { Component, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { Content, LoadingController, TextInput, NavParams } from 'ionic-angular';
import { Message, IMessage, IChat } from '../../models/chat';
import { Constants } from '../../helpers/constants';
import { WebDataService } from '../../helpers/webDataService';
import _ from 'underscore';
import { Keyboard } from '@ionic-native/keyboard';
import { FirebaseApp } from 'angularfire2';

 
@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html'
})
export class MessagesPage {
 
    @ViewChild(Content) contentArea: Content;
    @ViewChildren('messageListItems') messageListItems;
    @ViewChild('textInput', { read: ElementRef }) textAreaInput: ElementRef;

    uid: string;
    messages: Array<any> = [];
    message: string = '';
    firstName: string;
    roomkey: string;

    constructor(
        params: NavParams,
        private loadingCtrl: LoadingController,
        private keyboard: Keyboard,
        private firebase: FirebaseApp) {
        
        this.roomkey = params.get('roomkey');
        this.uid = window.sessionStorage.getItem(Constants.firebaseUserIdKey);
        this.firstName = window.sessionStorage.getItem(Constants.userFirstNameKey);

        this.keyboard.onKeyboardShow().subscribe(async ()=>{
            this.scrollToBottom(500)
                .then(()=> this.textAreaInput.nativeElement.click())
                .catch(()=>this.textAreaInput.nativeElement.click());
        });

        this.keyboard.onKeyboardHide().subscribe(async ()=>{
            await this.scrollToBottom(500);
        });
    }

    ionViewDidLoad(){
        this.messageListItems.changes.subscribe(async () => {
            await this.scrollToBottom(500);
        });

        this.loadMessages();
    }

    // ionViewDidEnter() {
    //     this.scrollToBottom(500);
    // }

    async loadMessages(){
        let loading = this.loadingCtrl.create();

        this.firebase.database().ref('messages/'+this.roomkey).on('value', resp => {
            this.messages = this.snapshotToArray(resp);
        });

        loading.dismiss();
    }

    async sendMessage() {

        var trimmedText = this.message.trim();
        if (trimmedText.length > 0){
            let loading = this.loadingCtrl.create();

            let dateInMillis = new Date().getTime();
            let key = dateInMillis.toString();
            
            await this.firebase.database()
                .ref('/messages/'+this.roomkey)
                .child(key)
                .set({ uid: this.uid, 
                    name: this.firstName, 
                    text: this.message, 
                    timestamp: dateInMillis });

            this.message = '';
            loading.dismiss();
        }
    }

    async scrollToBottom(duration){
        await this.contentArea.scrollToBottom(duration);
    }
 
    getClass(messageUid){
        return this.uid == messageUid  ? 'outgoing' : 'incoming';
    }

    snapshotToArray(snapshot){
        let returnArr = [];
    
        snapshot.forEach(childSnapshot => {
            let itemValue = childSnapshot.val();
            returnArr.push(itemValue);
        });
    
        return returnArr;
    };
}