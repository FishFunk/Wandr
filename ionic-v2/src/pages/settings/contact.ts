import { Component } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { Constants } from '../../helpers/constants';
import { NavController } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({ 
    selector: 'page-contact',
    templateUrl: 'contact.html'})

export class ContactPage {

    reason: string;
    text: string;

    constructor(
        private device: Device,
        private firestore: AngularFirestore,
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

            this.firestore.collection('reports')
                .add(reportData)
                .then(()=>{
                    alert("Thanks for your feedback!");
                    this.text = "";
                    this.reason = "";
                    this.navCtrl.pop();
                })
                .catch((error)=>{
                    console.error(error);
                });
        }
    }
}