import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { ForumDetailPage } from './forum_detail';
 
@Component({
  selector: 'forum-page',
  templateUrl: 'forum.html'
})

export class ForumPage {

    currentUserId: string;
    locationString: string;
    displayLocation: string;
    forumList: any[] = [];
    searchInput: string = "";

    constructor(
        params: NavParams,
        private navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private firestoreDbHelper: FirestoreDbHelper){
        
        this.locationString = params.get('locationStringFormat');
        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
    }

    async ionViewDidLoad(){
        this.forumList = [
            { id:"1", title: "Best tacos in town?" }, 
            { id:"2", title: "Just moved, looking for roommate!" }];
    }

    createTopic(){
        alert("Not implemented")
    }

    onClickTopic(item){
        this.navCtrl.push(ForumDetailPage, 
            { 
                locationStringFormat: this.locationString,
                forumId: item.id,
                forumTopic: item.title
            }, 
            { animate: true, direction: 'forward' });
    }

    private createSpinner(){
        return this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
        });
    }
}