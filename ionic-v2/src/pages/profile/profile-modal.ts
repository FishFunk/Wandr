import { Component, NgZone } from "@angular/core";
import { ViewController, NavParams, LoadingController, AlertController, Events } from "ionic-angular";
import { IUser, ICheckboxOption, User, Location } from '../../models/user';
import _ from "underscore";

import { FormBuilder } from "@angular/forms";
import { FirestoreDbHelper } from "../../helpers/firestoreDbHelper";
import { Constants } from "../../helpers/constants";

@Component({
    selector: 'profile-modal',
    templateUrl: 'profile-modal.html'
  })

export class ProfileModal {

  userData: IUser = new User('','','','', '',
    new Location(),[],[],'','', '', { notifications: true }, []);

  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];

  userInterests: ICheckboxOption[] = [];
  lifestyleOptions: ICheckboxOption[] = [];

  private geocoder: google.maps.Geocoder;

  constructor(
    public viewCtrl: ViewController, 
    public fb: FormBuilder,
    private zone: NgZone,    
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public events: Events,
    private firestoreDbHelper: FirestoreDbHelper) {

    this.googleAutoComplete = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder(); 
  }

  async ngOnInit(): Promise<any> {
    const loader = this.createLoadingPopup();
    loader.present();

    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid);
    this.userInterests = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
    this.lifestyleOptions = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

    if(this.userData.interests){
      this.userData.interests.forEach(unchecked=>{
        const match = _.find(this.userInterests, (checked)=>{
          return unchecked.label === checked.label;
        });
        if(match){
          match['checked'] = true;
        }
      });
    }

    if(this.userData.lifestyle){
      this.userData.lifestyle.forEach(unchecked=>{
        const match = _.find(this.lifestyleOptions, (checked)=>{
          return unchecked.label === checked.label;
        });
        if(match){
          match['checked'] = true;
        }
      });
    }

    loader.dismiss();
  }

  async onClickSave(){
    const loader = this.createLoadingPopup();
    loader.present();

    await this.saveProfileEdits();
    this.events.publish(Constants.refreshProfileDataEvent);
    loader.dismiss();

    this.viewCtrl.dismiss(null, '', { animate: true, direction: 'down'});
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
  //******* end Bound Elements ***** //

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }

  private async saveProfileEdits(){

    // TODO: Input validtaion
    // TODO: Save breaks if geocode fails. Handle errors.
    if(this.autoComplete.input)
    {
      await this.extractLocationAndGeoData(this.autoComplete.input);
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

  private writeUserDataToDb(): Promise<any>{
    const updateData = this.getPlainUserObject();
    return this.firestoreDbHelper.UpdateUser(this.userData.app_uid, updateData);
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
      profile_img_url: this.userData.profile_img_url || ""
    }
  }

  private createLoadingPopup(){
    return this.loadingCtrl.create({
      spinner: 'hide',
      content:`<img src="../../assets/ring-loader.gif"/>`,
      cssClass: 'my-loading-class'
    });
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
          const formattedLocation = Utils.formatGeocoderResults(reults);
          resolve(formattedLocation);
        }
        else {
          reject(new Error(`Unable to reverse geocode lat: ${lat}, lng: ${lng}`));
        }
      });
    });
  }
}