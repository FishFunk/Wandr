import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import { FirestoreDbHelper } from "../../helpers/firestoreDbHelper";
import { Constants } from "../../helpers/constants";
import { ITrip } from "../../models/trip";
import { IUser } from "../../models/user";

@Component({
    selector: 'trip-details-modal',
    templateUrl: 'trip-details-modal.html'
  })

export class TripDetailsModal {

    tripData: ITrip = {
        uid: '',
        facebook_uid: '',
        location: ''
    };

    locals: IUser[] = [];

    constructor(
        params: NavParams,
        public viewCtrl: ViewController,
        private dbHelper: FirestoreDbHelper
    ){
        this.tripData = params.get('trip');
    }

    ionViewDidLoad(){
        this.load();
    }

    async load(){
        const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        this.locals = await this.dbHelper.ReadAllUsers(uid, this.tripData.location);
    }

    onClickClose(){
        this.viewCtrl.dismiss();
    }
}