import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, AlertController } from 'ionic-angular';
import { FacebookApi } from '../../helpers/facebookApi';
import { ContactPage } from './contact';
import { AboutPage } from './about';
import { WebDataService } from '../../helpers/webDataService';
import { Constants } from '../../helpers/constants';
import { AngularFireDatabase } from 'angularfire2/database';
import { IUserSettings } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {

    firebaseUid: string;
    pushNotifications: boolean;
    ghostMode: boolean;
    thirdConnections: boolean;

    constructor(
        public navCtrl: NavController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fbApi: FacebookApi,
        private firebase: AngularFireDatabase){

        this.firebaseUid = sessionStorage.getItem(Constants.firebaseUserIdKey);
    }

    ionViewDidLoad(){
        this.firebase.database.ref('/users/' + this.firebaseUid).once('value')
            .then((snapshot)=>{
                const usr = snapshot.val();
                if(usr && usr.settings){
                    this.pushNotifications = usr.settings.pushNotifications;
                    this.ghostMode = usr.settings.ghostMode;
                    this.thirdConnections = usr.settings.thirdConnections;
                }
            })
            .catch(error=>{
                console.error(error);
            });
    }

    updateUserSettings(){
        const newSettings: IUserSettings = {
            notifications: !!this.pushNotifications,
            ghostMode: !!this.ghostMode,
            thirdConnections: !!this.thirdConnections
        }
        this.firebase.database.ref('users/' + this.firebaseUid).child('settings').set(newSettings)
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
                this.presentToast('top', 'Logout successful!');
                // TODO: Reset to app intro
            })
            .catch((error)=>{
                console.error(error);
                this.presentToast('top', 'Logout failed!');
            });
    }

    private deleteUser(){
        alert("Not yet implemented");
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