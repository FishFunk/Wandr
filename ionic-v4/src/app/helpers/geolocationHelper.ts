import { Injectable } from "@angular/core";
import { ILocation } from "../models/user";
import { Utils } from "./utils";
import _ from 'underscore';

@Injectable()
export class GeoLocationHelper {
    
    private geocoder: google.maps.Geocoder;

    constructor(){
        this.geocoder = new google.maps.Geocoder();
    }

    public async extractLocationAndGeoData(location: string): Promise<ILocation>{
        let data = await this.forwardGeocode(location);
        let formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

        // geocode again to ensure generic city lat long
        data = await this.forwardGeocode(formattedLocation);
        formattedLocation = await this.reverseGeocode(+data.latitude, +data.longitude);

        const lat = +data.latitude;
        const lng = +data.longitude;
        const countryCode = data.countryCode;

        return <ILocation>{
            stringFormat: formattedLocation,
            latitude: lat.toFixed(6).toString(),
            longitude: lng.toFixed(6).toString(),
            countryCode: countryCode
        };
    }

    private async forwardGeocode(formattedLocation: string): Promise<any>
    {
        return new Promise((resolve, reject)=>{
            this.geocoder.geocode({ address: formattedLocation }, (results, status)=>{
            if(status == google.maps.GeocoderStatus.OK){
                var result = _.first(results);
                resolve({ 
                    latitude: result.geometry.location.lat(), 
                    longitude: result.geometry.location.lng(),
                    countryCode: this.getCountryCode(result) 
                });
            } else {
                reject(new Error(`Unable to forward geocode ${formattedLocation}`));
            }
            });
        });
    }

    private async reverseGeocode(lat: number, lng: number): Promise<any>
    {
        return new Promise((resolve, reject)=>{
            this.geocoder.geocode({ location: {lat: lat, lng: lng} }, (results, status)=>{
            if(status == google.maps.GeocoderStatus.OK){
                const formattedLocation = Utils.formatGeocoderResults(_.first(results));
                resolve(formattedLocation);
            }
            else {
                reject(new Error(`Unable to reverse geocode lat: ${lat}, lng: ${lng}`));
            }
            });
        });
    }

    private getCountryCode(data: google.maps.GeocoderResult): string{
        let countryCode: string;
        data.address_components.forEach(comp=>{
          if (_.indexOf(comp.types, 'country') >= 0){
            countryCode = comp.short_name;
          }
        });
    
        return countryCode;
    }
}