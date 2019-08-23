import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FacebookApi } from './helpers/facebookApi';
import { Router } from '@angular/router';
import { Constants } from './helpers/constants';

declare var google: any; // Declare global 'google' variable

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})

export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private facebookApi: FacebookApi,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.onAppReady();
    });
  }

  async onAppReady(){
      // Handle tab hiding defect for android devices
      if (this.platform.is('android')) {
        this.statusBar.styleLightContent();
        // this.keyboard.onKeyboardShow().subscribe(() => {
        //   document.body.classList.add('keyboard-is-open');
        // });

        // this.keyboard.onKeyboardHide().subscribe(() => {
        //   document.body.classList.remove('keyboard-is-open');
        // });
      } else {
        this.statusBar.styleDefault();
      }

      if(this.platform.is('cordova')){
        const fbStatus = await this.facebookApi.facebookLoginStatus();
        const isLoggedIn = fbStatus.status === 'connected';
  
        if(!isLoggedIn){
          this.router.navigateByUrl('/intro');
        } else {
          const firebaseData = await this.facebookApi.firebaseLogin(fbStatus.authResponse.accessToken);
      
          // TODO: Cache profile and other info in firebaseData?
          this.cacheFacebookTokens(
            fbStatus.authResponse.userID, 
            firebaseData.user.uid,
            fbStatus.authResponse.accessToken);
        }
      } else {
        this.router.navigateByUrl('/intro');
      }
      
      this.splashScreen.hide();
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
