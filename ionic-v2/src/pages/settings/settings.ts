import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, AlertController, App, ViewController } from 'ionic-angular';
import { FacebookApi } from '../../helpers/facebookApi';
import { ContactPage } from './contact';
import { AboutPage } from './about';
import { Constants } from '../../helpers/constants';
import { IUserSettings } from '../../models/user';
import { IntroPage } from '../intro/intro';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';
import { ProfilePage } from '../profile/profile';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {

    firebaseUid: string;
    pushNotifications: boolean;

    constructor(
        public navCtrl: NavController,
        private appCtrl: App,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fbApi: FacebookApi,
        private firestoreDbHelper: FirestoreDbHelper,
        private logger: Logger){

        this.firebaseUid = localStorage.getItem(Constants.firebaseUserIdKey);
    }

    ionViewDidLoad(){
        this.firestoreDbHelper.ReadUserByFirebaseUid(this.firebaseUid)
            .then((usr)=>{
                if(usr && usr.settings){
                    this.pushNotifications = usr.settings.notifications;
                }
            })
            .catch(error=>{
                this.logger.Error(error);
            });
    }

    updateUserSettings(){
        const newSettings: IUserSettings = {
            notifications: !!this.pushNotifications
        }

        this.firestoreDbHelper.UpdateUser(this.firebaseUid, { settings: newSettings })
            .then(()=>{
                this.presentToast('top', "Preferences saved!");
            })
            .catch((error)=> {
                this.logger.Error(error);
            });
    }

    onClickViewProfile(){
        this.navCtrl.push(ProfilePage, {}, { animate: true, direction: 'forward' });
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

    onClickAccount(){
        alert("not implemented");
    }

    onClickPrefs(){
        alert("not implemented");
    }

    onClickShare(){
        alert("not implemented");
    }


    private logout() {
        this.fbApi.facebookLogout()
            .then(()=>{
                window.localStorage.clear();
                this.appCtrl.getRootNav().setRoot(IntroPage);
            })
            .catch((error)=>{
                this.presentToast('top', 'Logout failed!');
                this.logger.Error(error);
            });
    }

    private deleteUser(){
        this.firestoreDbHelper.DeleteUserByFirebaseUid(this.firebaseUid)
            .then(()=>{
                this.logout();
            })
            .catch(error=> {
                this.presentToast('top', 'Failed to delete account!');
                this.logger.Error(error);
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