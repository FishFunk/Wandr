import { Component } from '@angular/core';
import { LoadingController, NavParams, ToastController, NavController, AlertController } from 'ionic-angular';
import { IUser, IFacebookFriend, ICheckboxOption } from '../../models/user';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { IChat, IMessage } from '../../models/chat';
import { AngularFireFunctions } from 'angularfire2/functions';
import { MessagesPage } from '../messages/messages';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';
 
@Component({
  selector: 'page-connection-profile',
  templateUrl: 'connection_profile.html'
})

export class ConnectionProfilePage {
    userInterests: ICheckboxOption[] = [];
    lifestyleOptions: ICheckboxOption[] = [];

    secondConnectionCount: number;
    currentUserId: string;
    viewUserData: IUser;
    mutualFriends: IUser[] = [];
    showChatButton: boolean;
    chatData: IChat;

    chatExists: boolean = false;
    showJoinBtn: boolean = false;

    createChatFunction: firebase.functions.HttpsCallable;

    constructor(
        params: NavParams,
        private logger: Logger,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private navCtrl: NavController,
        private firebaseFunctionsModule: AngularFireFunctions,
        private dbHelper: FirestoreDbHelper){

        this.chatData = null;
        this.viewUserData = params.get('user');
        this.showChatButton = params.get('showChatButton');
        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
        this.createChatFunction = this.firebaseFunctionsModule.functions.httpsCallable('createChat');

        // Run function with no data to wake up
        this.createChatFunction();
    }

    ionViewDidLoad(){
        const loading = this.loadingCtrl.create({
          spinner: 'hide',
          content:`<img src="../../assets/ring-loader.gif"/>`,
          cssClass: 'my-loading-class'
        });
        loading.present();

        this.loadView()
            .then(()=>{
                loading.dismiss();
            })
            .catch(error=>{
                loading.dismiss();
                this.presentAlert("It's not you, it's us... something went wrong. Please try again!");
                this.logger.Error(error);
            });
    }

    async loadView(){
      this.userInterests = await this.dbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
      this.lifestyleOptions = await this.dbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

      this.renderUserOptions();

      if(this.showChatButton){
        this.chatExists = await this._checkIfChatExists();

        if(this.chatExists){
          // Chat with roomkey already exists, update UI button and verify user has roomkey
          if(
            (this.currentUserId == this.chatData.userA_id && this.chatData.userA_deleted) ||
            (this.currentUserId == this.chatData.userB_id && this.chatData.userB_deleted)){
            // Current user has deleted this chat. Show action button to re-join chat.
            this.showJoinBtn = true;
          } else {
            this.showJoinBtn = false;
            await this._verifyUserHasRoomkey()
              .catch(error =>{
                return Promise.reject(error);
              });
          }
        }
      }

      await this.readMutualConnectionInfo();
    }

    async readMutualConnectionInfo(){
      const currentUserFriends: IFacebookFriend[] = JSON.parse(window.localStorage.getItem(Constants.userFacebookFriendsKey));
      const currentUserFriendIds = _.map(currentUserFriends, (friendObj)=>friendObj.id);
      const connectionUserFriendIds = _.map(this.viewUserData.friends, (user)=>user.id);

      var mutualFriendIds = _.intersection(currentUserFriendIds, connectionUserFriendIds);
      this.mutualFriends = await this.dbHelper.ReadUsersByFacebookId(mutualFriendIds);
    }

    onClickBack(){
      this.navCtrl.pop({animate: true, direction: 'back'});
    }

    onClickReport(){
      this.presentConfirmation();
    }

    async onClickGoToChat(){
      // TODO: Nav to tab first?
      this.navCtrl.push(MessagesPage, 
        { chat: this.chatData, showProfileButton: false }, 
        { animate: true, direction: 'forward' });
    }

    async onClickRejoinChat(){
      let isUserA = this.currentUserId == this.chatData.userA_id;
      let message = `${isUserA ? this.chatData.userA_name : this.chatData.userB_name} has joined the chat.`;
      let dateInMillis = new Date().getTime().toString();

      let messageData = {};
      messageData[dateInMillis] = <IMessage> {
          roomkey: this.chatData.roomkey,
          to_uid: '', // Leave ID blank so notification isn't triggered
          from_uid: '', // Leave ID blank so message gets styled correctly
          name: 'Wandr Bot', 
          text: message, 
          timestamp: dateInMillis
      }

      // Update chat summary
      let chatUpdate = <IChat> {
          lastMessage: message,
          timestamp: dateInMillis
      }

      if(isUserA){
        chatUpdate.userA_deleted = false;
      } else {
        chatUpdate.userB_deleted = false;
      }

      await this._verifyUserHasRoomkey();

      await this.dbHelper.SendMessage(this.chatData.roomkey, messageData, chatUpdate)
        .catch(error => this.logger.Error(error));

      this.showJoinBtn = false;

      this.onClickGoToChat();
    }

