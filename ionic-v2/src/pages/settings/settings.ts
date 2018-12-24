import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, AlertController } from 'ionic-angular';
import { FacebookApi } from '../../helpers/facebookApi';
import { ContactPage } from './contact';
import { AboutPage } from './about';
import { WebDataService } from '../../helpers/webDataService';
import { Constants } from '../../helpers/constants';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {

    uid: string;
    pushNotifications: boolean;
    ghostMode: boolean;

    constructor(
        public navCtrl: NavController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fbApi: FacebookApi,
        private webDataService: WebDataService){

        this.uid = sessionStorage.getItem(Constants.firebaseUserIdKey);
    }

    ionViewDidLoad(){
        // this.webDataService.getUserSettings(this.uid)
        //     .subscribe((userSettings)=>{
        //         this.pushNotifications = !!userSettings.pushNotifications;
        //         this.ghostMode = !!userSettings.pushNotifications;
        //     });
    }

    updateUserSettings(){
        alert("Not yet implemented");
        // var newSettings = { 
        //     uid: this.uid, 
        //     pushNotifications: this.pushNotifications, 
        //     ghostMode: this.ghostMode 
        // };
        // this.webDataService.getUserSettings(newSettings)
        //     .subscribe((userSettings)=>{
        //         this.pushNotifications = !!userSettings.pushNotifications;
        //         this.ghostMode = !!userSettings.pushNotifications;
        //     });
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