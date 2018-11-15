import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, LoadingController, Tabs } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import * as firebase from 'firebase/app';
import { TabsPage } from '../tabs/tabs';

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
    private fb: Facebook,
    private platform: Platform,
    private loadingCtrl: LoadingController) 
    {
      this.cordova = this.platform.is('cordova');
    }

  onClickfacebookLogin() {
    if (this.cordova) {
      this.facebookWithCordova()
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

  private presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

  private facebookWithCordova()
  {
    console.log("Checking Facebook login status");

    return new Promise<string>((resolve, reject)=>{
      this.fb.getLoginStatus()
      .then((response) =>
      {
          if (response.status === 'connected') {
            console.log("Status: CONNECTED");
            this.next();
            resolve();
          } else {
            console.log(`Status: ${response.status}`);
            this.facebookLogin()
              .then(()=>resolve())
              .catch((error)=>reject(error));
          }
        })
        .catch((error)=> reject(error));
    });
  }

  private facebookLogin(){
    let loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Logging in...'
    });

    return new Promise((resolve, reject) =>{
      this.fb.login(['public_profile','user_location','email','user_age_range','user_friends','user_gender'])
        .then((loginResponse: FacebookLoginResponse) => {
            
            const credentials: firebase.auth.AuthCredential = firebase.auth.FacebookAuthProvider.credential(
              loginResponse.authResponse.accessToken);
            
              loadingPopup.present();

              firebase.auth().signInWithCredential(credentials)
                .then((user: firebase.User) => {
                  console.info('firebase.User.uid:' + user.uid);
                  loadingPopup.dismiss();
                  this.next();
                  resolve();
                })
                .catch((error) => {
                  loadingPopup.dismiss();
                  reject(error);
                });
          }
        )
        .catch((error) => {
          loadingPopup.dismiss();
          reject(error);
        });
    });
  }
}
