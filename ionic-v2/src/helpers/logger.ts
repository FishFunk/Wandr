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

    public Error(error: any){
        console.error(error);

        var log = this.initLogObject();

        if(this.isError(error)){
            log['error_name'] = error.name;
            log['message'] = error.message;
        } else {
            log['data'] = error;
        }

        this.upsertLog({data : error}, 'error');
    }

    public Fatal(fatal: any){
        console.error(fatal);
        
        var log = this.initLogObject();

        if(this.isError(fatal)){
            log['error_name'] = fatal.name;
            log['message'] = fatal.message;
        } else {
            log['data'] = fatal;
        }
        
        this.upsertLog(log, 'fatal')
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

    private initLogObject(): any{
        var log = {
            user: {
                first_name: window.localStorage.getItem(Constants.userFirstNameKey),
                last_name: window.localStorage.getItem(Constants.userLastNameKey),
                uid: window.localStorage.getItem(Constants.firebaseUserIdKey)
            },
            time: this.getTimeStamp(),
            device: this.getDeviceInfo()
        }

        return log;
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
