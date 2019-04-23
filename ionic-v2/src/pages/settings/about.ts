import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

@Component({ 
    selector: 'page-about',
    templateUrl: 'about.html'})

export class AboutPage {

    constructor(params: NavParams,
        private navCtrl: NavController){
    }

    onClickBack(){
        this.navCtrl.pop({animate: true, direction: 'back'});
    }
}