import { Component } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { Constants } from '../../helpers/constants';
import { NavController, ToastController } from 'ionic-angular';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Logger } from '../../helpers/logger';

@Component({ 
    selector: 'page-contact',
    templateUrl: 'contact.html'})

export class ContactPage {

    reason: string;
    text: string;

    constructor(
        private device: Device,
        private dbHelper: FirestoreDbHelper,
        private navCtrl: NavController,
        private toastCtrl: ToastController,
        private logger: Logger){
    }

    onSubmit(){
        if(!this.reason){
            this.presentToast("Please select a contact reason.");
            return;
        }

        this.text = this.text.trim();

        if(this.text.length > 0){
            var deviceInfo = {
                make: this.device.manufacturer,
                model: this.device.model,
                platform: this.device.platform,
                version: this.device.version
            }
    
            var reportData = {
                uid: localStorage.getItem(Constants.firebaseUserIdKey),
                timestamp: new Date().toDateString(),
                deviceInfo: deviceInfo,
                userText: this.text.trim()
            }

            this.dbHelper.CreateNewReport(reportData)
                .then(()=>{
                    this.presentToast("Thanks for your feedback!");
                    this.text = "";
                    this.reason = "";
                    this.navCtrl.pop();
                })
                .catch(async (error)=>{
                    this.presentToast("Something went wrong. Please try again.");
                    await this.logger.Error(error);
                });
        }
    }

    private presentToast(message: string){
        const toast = this.toastCtrl.create({
            message: message,
            position: 'top',
            duration: 3000
        });

        toast.present();
    }
}