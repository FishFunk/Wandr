import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Constants } from '../helpers/constants';
import _ from 'underscore';
import { Logger } from '../helpers/logger';
import { IShareInfo } from '../models/metadata';

@Component({
  selector: 'page-social',
  templateUrl: 'social.page.html'
})

export class SocialPage {

  shareInfo: IShareInfo;
  firstConnectionCount = 0;
  secondConnectionCount = 0;

  constructor(
    public loadingCtrl: LoadingController,
    private socialSharing: SocialSharing,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger) {
  }

  ionViewDidLoad(){
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

    const firstConnecitons = await this.firestoreDbHelper.ReadFirstConnections(firebaseUid)
      .catch(error =>{
        loading.dismiss();
        this.logger.Error(error);
        return Promise.resolve([]);
      });
    this.firstConnectionCount = firstConnecitons.length;

    const secondConnecitons = await this.firestoreDbHelper.ReadSecondConnections(firebaseUid, facebookUid)
      .catch(async error =>{
        loading.dismiss();
        this.logger.Error(error);
        return Promise.resolve([]);
      });
    this.secondConnectionCount = secondConnecitons.length;

    loading.dismiss();
  }

  openShareSheet(){
    this.socialSharing.share(this.shareInfo.message, this.shareInfo.subject, this.shareInfo.file, this.shareInfo.url)
      .catch(error=>{
        this.logger.Warn(error);
      });
  }
}