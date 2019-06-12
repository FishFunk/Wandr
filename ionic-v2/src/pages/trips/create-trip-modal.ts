import { Component, NgZone, ViewChild } from "@angular/core";
import { ViewController, ToastController, NavParams } from "ionic-angular";
import { FirestoreDbHelper } from "../../helpers/firestoreDbHelper";
import { Constants } from "../../helpers/constants";
import { ITrip } from "../../models/trip";
import { GeoLocationHelper } from "../../helpers/geolocationHelper";
import _ from 'underscore';

@Component({
    selector: 'create-trip-modal',
    templateUrl: 'create-trip-modal.html'
  })

export class CreateTripModal {

    @ViewChild('placeResults') placesRef: any;

    key: string = "";
    tripData: ITrip = {
        uid: '',
        facebook_uid: '',
        going: false,
        wantsToGo: false,
        hasBeen: false,
        business: false,
        leisure: false,
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
    placeService: google.maps.places.PlacesService;

    constructor(
        params: NavParams,
        public viewCtrl: ViewController,
        private zone: NgZone,
        public toastCtrl: ToastController,
        private firestoreDbHelper: FirestoreDbHelper,
        private geolocationHelper: GeoLocationHelper) {
        
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

    ionViewDidEnter(){
        this.placeService = new google.maps.places.PlacesService(this.placesRef.nativeElement);
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
                    this.viewCtrl.dismiss();
                })
                .catch(error=>{
                    console.error(error);
                });
        } else {
            this.firestoreDbHelper.CreateNewTrip(this.tripData)
                .then(()=>{
                    this.viewCtrl.dismiss();
                })
                .catch(error=>{
                    console.error(error);
                });
        }
    }

    private async getTripPhoto(): Promise<string>{
        return new Promise((resolve, reject)=>{
            var request = {
              placeId: this.selectedPlace.place_id,
              fields: ['photo']
            };
            
            this.placeService.getDetails(request, function(place, status) {
              if (status === google.maps.places.PlacesServiceStatus.OK && place.photos && place.photos.length > 0) {
                const randomIdx = _.random(0, place.photos.length - 1);
                const photoUrl = place.photos[randomIdx].getUrl({maxWidth: 500});
                resolve(photoUrl);
              } else {
                reject(new Error("Failed to get place details and photo")); // TODO: Default image?
              }
            });
        });
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