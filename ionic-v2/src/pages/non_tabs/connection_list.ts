import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IUser } from '../../models/user';
import _ from 'underscore';
import { ConnectionProfilePage } from './connection_profile';
 
@Component({
  selector: 'connection-list-page',
  templateUrl: 'connection_list.html'
})

export class ConnectionListPage {

    locationStringFormat: string;
    view: string = 'first';
    firstConnections: IUser[];
    secondConnections: IUser[];

    constructor(
        params: NavParams,
        private navCtrl: NavController){
        
        this.locationStringFormat = params.get('locationStringFormat');
        this.firstConnections = params.get('firstConnections');
        this.secondConnections = params.get('secondConnections');
    }

    onClickProfile(user: IUser){
        this.navCtrl.push(ConnectionProfilePage, 
            { user: user, showChatButton: true }, 
            { animate: true, direction: 'forward' });
    }
}