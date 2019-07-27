import { Component } from '@angular/core';
import { ToastController, NavController, AlertController } from '@ionic/angular';
import { FacebookApi } from '../helpers/facebookApi';
import { ContactPage } from './contact.page';
import { AboutPage } from './about.page';
import { Constants } from '../helpers/constants';
import { IUserSettings } from '../models/user';
import { IntroPage } from '../intro/intro.page';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import { ProfilePage } from '../profile/profile.page';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss']
})

export class SettingsPage {

    firebaseUid: string;
    pushNotifications: boolean;

    constructor(
        public navCtrl: NavController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fbApi: FacebookApi,
        private firestoreDbHelper: FirestoreDbHelper,
        private logger: Logger){

        this.firebaseUid = localStorage.getItem(Constants.firebaseUserIdKey);
    }

    ngOnInit(){
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
                this.presentToast("Preferences saved!");
            })
            .catch((error)=> {
                this.logger.Error(error);
            });
    }

    onClickViewProfile(){
        this.navCtrl.navigateForward('/profile');
    }

    onClickContact(){
        this.navCtrl.navigateForward('/contact');
    }

    onClickAbout(){
        this.navCtrl.navigateForward('/about');
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
                this.navCtrl.navigateRoot('/intro');
            })
            .catch((error)=>{
                this.presentToast('Logout failed!');
                this.logger.Error(error);
            });
    }

    private async deleteUser(){
        Promise.all([
            this.firestoreDbHelper.DeleteUserByFirebaseUid(this.firebaseUid),
            this.logout()
        ])
        .catch(async error=>{
            await this.presentToast('Failed to delete account!')
            await this.logger.Error(error);
        });
    }

    private async presentToast(message: string) {
        let toast = await this.toastCtrl.create({
          message: message,
          position: 'top',
          duration: 1000
        });
        toast.present();
    }

    private async presentConfirmation(
        title: string, 
        confirmTxt: string, 
        cancelTxt: string,
        confirmFunc: Function,
        cancelFunc: Function){
        const confirm = await this.alertCtrl.create({
            header: title,
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