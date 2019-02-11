import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IUser, IFacebookFriend } from '../../models/user';
import _ from 'underscore';
import { ConnectionProfilePage } from './connection_profile';
import { Constants } from '../../helpers/constants';
 
@Component({
  selector: 'connection-list-page',
  templateUrl: 'connection_list.html'
})

export class ConnectionListPage {

    currentUserFriends: IFacebookFriend[];
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
        this.currentUserFriends = JSON.parse(window.localStorage.getItem(Constants.userFacebookFriendsKey));
    }

    onClickProfile(user: IUser){
        this.navCtrl.push(ConnectionProfilePage, 
            { user: user, showChatButton: true }, 
            { animate: true, direction: 'forward' });
    }

    countMutualFriends(connectionUser: IUser){
        const currentUserFriendIds = _.map(this.currentUserFriends, (friendObj)=>friendObj.id);
        const connectionUserFriendIds = _.map(connectionUser.friends, (user)=>user.id);

        return _.intersection(currentUserFriendIds, connectionUserFriendIds).length;
    }
}