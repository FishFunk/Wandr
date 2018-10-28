import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

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
      color: "#C0C0B5"
    }
  ];


  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private fb: Facebook,
    private platform: Platform,) {
  }

  facebookWithCordova(){
    this.fb.login(['public_profile','user_location','email','user_age_range','user_friends','user_gender'])
      .then((res: FacebookLoginResponse) => {
          //this.navCtrl.push(HomePage);
          this.presentAlert("Go to HomePage");
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
    }
  }

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}
