import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController, Platform, App, ModalController, Events } from 'ionic-angular';
import { Location, User, IUser } from '../../models/user';
import {ICheckboxOption } from '../../models/metadata';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';
import { IntroPage } from '../intro/intro';
import _ from 'underscore';
import { ProfileModal } from './profile-modal';
import { Utils } from '../../helpers/utils';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  userInterests: ICheckboxOption[] = [];
  lifestyleOptions: ICheckboxOption[] = [];

  userData: IUser = new User('','','','', '',
    new Location(),[],[],'','', '', { notifications: true }, []);
  loadingPopup;
  secondConnectionCount: number = 0;
  defaultProfileImg = '../../assets/undraw/purple/undraw_profile_pic_ic5t.svg';

  private geocoder: google.maps.Geocoder;


  constructor(
    public modalController: ModalController,
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private appCtrl: App,
    private facebookApi: FacebookApi,
    private platform: Platform,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger,
    private events: Events) {

    this.geocoder = new google.maps.Geocoder();
    this.events.subscribe(Constants.refreshProfileDataEvent, this.reloadUser.bind(this));
  }

  ionViewDidLoad(){
    this.load();
  }

  async load(){
    this.showLoadingPopup();

    try{
      this.userInterests = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
      this.lifestyleOptions = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

      if(this.platform.is('cordova')){
        var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
        var token = window.localStorage.getItem(Constants.accessTokenKey);

        var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);

        if(!fbUserData){
          // Need to login to Facebook again
          this.loadingPopup.dismiss();
          this.appCtrl.getRootNav().setRoot(IntroPage);
          this.presentToast('top', 'Login expired. Please login again.');
          return;
        }

        var user = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);

        // If User does not exist yet
        if(!user) {
          this.userData.app_uid = firebaseUid;
          this.userData.facebook_uid = facebookUid;

          // Get first and last name
          var names = fbUserData.name.split(' ');
          this.userData.first_name = names[0];
          this.userData.last_name = names[1];

          // Get Facebook location and geocode it
          if(fbUserData.location && fbUserData.location.name) {
            this.userData.location.stringFormat = fbUserData.location.name;
            await this.extractLocationAndGeoData(fbUserData.location.name);
          }

          // Get Facebook friends list
          this.userData.friends = await this.facebookApi.getFriendList(facebookUid, token);

          // Email
          this.userData.email = fbUserData.email || '';

          // Get Facebook photo URL
          if(fbUserData.picture){
            this.userData.profile_img_url = 
              fbUserData.picture.data ? fbUserData.picture.data.url : '../../assets/avatar_man.png'; // TODO: Default image
          }

          // Create new user ref
          const newUsr = this.getPlainUserObject();
          await this.firestoreDbHelper.SetNewUserData(firebaseUid, newUsr);

          // Enable edit mode
          this.onClickEdit();
        } else {
          // IF user already has been created
          this.userData = <User> user;
          
          // Always update Facebook friends list
          this.userData.friends = await this.facebookApi.getFriendList(facebookUid, token);

          // Always update email
          this.userData.email = fbUserData.email || '';

          // Always update Facebook photo URL
          if(fbUserData.picture){
            this.userData.profile_img_url = 
              fbUserData.picture.data ? fbUserData.picture.data.url : this.defaultProfileImg;
          }
        }

        // Cache some user data
        window.localStorage.setItem(Constants.userFirstNameKey, this.userData.first_name);
        window.localStorage.setItem(Constants.userLastNameKey, this.userData.last_name);
        window.localStorage.setItem(Constants.profileImageUrlKey, this.userData.profile_img_url);
        window.localStorage.setItem(Constants.userFacebookFriendsKey, JSON.stringify(this.userData.friends));

        // Calculate second degree connections
        this.secondConnectionCount = await this.countSecondConnections();

        // Always update last login timestamp
        this.userData.last_login = new Date().toString();

        // Update DB
        await this.writeUserDataToDb();
      } else {
        // ionic serve path
        const uid = 'HN7yxROvzXhuoP80arDDmmmQUAj1'; // Johnny Appleseed
        window.localStorage.setItem(Constants.firebaseUserIdKey, uid);
        this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid, false);
        window.localStorage.setItem(Constants.userFirstNameKey, this.userData.first_name);
        window.localStorage.setItem(Constants.userLastNameKey, this.userData.last_name);
        window.localStorage.setItem(Constants.profileImageUrlKey, this.userData.profile_img_url);
        window.localStorage.setItem(Constants.userFacebookFriendsKey, JSON.stringify(this.userData.friends));
      }
 
      this.renderUserOptions();

      this.loadingPopup.dismiss();
    }
    catch(ex){
      this.loadingPopup.dismiss();
      this.logger.Error(ex);
    }
  }

  onClickEdit(){
      const modal = this.modalController.create(ProfileModal);
      modal.present();  
    }

  private async reloadUser(){
    var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);
    this.renderUserOptions();
  }

  private async extractLocationAndGeoData(location: string){
    let data = await this.forwardGeocode(location);
    let formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

    // geocode again to ensure generic city lat long
    data = await this.forwardGeocode(formattedLocation);
    formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

    const lat = +data.latitude;
    const lng = +data.longitude;

    this.userData.location = {
      stringFormat: formattedLocation,
      latitude: lat.toFixed(6).toString(),
      longitude: lng.toFixed(6).toString()
    };
  }

  private writeUserDataToDb(): Promise<any>{
    const updateData = this.getPlainUserObject();
    return this.firestoreDbHelper.UpdateUser(this.userData.app_uid, updateData);
  }

  private renderUserOptions(){
    if(this.userData.interests){
      this.userInterests.forEach(userOption=>{
        const match = _.find(this.userData.interests, (checked)=>{
          return userOption.label === checked.label;
        });
        if(match){
          userOption['checked'] = true;
        } else {
          userOption['checked'] = false;
        }
      });
    }

    if(this.userData.lifestyle){
      this.lifestyleOptions.forEach(userOption=>{
        const match = _.find(this.userData.lifestyle, (checked)=>{
          return userOption.label === checked.label;
        });
        if(match){
          userOption['checked'] = true;
        } else {
          userOption['checked'] = false;
        }
      });
    }
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

  private showLoadingPopup(){
    this.loadingPopup = this.loadingCtrl.create({
      spinner: 'hide',
      content:`<img src="../../assets/ring-loader.gif"/>`,
      cssClass: 'my-loading-class'
    });
    this.loadingPopup.present();
  }

  private presentToast(position: string,message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 1000
    });
    toast.present();
  }

  private async countSecondConnections(): Promise<number>{

    const currentUserFirebaseId = localStorage.getItem(Constants.firebaseUserIdKey);
    const currentUserFacebookId = localStorage.getItem(Constants.facebookUserIdKey);

    const secondConnections = await this.firestoreDbHelper.ReadSecondConnections(currentUserFirebaseId, currentUserFacebookId);

    return Promise.resolve(secondConnections.length);
  }

  private getPlainUserObject(){
    return <IUser> {
      app_uid: this.userData.app_uid, 
      facebook_uid: this.userData.facebook_uid,
      first_name: this.userData.first_name,
      last_name: this.userData.last_name,
      email: this.userData.email || "",
      bio: this.userData.bio || "",
      location: Object.assign({}, this.userData.location),
      friends: this.userData.friends.map((obj)=> {return Object.assign({}, obj)}),
      interests: this.userData.interests || [],
      lifestyle: this.userData.lifestyle || [],
      roomkeys: this.userData.roomkeys || [],
      last_login: this.userData.last_login || new Date().toString(),
      settings: Object.assign({}, this.userData.settings),
      profile_img_url: this.userData.profile_img_url
    }
  }
}
