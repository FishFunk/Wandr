import { Component, NgZone, ViewChild } from "@angular/core";
import { ViewController, ToastController, NavParams, LoadingController } from "ionic-angular";
import { FirestoreDbHelper } from "../../helpers/firestoreDbHelper";
import { Constants } from "../../helpers/constants";
import { ITrip } from "../../models/trip";
import { GeoLocationHelper } from "../../helpers/geolocationHelper";
import _ from 'underscore';
import { filter } from "rxjs/operators";
import { PhotoApi } from "../../helpers/photoApi";

@Component({
    selector: 'create-trip-modal',
    templateUrl: 'create-trip-modal.html'
  })

export class CreateTripModal {

    key: string = "";
    tripData: ITrip = {
        uid: '',
        facebook_uid: '',
        going: false,
        wantsToGo: false,
        // hasBeen: false,
        // business: false,
        // leisure: false,
        moving: false,
        flying: false,
        driving: false,
        startDate: null,
        endDate: null,
        location: ""
    };

    googleAutoComplete: any;
    autoComplete: any = { input: '' };
    autoCompleteItems: any[] = [];
    selectedPlace: google.maps.places.AutocompletePrediction;

    constructor(
        params: NavParams,
        public viewCtrl: ViewController,
        private zone: NgZone,
        public toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private firestoreDbHelper: FirestoreDbHelper,
        private geolocationHelper: GeoLocationHelper,
        private photoApi: PhotoApi) {
        
        const tripData = params.get('trip');
    
        if(tripData){
            this.key = params.get('key');
            this.tripData = JSON.parse(JSON.stringify(tripData));
            this.autoComplete.input = this.tripData.location;
        } else {
            this.tripData.uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
            this.tripData.facebook_uid = window.localStorage.getItem(Constants.facebookUserIdKey);
        }

        this.googleAutoComplete = new google.maps.places.AutocompleteService();
    }

    onClickCancel(){
        this.viewCtrl.dismiss();
    }

    async onClickSave(){
        if(!this.autoComplete.input){
            const toast = this.toastCtrl.create({message:"Destination field is required", duration: 3000});
            toast.present();
            return;
        }

        const loading = this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
        });
        loading.present();

        if(this.autoCompleteItems.length > 0){
            const place = _.first(this.autoCompleteItems);
            this.selectedPlace = place;
            this.autoComplete.input = place.description;
            this.autoCompleteItems = [];
            this.tripData.photoUrl = await this.getTripPhoto();
        }

        const location = await this.geolocationHelper.extractLocationAndGeoData(this.autoComplete.input);
        this.tripData.location = location.stringFormat;

        if(this.key){
            this.firestoreDbHelper.UpdateTrip(this.key, this.tripData)
                .then(()=>{
                    loading.dismiss();
                    this.viewCtrl.dismiss();
                })
                .catch(error=>{
                    loading.dismiss();
                    console.error(error);
                });
        } else {
            this.firestoreDbHelper.CreateNewTrip(this.tripData)
                .then(()=>{
                    loading.dismiss();
                    this.viewCtrl.dismiss();
                })
                .catch(error=>{
                    loading.dismiss();
                    console.error(error);
                });
        }
    }

    private async getTripPhoto(): Promise<string>{
        return this.photoApi.queryRandomPhoto(this.selectedPlace.description);
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

    async selectSearchResult(item){
        this.selectedPlace = item;
        this.autoComplete.input = item.description;
        this.autoCompleteItems = [];
        this.tripData.photoUrl = await this.getTripPhoto();
    }
    //******* end Bound Elements ***** //
}