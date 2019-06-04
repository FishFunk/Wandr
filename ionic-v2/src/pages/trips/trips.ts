import { Component } from '@angular/core';
import { IonicPage, ModalController } from 'ionic-angular';
import { CreateTripModal } from './create-trip-modal';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Constants } from '../../helpers/constants';
import { Observable } from 'rxjs';
import _ from 'underscore';

@IonicPage()
@Component({
    selector: 'trips-page',
    templateUrl: 'trips.html'
})
export class TripsPage {

  tripsObservable: Observable<any>;
  data = [];

  constructor(private modalController: ModalController,
    private firestoreDbHelper: FirestoreDbHelper) {
  }

  ionViewDidEnter(){
    this.load();
  }

  onClickCreateTrip(){
    const modal = this.modalController.create(CreateTripModal);
    modal.present();
  }

  load() :any {
    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.tripsObservable = this.firestoreDbHelper.ReadTripsObservableByUserId(uid);

    this.tripsObservable.subscribe(async data =>{
      this.data = _.map(data, (obj, key)=> {
        return obj
      });
  });

    // return {
    //     "items": [
    //         {
    //             "id": 1,
    //             "title": "San Diego",
    //             "time": "March 29, 2019",
    //             "image": "assets/images/background/3.jpg"
    //         },
    //         {
    //             "id": 2,
    //             "title": "Miami",
    //             "time": "March 29, 2018",
    //             "image": "assets/images/background/2.jpg"
    //         },
    //         {
    //             "id": 3,
    //             "title": "Washington, DC.",
    //             "time": "March 29, 2017",
    //             "image": "assets/images/background/3.jpg"
    //         },
    //         {
    //             "id": 4,
    //             "title": "Mexico City",
    //             "time": "March 29, 2016",
    //             "image": "assets/images/background/2.jpg"
    //         }
    //     ]
    // };
  }
}
