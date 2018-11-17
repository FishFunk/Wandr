import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, LoadingController, Tabs } from 'ionic-angular';

import { TabsPage } from '../tabs/tabs';
import { FacebookApi } from '../../helpers/facebookApi';

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {
  cordova: boolean = false;

  slides = [
    {
      title: "Welcome, Travel Guru",
      description: "Explore. Discover. Connect.",
      image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
    },
    {
      title: "Join the Tribe!",
      description: "Travel globally. Experience locally.",
      image: "../../assets/undraw/purple/undraw_connected_8wvi.svg"
    }
  ];

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private fbApi: FacebookApi,
    private platform: Platform,
    private loadingCtrl: LoadingController) 
    {
      this.cordova = this.platform.is('cordova');
    }

  onClickfacebookLogin() {
    if (this.cordova) {
      this.checkStatusAndLogin()
        .then(()=>this.next())
        .catch((error)=> {
          console.log(error);
          this.presentAlert("Failed to login with Facebook");
        });
    }
    else {
      this.presentAlert('cordova is not available.');
      this.next();
    }
  }
  
  private next(): void {
    this.navCtrl.setRoot(TabsPage);
  }

  private checkStatusAndLogin() {
    let loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Logging in...'
    });

    console.log("Checking Facebook login status");
    
    return new Promise((resolve, reject) =>{
      this.fbApi.facebookLoginStatus()
        .then((status) =>
        {
          if (status === 'connected') {
            resolve();
          } else {
            console.log(`Facebook login status: ${status}`);

            this.fbApi.facebookLogin()
              .then(()=>{
                loadingPopup.dismiss();
                resolve();
              })
              .catch((error)=>{
                loadingPopup.dismiss();
                reject(error);
              });
          }
        })
        .catch((error)=> {
          loadingPopup.dismiss();
          reject(error);
        });
    });
  }

  private presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}
