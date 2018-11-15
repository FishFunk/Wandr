import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import {  AngularFireDatabase ,  FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { Facebook } from '@ionic-native/facebook';
import { IUser, User, ILocation, IUserServices } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  a = true;
  b = true;
  c = false;
  d = true;

  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];

  userData:  IUser = new User('TG1','FB1','Johnny', 'Appleseed', 
    28, "I really like planting apple trees.", 
    { stringFormat: '', latitude: '', longitude: ''},
    [],
    { host: true, tips: true, meetup: false, emergencyContact: false},
    "11/13/18",
    "");
  editMode: boolean = false;
  loadingPopup;
  countries: any[] = [];
  selectedCountry: string;
  selectState: boolean = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private zone: NgZone,
    private fb: Facebook) {

    this.loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: ''
    });
    this.loadingPopup.present();

    this.googleAutoComplete = new google.maps.places.AutocompleteService();

    //// TODO: Get geocode information from user string location, save in DB

    // var geocoderOptions: NativeGeocoderOptions = {
    //   useLocale: true,
    //   maxResults: 1
    // };
    // var data: NativeGeocoderForwardResult[] = await this.nativeGeocoder.forwardGeocode(strLocation, this.geocoderOptions);
    // if(!data || data.length == 0){
    //   console.error(`Unable to geocode: ${strLocation}`);
    //   return null;
    // }

    // return new google.maps.LatLng(data[0].latitude, data[0].longitude);

  }

  ionViewDidLoad(){
    this.loadingPopup.dismiss();
  }

  toggleEdit(){
    this.editMode = !this.editMode;
  }

  presentToast(position: string,message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 1000
    });
    toast.present();
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
    // TODO: Get geocode info and update profile
    this.autoComplete.input = item.description;
    this.autoCompleteItems = [];
  }
  // end Bound Elements
}
