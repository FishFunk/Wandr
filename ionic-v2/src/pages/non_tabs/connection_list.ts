import { Component } from '@angular/core';
import { NavController, NavParams, Events, PopoverController } from 'ionic-angular';
import { IUser, IFacebookFriend } from '../../models/user';
import _ from 'underscore';
import { ConnectionProfilePage } from './connection_profile';
import { Constants } from '../../helpers/constants';
import { PopoverPage } from './popover_options';
 
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
        private navCtrl: NavController,
        private popoverCtrl: PopoverController,
        private events: Events){
        
        const temp = params.get('locationStringFormat');
        this.locationStringFormat = temp.substr(0, temp.indexOf(','));
        this.firstConnections = params.get('firstConnections');
        this.secondConnections = params.get('secondConnections');
        this.currentUserFriends = JSON.parse(window.localStorage.getItem(Constants.userFacebookFriendsKey));

        // Subscribe to sort events
        this.events.subscribe(Constants.orderConnectionsByFirstName, this.orderByFirstName.bind(this));
        this.events.subscribe(Constants.orderConnectionsByLastName, this.orderByLastName.bind(this));
        this.events.subscribe(Constants.orderConnectionsByMutual, this.orderByMutualFriends.bind(this));
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({
          ev: myEvent
        });
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

    orderByFirstName(){
        this.firstConnections = _.sortBy(this.firstConnections, (user)=>{
            return user.first_name;
        });

        this.secondConnections = _.sortBy(this.secondConnections, (user)=>{
            return user.first_name;
        });
    }

    orderByLastName(){
        this.firstConnections = _.sortBy(this.firstConnections, (user)=>{
            return user.last_name;
        });

        this.secondConnections = _.sortBy(this.secondConnections, (user)=>{
            return user.last_name;
        });
    }

    orderByMutualFriends(){
        this.firstConnections = _.sortBy(this.firstConnections, (user)=>{
            return -this.countMutualFriends(user);
        });

        this.secondConnections = _.sortBy(this.secondConnections, (user)=>{
            return -this.countMutualFriends(user);
        });
    }
}