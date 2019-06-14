import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, ModalController, AlertController, Modal } from 'ionic-angular';
import { CreateTripModal } from './create-trip-modal';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Constants } from '../../helpers/constants';
import { Observable } from 'rxjs';
import _ from 'underscore';
import { TripDetailsModal } from './trip-details-modal';
import { ITrip } from '../../models/trip';
import { PhotoApi } from '../../helpers/photoApi';

@IonicPage()
@Component({
    selector: 'trips-page',
    templateUrl: 'trips.html'
})
export class TripsPage {

  tripsObservable: Observable<any>;
  data = [];

  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: google.maps.places.AutocompletePrediction[] = [];
  selectedPlace: google.maps.places.AutocompletePrediction;

  constructor(private modalController: ModalController,
    private alertCtrl: AlertController,
    private firestoreDbHelper: FirestoreDbHelper,
    private zone: NgZone,
    private photoApi: PhotoApi)
  {
    this.googleAutoComplete = new google.maps.places.AutocompleteService();
  }

  ionViewDidEnter(){
    this.load();
  }

  async onClickCreateTrip(){
    let modal: Modal;
    if(this.autoCompleteItems.length > 0){
      const place = _.first(this.autoCompleteItems);
      this.selectedPlace = place;
      this.autoComplete.input = place.description;
      this.autoCompleteItems = [];
    }

    const trip: ITrip = {
      uid: window.localStorage.getItem(Constants.firebaseUserIdKey),
      facebook_uid: window.localStorage.getItem(Constants.facebookUserIdKey),
      location: this.autoComplete.input
    }

    trip.photoUrl = await this.getPhotoUrl();

    modal = this.modalController.create(CreateTripModal, { trip: trip });
    modal.present();

    this.autoComplete.input = '';
    this.autoCompleteItems = [];
  }

  onClickTrash(key){
    const confirm = this.alertCtrl.create({
      title: `Are you sure want to delete this trip?`,
      buttons: [
        {
          text: 'Cancel',
          handler:  ()=>{}
        },
        {
          text: 'Delete',
          handler: this.deleteTrip.bind(this, key)
        }]
    });
    confirm.present();
  }

  onClickEdit(key){
    const match = _.find(this.data, (obj)=> obj.key == key);
    const modal = this.modalController.create(CreateTripModal, { key: key, trip: match.data });
    modal.present();
  }

  onClickDetail(key){
    const match = _.find(this.data, (obj)=> obj.key == key);
    const modal = this.modalController.create(TripDetailsModal, { key: key, trip: match.data });
    modal.present();
  }

  load() :any {
    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.tripsObservable = this.firestoreDbHelper.ReadTripsObservableByUserId(uid);

    this.tripsObservable.subscribe(async data =>{
      this.data = data;
    });
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

  selectSearchResult(item: google.maps.places.AutocompletePrediction){
    this.selectedPlace = item;
    this.autoComplete.input = item.description;
    this.autoCompleteItems = [];
  }
  //******* end Bound Elements ***** //

  private deleteTrip(key){
    this.firestoreDbHelper.DeleteTripByKey(key)
      .catch(error=>{
        console.error(error);
      });
  }

  private getPhotoUrl(): Promise<string>{
    return this.photoApi.queryRandomPhoto(this.selectedPlace.description);
  }
}
