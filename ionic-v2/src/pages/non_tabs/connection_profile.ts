import { Component } from '@angular/core';
import { LoadingController, NavParams, ToastController, NavController } from 'ionic-angular';
import { IUser, IFacebookFriend } from '../../models/user';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { IChat } from '../../models/chat';
import { AngularFireFunctions } from 'angularfire2/functions';
import { AngularFirestore } from 'angularfire2/firestore';
import { Utils } from '../../helpers/utils';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { MessagesPage } from '../messages/messages';
 
@Component({
  selector: 'page-connection-profile',
  templateUrl: 'connection_profile.html'
})

export class ConnectionProfilePage {

    secondConnectionCount: number;
    currentUserId: string;
    viewUserData: IUser;
    mutualFriends: string[];
    showChatButton: boolean;
    chatExists: boolean;
    chatData: IChat;

    constructor(
        params: NavParams,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private firestore: AngularFirestore,
        private firebaseFunctionsModule: AngularFireFunctions,
        private navCtrl: NavController){

        this.chatData = null;
        this.viewUserData = params.get('user');
        this.showChatButton = params.get('showChatButton');
        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
    }

    ionViewDidLoad(){
        const loading = this.loadingCtrl.create();
        loading.present();

        this.loadView()
            .then(()=>{
                loading.dismiss();
            })
            .catch(error=>{
                console.error(error);
                loading.dismiss();
            });
    }

    async loadView(){
      const doesExist = await this._checkIfChatExists();
      if(doesExist){
        // Chat with roomkey already exists, update UI button
        this.chatExists = true;
      } else {
          this.chatExists = false;
      }

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

          return;
        }
    
        let loading = this.loadingCtrl.create();
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
          .catch(error=>{
            console.error(error);
            loading.dismiss();
          });
    }

    private async _checkIfChatExists(){
        // Check if chat exists to prevent duplicates
        let possibleRoomkey = this.currentUserId + '_' + this.viewUserData.app_uid;
        let snapshot = await this.firestore.collection('chats').doc(possibleRoomkey).get().toPromise();
        if(snapshot.exists){
          // Chat with roomkey already exists
          this.chatData = <IChat> snapshot.data();
          return true;
        }
        
        possibleRoomkey = this.viewUserData.app_uid + '_' + this.currentUserId;
        snapshot = await this.firestore.collection('chats').doc(possibleRoomkey).get().toPromise();
    
        if(snapshot.exists){
          // Chat with roomkey already exists
          this.chatData = <IChat> snapshot.data();
          return true;
        }
    
        return false;
    }
}