    onClickSendMessage(){
        if(this.chatExists){
          const toast = this.toastCtrl.create({
            message: "Chat already exists!",
            duration: 2000
          });

          toast.present();
        } else {
          let loading = this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
          });
          loading.present();
      
          const currentUserFirstName = window.localStorage.getItem(Constants.userFirstNameKey);
          const currentUserPhotoUrl = window.localStorage.getItem(Constants.profileImageUrlKey);
      
          const focusedConnectionUid = this.viewUserData.app_uid;
          const roomkey = this.currentUserId + '_' + focusedConnectionUid;
      
          const data: IChat = {
            roomkey: roomkey,
            userA_id: this.currentUserId,
            userA_name: currentUserFirstName,
            userA_photoUrl: currentUserPhotoUrl,
            userA_unread: true,
            userB_id: focusedConnectionUid,
            userB_name: this.viewUserData.first_name,
            userB_photoUrl: this.viewUserData.profile_img_url,
            userB_unread: true,
            lastMessage: '',
            timestamp: new Date().getTime().toString(),
            userA_deleted: false,
            userB_deleted: false
          };
      
          
          this.createChatFunction(data)
            .then((result)=>{
              this.chatData = result.data;
              this.chatExists = true;
              loading.dismiss();
              // TODO: Navigate to new chat view?
              const toast = this.toastCtrl.create({
                message: "Message sent!",
                position: 'top',
                duration: 2000
              });
              toast.present();
            })
            .catch(error=>{
              loading.dismiss();
              this.logger.Error(error);
            });
        }
    }

    private renderUserOptions(){
      if(this.viewUserData.interests){
        this.userInterests.forEach(userOption=>{
          const match = _.find(this.viewUserData.interests, (checked)=>{
            return userOption.label === checked.label;
          });
          if(match){
            userOption['checked'] = true;
          } else {
            userOption['checked'] = false;
          }
        });
      }
  
      if(this.viewUserData.lifestyle){
        this.lifestyleOptions.forEach(userOption=>{
          const match = _.find(this.viewUserData.lifestyle, (checked)=>{
            return userOption.label === checked.label;
          });
          if(match){
            userOption['checked'] = true;
          } else {
            userOption['checked'] = false;
          }
        });
      }
    }

    private async _checkIfChatExists(){
        // Check if chat exists to prevent duplicates
        let possibleRoomkey = this.currentUserId + '_' + this.viewUserData.app_uid;
        let possibleChat = await this.dbHelper.ReadSingleChat(possibleRoomkey);
        if(possibleChat){
          // Chat with roomkey already exists
          this.chatData = possibleChat;
          return true;
        }
        
        possibleRoomkey = this.viewUserData.app_uid + '_' + this.currentUserId;
        possibleChat = await this.dbHelper.ReadSingleChat(possibleRoomkey);

        if(possibleChat){
          // Chat with roomkey already exists
          this.chatData = possibleChat;
          return true;
        }
    
        return false;
    }

    private async _verifyUserHasRoomkey(){
      try{
        const user = await this.dbHelper.ReadUserByFirebaseUid(this.currentUserId);

        if(!_.contains(user.roomkeys, this.chatData.roomkey)){
          //this.logger.Warn(`Roomkey exists but ${this.currentUserId} does not have it! Updating user roomkeys...`);
          user.roomkeys.push(this.chatData.roomkey);
          await this.dbHelper.UpdateUser(this.currentUserId, { roomkeys: user.roomkeys });
        }
      }
      catch(ex){
        return Promise.reject(ex);
      }
    }

    private confirmReportUser(inputData: any){

      const reason = inputData.reason.trim();
      if(!reason){
        this.presentAlert("Please add your reason for the report!");
        return;
      }

      const reportData = {
        dateReported: new Date(),
        from: this.currentUserId,
        reportInfo: {
          uid: this.viewUserData.app_uid,
          first_name: this.viewUserData.first_name,
          last_name: this.viewUserData.last_name,
          reason: inputData
        }
      };

      this.dbHelper.CreateNewReport(reportData)
        .then(()=>{
          this.toastCtrl.create({
            message: 'Report successfully submitted!',
            duration: 2000
          }).present();
        })
        .catch(error => {
          this.presentAlert("Report failed to send. Please try again.");
          this.logger.Error(error);
        });
    }

    private presentAlert(message: string){
      this.alertCtrl.create({
        title: message
      }).present();
    }

    private presentConfirmation(){
      const confirm = this.alertCtrl.create({
          title: `Report ${this.viewUserData.first_name}?`,
          message: `We take reports very seriously in order to maintain a safe \
            and enjoyable app experience for everyone. \
            We will review your report and ${this.viewUserData.first_name}'s profile. \
            If they are in violation of our user agreement they will be banned.`,
          inputs: [
            {
              disabled: true,
              name: 'reason',
              placeholder: 'Please enter your reason...'
            }],
          buttons: [
            {
              text: 'Cancel',
              handler:  ()=>{}
            },
            {
              text: 'Confirm',
              handler: this.confirmReportUser.bind(this)
            }]
        });
        confirm.present();
    }
}