import { Component, NgZone } from '@angular/core';
import { IonicPage, LoadingController, ToastController, Platform, App } from 'ionic-angular';
import { Location, User, IUser, ICheckboxOption } from '../../models/user';
import { NativeGeocoderOptions, NativeGeocoderForwardResult, NativeGeocoderReverseResult, NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Utils } from '../../helpers/utils';
import { Logger } from '../../helpers/logger';
import { IntroPage } from '../intro/intro';
import _ from 'underscore';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];
  userData: IUser = new User('','','','', '',
    new Location(),[],[],'','', '', { notifications: true }, []);
  userInterests: ICheckboxOption[] = [];
  lifestyleOptions: ICheckboxOption[] = [];
  editMode: boolean = false;
  loadingPopup;
  countries: any[] = [];
  selectedCountry: string;
  selectState: boolean = false;
  secondConnectionCount: number = 0;

  private geocoderOptions: NativeGeocoderOptions = { useLocale: true, maxResults: 1 };

  constructor(
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private appCtrl: App,
    private zone: NgZone,
    private nativeGeocoder: NativeGeocoder,
    private facebookApi: FacebookApi,
    private platform: Platform,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger) {

    this.googleAutoComplete = new google.maps.places.AutocompleteService();
  }

  ionViewDidLoad(){
    this.load();
  }

  ionViewWillLeave(){
    if(this.editMode){
      return this.toggleEdit();
    }
  }

  async load(){
    this.showLoadingPopup();

    this.userInterests = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
    this.lifestyleOptions = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

    try{
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
            this.autoComplete.input = fbUserData.location.name;
            await this.extractLocationAndGeoData();
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
          this.editMode = true;
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
              fbUserData.picture.data ? fbUserData.picture.data.url : ''; // TODO: Default image
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
        const uid = 'XkS98bzJM1co7vpyBlKGUpPgd2Q2'; // Johnny Appleseed
        this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid, false);
        this.userData.profile_img_url = '../../assets/avatar_man.png';
      }

      this.loadingPopup.dismiss();
    }
    catch(ex){
      this.loadingPopup.dismiss();
      await this.logger.Error(ex);
    }
  }

  async toggleEdit(){
    this.editMode = !this.editMode;
    if(!this.editMode){
      this.showLoadingPopup();
      return this.saveProfileEdits()
        .then(()=>{
          this.loadingPopup.dismiss();
          this.presentToast("top", "Profile updates saved!");
        })
        .catch(async error=>{
          await this.logger.Error(error);
          this.loadingPopup.dismiss();
          this.presentToast("top", "Failed to save profile updates");
        });
    } else {
      this.userData.interests.forEach(unchecked=>{
        const match = _.find(this.userInterests, (checked)=>{
          return unchecked.label === checked.label;
        });
        if(match){
          match['checked'] = true;
        }
      });

      this.userData.lifestyle.forEach(unchecked=>{
        const match = _.find(this.lifestyleOptions, (checked)=>{
          return unchecked.label === checked.label;
        });
        if(match){
          match['checked'] = true;
        }
      });
    }
  }

  //***** start Bound Elements ***** //
  updateSearchResults(){
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

  selectSearchResult(item){
    this.autoComplete.input = item.description;
    this.autoCompleteItems = [];
  }

  getUserRank(){
    return Utils.getUserRank(this.userData.friends.length);
  }

  onClickCreateNewPlan(){
    this.presentToast('top', 'Not yet implemented');
  }
  //******* end Bound Elements ***** //

  private async saveProfileEdits(){

    // TODO: Input validtaion
    // TODO: Save breaks if geocode fails. Handle errors.
    if(this.autoComplete.input)
    {
      await this.extractLocationAndGeoData();
    }

    this.userData.interests = [];
    this.userInterests.forEach(item =>{
      if(item['checked']){
        this.userData.interests.push(item);
      }
    });

    this.userData.lifestyle = [];
    this.lifestyleOptions.forEach(item =>{
      if(item['checked']){
        this.userData.lifestyle.push(item);
      }
    });

    await this.writeUserDataToDb()
  }

  private async extractLocationAndGeoData(){
    let data = await this.forwardGeocode(this.autoComplete.input);
    let formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

    // geocode again to ensure generic city lat long
    data = await this.forwardGeocode(formattedLocation);
    formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

    this.userData.location = {
      stringFormat: formattedLocation,
      latitude: data.latitude,
      longitude: data.longitude
    };
  }

  private writeUserDataToDb(): Promise<any>{
    const updateData = this.getPlainUserObject();
    return this.firestoreDbHelper.UpdateUser(this.userData.app_uid, updateData);
  }

  private async forwardGeocode(formattedLocation: string): Promise<NativeGeocoderForwardResult>
  {
    var data: NativeGeocoderForwardResult[] = 
      await this.nativeGeocoder.forwardGeocode(formattedLocation, this.geocoderOptions);

    
    if(!data || data.length == 0) {
      this.logger.Warn(`Unable to forward geocode: ${formattedLocation}`);
      return {latitude: '', longitude: ''};
    }

    return data[0];
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string>
  {
    var data: NativeGeocoderReverseResult[] = 
      await this.nativeGeocoder.reverseGeocode(lat, lng, this.geocoderOptions);

    if(!data || data.length == 0) {
      this.logger.Warn(`Unable to reverse geocode Lat: ${lat}, Long: ${lng}`);
      return;
    }

    if(data[0].countryCode == "US"){
      return `${data[0].locality}, ${data[0].administrativeArea}`;
    } else {
      return `${data[0].locality}, ${data[0].countryName}`;
    }
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
      //travel_info: this.userData.travel_info || "",
      roomkeys: this.userData.roomkeys,
      last_login: this.userData.last_login || new Date().toString(),
      settings: Object.assign({}, this.userData.settings),
      profile_img_url: this.userData.profile_img_url
    }
  }
}
