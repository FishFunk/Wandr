import { Component, NgZone } from '@angular/core';
import { ModalController, NavController, LoadingController } from '@ionic/angular';
import { CreateTripModal } from './create-trip-modal';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Constants } from '../helpers/constants';
import { Observable } from 'rxjs';
import _ from 'underscore';
import { TripDetailsModal } from './trip-details-modal';
import { ITrip } from '../models/trip';
// import { PhotoApi } from '../../helpers/photoApi';

@Component({
    selector: 'page-trips',
    templateUrl: 'trips.page.html',
    styleUrls: ['trips.page.scss']
})

export class TripsPage {

  tripsObservable: Observable<any>;
  data = [];

  googleAutoComplete: any;
  autoComplete: any = { input: '' };
  autoCompleteItems: google.maps.places.AutocompletePrediction[] = [];
  selectedPlace: google.maps.places.AutocompletePrediction;

  constructor(private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private firestoreDbHelper: FirestoreDbHelper,
    private zone: NgZone)
  {
    this.googleAutoComplete = new google.maps.places.AutocompleteService();
  }

  ngOnInit(){
    this.load();
  }

  async onClickCreateTrip(){
    let modal;
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

    //trip.photoUrl = await this.getPhotoUrl();

    modal = await this.modalController.create({
      component: CreateTripModal, 
      componentProps: { trip: trip }
    });

    modal.present();

    this.autoComplete.input = '';
    this.autoCompleteItems = [];
  }

  async onClickDetail(key){
    const match = _.find(this.data, (obj)=> obj.key == key);
    const modal = await this.modalController.create({
      component: TripDetailsModal, 
      componentProps: { key: key, trip: match.data }
    });

    modal.present();
  }

  onClickExplore(){
    this.navCtrl.navigateForward('/tabs/map');
  }

  async load(){
    const spinner = await this.loadingCtrl.create({
      spinner: 'dots'
    });
    spinner.present();

    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.tripsObservable = this.firestoreDbHelper.ReadTripsObservableByUserId(uid);

    this.tripsObservable.subscribe(async data =>{
      this.data = data;
    });

    spinner.dismiss();
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

  clearResults(){
    this.autoComplete.input = '';
    this.autoCompleteItems = [];
  }

  selectSearchResult(item: google.maps.places.AutocompletePrediction){
    this.selectedPlace = item;
    this.autoComplete.input = item.description;
    this.autoCompleteItems = [];
  }
  //******* end Bound Elements ***** //

  // private getPhotoUrl(): Promise<string>{
  //   return this.photoApi.queryRandomPhoto(this.selectedPlace.description);
  // }
}
