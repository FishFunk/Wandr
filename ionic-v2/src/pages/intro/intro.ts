import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
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
    private fb: Facebook) {
  }

  goToLogin(){
    this.fb.login(['public_profile','user_location','email','user_age_range','user_friends','user_gender'])
      .then((res: FacebookLoginResponse) => console.log("Facebook login was successful!"))
      .catch(e => console.log('Error logging into Facebook', e));
  }

  
  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}
