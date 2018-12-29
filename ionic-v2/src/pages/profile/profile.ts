import { Component, NgZone } from '@angular/core';
import { IonicPage, LoadingController, ToastController, Platform } from 'ionic-angular';
import { Location, UserServices, User, IUser } from '../../models/user';
import { NativeGeocoderOptions, NativeGeocoderForwardResult, NativeGeocoderReverseResult, NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
import _ from 'underscore';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { AngularFirestore } from 'angularfire2/firestore';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];
  userData = new User('','','','',new Location(),[],new UserServices(),[],'','',0);
  editMode: boolean = false;
  loadingPopup;
  countries: any[] = [];
  selectedCountry: string;
  selectState: boolean = false;
  secondConnectionCount: number;

  private geocoderOptions: NativeGeocoderOptions = { useLocale: true, maxResults: 1 };

  constructor(
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private zone: NgZone,
    private nativeGeocoder: NativeGeocoder,
    private facebookApi: FacebookApi,
    private platform: Platform,
    private firestoreDbHelper: FirestoreDbHelper,
    private firestore: AngularFirestore) {

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

    if(this.platform.is('cordova')){
      var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
      var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
      var token = window.localStorage.getItem(Constants.accessTokenKey);

      var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);
      var snapshot = await this.firestore.collection('users').doc(firebaseUid).get().toPromise();

      // If User does not exist yet
      if(!snapshot.exists) {
        this.userData.app_uid = firebaseUid;
        this.userData.facebook_uid = facebookUid;

        // Get first and last name
        var names = fbUserData.name.split(' ');
        this.userData.first_name = names[0];
        this.userData.last_name = names[1];

        // Get Facebook location and geocode it
        this.userData.location.stringFormat = fbUserData.location.name;
        this.autoComplete.input = fbUserData.location.name;
        await this.forwardGeocode(fbUserData.location.name);

        // Get Facebook friends list
        this.userData.friends = await this.facebookApi.getFriendList(facebookUid);

        // Get Facebook photo URL
        this.userData.profile_img_url = fbUserData.picture.data ? fbUserData.picture.data.url : ''; // TODO: Default image
        
        // Create user ref
        const newUsr = this.getPlainUserObject();
        await this.firestore.collection('users').doc(firebaseUid).set(newUsr);
      } else {
        // IF user already has been created
        this.userData = <User> snapshot.data();
        
        // Always update Facebook friends list
        this.userData.friends = await this.facebookApi.getFriendList(facebookUid);

        // Always update Facebook photo URL
        this.userData.profile_img_url = fbUserData.picture.data ? fbUserData.picture.data.url : ''; // TODO: Default image
      }

      // Cache some user data
      window.localStorage.setItem(Constants.userFirstNameKey, this.userData.first_name);
      window.localStorage.setItem(Constants.userLastNameKey, this.userData.last_name);
      localStorage.setItem(Constants.profileImageUrlKey, this.userData.profile_img_url);

      // Calculate second degree connections
      this.secondConnectionCount = await this.countSecondConnections();

      // Always update last login timestamp
      this.userData.last_login = new Date().toString();

      // Update DB
      await this.writeUserDataToDb();
    } else {
      // Debug or Browser path
      this.userData = new User('', '', 'Johnny', 'Appleseed', 
        { stringFormat: 'Washington, DC', latitude: '', longitude: ''}, 
        [],
        { host: true, tips: true, meetup: true, emergencyContact: true},
        [],
        '',
        '../../assets/avatar_man.png',
        28,
        'This is fake data, for running in the browser.');
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
        })
        .catch(error=>{
          alert("Failed to update profile info");
          console.error(error);
          this.loadingPopup.dismiss();
        });
    }
  }

  //***** start Bound Elements ***** //
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
    return this.firestore.collection('users')
      .doc(this.userData.app_uid)
      .update(updateData)
      .catch((error)=>{
        console.error(error);
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
