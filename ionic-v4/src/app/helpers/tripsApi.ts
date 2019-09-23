import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import _ from 'underscore';

@Injectable()
export class TripsApi
{
    private holidayApiKey = '2656bc40-db4f-467d-95ec-2dd1341e3ca0';
    private weatherApiKey = 'Kcv7ifgZrORjPoqjTp95UqlBFJiG6RxV';
    private googleApiKey = 'AIzaSyCuxtLSqHoL0CkX2QynMDyo-vxCKl-1qmE';

    constructor(private http: HttpClient){

    }

    public async getWeatherInfoByLatLong(lat: string, lng: string): Promise<any>{
        const key = await this.getLocationKey(lat, lng);
        const data = await this.getWeatherInfo(key);
        return data;
    }

    public getLocationScreenshotUrl(location: string): string{
        // green 0x1ABC9C
        // purple 0x6700a9
        return `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=12`+
        '&size=400x200'+
        '&maptype=roadmap'+
        '&style=feature:landscape|color:0xf2f2f2'+
        '&style=feature:administrative.locality|color:0x6700a9|weight:0.6'+
        '&style=feature:administrative.land_parcel|visibility:off'+
        '&style=feature:administrative.neighborhood|visibility:off'+
        '&style=feature:water|color:0xaeaeae'+
        '&style=feature:poi|visibility:off'+
        '&style=feature:transit|visibility:off'+
        '&style=feature:road|element:labels.icon|visibility:off'+
        '&style=feature:road.highway|color:0x1ABC9C|weight:0.7'+
        `&key=${this.googleApiKey}`;
    }

    private getLocationKey(lat: string, lng: string): Promise<string>{
        return new Promise((resolve, reject)=>{
            this.http.get(
                `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?q=${lat},${lng}&apikey=${this.weatherApiKey}`)
                .subscribe((data: any)=>{
                    resolve(data.Key);
                },(error)=>{
                    reject(error);
                });
        });
    }

    private getWeatherInfo(locationKey: string): Promise<any>{
        return new Promise((resolve, reject)=>{
            this.http.get(
                `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${this.weatherApiKey}`)
                .subscribe((data: any)=>{
                    resolve(data);
                },(error)=>{
                    reject(error);
                });
        });
    }

    public async getUpcomingHolidays(countryCode: string): Promise<any>{
        const date = new Date();
        const year = date.getFullYear();

        const data = await this.getHolidays(countryCode, year)
            .catch(error=>{
                Promise.reject(error);
            });
        
        const result = _.filter(data.holidays, (holiday)=>{
            let then = new Date(holiday.observed);
            return then > date;
        });

        return result;
    }

    private getHolidays(countryCode: string, year: number): Promise<any>{
        return new Promise((resolve, reject)=>{
            this.http.get(`https://holidayapi.com/v1/holidays?key=${this.holidayApiKey}&country=${countryCode}&year=${year}&public`)
                .subscribe((data: any)=>{
                    resolve(data);
                }, (error)=>{
                    reject(error);
                });
        })
    }
}