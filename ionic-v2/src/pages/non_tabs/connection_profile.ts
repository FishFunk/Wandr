import { Component } from '@angular/core';
import { LoadingController, NavParams, ToastController } from 'ionic-angular';
import { IUser } from '../../models/user';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { IChat } from '../../models/chat';
import { AngularFireFunctions } from 'angularfire2/functions';
import { AngularFirestore } from 'angularfire2/firestore';
import { Utils } from '../../helpers/utils';
 
@Component({
  selector: 'connection-profile-page',
  templateUrl: 'connection_profile.html'
})

export class ConnectionProfilePage {

    secondConnectionCount: number;
    currentUserId: string;
    userData: IUser;
    showChatButton: boolean;
    disableMessageButton: boolean;

    constructor(
        params: NavParams,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private firestore: AngularFirestore,
        private firebaseFunctionsModule: AngularFireFunctions){

        this.userData = params.get('user');
        this.showChatButton = params.get('showChatButton');
        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);

    }

    ionViewDidLoad(){
        const loading = this.loadingCtrl.create();
        loading.present();

        this._checkIfChatExists()
            .then((doesExist)=>{
                if(doesExist){
                    // Chat with roomkey already exists, disable contact button
                    this.disableMessageButton = true;
                } else {
                    this.disableMessageButton = false;
                }
                loading.dismiss();
            })
            .catch(error=>{
                console.error(error);
                loading.dismiss();
            });
    }

    getUserRank(){
      return Utils.getUserRank(this.userData.friends.length);
    }

    onClickSendMessage(){

        if(this.disableMessageButton){
          // TODO: Navigate to open chat?
          return;
        }
    
        let loading = this.loadingCtrl.create();
        loading.present();
    
        const currentUserFirstName = window.localStorage.getItem(Constants.userFirstNameKey);
        const currentUserPhotoUrl = window.localStorage.getItem(Constants.profileImageUrlKey);
    
        const focusedConnectionUid = this.userData.app_uid;
        const roomkey = this.currentUserId + '_' + focusedConnectionUid;
    
        const data: IChat = {
          roomkey: roomkey,
          userA_id: this.currentUserId,
          userA_name: currentUserFirstName,
          userA_photoUrl: currentUserPhotoUrl,
          userA_unread: true,
          userB_id: focusedConnectionUid,
          userB_name: this.userData.first_name,
          userB_photoUrl: this.userData.profile_img_url,
          userB_unread: true,
          lastMessage: '',
          timestamp: new Date().getTime().toString()
        };
    
        const createChat = this.firebaseFunctionsModule.functions.httpsCallable('createChat');
        
        createChat(data)
          .then((result)=>{
            this.disableMessageButton = true;
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
        let possibleRoomkey = this.currentUserId + '_' + this.userData.app_uid;
        let snapshot = await this.firestore.collection('chats').doc(possibleRoomkey).get().toPromise();
        if(snapshot.exists){
          // Chat with roomkey already exists
          return true;
        }
        
        possibleRoomkey = this.userData.app_uid + '_' + this.currentUserId;
        snapshot = await this.firestore.collection('chats').doc(possibleRoomkey).get().toPromise();
    
        if(snapshot.exists){
          // Chat with roomkey already exists
          return true;
        }
    
        return false;
    }
}