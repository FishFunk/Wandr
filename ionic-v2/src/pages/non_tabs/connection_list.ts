import { Component } from '@angular/core';
import { NavController, NavParams, Events, PopoverController, LoadingController } from 'ionic-angular';
import { IUser, IFacebookFriend } from '../../models/user';
import _ from 'underscore';
import { ConnectionProfilePage } from './connection_profile';
import { Constants } from '../../helpers/constants';
import { SortOptionsPopover } from './sort_option_popover';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { ForumPage } from './forum';
 
@Component({
  selector: 'connection-list-page',
  templateUrl: 'connection_list.html'
})

export class ConnectionListPage {

    currentUserId: string;
    currentUserFriends: IFacebookFriend[];
    locationString: string;
    displayLocation: string;
    firstConnections: IUser[] = [];
    secondConnections: IUser[] = [];
    otherConnections: IUser[] = [];
    showForumButton: boolean;

    constructor(
        params: NavParams,
        private navCtrl: NavController,
        private popoverCtrl: PopoverController,
        private loadingCtrl: LoadingController,
        private firestoreDbHelper: FirestoreDbHelper,
        private events: Events){
        
        this.locationString = params.get('locationStringFormat');
        if(this.locationString){
            this.displayLocation = this.locationString.substr(0, this.locationString.indexOf(','));
            this.showForumButton = true;
        }else {
            // Show all connections
            this.displayLocation = "All Connections";
            this.showForumButton = false;
        }

        this.currentUserFriends = JSON.parse(window.localStorage.getItem(Constants.userFacebookFriendsKey));
        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);

        // Subscribe to sort events
        this.events.subscribe(Constants.orderConnectionsByFirstName, this.orderByFirstName.bind(this));
        this.events.subscribe(Constants.orderConnectionsByLastName, this.orderByLastName.bind(this));
        this.events.subscribe(Constants.orderConnectionsByMutual, this.orderByMutualFriends.bind(this));
    }

    async ionViewDidLoad(){
        const spinner = this.createSpinner();
        await spinner.present();

        // First degree
        this.firstConnections = 
            await this.firestoreDbHelper.ReadFirstConnections(this.currentUserId, this.locationString);

        // Second degree
        const facebookId = window.localStorage.getItem(Constants.facebookUserIdKey);
        this.secondConnections = 
            await this.firestoreDbHelper.ReadSecondConnections(
                this.currentUserId ,facebookId, this.locationString);

        // Others
        const excludeFirstIdMap = _.indexBy(this.firstConnections, (usr)=>usr.app_uid);
        const excludeSecondIdMap = _.indexBy(this.secondConnections, (usr)=>usr.app_uid);
        
        const allUsers = 
            await this.firestoreDbHelper.ReadAllUsers(this.currentUserId, this.locationString);

        this.otherConnections = _.filter(allUsers, 
            (usr)=> !excludeFirstIdMap[usr.app_uid] && !excludeSecondIdMap[usr.app_uid]);

        await spinner.dismiss();
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(SortOptionsPopover);
        popover.present({
          ev: myEvent
        });
    }

    onClickBack(){
        this.navCtrl.pop({animate: true, direction: 'back'});
    }

    onClickForum(){
        this.navCtrl.push(
            ForumPage, 
            {locationStringFormat: this.locationString},
            { animate: true, direction: 'forward' });
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

        this.otherConnections = _.sortBy(this.otherConnections, (user)=>{
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

        this.otherConnections = _.sortBy(this.otherConnections, (user)=>{
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

        this.otherConnections = _.sortBy(this.otherConnections, (user)=>{
            return -this.countMutualFriends(user);
        });
    }

    private createSpinner(){
        return this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
        });
    }
}