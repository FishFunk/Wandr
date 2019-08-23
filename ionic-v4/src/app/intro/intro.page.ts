import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacebookApi } from '../helpers/facebookApi';
import { Constants } from '../helpers/constants';
import { AlertController, Platform, NavController } from '@ionic/angular';
import { Logger } from '../helpers/logger';
import { GeoLocationHelper } from '../helpers/geolocationHelper';
import { Utils } from '../helpers/utils';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { User, Location, IUser} from '../models/user';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss']
})
export class IntroPage implements OnInit {

  slideOpts = {
    direction: 'horizontal',
    initialSlide: 0
  }

  constructor(
    private facebookApi: FacebookApi,
    private geolocationHelper: GeoLocationHelper,
    private firestoreDbHelper: FirestoreDbHelper,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private logger: Logger) { }

  ngOnInit() {
  }

  async onClickFacebookLogin() {
    if (this.platform.is('cordova')) {
      this.checkStatusAndLogin()
        .then(()=>{
          this.navCtrl.navigateRoot('/tabs');
        })
        .catch((error)=>{
          this.logger.Error(error);
          this.presentAlert("Failed to login with Facebook");
        });
    }
    else{
      // DEBUG/Browser Mode
      window.localStorage.setItem(Constants.facebookUserIdKey, "10212312262992697");
      window.localStorage.setItem(Constants.firebaseUserIdKey, "SlQA4Yz8Pwhuv15d6ygmdo284UF2");
      this.navCtrl.navigateRoot('/tabs');  
    }
  }

  private async checkStatusAndLogin() {
    let statusResponse = await this.facebookApi.facebookLoginStatus();

    if (statusResponse.status != 'connected') {
      statusResponse = await this.facebookApi.facebookLogin();
    }

    const firebaseData = await this.facebookApi.firebaseLogin(statusResponse.authResponse.accessToken);

    // TODO: Cache profile and other info in firebaseData?
    this.cacheFacebookTokens(
      statusResponse.authResponse.userID, 
      firebaseData.user.uid,
      statusResponse.authResponse.accessToken);

    await this.initUser();
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

  private async initUser(){
    var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
    var token = window.localStorage.getItem(Constants.accessTokenKey);

    var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);

    var user = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);

    // If User does not exist yet
    if(!user) {
      user = new User('','','','', '',
        new Location(),[],[],'','','', { notifications: true }, []);

      user.app_uid = firebaseUid;
      user.facebook_uid = facebookUid;

      // Get first and last name
      var names = fbUserData.name.split(' ');
      user.first_name = names[0];
      user.last_name = names[1];

      // Get Facebook location and geocode it
      if(fbUserData.location && fbUserData.location.name) {
        user.location = await this.geolocationHelper.extractLocationAndGeoData(fbUserData.location.name);
      }

      // Get Facebook friends list
      user.friends = await this.facebookApi.getFriendList(facebookUid, token);

      // Email
      user.email = fbUserData.email || '';

      // Set Facebook photo URL
      user.profile_img_url = `https://graph.facebook.com/${facebookUid}/picture?width=360&height=360`;

      // Create new user ref
      const newUsr = Utils.getPlainUserObject(user);
      await this.firestoreDbHelper.SetNewUserData(firebaseUid, newUsr);
    } else {
      // IF user already has been created
      // just update Facebook friends list and email
      user.friends = await this.facebookApi.getFriendList(facebookUid, token);
      user.email = fbUserData.email || '';

      this.updateUserData(user);
    }
  }

  private updateUserData(userData: IUser): Promise<any>{
    const updateData = Utils.getPlainUserObject(userData);
    return this.firestoreDbHelper.UpdateUser(userData.app_uid, updateData);
  }

  private async presentAlert(msg: string) {
    let alert = await this.alertCtrl.create({
      message: msg,
      buttons: ['OK']
    });
    alert.present();
  }
}