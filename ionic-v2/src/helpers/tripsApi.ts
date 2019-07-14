import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class TripsApi
{
    private holidayApiKey = '50059bac-4ff6-4353-b67a-e99f72b303a4';
    private weatherApiKey = 'eiWAikLyHInkK2oVffGtWBR8lp50hUvM';

    constructor(private http: HttpClient){

    }

    public getHolidays(countryCode: string = 'US'): Promise<string>{
        return new Promise((resolve, reject)=>{
            this.http.get(`https://holidayapi.com/v1/holidays?key=${this.holidayApiKey}&country=${countryCode}&year=2018`)
                .subscribe((data: any)=>{
                    resolve(data);
                }, (error)=>{
                    reject(error);
                });
        })
    }

    public getRegions(): Promise<string>{
        return new Promise((resolve, reject)=>{
            this.http.get(
                `http://dataservice.accuweather.com/locations/v1/regions?apikey=${this.weatherApiKey}&language=en`)
                .subscribe((data: any)=>{
                    resolve(data);
                }, (error)=>{
                    reject(error);
                });
        })
    }
}