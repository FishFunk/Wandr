import { Component } from '@angular/core';
import { ModalController, NavController, LoadingController } from '@ionic/angular';
import { CreateTripModal } from './create-trip-modal';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Constants } from '../helpers/constants';
import { Observable } from 'rxjs';
import _ from 'underscore';
import { TripDetailsModal } from './trip-details-modal';
import { ITrip } from '../models/trip';
import { TripsApi } from '../helpers/tripsApi';
import { ILocation } from '../models/user';


@Component({
    selector: 'page-trips',
    templateUrl: 'trips.page.html',
    styleUrls: ['trips.page.scss']
})

export class TripsPage {

  tripsObservable: Observable<any>;
  data = [];

  constructor(private modalController: ModalController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private tripsApi: TripsApi,
    private firestoreDbHelper: FirestoreDbHelper)
  {
  }

  ngOnInit(){
    this.load();
  }

  async onClickCreateTrip(){
    let modal;
    let location;

    const trip: ITrip = {
      uid: window.localStorage.getItem(Constants.firebaseUserIdKey),
      facebook_uid: window.localStorage.getItem(Constants.facebookUserIdKey),
      location: location || ''
    }

    modal = await this.modalController.create({
      component: CreateTripModal, 
      componentProps: { trip: trip }
    });

    modal.present();
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

  getLocationScreenshotUrl(location: ILocation){
    const formattedLocation = location.stringFormat.replace(/,/g,'').replace(/ /g, '%20');
    return this.tripsApi.getLocationScreenshotUrl(formattedLocation);
  }

  async load(){
    const spinner = await this.loadingCtrl.create({
      spinner: 'dots'
    });
    spinner.present();

    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.tripsObservable = this.firestoreDbHelper.ReadTripsObservableByUserId(uid);

    this.tripsObservable.subscribe(async trip =>{
      this.data = _.sortBy(trip, (obj)=> obj.data.startDate);
    });

    spinner.dismiss();
  }
}
