import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Content, LoadingController, NavParams, Button } from 'ionic-angular';
import { Constants } from '../../helpers/constants';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { FirebaseApp } from 'angularfire2';
import { Subscription } from 'rxjs';

 
@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html'
})
export class MessagesPage {
 
    @ViewChild(Content) contentArea: Content;
    @ViewChildren('messageListItems') messageListItems: QueryList<ElementRef>;
    @ViewChild('sendButton') sendButton: Button;

    uid: string;
    messages: Array<any> = [];
    message: string = '';
    firstName: string;
    roomkey: string;

    keyboardShowObservable: Subscription;
    keyboardHideObservable: Subscription;
    sendButtonElement: Element;

    constructor(
        params: NavParams,
        private loadingCtrl: LoadingController,
        private keyboard: Keyboard,
        private firebase: FirebaseApp) {
        
        this.roomkey = params.get('roomkey');
        this.uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        this.firstName = window.localStorage.getItem(Constants.userFirstNameKey);
    }

    ionViewWillLeave(){
        // Remove listeners
        this.keyboardShowObservable.unsubscribe();
        this.keyboardHideObservable.unsubscribe();

        this.sendButtonElement.removeEventListener('click', this.stopBubble.bind(this));
        this.sendButtonElement.removeEventListener('mousedown', this.stopBubble.bind(this));
        this.sendButtonElement.removeEventListener('touchdown', this.stopBubble.bind(this));
        this.sendButtonElement.removeEventListener('touchmove', this.stopBubble.bind(this));
        this.sendButtonElement.removeEventListener('touchstart', this.stopBubble.bind(this));
        this.sendButtonElement.removeEventListener('touchend', this.stopBubbleAndSendMessage.bind(this));
        this.sendButtonElement.removeEventListener('mouseup', this.stopBubbleAndSendMessage.bind(this));
    }

    ngAfterViewInit() {
        // Subscribe listeners
        this.messageListItems.changes.subscribe(async () => {
            await this.scrollToBottom(500);
        });

        this.keyboardShowObservable = this.keyboard.onKeyboardShow().subscribe(async ()=>{
            await this.scrollToBottom(500);
        });
        
        this.keyboardHideObservable = this.keyboard.onKeyboardHide().subscribe(async ()=>{
            await this.scrollToBottom(500);
        });

        this.sendButtonElement = this.sendButton._elementRef.nativeElement;     
        this.sendButtonElement.addEventListener('click', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('mousedown', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchdown', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchmove', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchstart', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchend', this.stopBubbleAndSendMessage.bind(this));
        this.sendButtonElement.addEventListener('mouseup', this.sendMessage.bind(this));
    }

    ionViewDidLoad(){
        this.loadMessages();
    }

    ionViewDidEnter(){
        this.scrollToBottom(500);
    }

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
            
            // Insert message object
            await this.firebase.database()
                .ref('/messages/'+this.roomkey)
                .child(key)
                .set({ uid: this.uid, 
                    name: this.firstName, 
                    text: this.message, 
                    timestamp: dateInMillis });

            // Update chat object
            var updates = {};
            updates['/chats/' + this.roomkey + '/lastMessage'] = this.message;
            updates['/chats/' + this.roomkey + '/timestamp'] = dateInMillis;

            await this.firebase.database().ref().update(updates);

            this.message = '';
            loading.dismiss();
        }
    }

    async scrollToBottom(duration){
        await this.contentArea.scrollToBottom(duration);
    }
 
    getClass(messageUid){
        if(messageUid == Constants.appBotId){
            return 'bot';
        }
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

    private stopBubble(event) {
        try 
        {
            event.preventDefault(); 
            event.stopPropagation(); //Stops event bubbling
        }
        catch (ex) {
            console.error(ex);
        }
    }

    private stopBubbleAndSendMessage(event) {
        this.stopBubble(event);
        this.sendMessage();
    }
}