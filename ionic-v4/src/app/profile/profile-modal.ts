import { Component, NgZone } from "@angular/core";
import { ModalController, NavParams, LoadingController, AlertController, Events } from "@ionic/angular";
import { IUser, User, Location } from '../models/user';
import { ICheckboxOption } from "../models/metadata";
import _ from "underscore";
import { FirestoreDbHelper } from "../helpers/firestoreDbHelper";
import { Constants } from "../helpers/constants";
import { Utils } from "../helpers/utils";
import { GeoLocationHelper } from "../helpers/geolocationHelper";

@Component({
    selector: 'profile-modal',
    templateUrl: 'profile-modal.html',
    styleUrls: ['profile-modal.scss']
})

export class ProfileModal {

  userData: IUser = new User('','','','', '',
    new Location(),[],[],'','', '', { notifications: true }, []);

  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: any[] = [];

  userInterests: ICheckboxOption[] = [];
  lifestyleOptions: ICheckboxOption[] = [];

  constructor(
    public modalCtrl: ModalController,
    private zone: NgZone,    
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public events: Events,
    private firestoreDbHelper: FirestoreDbHelper,
    private geolocationHelper: GeoLocationHelper) {

    this.googleAutoComplete = new google.maps.places.AutocompleteService();
  }

  async ngOnInit(): Promise<any> {
    const loader = await this.createLoadingPopup();
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

    this.autoComplete.input = this.userData.location.stringFormat || '';

    loader.dismiss();
  }

  async onClickSave(){
    const loader = await this.createLoadingPopup();
    loader.present();

    await this.saveProfileEdits();
    this.events.publish(Constants.refreshProfileDataEvent);
    loader.dismiss();

    this.modalCtrl.dismiss();
  }

  onClickCancel(){
    this.modalCtrl.dismiss();
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

  async presentAlert(title: string) {
    let alert = await this.alertCtrl.create({
      header: title,
      buttons: ['OK']
    });
    alert.present();
  }

  private async saveProfileEdits(){

    // TODO: Input validtaion
    // TODO: Save breaks if geocode fails. Handle errors.
    if(this.autoComplete.input)
    {
      this.userData.location = await this.geolocationHelper.extractLocationAndGeoData(this.autoComplete.input);
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
    const updateData = Utils.getPlainUserObject(this.userData);
    updateData.onboardcomplete = true;
    return this.firestoreDbHelper.UpdateUser(this.userData.app_uid, updateData);
  }

  private createLoadingPopup(){
    return this.loadingCtrl.create({
      spinner: 'dots'
    });
  }
}