import { Component, NgZone } from "@angular/core";
import { ToastController, NavParams, LoadingController, ModalController } from "@ionic/angular";
import { FirestoreDbHelper } from "../helpers/firestoreDbHelper";
import { Constants } from "../helpers/constants";
import { ITrip } from "../models/trip";
import { GeoLocationHelper } from "../helpers/geolocationHelper";
import _ from 'underscore';
import { Location } from '../models/user';
import { TripsApi } from '../helpers/tripsApi';
import { Utils } from '../helpers/utils';
import * as moment from 'moment';

@Component({
    selector: 'create-trip-modal',
    templateUrl: 'create-trip-modal.html',
    styleUrls: ['create-trip-modal.scss']
  })

export class CreateTripModal {

    todaysDate = moment().format('YYYY-MM-DD');
    maxDate = moment().add(50, 'years').format('YYYY-MM-DD');
    key: string = "";
    tripData: ITrip = {
        uid: '',
        facebook_uid: '',
        business: false,
        leisure: false,
        moving: false,
        startDate: null,
        endDate: null,
        location: new Location(),
        notes: ""
    };

    weatherInfo = {
        F: '',
        C: '',
        Text: '',
        Icon: ''
    }

    googleAutoComplete: any;
    autoComplete: any = { input: '' };
    autoCompleteItems: any[] = [];
    // selectedPlace: google.maps.places.AutocompletePrediction;

    constructor(
        params: NavParams,
        public modalCtrl: ModalController,
        private zone: NgZone,
        public toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private firestoreDbHelper: FirestoreDbHelper,
        private geolocationHelper: GeoLocationHelper,
        private tripsApi: TripsApi) {
        
        const tripDataParam = params.get('trip');
    
        if(tripDataParam){
            this.key = params.get('key');
            this.tripData = JSON.parse(JSON.stringify(tripDataParam));
            this.autoComplete.input = this.tripData.location.stringFormat || '';
        } else {
            this.tripData.uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
            this.tripData.facebook_uid = window.localStorage.getItem(Constants.facebookUserIdKey);
        }

        this.googleAutoComplete = new google.maps.places.AutocompleteService();
    }

    ngOnInit(){
        this.loadWeatherInfo();
    }

    async loadWeatherInfo(){
        if(this.autoComplete.input)
        {
            const location = await this.geolocationHelper.extractLocationAndGeoData(this.autoComplete.input);
            const weatherData = await this.tripsApi.getWeatherInfoByLatLong(location.latitude, location.longitude)
            const weatherInfo = _.first(weatherData);
            this.weatherInfo.F = weatherInfo.Temperature.Imperial.Value;
            this.weatherInfo.C = weatherInfo.Temperature.Metric.Value;
            this.weatherInfo.Text = weatherInfo.WeatherText;
            this.weatherInfo.Icon = Utils.getWeatherIcon(weatherInfo.WeatherText);
        }
    }

    onClickCancel(){
        this.modalCtrl.dismiss();
    }

    async onClickSave(){
        if(!this.autoComplete.input){
            const toast = await this.toastCtrl.create({message: "Destination field is required", duration: 3000});
            toast.present();
            return;
        }

        const loading = await this.loadingCtrl.create({
            spinner: 'dots'
        });
        loading.present();

        if(this.autoCompleteItems.length > 0){
            const place = _.first(this.autoCompleteItems);
            // this.selectedPlace = place;
            this.autoComplete.input = place.description;
            this.autoCompleteItems = [];
            //this.tripData.photoUrl = await this.getTripPhoto();
        }

        await this.geolocationHelper.extractLocationAndGeoData(this.autoComplete.input)
            .then((location)=>{
                this.tripData.location = location;
            })
            .catch((error)=>{
                console.error(error);
                loading.dismiss();
                return;
            })

        // Format Dates
        if(this.tripData.startDate){
            this.tripData.startDate = moment(this.tripData.startDate).format('M/D/YY');
        }
        if(this.tripData.endDate){
            this.tripData.endDate = moment(this.tripData.endDate).format('M/D/YY');
        }

        if(this.key){
            this.firestoreDbHelper.UpdateTrip(this.key, this.tripData)
                .then(()=>{
                    loading.dismiss();
                    this.modalCtrl.dismiss();
                })
                .catch(error=>{
                    loading.dismiss();
                    console.error(error);
                });
        } else {
            this.firestoreDbHelper.CreateNewTrip(this.tripData)
                .then(()=>{
                    loading.dismiss();
                    this.modalCtrl.dismiss();
                })
                .catch(error=>{
                    loading.dismiss();
                    console.error(error);
                });
        }
    }

    // private async getTripPhoto(): Promise<string>{
    //     return this.photoApi.queryRandomPhoto(this.selectedPlace.description);
    // }
    
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

    async selectSearchResult(item){
        // this.selectedPlace = item;
        this.autoComplete.input = item.description;
        this.autoCompleteItems = [];
        this.loadWeatherInfo();
        //this.tripData.photoUrl = await this.getTripPhoto();
    }
    //******* end Bound Elements ***** //
}