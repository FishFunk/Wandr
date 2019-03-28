import { Component } from '@angular/core';
import { LoadingController, NavParams, ToastController, NavController, AlertController } from 'ionic-angular';
import { IUser, IFacebookFriend } from '../../models/user';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { IChat } from '../../models/chat';
import { AngularFireFunctions } from 'angularfire2/functions';
import { Utils } from '../../helpers/utils';
import { MessagesPage } from '../messages/messages';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';
 
@Component({
  selector: 'page-connection-profile',
  templateUrl: 'connection_profile.html'
})

export class ConnectionProfilePage {

    secondConnectionCount: number;
    currentUserId: string;
    viewUserData: IUser;
    mutualFriends: string[] = [];
    showChatButton: boolean;
    chatExists: boolean;
    chatData: IChat;

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
            .catch(async error=>{
                await this.logger.Error(error);
                loading.dismiss();
                this.presentAlert("It's not you, it's us... something went wrong. Please try again!");
            });
    }

    async loadView(){
      const doesExist = await this._checkIfChatExists();

      if(doesExist){
        // Chat with roomkey already exists, update UI button and verify user has roomkey
        this.chatExists = true;
        await this._verifyUserHasRoomkey()
          .catch(error =>{
            return Promise.reject(error);
          });
      } else {
          this.chatExists = false;
      }

      // const firstConnections = await this.dbHelper.ReadFirstConnections(this.viewUserData.app_uid);
      // const secondConnections = await this.dbHelper.ReadSecondConnections(this.viewUserData.facebook_uid, firstConnections);

      // this.secondConnectionCount = secondConnections.length;
      this.countMutualConnections();
    }

    countMutualConnections() {
      const currentUserFriends: IFacebookFriend[] = JSON.parse(window.localStorage.getItem(Constants.userFacebookFriendsKey));
      const currentUserFriendIds = _.map(currentUserFriends, (friendObj)=>friendObj.id);
      const connectionUserFriendIds = _.map(this.viewUserData.friends, (user)=>user.id);

      this.mutualFriends = _.intersection(currentUserFriendIds, connectionUserFriendIds);
    }

    getUserRank(){
      return Utils.getUserRank(this.viewUserData.friends.length);
    }

    onClickReport(){
      this.presentConfirmation();
    }

    onClickGoToChat(){
      this.navCtrl.push(MessagesPage, 
        { chat: this.chatData, showProfileButton: false }, 
        { animate: true, direction: 'forward' });
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
            timestamp: new Date().getTime().toString()
          };
      
          const createChat = this.firebaseFunctionsModule.functions.httpsCallable('createChat');
          
          createChat(data)
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
            .catch(async error=>{
              await this.logger.Error(error);
              loading.dismiss();
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
          this.logger.Warn(`Roomkey exists but ${this.currentUserId} does not have it! Updating user roomkeys...`);
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
        .catch(async error => {
          this.presentAlert("Report failed to send. Please try again.");
          await this.logger.Error(error);
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