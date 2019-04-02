import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { Constants } from './constants';
import { AngularFirestore } from "angularfire2/firestore";
import { Platform, AlertController } from 'ionic-angular';

@Injectable()
export class Logger{
    
    constructor(
        private device: Device,
        private firestore: AngularFirestore,
        private platform: Platform,
        private alertCtrl: AlertController)
    {
    }

    public Trace(trace: any){
        console.trace(trace);
    }

    public Info(info: any){
        console.info(info);
    }

    public Warn(warn: any){
        console.warn(warn);
    }

    public async Error(error: any){
        console.error(error);

        if(this.isError(error)){
            var log = {
                time: this.getTimeStamp(),
                device: this.getDeviceInfo(),
                name: error.name,
                message: error.message,
            };

            await this.upsertLog(log, 'error');
        } else {
            await this.upsertLog({data : error}, 'error');
        }
    }

    public Fatal(fatal: any){
        console.error(fatal);
        var promise: Promise<any>;

        if(this.isError(fatal)){
            var log = {
                time: this.getTimeStamp(),
                device: this.getDeviceInfo(),
                name: fatal.name,
                message: fatal.message,
            };

            promise = this.upsertLog(log, 'fatal');
        } else {
            promise = this.upsertLog({data : fatal}, 'fatal')
        }
        
        promise
            .then(()=>{
                this.forceClose();
            })
            .catch((error)=>{
                console.error(error);
                this.forceClose();
            });
    }

    private forceClose(){
        this.alertCtrl.create({
            title: "Oh no! Something isn't right and the app needs to close.",
            buttons: [
                {
                    text: "Ok",
                    handler: ()=>{
                        this.platform.exitApp();
                    }
                }
            ]
        }).present();
    }

    private upsertLog(logData: any, logLevel: string): Promise<any>{
        const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        return this.firestore.collection('logs').doc(uid).collection(logLevel).add(logData);
    }

    private getTimeStamp(){
        return new Date().getTime().toString();
    }

    private getDeviceInfo(){
        var deviceInfo = {
            make: this.device.manufacturer,
            model: this.device.model,
            platform: this.device.platform,
            version: this.device.version
        }

        return deviceInfo;
    }

    private isError(err){
        return err && err.stack && err.message && typeof err.stack === 'string' 
            && typeof err.message === 'string';
    }

}
