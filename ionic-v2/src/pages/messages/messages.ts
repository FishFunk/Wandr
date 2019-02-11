import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Content, LoadingController, NavParams, Button, NavController, Events } from 'ionic-angular';
import { Constants } from '../../helpers/constants';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription, Observable } from 'rxjs';
import { IMessage, IChat } from '../../models/chat';
import _ from 'underscore';
import { ConnectionProfilePage } from '../non_tabs/connection_profile';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';

 
@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html'
})
export class MessagesPage {
 
    @ViewChild(Content) contentArea: Content;
    @ViewChildren('messageListItems') messageListItems: QueryList<ElementRef>;
    @ViewChild('sendButton') sendButton: Button;

    headerName: string;
    uid: string;
    messages: Array<any> = [];
    message: string = '';
    firstName: string;
    chat: IChat;
    showProfileButton: boolean;
    messagesObservable: Observable<any>;

    keyboardShowObservable: Subscription;
    keyboardHideObservable: Subscription;
    sendButtonElement: Element;

    constructor(
        params: NavParams,
        private loadingCtrl: LoadingController,
        private navCtrl: NavController,
        private keyboard: Keyboard,
        private firestore: AngularFirestore,
        private firestoreDbHelper: FirestoreDbHelper,
        private events: Events) {
        
        this.chat = params.get('chat');
        this.showProfileButton = !!params.get('showProfileButton');
        this.uid = window.localStorage.getItem(Constants.firebaseUserIdKey);

        if(this.uid == this.chat.userA_id){
            this.headerName = this.chat.userB_name;
        } else {
            this.headerName = this.chat.userA_name;
        }

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

        this.messagesObservable = this.firestore
            .collection('messages')
            .doc(this.chat.roomkey)
            .valueChanges();
            
        this.messagesObservable.subscribe(async data =>{
            this.messages = _.map(data, (obj, key)=> obj);
        });

        this.updateChatReadReceipt()
            .catch(error => console.error(error));
    }

    onClickProfile(){
        const loading = this.loadingCtrl.create();
        loading.present();

        let targetUid;
        if(this.uid == this.chat.userA_id){
            targetUid = this.chat.userB_id;
        } else {
            targetUid = this.chat.userA_id;
        }

        this.firestoreDbHelper.ReadUserByFirebaseUid(targetUid)
            .then((user)=>{
                loading.dismiss();
                this.navCtrl.push(ConnectionProfilePage, 
                    { user: user, showChatButton: false }, 
                    { animate: true, direction: 'forward' });
            })
            .catch(error=>{
                console.error(error);
                loading.dismiss();
                alert(`${this.headerName} has deleted their account.`);
            });
    }

    async sendMessage() {

        var trimmedText = this.message.trim();
        if (trimmedText.length > 0){
            let loading = this.loadingCtrl.create();

            const isUserA = this.uid == this.chat.userA_id;

            // Use timestamp as key
            let dateInMillis = new Date().getTime().toString();
            
            // Insert message doc
            let data = {};
            data[dateInMillis] = <IMessage> {
                roomkey: this.chat.roomkey,
                to_uid: isUserA ? this.chat.userB_id : this.chat.userA_id,
                from_uid: this.uid, 
                name: this.firstName, 
                text: this.message, 
                timestamp: dateInMillis
            }

            let chatUpdate = {
                lastMessage: this.message,
                timestamp: dateInMillis,
                userA_unread: !isUserA,
                userB_unread: isUserA
            }

            this.message = '';

            await this.firestore
                .collection('messages')
                .doc(this.chat.roomkey)
                .update(data);

            // Update chat doc
            await this.firestore
                .collection('chats')
                .doc(this.chat.roomkey)
                .update(chatUpdate);

            loading.dismiss();
        }
    }

    async scrollToBottom(duration){
        await this.contentArea.scrollToBottom(duration);
    }
 
    getClass(message){
        if(message.from_uid == Constants.appBotId){
            return 'bot';
        }
        return this.uid == message.from_uid  ? 'outgoing' : 'incoming';
    }

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

    private async updateChatReadReceipt(){
        // Mark chat as read
        let chatUpdate;
        if(this.uid == this.chat.userA_id){
            chatUpdate = { userA_unread: false };
        } else {
            chatUpdate = { userB_unread: false };
        }

        await this.firestore
            .collection('chats')
            .doc(this.chat.roomkey)
            .update(chatUpdate);

        const newBadgeCount = await this.firestoreDbHelper.GetUnreadChatCount(this.uid);

        this.events.publish(Constants.updateBadgeCountEventName, newBadgeCount);
    }
}