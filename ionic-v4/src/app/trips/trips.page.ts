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
    let modal = await this.modalController.create({
      component: CreateTripModal
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

    this.tripsObservable.subscribe(async trips =>{
      this.data = _.sortBy(trips, (obj)=> obj.data.startDate ? new Date(obj.data.startDate) : 999999999999999);
    });

    spinner.dismiss();
  }
}
