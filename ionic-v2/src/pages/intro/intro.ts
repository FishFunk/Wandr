import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';

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
    private alertCtrl: AlertController) {
  }

  goToLogin(){
    this.presentAlert("Need to implement Facebook login")
  }

  
  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}
