import { Component } from '@angular/core';
import { IonicPage, LoadingController } from 'ionic-angular';
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

    this.shareInfo = await this.firestoreDbHelper.ReadMetadata(Constants.shareInfoKey);

    loading.dismiss();
  }

  openShareSheet(){
    this.socialSharing.share(this.shareInfo.message, this.shareInfo.subject, this.shareInfo.file, this.shareInfo.url)
      .catch(error=>{
        this.logger.Warn(error);
      });
  }

  // facebookShare(){
  //   this.socialSharing.shareViaFacebookWithPasteMessageHint('', this.imageSrc, this.shareUrl, this.shareMessage)
  //   .then(() => {
  //   }).catch((error) => {
  //       this.logger.Warn(error);
  //       this.presentToast('Unable to share via Facebook.');
  //   });
  // }

  // instagramShare(){
  //   this.socialSharing.shareViaInstagram(this.shareMessage, this.imageSrc)
  //   .then(() => {
  //   }).catch((error) => {
  //     this.logger.Warn(error);
  //     this.presentToast('Unable to share via Instagram.');
  //   });
  // }

  // whatsAppShare(){
  //   this.socialSharing.shareViaWhatsApp(this.shareMessage, this.imageSrc, this.shareUrl)
  //   .then(() => {
  //   })
  //   .catch((error) => {
  //     this.logger.Warn(error);
  //     this.presentToast('Unable to share via WhatsApp.');
  //   });
  // }

  // twitterShare(){
  //   this.socialSharing.shareViaTwitter(this.shareMessage, this.imageSrc, this.shareUrl)
  //   .then(() => {
  //   })
  //   .catch((error) => {
  //     this.logger.Warn(error);
  //     this.presentToast('Unable to share via Twitter.');
  //   });
  // }

  // smsShare(){
  //   this.contactsNative.pickContact()
  //     .then(contact=>{
  //       if(contact){
  //         let targetContact: IContactField;
  //         let targets = _.filter(contact.phoneNumbers, (phoneObj)=>phoneObj.type=="mobile");
  //         targetContact = _.first(targets);
          
  //         if(targetContact){
  //           this.socialSharing.share
  //           this.socialSharing.shareViaSMS(this.shareMessage, targetContact.value)
  //             .catch(error=>this.logger.Warn(error));
  //         } else {
  //           this.presentToast('No mobile number found for that contact.');
  //         }
  //       }
  //     })
  //     .catch(error=> {
  //       this.logger.Warn(error);
  //     });
  // }


  // presentToast(message: string) {
  //   let toast = this.toastCtrl.create({
  //     message: message,
  //     position: 'top',
  //     duration: 3000
  //   });
  //   toast.present();
  // }
}