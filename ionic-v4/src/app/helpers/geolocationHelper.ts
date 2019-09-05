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
        let data: google.maps.GeocoderResult = await this.forwardGeocode(location);
        const formattedLocation = Utils.formatGeocoderResults(data);

        // geocode again to ensure generic city lat long
        data = await this.forwardGeocode(formattedLocation);

        const lat = +data.geometry.location.lat();
        const lng = +data.geometry.location.lng();
        const countryCode = this.getCountryCode(data);

        return <ILocation>{
            stringFormat: formattedLocation,
            latitude: lat.toFixed(6).toString(),
            longitude: lng.toFixed(6).toString(),
            countryCode: countryCode
        };
    }

    private async forwardGeocode(location: string): Promise<any>
    {
        return new Promise((resolve, reject)=>{
            this.geocoder.geocode({ address: location }, (results, status)=>{
                if(status == google.maps.GeocoderStatus.OK){
                    var result = _.first(results);
                    resolve(result);
                } else {
                    reject(new Error(`Unable to forward geocode ${location}`));
                }
            });
        });
    }

    private async reverseGeocode(lat: number, lng: number): Promise<any>
    {
        return new Promise((resolve, reject)=>{
            this.geocoder.geocode({ location: {lat: lat, lng: lng}}, (results, status)=>{
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