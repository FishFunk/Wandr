import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, AlertController, App } from 'ionic-angular';
import { FacebookApi } from '../../helpers/facebookApi';
import { ContactPage } from './contact';
import { AboutPage } from './about';
import { Constants } from '../../helpers/constants';
import { AngularFirestore } from 'angularfire2/firestore';
import { IUserSettings, IUser } from '../../models/user';
import { IntroPage } from '../intro/intro';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {

    firebaseUid: string;
    pushNotifications: boolean;
    ghostMode: boolean;

    constructor(
        public navCtrl: NavController,
        private appCtrl: App,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fbApi: FacebookApi,
        private firestore: AngularFirestore,
        private firestoreDbHelper: FirestoreDbHelper){

        this.firebaseUid = localStorage.getItem(Constants.firebaseUserIdKey);
    }

    ionViewDidLoad(){
        this.firestoreDbHelper.ReadUserByFirebaseUid(this.firebaseUid)
            .then((usr)=>{
                if(usr && usr.settings){
                    this.pushNotifications = usr.settings.notifications;
                    this.ghostMode = usr.settings.ghostMode;
                }
            })
            .catch(error=>{
                console.error(error);
            });
    }

    updateUserSettings(){
        const newSettings: IUserSettings = {
            notifications: !!this.pushNotifications,
            ghostMode: !!this.ghostMode
        }
        this.firestore.collection('users')
            .doc(this.firebaseUid)
            .update({
                settings: newSettings
            })
            .then(()=>{
                // alert("Preferences saved!");
            })
            .catch((error)=> {
                console.error(error);
            });
    }

    onClickContact(){
        this.navCtrl.push(ContactPage, {}, { animate: true, direction: 'forward' });
    }

    onClickAbout(){
        this.navCtrl.push(AboutPage, {}, { animate: true, direction: 'forward' });
    }

    onClickLogout() {
        this.presentConfirmation(
            'Are you sure you want to logout?',
            "Yes, I'm Sure",
            "Oops, No Way!",
            this.logout.bind(this),
            ()=>{});
    }

    onClickDeleteAccount(){
        this.presentConfirmation(
            'Are you sure you want to delete your account?',
            "Yes, I'm Sure",
            "Oops, No Way!",
            this.deleteUser.bind(this),
            ()=>{});
    }


    private logout() {
        this.fbApi.facebookLogout()
            .then(()=>{
                window.localStorage.clear();
                this.appCtrl.getRootNav().setRoot(IntroPage);
            })
            .catch((error)=>{
                console.error(error);
                this.presentToast('top', 'Logout failed!');
            });
    }

    private deleteUser(){
        this.firestoreDbHelper.DeleteUserByFirebaseUid(this.firebaseUid)
            .then(()=>{
                this.logout();
            })
            .catch(error=> {
                console.error(error);
                this.presentToast('top', 'Failed to delete account!');
            });
    }

    private presentToast(position: string,message: string) {
        let toast = this.toastCtrl.create({
          message: message,
          position: position,
          duration: 1000
        });
        toast.present();
    }

    private presentConfirmation(
        title: string, 
        confirmTxt: string, 
        cancelTxt: string,
        confirmFunc: Function,
        cancelFunc: Function){
        const confirm = this.alertCtrl.create({
            title: title,
            buttons: [
              {
                text: confirmTxt,
                handler: ()=>{
                    confirmFunc()
                }
              },
              {
                text: cancelTxt,
                handler:  ()=>{
                    cancelFunc()
                }
              }]
          });
          confirm.present();
    }
}