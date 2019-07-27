import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { FacebookApi } from '../helpers/facebookApi';
import { Platform } from '@ionic/angular';
import { Constants } from '../helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class IntroGuard implements CanActivate {
  constructor(
    private router: Router,
    private platform: Platform,
    private facebookApi: FacebookApi)
  {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

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

      return isLoggedIn;
    } else {
      // ionic serve
      return true;
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
}
