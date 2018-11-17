import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import {  AngularFireDatabase } from 'angularfire2/database-deprecated';
import { IUser, User } from '../../models/user';
import { NativeGeocoderOptions, NativeGeocoderForwardResult, NativeGeocoderReverseResult, NativeGeocoder } from '@ionic-native/native-geocoder';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];

  userData:  IUser = new User('TG1','FB1','Johnny', 'Appleseed', 
    28, "I really like planting apple trees.", 
    { stringFormat: 'San Diego, CA', latitude: '', longitude: ''},
    [],
    { host: true, tips: true, meetup: false, emergencyContact: false},
    "11/13/18",
    "");
  editMode: boolean = false;
  loadingPopup;
  countries: any[] = [];
  selectedCountry: string;
  selectState: boolean = false;

  private geocoderOptions: NativeGeocoderOptions = { useLocale: true, maxResults: 1 };

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private zone: NgZone,
    private nativeGeocoder: NativeGeocoder) {

    this.googleAutoComplete = new google.maps.places.AutocompleteService();
  }

  ionViewDidLoad(){
    // this.loadingPopup.dismiss();
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
    await this.forwardGeocode(this.autoComplete.input);
    await this.reverseGeocode();
    // TODO: Update backend
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
