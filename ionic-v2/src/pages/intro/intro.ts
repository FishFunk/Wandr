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
      // DEBUG/Browser Mode
      window.localStorage.setItem(Constants.facebookUserIdKey, "00001");
      window.localStorage.setItem(Constants.firebaseUserIdKey, "00001");
      this.presentAlert('cordova is not available.');
      this.next();
    }
  }
  
  private next(): void {
    this.navCtrl.setRoot(TabsPage);
  }

  private async checkStatusAndLogin() {
    console.info("Checking Facebook login status");
    
    let statusResponse = await this.fbApi.facebookLoginStatus();

    if (statusResponse.status != 'connected') {
      statusResponse = await this.fbApi.facebookLogin();
    }

    const firebaseData = await this.fbApi.firebaseLogin(statusResponse.authResponse.accessToken);
    const expiresIn = +statusResponse.authResponse.expiresIn;
    // const expireDateInMillis = new Date().setTime(expiresIn * 1000);

    // TODO: Cache profile and other info in firebaseData?
    this.cacheFacebookTokens(
      statusResponse.authResponse.userID, 
      firebaseData.user.uid,
      statusResponse.authResponse.accessToken);
  }

  private presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

  private cacheFacebookTokens(facebookUid: string, firebaseUid: string, accessToken: string){
    if(window.localStorage){
      window.localStorage.setItem(Constants.facebookUserIdKey, facebookUid);
      window.localStorage.setItem(Constants.firebaseUserIdKey, firebaseUid);
      window.localStorage.setItem(Constants.accessTokenKey, accessToken);
    } else {
      throw new Error("Local storage not available");
    }
  }
}
