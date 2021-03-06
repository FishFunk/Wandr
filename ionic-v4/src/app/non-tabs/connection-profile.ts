import { Component } from '@angular/core';
import { LoadingController, NavParams, ToastController, AlertController, ModalController, NavController, Events } from '@ionic/angular';
import { IUser, User, Location } from '../models/user';
import _ from 'underscore';
import { Constants } from '../helpers/constants';
import { IChat, IMessage } from '../models/chat';
import { AngularFireFunctions } from 'angularfire2/functions';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import { ICheckboxOption } from '../models/metadata';
import { Observable } from 'rxjs';
 
@Component({
  selector: 'connection-profile-modal',
  templateUrl: 'connection-profile.html',
  styleUrls: ['connection-profile.scss']
})

export class ConnectionProfileModal {

    tripsObservable: Observable<any>;
    tripData = [];

    userInterests: ICheckboxOption[] = [];
    lifestyleOptions: ICheckboxOption[] = [];

    secondConnectionCount: number;
    currentUserId: string;
    viewUserId: string;
    viewUserData: IUser = new User('','','','', '',
      new Location(),[],[], [], '','', '');
    mutualFriends: IUser[] = [];
    showChatButton: boolean;
    chatData: IChat;

    navPath: number;

    chatExists: boolean = false;
    showJoinBtn: boolean = false;

    constructor(
        navParams: NavParams,
        private events: Events,
        private logger: Logger,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private navCtrl: NavController,
        private firebaseFunctionsModule: AngularFireFunctions,
        private dbHelper: FirestoreDbHelper){
        
        this.chatData = null;
        this.viewUserId = navParams.get('userId');
        this.navPath = navParams.get('navPath');
        this.showChatButton = navParams.get('showChatButton') == "true";
        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
    }

