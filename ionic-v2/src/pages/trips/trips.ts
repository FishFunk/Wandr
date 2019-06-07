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

  onClickTrash(key){
    this.firestoreDbHelper.DeleteTripByKey(key)
      .catch(error=>{
        console.error(error);
      });
  }

  onClickEdit(key){
    const match = _.find(this.data, (obj)=> obj.key == key);
    const modal = this.modalController.create(CreateTripModal, { key: key, trip: match.data });
    modal.present();
  }

  onClickDetail(key){
    alert("not implemented");
  }

  load() :any {
    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.tripsObservable = this.firestoreDbHelper.ReadTripsObservableByUserId(uid);

    this.tripsObservable.subscribe(async data =>{
      this.data = data;
    });
  }
}
