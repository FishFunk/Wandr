import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import { Logger } from '../../helpers/logger';


@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {
  cordova: boolean = false;

  slides = [
    {
      title: "Wandr-ing where to go next?",
      description: "Wandr makes it easy to explore where friends are located!",
      image: "../../assets/undraw/purple/undraw_directions_x53j.svg"
    },
    {
      title: "Explore the Wandr map.",
      description: "See all your connections on an interactive map.",
      image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
    },
    {
      title: "Instantly chat with connections!.",
      description: "Talk with your connections and make plans.",
      image: "../../assets/undraw/purple/undraw_chatting_2yvo (1).svg"
    },
  ];

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private fbApi: FacebookApi,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private logger: Logger){
      this.cordova = this.platform.is('cordova');
    }

  onClickfacebookLogin() {
    if (this.cordova) {
      let loadingPopup = this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
        });
        
      loadingPopup.present();

      this.checkStatusAndLogin()
        .then(()=>{
          loadingPopup.dismiss();
          this.next();
        })
        .catch((error)=> {
          loadingPopup.dismiss()
          this.logger.Error(error);
          this.presentAlert("Failed to login with Facebook");
          // TODO: Prompt with 'retry' button?
        });
    }
    else {
      // DEBUG/Browser Mode
      window.localStorage.setItem(Constants.facebookUserIdKey, "00001");
      window.localStorage.setItem(Constants.firebaseUserIdKey, "00001");
      // this.presentAlert('cordova is not available.');
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
    // const expiresIn = +statusResponse.authResponse.expiresIn;
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
