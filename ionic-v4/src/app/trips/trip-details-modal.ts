import { Component } from "@angular/core";
import { NavParams, AlertController, ModalController, NavController, Events } from "@ionic/angular";
import { FirestoreDbHelper } from "../helpers/firestoreDbHelper";
import { Constants } from "../helpers/constants";
import { ITrip } from "../models/trip";
import { IUser, Location } from "../models/user";
import { CreateTripModal } from "./create-trip-modal";
import { TripsApi } from "../helpers/tripsApi";
import _ from "underscore";
import { Utils } from '../helpers/utils';
import { ConnectionProfileModal } from '../non-tabs/connection-profile';

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
        location: new Location()
    };

    weatherInfo = {
      F: '',
      C: '',
      Text: '',
      Icon: ''
    }

    upcomingHolidays = [];

    locals: IUser[] = [];

    constructor(
        params: NavParams,
        private events: Events,
        private modalCtrl: ModalController,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private firestoreDbHelper: FirestoreDbHelper,
        private tripsApi: TripsApi
    ){
        this.key = params.get('key');
        this.tripData = params.get('trip');
    }

    ngOnInit(){
        this.load();
    }

    async load(){
        const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        this.locals = await this.firestoreDbHelper.ReadAllUsers(uid, this.tripData.location.stringFormat);

        const weatherData = await this.tripsApi.getWeatherInfoByLatLong(this.tripData.location.latitude, this.tripData.location.longitude)
          .catch(error=>{
            console.error(error);
          });

        const weatherInfo = _.first(weatherData);
        if(weatherInfo){
          this.weatherInfo.F = weatherInfo.Temperature.Imperial.Value;
          this.weatherInfo.C = weatherInfo.Temperature.Metric.Value;
          this.weatherInfo.Text = weatherInfo.WeatherText;
          this.weatherInfo.Icon = Utils.getWeatherIcon(weatherInfo.WeatherText);
        }

        this.upcomingHolidays = await this.tripsApi.getUpcomingHolidays(this.tripData.location.countryCode)
          .catch(error=>{
            console.error(error);
          });
    }

    onClickClose(){
        this.modalCtrl.dismiss();
    }

    async onClickUser(user: IUser){
      const modal = await this.modalCtrl.create({
          component: ConnectionProfileModal,
          componentProps: {
              userId: user.app_uid,
              showChatButton: true
          }
      });
      modal.present();
    }

    async onClickGoToMapSpot(){
      this.modalCtrl.dismiss();
      await this.navCtrl.navigateForward('/tabs/map');
      setTimeout(()=>{
        this.events.publish(Constants.onSnapToMapLocationEvent, this.tripData.location);
      },500);
    }
    
    async onClickEdit(){
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
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
            this.modalCtrl.dismiss();
          })
          .catch(error=>{
            console.error(error);
          });
    }
}