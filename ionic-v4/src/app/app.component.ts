import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FacebookApi } from './helpers/facebookApi';
import { Router } from '@angular/router';
import { Constants } from './helpers/constants';
import { FirestoreDbHelper } from './helpers/firestoreDbHelper';

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
    private dbHelper: FirestoreDbHelper,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.onAppReady()
        .finally(()=>{
          this.splashScreen.hide();
        })
    });
  }

  async onAppReady(){
      // Handle tab hiding defect for android devices
      if (this.platform.is('android')) {
        this.statusBar.styleLightContent();
      } else {
        this.statusBar.styleDefault();
      }

      if(this.platform.is('cordova')){
        const fbStatus = await this.facebookApi.facebookLoginStatus();
        const isLoggedIn = fbStatus.status === 'connected';
  
        if(!isLoggedIn || !this.areValuesCached()){
          this.router.navigateByUrl('/intro');
        } else {
          const firebaseData = await this.facebookApi.firebaseLogin(fbStatus.authResponse.accessToken)
            .catch(error=>{
              console.error(error);
              this.router.navigateByUrl('/intro');
              return;
            });

          const userData = await this.dbHelper.ReadUserByFirebaseUid(firebaseData.user.uid, false);

          if(userData){
            this.cacheFacebookTokens(
              fbStatus.authResponse.userID, 
              firebaseData.user.uid,
              fbStatus.authResponse.accessToken);
  
            this.router.navigateByUrl('/tabs/trips');
          } else {
            this.router.navigateByUrl('/intro');
          }
        }
      } else {
        this.router.navigateByUrl('/intro');
      }
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

  private areValuesCached(): boolean
  {
    if(window.localStorage){
      return (
        window.localStorage.getItem(Constants.facebookUserIdKey) != null && 
        window.localStorage.getItem(Constants.firebaseUserIdKey)  != null &&
        window.localStorage.getItem(Constants.accessTokenKey) != null);
    } else {
      throw new Error("Local storage not available");
    }
  }
}
