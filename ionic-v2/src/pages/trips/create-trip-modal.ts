import { Component, NgZone } from "@angular/core";
import { ViewController, ToastController, NavParams } from "ionic-angular";
import { FirestoreDbHelper } from "../../helpers/firestoreDbHelper";
import { Constants } from "../../helpers/constants";
import { ITrip } from "../../models/trip";
import { GeoLocationHelper } from "../../helpers/geolocationHelper";

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
            this.tripData = tripData;
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
        if(this.autoComplete.input){
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
        } else {
            const toast = this.toastCtrl.create({message:"Destination field is required", duration: 3000});
            toast.present();
        }
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

    selectSearchResult(item){
        this.autoComplete.input = item.description;
        this.autoCompleteItems = [];
    }
    //******* end Bound Elements ***** //
}