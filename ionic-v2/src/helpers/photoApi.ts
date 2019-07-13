import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class PhotoApi
{
    private client_id = '538140f3e765899b3a502433b4959e08e5a7c29671a0da8631a3a3c9295c7813';

    constructor(private http: HttpClient){

    }

    public queryRandomPhoto(searchValue: string): Promise<string>{
        searchValue = searchValue.replace(' ', '%20').replace(',','');
        return new Promise((resolve, reject)=>{
            this.http.get(`https://api.unsplash.com/photos/random?query=${searchValue}&orientation=landscape&featured=true&client_id=${this.client_id}`)
                .subscribe((data: any)=>{
                    resolve(data.urls.regular);
                }, (error)=>{
                    reject(error);
                });
        })
    }
}