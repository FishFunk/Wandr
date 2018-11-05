import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import * as firebase from 'firebase/app';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {

  slides = [
    {
      title: "Welcome to the Local Travaller",
      description: "Explore new places. Meet new people",
      image: "./assets/slide2-2.png",
      color: "#1ABC9C"
    },
    {
      title: "Join the Tribe!",
      description: "Travel globally. Experience locally.",
      image: "./assets/slide1-1.png",
      color: "#1ABC9C"
    }
  ];



  public userProfile: any = null;


  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private fb: Facebook,
    private platform: Platform,
    private loadingCtrl: LoadingController) {
  }

  facebookWithCordova(){

    let loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Logging in...'
    });
    this.fb.login(['public_profile','user_location','email','user_age_range','user_friends','user_gender'])
      .then((loginResponse: FacebookLoginResponse) => {
          
          const credentials: firebase.auth.AuthCredential = firebase.auth.FacebookAuthProvider.credential(
            loginResponse.authResponse.accessToken);
          
            loadingPopup.present();

            firebase.auth().signInWithCredential(credentials)
            .then((user: firebase.User) => {
              let uid: string = user.uid;
              this.presentAlert('firebase.User.uid:' + uid);
              loadingPopup.dismiss();
              this.next();
            })
            .catch((err) => {
              loadingPopup.dismiss();
              this.presentAlert('Error logging into Facebook: ' + err);
            });
        }
      )
      .catch(e => this.presentAlert('Error logging into Facebook: ' + e));
  }

  facebookLogin() {
    if (this.platform.is('cordova')) {
      this.facebookWithCordova();
    }
    else {
      this.presentAlert('cordova is not available.');
      this.next();
    }
  }

  
  private next(): void {
    //this.unsubscribe();
    this.navCtrl.setRoot(TabsPage);
  }

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}
