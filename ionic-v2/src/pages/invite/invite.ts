import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Constants } from '../../helpers/constants';
import _ from 'underscore';
import { Logger } from '../../helpers/logger';
import { IShareInfo } from '../../models/metadata';

@IonicPage()
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html'
})

export class InvitePage {

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

    const loading = this.loadingCtrl.create({
      spinner: 'hide',
      content:`<img src="../../assets/ring-loader.gif"/>`,
      cssClass: 'my-loading-class'
    });
    
    loading.present();

    this.shareInfo = await this.firestoreDbHelper.ReadMetadata(Constants.shareInfoKey);

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