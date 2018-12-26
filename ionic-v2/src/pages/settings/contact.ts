import { Component } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { Constants } from '../../helpers/constants';
import { AngularFireDatabase } from 'angularfire2/database';
import { NavController } from 'ionic-angular';

@Component({ 
    selector: 'page-contact',
    templateUrl: 'contact.html'})

export class ContactPage {

    reason: string;
    text: string;

    constructor(
        private device: Device,
        private firebase: AngularFireDatabase,
        private navCtrl: NavController){
    }

    onSubmit(){
        if(!this.reason){
            alert("Please select a reason");
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

            this.firebase.database.ref('/reports/').push(reportData, (possibleError)=>{
                if(possibleError){
                    console.error(possibleError);
                } else {
                    alert("Thank you!");
                    this.text = "";
                    this.reason = "";
                    this.navCtrl.pop();
                }
            });
        }
    }
}