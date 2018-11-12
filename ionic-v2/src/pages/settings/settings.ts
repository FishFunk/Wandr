import { Component } from '@angular/core';
import { IonicPage, ToastController, NavController } from 'ionic-angular';
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
        private fb: Facebook){

    }

    logout() {
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

    presentToast(position: string,message: string) {
        let toast = this.toastCtrl.create({
          message: message,
          position: position,
          duration: 1000
        });
        toast.present();
    }
}