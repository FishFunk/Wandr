import { Component } from "@angular/core";
import { ViewController, NavParams, AlertController, ModalController } from "ionic-angular";
import { FirestoreDbHelper } from "../../helpers/firestoreDbHelper";
import { Constants } from "../../helpers/constants";
import { ITrip } from "../../models/trip";
import { IUser } from "../../models/user";
import { CreateTripModal } from "./create-trip-modal";

@Component({
    selector: 'trip-details-modal',
    templateUrl: 'trip-details-modal.html'
  })

export class TripDetailsModal {

    key: string;
    tripData: ITrip = {
        uid: '',
        facebook_uid: '',
        location: ''
    };

    locals: IUser[] = [];

    constructor(
        params: NavParams,
        public viewCtrl: ViewController,
        private alertCtrl: AlertController,
        private firestoreDbHelper: FirestoreDbHelper,
        private modalController: ModalController
    ){
        this.key = params.get('key');
        this.tripData = params.get('trip');
    }

    ionViewDidLoad(){
        this.load();
    }

    async load(){
        const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        this.locals = await this.firestoreDbHelper.ReadAllUsers(uid, this.tripData.location);
    }

    onClickClose(){
        this.viewCtrl.dismiss();
    }

    onClickEdit(){
        this.viewCtrl.dismiss();
        const modal = this.modalController.create(CreateTripModal, { key: this.key, trip: this.tripData });
        modal.present();
    }

    onClickDelete(){
        const confirm = this.alertCtrl.create({
          title: `Are you sure want to delete this trip?`,
          buttons: [
            {
              text: 'Cancel',
              handler:  ()=>{}
            },
            {
              text: 'Delete',
              handler: this.deleteTrip.bind(this)
            }]
        });
        confirm.present();
    }

    private deleteTrip(){
        this.firestoreDbHelper.DeleteTripByKey(this.key)
          .then(()=>{
            this.viewCtrl.dismiss();
          })
          .catch(error=>{
            console.error(error);
          });
    }
}