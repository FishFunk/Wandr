import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
// import {
//     StartPage,
//     MyMetricsWizardStartDate
// } from '../../livingfit';

import { OnDestroy, OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { FacebookApi } from '../../helpers/facebookApi';
import { Logger } from '../../helpers/logger';
import { Constants } from '../../helpers/constants';
import { IntroPage } from '../intro/intro';
// import { MainPage } from '../auth/main/main';
// import { FaveFivePage } from '../fave-five/fave-five';
// import { SettingsPage } from '../settings/settings';
// import { TabsPage } from '../tabs/tabs';
// import { GroceryListPage } from '../grocery-list/grocery-list';
// import { DatePicker } from '@ionic-native/date-picker';



@Component({
    selector: 'page-welcome',
    templateUrl: 'welcome.html'
})
export class WelcomePage implements OnDestroy, OnInit {
    cordova: boolean = false;


    slides = [
        {
          title: "*What's your location?",
          description: "Enter your location",
          image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
        },
        {
          title: "*Describe yourself in a couple of sentenes:",
          description: "(e.g) Forget nudes, send me your playlist...",
          image: "../../assets/undraw/purple/undraw_connected_8wvi.svg"
        },
        {
          title: "*Tell us what you're cool with?",
          description: "Options, Politics, Religion, Age, Lifestyles, Genders",
          image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
        },
        {
          title: "*Where you been to?",
          description: "Enter your location",
          image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
        },
        {
          title: "*Where you going to?",
          description: "Enter your location",
          image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
        },
        {
          title: "*What're you seeking?",
          description: "Host, friend, opinion, romance",
          image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
        },
        {
          title: "*What're you offering?",
          description: "Host, friend, opion, romance",
          image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
        },
      ];
    

    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        private fbApi: FacebookApi,
        private platform: Platform,
        private loadingCtrl: LoadingController,
        private logger: Logger) 
        {
          this.cordova = this.platform.is('cordova');
        }
    

    public ngOnInit(): void {
        // check if the user is logged in, the do next, and same for the following page.
        //   this.storage.get('uid').then((val) => {
        //     this.uid = val;});
    }

    public ngOnDestroy(): void {

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
              this.presentAlert("Failed to login with Facebook");
              this.logger.Error(error);
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

    private cacheFacebookTokens(facebookUid: string, firebaseUid: string, accessToken: string){
        if(window.localStorage){
          window.localStorage.setItem(Constants.facebookUserIdKey, facebookUid);
          window.localStorage.setItem(Constants.firebaseUserIdKey, firebaseUid);
          window.localStorage.setItem(Constants.accessTokenKey, accessToken);
        } else {
          throw new Error("Local storage not available");
        }
      }



    private presentAlert(title) {
        let alert = this.alertCtrl.create({
            title: title,
            buttons: ['OK']
        });
        alert.present();
    }

    next() {
        // this.navCtrl.setRoot(SettingsPage, null, {animate: true, direction: 'forward'});
        // this.navCtrl.setRoot(MainPage, null, { animate: true, direction: 'forward' });
        // this.navCtrl.setRoot(MyMetricsWizardStart Date, null, { animate: true, direction: 'forward' });
        this.navCtrl.setRoot(IntroPage, null, { animate: true, direction: 'forward' });
        // this.navCtrl.setRoot(FaveFivePage, null, { animate: true, direction: 'forward' });
        // this.datePicker.show({
        //     date: new Date(),
        //     mode: 'date',
        //     androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
        // }).then(
        //     date => console.log('Got date: ', date),
        //     err => console.log('Error occurred while getting date: ', err)
        // );

    }
}