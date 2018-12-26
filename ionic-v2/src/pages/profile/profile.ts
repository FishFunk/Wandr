import { Component, NgZone } from '@angular/core';
import { IonicPage, LoadingController, ToastController, Platform } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Location, UserServices, User, IUser } from '../../models/user';
import { NativeGeocoderOptions, NativeGeocoderForwardResult, NativeGeocoderReverseResult, NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { FacebookApi } from '../../helpers/facebookApi';
import { Constants } from '../../helpers/constants';
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
  userData = new User('','','','',new Location(),[],new UserServices(),[],'','',0);
  editMode: boolean = false;
  loadingPopup;
  countries: any[] = [];
  selectedCountry: string;
  selectState: boolean = false;
  secondConnectionCount: number;

  private geocoderOptions: NativeGeocoderOptions = { useLocale: true, maxResults: 1 };

  constructor(
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private zone: NgZone,
    private nativeGeocoder: NativeGeocoder,
    private facebookApi: FacebookApi,
    private platform: Platform,
    private firebase: AngularFireDatabase) {

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

      var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);
      var snapshot = await this.firebase.database.ref('/users/' + firebaseUid).once('value');

      // If User does not exist yet
      if(!snapshot.val()){
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
        await this.firebase.database.ref('users/' + firebaseUid).set(this.userData);
      } else {
        // IF user already has been created
        this.userData = <User> snapshot.val();
        
        // Always update Facebook friends list
        this.userData.friends = await this.facebookApi.getFriendList(facebookUid);

        // Always update Facebook photo URL
        this.userData.profile_img_url = fbUserData.picture.data ? fbUserData.picture.data.url : ''; // TODO: Default image
      }

      // Cache some user data
      window.sessionStorage.setItem(Constants.userFirstNameKey, this.userData.first_name);
      window.sessionStorage.setItem(Constants.userLastNameKey, this.userData.last_name);
      sessionStorage.setItem(Constants.profileImageUrlKey, this.userData.profile_img_url);

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
    // TODO: Save breaks if geocode fails. Handle errors.
    if(this.autoComplete.input){
      await this.forwardGeocode(this.autoComplete.input);
      await this.reverseGeocode();
    }

    await this.writeUserDataToDb()
  }

  private writeUserDataToDb(): Promise<any>{
    return this.firebase.database.ref('users/' + this.userData.app_uid).set(this.userData, (possibleError)=>{
      if(possibleError){
        console.error(possibleError);
      };
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

    let count = 0;
    const currentUserFacebookId = sessionStorage.getItem(Constants.facebookUserIdKey);
    let ids = _.map(this.userData.friends, (friendObj) => friendObj.id);

    var promises = ids.map((facebook_uid)=> {
      return this.firebase.database.ref('users')
        .orderByChild('facebook_uid')
        .equalTo(facebook_uid)
        .once("value");
    });

    var firstConnectionSnapshots = await Promise.all(promises).catch((error)=> {
        console.error(error);
        return Promise.reject(error);
    });

    _.each(firstConnectionSnapshots, (snapshot)=>{
      var user: IUser = snapshot.val();
      _.each(user.friends, (secondConnection)=>{
        // Exclude current user
        if(secondConnection.id != currentUserFacebookId){
          count++;
        }
      });
    });

    return Promise.resolve(count);
  }
}
