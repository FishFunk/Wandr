import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
 
@Component({
  selector: 'forum-deail-page',
  templateUrl: 'forum_detail.html'
})

export class ForumDetailPage {

    currentUserId: string;
    locationString: string;
    displayLocation: string;

    forumReplies = [];
    textInput: string = "";
    forumId: string;
    forumTopic: string = "";

    constructor(
        params: NavParams,
        private navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private firestoreDbHelper: FirestoreDbHelper){
        
        this.locationString = params.get('locationStringFormat');
        this.forumId = params.get('forumId');
        this.forumTopic = params.get('forumTopic');

        this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
    }

    async ionViewDidLoad(){
    }

    submitInput(){
        alert("Not implemented")
    }

    private createSpinner(){
        return this.loadingCtrl.create({
            spinner: 'hide',
            content:`<img src="../../assets/ring-loader.gif"/>`,
            cssClass: 'my-loading-class'
        });
    }
}