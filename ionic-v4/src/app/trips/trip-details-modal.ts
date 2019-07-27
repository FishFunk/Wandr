import { Component } from "@angular/core";
import { NavParams, AlertController, ModalController } from "@ionic/angular";
import { FirestoreDbHelper } from "../helpers/firestoreDbHelper";
import { Constants } from "../helpers/constants";
import { ITrip } from "../models/trip";
import { IUser } from "../models/user";
import { CreateTripModal } from "./create-trip-modal";
import { TripsApi } from "../helpers/tripsApi";

@Component({
    selector: 'trip-details-modal',
    templateUrl: 'trip-details-modal.html',
    styleUrls: ['trip-details-modal.scss']
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
        public modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private firestoreDbHelper: FirestoreDbHelper,
        private modalController: ModalController,
        private tripsApi: TripsApi
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

        // await this.tripsApi.getHolidays()
        //   .then(data=>{
        //     console.log(data);
        //   })
        //   .catch(error=>{
        //     console.error(error);
        //   });

        // await this.tripsApi.getRegions()
        //   .then(data=>{
        //     console.log(data);
        //   })
        //   .catch(error=>{
        //     console.error(error);
        //   });
    }

    onClickClose(){
        this.modalCtrl.dismiss();
    }

    async onClickEdit(){
        this.modalCtrl.dismiss();
        const modal = await this.modalController.create({
          component: CreateTripModal, 
          componentProps: { key: this.key, trip: this.tripData }
        });
        modal.present();
    }

    async onClickDelete(){
        const confirm = await this.alertCtrl.create({
          header: `Are you sure want to delete this trip?`,
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
            this.modalController.dismiss();
          })
          .catch(error=>{
            console.error(error);
          });
    }
}