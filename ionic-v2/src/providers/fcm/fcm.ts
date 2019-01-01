import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { Constants } from '../../helpers/constants';

/*
  Generated class for the FcmProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FcmProvider {

  constructor(public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform) {
  }

  public clearBadges(){
    this.firebaseNative.setBadgeNumber(0);
  }

  async getToken(){
    let token;
    
    // Android
    if(this.platform.is('android')){
      token = await this.firebaseNative.getToken();
    }

    // iOS
    if(this.platform.is('ios')){
      token = await this.firebaseNative.getToken();
      const perm = await this.firebaseNative.grantPermission();
    }

    // Web
    if(!this.platform.is('cordova')){

    }

    return this.saveTokenToFirestore(token);
  }

  private saveTokenToFirestore(token){
    if(!token) return;
    
    const devicesRef = this.afs.collection('devices');
    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    const docData = {
      token,
      userId: uid
    }

    return devicesRef.doc(token).set(docData);
  }

  listenToNotifications(): Observable<any>{
    return this.firebaseNative.onNotificationOpen();
  }
}
