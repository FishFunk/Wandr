import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, Platform, LoadingController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import { Logger } from '../../helpers/logger';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { User, IUser, Location, ILocation } from '../../models/user';
import _ from 'underscore';
import { Utils } from '../../helpers/utils';

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html'
})
export class IntroPage {

  private geocoder: google.maps.Geocoder;

  cordova: boolean = false;

  slides = [
    {
      title: '<br>Welcome fellow Wandrer!',
      // description: "Easily explore where friends are located!",
      image: "../../assets/undraw/purple/undraw_directions_x53j.svg"
    },
    {
      title: "Explore your Wandr map!",
      description: "Visualize and engage with your network in a whole new way.",
      image: "../../assets/undraw/purple/undraw_map_light_6ttm.svg"
    },
    {
      title: "Connect and chat with other Wandrers!",
      description: "Make plans and go have fun!",
      image: "../../assets/undraw/purple/undraw_chatting_2yvo (1).svg"
    },
  ];

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private fbApi: FacebookApi,
    private firestoreDbHelper: FirestoreDbHelper,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private logger: Logger) {
      this.cordova = this.platform.is('cordova');
      this.geocoder = new google.maps.Geocoder();
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
      window.localStorage.setItem(Constants.facebookUserIdKey, "10212312262992697");
      window.localStorage.setItem(Constants.firebaseUserIdKey, "SlQA4Yz8Pwhuv15d6ygmdo284UF2");
      // this.presentAlert('cordova is not available.');
      this.next();
    }
  }
  
  private next(): void {
    // this.navCtrl.setRoot(TabsPage);
    this.navCtrl.setRoot(TabsPage, null, { animate: true, direction: 'forward' });
  }

  private async checkStatusAndLogin() {
    console.info("Checking Facebook login status");
    
    let statusResponse = await this.fbApi.facebookLoginStatus();

    if (statusResponse.status != 'connected') {
      statusResponse = await this.fbApi.facebookLogin();
    }

    const firebaseData = await this.fbApi.firebaseLogin(statusResponse.authResponse.accessToken);

    this.cacheFacebookTokens(
      statusResponse.authResponse.userID, 
      firebaseData.user.uid,
      statusResponse.authResponse.accessToken);

    this.initUser();
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

  private async initUser(){
    var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
    var token = window.localStorage.getItem(Constants.accessTokenKey);

    var fbUserData = await <any> this.fbApi.getUser(facebookUid, token);

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
        user.location = await this.extractLocationAndGeoData(fbUserData.location.name);
      }

      // Get Facebook friends list
      user.friends = await this.fbApi.getFriendList(facebookUid, token);

      // Email
      user.email = fbUserData.email || '';

      // Get Facebook photo URL
      if(fbUserData.picture){
        user.profile_img_url = 
          fbUserData.picture.data ? fbUserData.picture.data.url : '../../assets/avatar_man.png'; // TODO: Default image
      }

      // Create new user ref
      const newUsr = Utils.getPlainUserObject(user);
      await this.firestoreDbHelper.SetNewUserData(firebaseUid, newUsr);
    } else {
      // IF user already has been created
      // Always update Facebook friends list
      user.friends = await this.fbApi.getFriendList(facebookUid, token);

      // Always update email
      user.email = fbUserData.email || '';

      // Always update Facebook photo URL
      if(fbUserData.picture){
        user.profile_img_url = 
          fbUserData.picture.data ? fbUserData.picture.data.url : '';
      }
    }

    // Cache some user data
    window.localStorage.setItem(Constants.userFirstNameKey, user.first_name);
    window.localStorage.setItem(Constants.userLastNameKey, user.last_name);
    window.localStorage.setItem(Constants.profileImageUrlKey, user.profile_img_url);
    window.localStorage.setItem(Constants.userFacebookFriendsKey, JSON.stringify(user.friends));

    // Always update last login timestamp
    user.last_login = new Date().toString();

    // Update DB
    await this.updateUserData(user);
  }

  private updateUserData(userData: IUser): Promise<any>{
    const updateData = Utils.getPlainUserObject(userData);
    return this.firestoreDbHelper.UpdateUser(userData.app_uid, updateData);
  }

  private async extractLocationAndGeoData(location: string): Promise<ILocation>{
    let data = await this.forwardGeocode(location);
    let formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

    // geocode again to ensure generic city lat long
    data = await this.forwardGeocode(formattedLocation);
    formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

    const lat = +data.latitude;
    const lng = +data.longitude;

    return <ILocation>{
      stringFormat: formattedLocation,
      latitude: lat.toFixed(6).toString(),
      longitude: lng.toFixed(6).toString()
    };
  }

  private async forwardGeocode(formattedLocation: string): Promise<any>
  {
    return new Promise((resolve, reject)=>{
      this.geocoder.geocode({ address: formattedLocation }, (results, status)=>{
        if(status == google.maps.GeocoderStatus.OK){
          var result = _.first(results);
          resolve({ latitude: result.geometry.location.lat(), longitude: result.geometry.location.lng() });
        } else {
          reject(new Error(`Unable to forward geocode ${formattedLocation}`));
        }
      });
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<any>
  {
    return new Promise((resolve, reject)=>{
      this.geocoder.geocode({ location: {lat: lat, lng: lng} }, (results, status)=>{
        if(status == google.maps.GeocoderStatus.OK){
          const formattedLocation = Utils.formatGeocoderResults(results);
          resolve(formattedLocation);
        }
        else {
          reject(new Error(`Unable to reverse geocode lat: ${lat}, lng: ${lng}`));
        }
      });
    });
  }
}
