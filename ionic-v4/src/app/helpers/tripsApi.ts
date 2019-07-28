import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { resolve } from 'dns';

@Injectable()
export class TripsApi
{
    private holidayApiKey = '50059bac-4ff6-4353-b67a-e99f72b303a4';
    private weatherApiKey = 'eiWAikLyHInkK2oVffGtWBR8lp50hUvM';

    constructor(private http: HttpClient){

    }

    public async getWeatherInfoByLatLong(lat: string, lng: string): Promise<any>{
        const key = await this.getLocationKey(lat, lng);
        const data = await this.getWeatherInfo(key);
        return data;
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

    // public getHolidays(countryCode: string = 'US'): Promise<string>{
    //     return new Promise((resolve, reject)=>{
    //         this.http.get(`https://holidayapi.com/v1/holidays?key=${this.holidayApiKey}&country=${countryCode}&year=2018`)
    //             .subscribe((data: any)=>{
    //                 resolve(data);
    //             }, (error)=>{
    //                 reject(error);
    //             });
    //     })
    // }

    // public getRegions(): Promise<string>{
    //     return new Promise((resolve, reject)=>{
    //         this.http.get(
    //             `http://dataservice.accuweather.com/locations/v1/regions?apikey=${this.weatherApiKey}&language=en`)
    //             .subscribe((data: any)=>{
    //                 resolve(data);
    //             }, (error)=>{
    //                 reject(error);
    //             });
    //     })
    // }
}