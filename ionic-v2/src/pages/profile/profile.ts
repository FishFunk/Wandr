import { Component, NgZone } from '@angular/core';
import { IonicPage, LoadingController, ToastController, Platform } from 'ionic-angular';
import { Location, UserServices, User, IUser } from '../../models/user';
import { NativeGeocoderOptions, NativeGeocoderForwardResult, NativeGeocoderReverseResult, NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Utils } from '../../helpers/utils';
import { Logger } from '../../helpers/logger';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];
  userData = new User('','','','', '',new Location(),[],new UserServices(),[],'','', '', { notifications: true });
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
    try{
      if(this.platform.is('cordova')){
        var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
        var token = window.localStorage.getItem(Constants.accessTokenKey);

        var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);
        var user = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid);

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
            await this.forwardGeocode(fbUserData.location.name);
          }

          // Get Facebook friends list
          this.userData.friends = await this.facebookApi.getFriendList(facebookUid, token);

          // Email
          this.userData.email = fbUserData.email || '';

          // Get Facebook photo URL
          if(fbUserData.picture){
            this.userData.profile_img_url = 
              fbUserData.picture.data ? fbUserData.picture.data.url : ''; // TODO: Default image
          }

          // Create new user ref
          const newUsr = this.getPlainUserObject();
          await this.firestoreDbHelper.SetNewUserData(firebaseUid, newUsr);
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
        // Debug or Browser path
        this.userData = new User('', '', 'Johnny', 'Appleseed', '',
          { stringFormat: 'Dallas, TX', latitude: '', longitude: ''}, 
          [],
          { host: true, tips: true, meetup: true, emergencyContact: true},
          [],
          '',
          '../../assets/avatar_man.png',
          'Hey guys! I joined Wandr because I love traveling and meeting new people! Oh, I also have a thing for apples.');
      }
    }
    catch(ex){
      await this.logger.Error(ex);
    }
    this.loadingPopup.dismiss();
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
  //******* end Bound Elements ***** //

  private async saveProfileEdits(){

    // TODO: Input validtaion
    // TODO: Save breaks if geocode fails. Handle errors.
    if(this.autoComplete.input){
      await this.forwardGeocode(this.autoComplete.input);
      await this.reverseGeocode();
    }

    await this.writeUserDataToDb()
  }

  private writeUserDataToDb(): Promise<any>{
    const updateData = this.getPlainUserObject();
    return this.firestoreDbHelper.UpdateUser(this.userData.app_uid, updateData);
  }

  private async forwardGeocode(formattedLocation: string)
  {
    var data: NativeGeocoderForwardResult[] = 
      await this.nativeGeocoder.forwardGeocode(formattedLocation, this.geocoderOptions);

    
    if(!data || data.length == 0) {
      this.logger.Warn(`Unable to forward geocode: ${formattedLocation}`);
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
      this.logger.Warn(`Unable to reverse geocode Lat: ${lat}, Long: ${long}`);
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

  private async countSecondConnections(): Promise<number>{

    const currentUserFirebaseId = localStorage.getItem(Constants.firebaseUserIdKey);
    const currentUserFacebookId = localStorage.getItem(Constants.facebookUserIdKey);

    const firstConnections = await this.firestoreDbHelper.ReadFirstConnections(currentUserFirebaseId);
    const secondConnections = await this.firestoreDbHelper.ReadSecondConnections(currentUserFacebookId, firstConnections);

    return Promise.resolve(secondConnections.length);
  }

  private getPlainUserObject(){
    return <IUser> {
      app_uid: this.userData.app_uid, 
      facebook_uid: this.userData.facebook_uid,
      first_name: this.userData.first_name,
      last_name: this.userData.last_name,
      email: this.userData.email,
      bio: this.userData.bio,
      location: Object.assign({}, this.userData.location),
      friends: this.userData.friends.map((obj)=> {return Object.assign({}, obj)}),
      services: {
        host: this.userData.services.host,
        tips: this.userData.services.tips,
        meetup: this.userData.services.meetup,
        emergencyContact: this.userData.services.emergencyContact
      },
      roomkeys: this.userData.roomkeys,
      last_login: this.userData.last_login,
      settings: Object.assign({}, this.userData.settings),
      profile_img_url: this.userData.profile_img_url
    }
  }
}
