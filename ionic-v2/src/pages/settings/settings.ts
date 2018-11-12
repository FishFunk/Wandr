import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController, AlertController } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { IntroPage } from '../intro/intro';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
    constructor(
        public navCtrl: NavController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fb: Facebook){

    }

    onClickLogout() {
        const confirm = this.alertCtrl.create({
          title: 'Are you sure you want to logout?',
          buttons: [
            {
                text: "I'm sure",
                    handler: () => {
                    this.logout();
                }
            },
            {
                text: 'Oops, no way!',
                handler: () => {}
            }]
        });
        confirm.present();
    }


    private logout() {
        this.fb.logout()
            .then(()=>{
                this.presentToast('top', 'Logout successful!');
                this.navCtrl.setRoot(IntroPage);
            })
            .catch((error)=>{
                console.error(error);
                this.presentToast('top', 'Logout failed!');
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
}