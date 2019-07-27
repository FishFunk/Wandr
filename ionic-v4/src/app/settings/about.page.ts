import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({ 
    selector: 'page-about',
    templateUrl: 'about.page.html',
    styleUrls: ['about.page.scss']
})

export class AboutPage {

    constructor(private navCtrl: NavController){
    }

    onClickBack(){
        this.navCtrl.back();
    }
}