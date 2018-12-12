import { Component, NgZone } from '@angular/core';
import { IonicPage, LoadingController, ToastController, Platform } from 'ionic-angular';
import {  AngularFireDatabase } from 'angularfire2/database-deprecated';
import { IUser, ILocation, IUserServices, User } from '../../models/user';
import { NativeGeocoderOptions, NativeGeocoderForwardResult, NativeGeocoderReverseResult, NativeGeocoder } from '@ionic-native/native-geocoder';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import { WebDataService } from '../../helpers/webDataService';
import { SaveProfileRequest } from '../../models/saveProfileRequest';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];
  userData:  IUser = new User('','','','',<ILocation>{},[],<IUserServices>{},'');
  editMode: boolean = false;
  loadingPopup;
  countries: any[] = [];
  selectedCountry: string;
  selectState: boolean = false;

  private geocoderOptions: NativeGeocoderOptions = { useLocale: true, maxResults: 1 };

  constructor(
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private zone: NgZone,
    private nativeGeocoder: NativeGeocoder,
    private facebookApi: FacebookApi,
    private webDataService: WebDataService,
    private platform: Platform) {

    this.googleAutoComplete = new google.maps.places.AutocompleteService();
  }

  ionViewDidLoad(){
    this.load();
  }

  async load(){
    this.showLoadingPopup();

    if(this.platform.is('cordova')){
      var firebaseUid = window.sessionStorage.getItem(Constants.firebaseUserIdKey);
      var facebookUid = window.sessionStorage.getItem(Constants.facebookUserIdKey);
      var token = window.sessionStorage.getItem(Constants.accessTokenKey);

      // TODO: IF user is onboarding, get FB data. Otherwise pull Firebase user data
      // TODO: If pulling from Firebase data, still need to update Facebook image and friend list
      var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);

      this.userData.app_uid = firebaseUid;
      this.userData.facebook_uid = facebookUid;

      // Get first and last name
      var names = fbUserData.name.split(' ');
      this.userData.first_name = names[0];
      window.sessionStorage.setItem(Constants.userFirstNameKey, names[0]);
      this.userData.last_name = names[1];
      window.sessionStorage.setItem(Constants.userLastNameKey, names[1]);

      // Update last login timestamp
      this.userData.last_login = new Date().toString();

      // Get Facebook friends list
      this.userData.friends = await this.facebookApi.getFriendList(facebookUid);
      
      // Get Facebook location and geocode it
      this.userData.location.stringFormat = fbUserData.location.name;
      this.autoComplete.input = fbUserData.location.name;
      await this.forwardGeocode(fbUserData.location.name);

      // Update Facebook photo url
      let photoUrl = fbUserData.picture ? fbUserData.picture.data.url : '../../assets/avatar_man.png';
      this.userData.profile_img_url = photoUrl;
      sessionStorage.setItem(Constants.profileImageUrlKey, photoUrl);

    } else {
      // Debug or Browser path
      this.userData = new User('', '', 'Johnny', 'Appleseed', 
        { stringFormat: 'Washington, DC', latitude: '', longitude: ''}, 
        [],
        { host: true, tips: true, meetup: true, emergencyContact: true},
        '',
        '../../assets/avatar_man.png',
        28,
        'This is fake data, for running in the browser.');
    }
    this.loadingPopup.dismiss();
  }

  toggleEdit(){
    this.editMode = !this.editMode;
    if(!this.editMode){
      this.showLoadingPopup();
      this.saveProfileEdits()
        .then(()=>{
          this.loadingPopup.dismiss();
        })
        .catch(error=>{
          console.error(error);
          this.loadingPopup.dismiss();
        });
    }
  }

  // start Bound Elements
  private updateSearchResults(){
    if (this.autoComplete.input == '') {
      this.autoCompleteItems = [];
      return;
    }
    this.googleAutoComplete.getPlacePredictions({ input: this.autoComplete.input },
    (predictions, status) => {
      this.autoCompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autoCompleteItems.push(prediction);
        });
      });
    });
  }

  private selectSearchResult(item){
    this.autoComplete.input = item.description;
    this.autoCompleteItems = [];
  }
  // end Bound Elements

  private async saveProfileEdits(){

    // TODO: Input validtaion

    await this.forwardGeocode(this.autoComplete.input);
    await this.reverseGeocode();

    var updateUser = new SaveProfileRequest();
    updateUser.uid = sessionStorage.getItem(Constants.firebaseUserIdKey);
    updateUser.onboardcomplete = true;
    updateUser.user = this.userData;

    this.webDataService.saveProfile(updateUser)
      .subscribe(returnData=>{
        alert("Profile update success!");
      },
      error =>{
        alert("Failed to update profile!");
      });
  }

  private async forwardGeocode(formattedLocation: string)
  {
    var data: NativeGeocoderForwardResult[] = 
      await this.nativeGeocoder.forwardGeocode(formattedLocation, this.geocoderOptions);

    
    if(!data || data.length == 0) {
      console.error(`Unable to forward geocode: ${formattedLocation}`);
      return;
    }

    this.userData.location.latitude = data[0].latitude;
    this.userData.location.longitude = data[0].longitude;
  }

  private async reverseGeocode()
  {
    var lat = +this.userData.location.latitude;
    var long = +this.userData.location.longitude;

    var data: NativeGeocoderReverseResult[] = 
      await this.nativeGeocoder.reverseGeocode(lat, long, this.geocoderOptions);

    if(!data || data.length == 0) {
      console.error(`Unable to reverse geocode Lat: ${lat}, Long: ${long}`);
      return;
    }

    if(data[0].countryCode == "US"){
      this.userData.location.stringFormat = `${data[0].locality}, ${data[0].administrativeArea}`;
    } else {
      this.userData.location.stringFormat = `${data[0].locality}, ${data[0].countryName}`;
    }
  }

  private showLoadingPopup(){
    this.loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: ''
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
}
