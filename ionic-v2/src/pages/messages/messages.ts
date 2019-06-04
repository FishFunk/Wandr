import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Content, LoadingController, NavParams, Button, NavController, Events, AlertController } from 'ionic-angular';
import { Constants } from '../../helpers/constants';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Subscription, Observable } from 'rxjs';
import { IMessage, IChat } from '../../models/chat';
import _ from 'underscore';
import { ConnectionProfilePage } from '../non_tabs/connection_profile';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';
import { Utils } from '../../helpers/utils';

 
@Component({
    selector: 'page-messages',
    templateUrl: 'messages.html'
})
export class MessagesPage {
 
    @ViewChild(Content) contentArea: Content;
    @ViewChildren('messageListItems') messageListItems: QueryList<ElementRef>;
    @ViewChild('sendButton') sendButton: ElementRef;
    @ViewChild('textInput') textarea: ElementRef;

    headerName: string;
    uid: string;
    messages: Array<any> = [];
    message: string = '';
    initialTextareaScrollHeight: number;
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
        private alertCtrl: AlertController,
        private keyboard: Keyboard,
        private firestoreDbHelper: FirestoreDbHelper,
        private logger: Logger,
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

    ionViewWillEnter() {
        this.initialTextareaScrollHeight = this.textarea.nativeElement.scrollHeight;

        this.messageListItems.changes.subscribe(() => {
            this.scrollToBottom(0);
        });

        this.keyboardShowObservable = this.keyboard.onKeyboardShow().subscribe(()=>{
            this.scrollToBottom(0);
        });
        
        this.keyboardHideObservable = this.keyboard.onKeyboardHide().subscribe(()=>{
            this.scrollToBottom(0);
        });

        this.sendButtonElement = this.sendButton.nativeElement;     
        this.sendButtonElement.addEventListener('click', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('mousedown', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchdown', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchmove', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchstart', this.stopBubble.bind(this));
        this.sendButtonElement.addEventListener('touchend', this.stopBubbleAndSendMessage.bind(this));
        this.sendButtonElement.addEventListener('mouseup', this.stopBubbleAndSendMessage.bind(this));

        setTimeout(()=>{
            this.scrollToBottom(0);
        },10);
    }

    ionViewDidLoad(){
        this.loadMessages();
    }

    async loadMessages(){

        this.messagesObservable = this.firestoreDbHelper.GetMessagesObservable(this.chat.roomkey);
        
        if(this.messagesObservable){
            this.messagesObservable.subscribe(async data =>{
                this.messages = _.map(data, (obj: IMessage, key)=> {
                    obj.text = Utils.convertLinkValuesInString(obj.text);
                    return obj
                });
            });
    
            this.updateChatReadReceipt()
                .catch(error => {
                    this.logger.Error(error);
                });
        } else {
            this.presentAlert("It's not you, it's us... something went wrong.");
            this.logger.Error(new Error("GetMessagesObservable returned null!"));
        }
    }

    onClickBack(){
        this.navCtrl.pop({animate: true, direction: 'back'});
    }

    onClickProfile(){
        const loading = this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
        });
        loading.present();

        let targetUid;
        if(this.uid == this.chat.userA_id){
            targetUid = this.chat.userB_id;
        } else {
            targetUid = this.chat.userA_id;
        }

        this.firestoreDbHelper.ReadUserByFirebaseUid(targetUid, true)
            .then((user)=>{
                loading.dismiss();
                this.navCtrl.push(ConnectionProfilePage, 
                    { user: user, showChatButton: false }, 
                    { animate: true, direction: 'forward' });
            })
            .catch(error=>{
                loading.dismiss();
                this.presentAlert(`${this.headerName} has deleted their account!`);
                this.logger.Error(error);
            });
    }

    async sendMessage() {

        if(this.chat.userB_deleted || this.chat.userA_deleted){
            this.presentAlert("Chat room only has one user. Messaging is disabled.");
            return;
        }

        var trimmedText = this.message.trim();
        if (trimmedText.length > 0){
            let formattedText = trimmedText;

            // formattedText = Utils.convertLinkValuesInString(trimmedText);

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
                text: formattedText, 
                timestamp: dateInMillis
            }

            // Update chat summary
            let chatUpdate = {
                lastMessage: this.message,
                timestamp: dateInMillis,
                userA_unread: !isUserA,
                userB_unread: isUserA
            }

            this.message = '';

            await this.firestoreDbHelper.SendMessage(this.chat.roomkey, data, chatUpdate)
                .then(()=>{
                    this.udpateHeight();
                })
                .catch(error =>{
                    this.presentAlert("It's not you, it's us... Message failed to send :(");
                    this.logger.Error(error);
                });
        }
    }

    async scrollToBottom(duration){
        await this.contentArea.scrollToBottom(duration);
    }
 
    getClass(message){
        // Generated message
        if(message.from_uid == Constants.appBotId){
            return 'bot';
        }
        // Current user sent message
        if(this.uid == message.from_uid){
            return 'outgoing';
        }
        // Current user received message
        if(this.uid == message.to_uid){
            return 'incoming';
        }

        return 'other';
    }

    udpateHeight()
    {
        this.textarea.nativeElement.style.height = this.initialTextareaScrollHeight+"px";
        this.textarea.nativeElement.style.height = (this.textarea.nativeElement.scrollHeight)+"px";
    }

    private stopBubble(event) {
        try 
        {
            event.preventDefault(); 
            event.stopPropagation(); //Stops event bubbling
        }
        catch (ex) {
            this.logger.Warn(ex);
        }

        return false;
    }

    private stopBubbleAndSendMessage(event) {
        event.preventDefault(); 
        event.stopPropagation();
        this.sendMessage();
        return false;
    }

    private presentAlert(message: string){
        this.alertCtrl.create({
            title: message
        }).present();
    }

    private async updateChatReadReceipt(){
        // Mark chat as read
        let chatUpdate;
        if(this.uid == this.chat.userA_id){
            chatUpdate = { userA_unread: false };
        } else {
            chatUpdate = { userB_unread: false };
        }

        await this.firestoreDbHelper.UpdateChat(this.chat.roomkey, chatUpdate)
            .catch(async error =>{
                this.logger.Warn(error);
            });

        const newBadgeCount = await this.firestoreDbHelper.GetUnreadChatCount(this.uid)
            .catch(async error =>{
                this.logger.Warn(error);
            });

        this.events.publish(Constants.updateBadgeCountEventName, newBadgeCount);
    }
}