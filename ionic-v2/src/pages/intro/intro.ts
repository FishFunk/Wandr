import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';


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
      description: "See where your network can take you.",
      image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
    },
    {
      title: "Join the Tribe!",
      description: "Explore. Discover. Connect.",
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
      let loadingPopup = this.loadingCtrl.create({
        spinner: 'crescent',
        content: 'Logging in...'
      });

      this.checkStatusAndLogin()
        .then(()=>{
          loadingPopup.dismiss();
          this.next();
        })
        .catch((error)=> {
          loadingPopup.dismiss()
          console.log(error);
          this.presentAlert("Failed to login with Facebook");
          // TODO: Prompt with 'retry' button?
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

  private async checkStatusAndLogin() {
    console.log("Checking Facebook login status");
    
    let statusResponse = await this.fbApi.facebookLoginStatus();

    if (statusResponse.status != 'connected') {
      statusResponse = await this.fbApi.facebookLogin();
    }

    var userData = await this.fbApi.firebaseLogin(statusResponse.authResponse.accessToken);

    this.cacheFacebookTokens(
      statusResponse.authResponse.userID, 
      statusResponse.authResponse.accessToken,
      userData.uid);
  }

  private presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

  private cacheFacebookTokens(facebookUid: string, firebaseUid: string, accessToken: string){
    if(window.sessionStorage){
      window.sessionStorage.setItem(Constants.facebookUserIdKey, facebookUid);
      window.sessionStorage.setItem(Constants.firebaseUserIdKey, firebaseUid);
      window.sessionStorage.setItem(Constants.accessTokenKey, accessToken);
    } else {
      throw new Error("Session storage not available");
    }
  }
}
