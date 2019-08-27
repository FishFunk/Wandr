import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { Constants } from './constants';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';
import { FirestoreDbHelper } from './firestoreDbHelper';

@Injectable()
export class Logger{
    
    constructor(
        private device: Device,
        private dbHelper: FirestoreDbHelper,
        private platform: Platform)
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
        var log;

        console.error(error);

        if(this.platform.is('cordova')){
            const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
            const user = await this.dbHelper.ReadUserByFirebaseUid(uid);

            if(this.isError(error)){
                log = {
                    userName: user != null ? user.first_name : "NO_NAME",
                    time: this.getTimeStamp(),
                    device: this.getDeviceInfo(),
                    error: error.name,
                    message: error.message,
                };
    
                return this.upsertLog(log, 'error');
            } else {
                log = {
                    userName: user != null ? user.first_name : "NO_NAME",
                    time: this.getTimeStamp(),
                    device: this.getDeviceInfo(),
                    error: error
                }
                return this.upsertLog(log, 'error');
            }
        }
    }

    // public Fatal(fatal: any){
    //     console.error(fatal);
    //     var promise: Promise<any>;

    //     if(this.isError(fatal)){
    //         var log = {
    //             time: this.getTimeStamp(),
    //             device: this.getDeviceInfo(),
    //             name: fatal.name,
    //             message: fatal.message,
    //         };

    //         promise = this.upsertLog(log, 'fatal');
    //     } else {
    //         promise = this.upsertLog(fatal, 'fatal')
    //     }
        
    //     promise
    //         .then(()=>{
    //             this.forceClose();
    //         })
    //         .catch((error)=>{
    //             console.error(error);
    //             this.forceClose();
    //         });
    // }

    // private async forceClose(){
    //     const alert = await this.alertCtrl.create({
    //         message: "Oh no! Something isn't right and the app needs to close.",
    //         buttons: [
    //             {
    //                 text: "Ok",
    //                 handler: ()=>{
    //                     // TODO: Exit app
    //                 }
    //             }
    //         ]
    //     });
    //     alert.present();
    // }

    private upsertLog(logData: any, logLevel: 'error' | 'warn'): Promise<any>{
        const uid = window.localStorage.getItem(Constants.firebaseUserIdKey) || "NO_USER_ID";
        return this.dbHelper.CreateLog(uid, logLevel, logData);
    }

    private getTimeStamp(){
        return moment().format('M/D/YY');
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