import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import _ from 'underscore';

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

    public getUpcomingHolidays(countryCode: string): Promise<any>{
        return new Promise((resolve,reject)=>{
            const date = new Date();
            const year = '2018'; // date.getFullYear(); // TODO: Buy full featured API
            const month = date.getMonth();
            const day = date.getDay();

            this.http.get(
                `https://holidayapi.com/v1/holidays?key=${this.holidayApiKey}&country=${countryCode}&year=${year}&upcoming&month=${month}&day=${day}&public`)
                .subscribe((data: any)=>{
                    resolve(data);
                }, (error)=>{
                    reject(error);
                });
        });
    }

    public async getUpcomingHolidays2(countryCode: string): Promise<any>{
        const data = await this.getHolidays(countryCode)
            .catch(error=>{
                Promise.reject(error);
            });
        
        const now = new Date();
        now.setFullYear(2018);

        const result = _.filter(data.holidays, (holiday)=>{
            let then = new Date(holiday.observed);
            return then > now;
        });

        return result;
    }

    private getHolidays(countryCode: string): Promise<any>{
        return new Promise((resolve, reject)=>{
            this.http.get(`https://holidayapi.com/v1/holidays?key=${this.holidayApiKey}&country=${countryCode}&year=2018&public`)
                .subscribe((data: any)=>{
                    resolve(data);
                }, (error)=>{
                    reject(error);
                });
        })
    }
}