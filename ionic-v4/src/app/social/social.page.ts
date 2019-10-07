import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Constants } from '../helpers/constants';
import _ from 'underscore';
import { Logger } from '../helpers/logger';
import { IShareInfo } from '../models/metadata';

@Component({
  selector: 'page-social',
  templateUrl: 'social.page.html',
  styleUrls: ['social.page.scss']
})

export class SocialPage {

  shareInfo: IShareInfo;
  firstConnectionCount = 0;
  secondConnectionCount = 0;

  constructor(
    public loadingCtrl: LoadingController,
    private socialSharing: SocialSharing,
    private firestoreDbHelper: FirestoreDbHelper,
    private platform: Platform,
    private logger: Logger) {
  }

  ngOnInit(){
    this.load();
  }

  async load(){

    const loading = await this.loadingCtrl.create({
      spinner: 'dots'
    });
    
    loading.present();

    this.shareInfo = await this.firestoreDbHelper.ReadMetadata<IShareInfo>(Constants.shareInfoKey);

    const firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    const facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);

    const firstConnections = await this.firestoreDbHelper.ReadFirstConnections(firebaseUid)
      .catch(error =>{
        loading.dismiss();
        this.logger.Error(error);
        return Promise.resolve([]);
      });
    this.firstConnectionCount = firstConnections.length;

    const secondConnecitons = await this.firestoreDbHelper.ReadSecondConnections(facebookUid, firstConnections)
      .catch(async error =>{
        loading.dismiss();
        this.logger.Error(error);
        return Promise.resolve([]);
      });
    this.secondConnectionCount = secondConnecitons.length;

    loading.dismiss();
  }

  openShareSheet(){
    if(this.platform.is('cordova')){
      this.socialSharing.share(this.shareInfo.message, this.shareInfo.subject, this.shareInfo.file, this.shareInfo.url)
      .catch(error=>{
        this.logger.Warn(error);
      });
    }
  }
}