    async ngOnInit(){
        const loading = await this.loadingCtrl.create({
          spinner: 'dots'
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
      this.viewUserData = await this.dbHelper.ReadUserByFirebaseUid(this.viewUserId);
      
      if(typeof(this.viewUserData) == "string"){
        // Read User Failed
        this.modalCtrl.dismiss();
        this.alertCtrl.create({
          message: 'User no longer exists'
        });
      }

      this.userInterests = await this.dbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
      this.lifestyleOptions = await this.dbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

      this.renderUserOptions();

      await this.readTrips();

      if(this.showChatButton){
        if(_.contains(this.viewUserData.blockedUsers, this.currentUserId)){
          this.showChatButton = false;
          return;
        }

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
      const currentUser = await this.dbHelper.ReadUserByFirebaseUid(this.currentUserId);
      const currentUserFriendIds = _.map(currentUser.friends, (friendObj)=>friendObj.id);
      const connectionUserFriendIds = _.map(this.viewUserData.friends, (user)=>user.id);

      var mutualFriendIds = _.intersection(currentUserFriendIds, connectionUserFriendIds);
      this.mutualFriends = await this.dbHelper.ReadUsersByFacebookId(mutualFriendIds);
    }

    async readTrips(){
      this.tripsObservable = this.dbHelper.ReadTripsObservableByUserId(this.viewUserId);
  
      this.tripsObservable.subscribe(async trips =>{
        trips = _.reject(trips, (obj)=> !obj.data.public);
        this.tripData = _.sortBy(trips, (obj)=> obj.data.startDate ? new Date(obj.data.startDate) : 999999999999999);
      });
    }

    onClickClose(){
      this.modalCtrl.dismiss();
    }

    onClickReport(){
      this.presentConfirmation(
        `Report ${this.viewUserData.first_name}?`,
        `Reports are taken very seriously in order to maintain an enjoyable \
            app experience for everyone. Relevant user activity will be reviewed and if there is \
            violation of the Wandr user agreement, users will be banned.`,
        this.confirmReportUser.bind(this));
    }

    onClickBlock(){
      this.presentConfirmation(
        `Block ${this.viewUserData.first_name}?`,
        `You will no longer see or be able to interact with this user.`,
        this.confirmBlockUser.bind(this));
    }

    async onClickUser(user: IUser){
      this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
          component: ConnectionProfileModal,
          componentProps: {
              navPath: 2,
              userId: user.app_uid,
              showChatButton: true
          }
      });
      modal.present();
    }

    async onClickGoToChat(){
      if(this.navPath === 1){
        // Nav from chat tab
        await this.modalCtrl.dismiss();
      } else {
        // Nav from different tab
        await this.modalCtrl.dismiss();
        await this.modalCtrl.dismiss();
        this.navCtrl.navigateForward(`messages/${this.chatData.roomkey}/false`);
      }
    }

    async onClickRejoinChat(){
      let isUserA = this.currentUserId == this.chatData.userA_id;
      const currentUser = await this.dbHelper.ReadUserByFirebaseUid(this.currentUserId);
      let message = `${currentUser.first_name} has joined the chat.`;
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

    async onClickSendMessage(){
        if(this.chatExists){
          const toast = await this.toastCtrl.create({
            message: "Chat already exists!",
            duration: 2000
          });

          toast.present();
        } else {
          let loading = await this.loadingCtrl.create({
            spinner: 'dots'
          });
          loading.present();
      
          const currentUser = await this.dbHelper.ReadUserByFirebaseUid(this.currentUserId);
          
          const focusedConnectionUid = this.viewUserData.app_uid;
          const roomkey = this.currentUserId + '_' + focusedConnectionUid;
      
          const data: IChat = {
            roomkey: roomkey,
            userA_id: this.currentUserId,
            userA_name: currentUser.first_name,
            userA_photoUrl: currentUser.profile_img_url,
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
      
          const createChat = this.firebaseFunctionsModule.functions.httpsCallable('createChat');
          
          createChat(data)
            .then(async (result)=>{
              this.chatData = result.data;
              this.chatExists = true;
              loading.dismiss();
              // TODO: Navigate to new chat view?
              const toast = await this.toastCtrl.create({
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

    private confirmReportUser(){
      const reportData = {
        dateReported: new Date(),
        from: this.currentUserId,
        reportInfo: {
          uid: this.viewUserData.app_uid,
          first_name: this.viewUserData.first_name,
          last_name: this.viewUserData.last_name
        }
      };

      this.dbHelper.CreateNewReport(reportData)
        .then(async ()=>{
          const toast = await this.toastCtrl.create({
            message: 'Report successfully submitted!',
            duration: 2000
          });
          toast.present();
        })
        .catch(async error => {
          this.presentAlert("Report failed to send. Please try again.");
          this.logger.Error(error);
        });
    }

    private async confirmBlockUser(){
      const user = await this.dbHelper.ReadUserByFirebaseUid(this.currentUserId);
      var blocked = user.blockedUsers || [];
      blocked.push(this.viewUserId);
      var roomkeys = _.reject(user.roomkeys, (roomkey)=> roomkey.indexOf(this.viewUserId) > -1);
      this.dbHelper.UpdateUser(this.currentUserId, { blockedUsers: blocked, roomkeys: roomkeys });

      if(this.navPath === 1){
        // Nav from chat tab
        await this.modalCtrl.dismiss();
        this.navCtrl.back();
      } else {
        // Nav from different tab
        await this.modalCtrl.dismiss();
        await this.modalCtrl.dismiss();
      }

      var promises: Promise<any>[] = this.events.publish(Constants.refreshChatDataEvent);
      await Promise.all(promises);
      promises = this.events.publish(Constants.refreshMapDataEventName);
      await Promise.all(promises);
    }

    private async presentAlert(message: string){
      const alert = await this.alertCtrl.create({
        header: message
      });
      alert.present();
    }

    private async presentConfirmation(header: string, message: string, func: any){
      const confirm = await this.alertCtrl.create({
          header: header,
          message: message,
          buttons: [
            {
              text: 'Cancel',
              handler:  ()=>{}
            },
            {
              text: 'Confirm',
              handler: func
            }]
        });
        confirm.present();
    }
}