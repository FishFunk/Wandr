import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Constants } from '../../helpers/constants';
import { Utils } from '../../helpers/utils';
import { Contacts, IContactField } from '@ionic-native/contacts/ngx';
import _ from 'underscore';
import { Logger } from '../../helpers/logger';

@IonicPage()
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html'
})

export class InvitePage {
  shareMessage:  "Check out Wandr - an interactive travel network!";
  imageSrc: "";
  shareUrl: "";
  firstConnectionCount = 0;
  secondConnectionCount = 0;

  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private socialSharing: SocialSharing,
    private firestoreDbHelper: FirestoreDbHelper,
    private contactsNative: Contacts,
    private logger: Logger) {
  }

  ionViewDidLoad(){
    this.getConnectionCounts();
  }

  async getConnectionCounts(){

    const loading = this.loadingCtrl.create({
      spinner: 'hide',
      content:`<img src="../../assets/ring-loader.gif"/>`,
      cssClass: 'my-loading-class'
    });
    
    loading.present();

    const firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    const facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);

    const firstConnecitons = await this.firestoreDbHelper.ReadFirstConnections(firebaseUid)
      .catch(async error =>{
        await this.logger.Error(error);
        loading.dismiss();
        return Promise.resolve([]);
      });
    this.firstConnectionCount = firstConnecitons.length;

    const secondConnecitons = await this.firestoreDbHelper.ReadSecondConnections(firebaseUid, facebookUid)
      .catch(async error =>{
        await this.logger.Error(error);
        loading.dismiss();
        return Promise.resolve([]);
      });
    this.secondConnectionCount = secondConnecitons.length;

    loading.dismiss();
  }

  facebookShare(){
    this.socialSharing.shareViaFacebook(this.shareMessage, this.imageSrc, this.shareUrl)
    .then(() => {
    }).catch((error) => {
        this.logger.Warn(error);
        this.presentToast('Unable to share via Facebook.');
    });
  }

  instagramShare(){
    this.socialSharing.shareViaInstagram(this.shareMessage, this.imageSrc)
    .then(() => {
    }).catch((error) => {
      this.logger.Warn(error);
      this.presentToast('Unable to share via Instagram.');
    });
  }

  whatsAppShare(){
    this.socialSharing.shareViaWhatsApp(this.shareMessage, this.imageSrc, this.shareUrl)
    .then(() => {
    })
    .catch((error) => {
      this.logger.Warn(error);
      this.presentToast('Unable to share via WhatsApp.');
    });
  }

  twitterShare(){
    this.socialSharing.shareViaTwitter(this.shareMessage, this.imageSrc, this.shareUrl)
    .then(() => {
    })
    .catch((error) => {
      this.logger.Warn(error);
      this.presentToast('Unable to share via Twitter.');
    });
  }

  smsShare(){
    this.contactsNative.pickContact()
      .then(contact=>{
        if(contact){
          let targetContact: IContactField;
          let targets = _.filter(contact.phoneNumbers, (phoneObj)=>phoneObj.type=="mobile");
          targetContact = _.first(targets);
          
          if(targetContact){
            this.socialSharing.shareViaSMS(this.shareMessage, targetContact.value)
              .catch(error=>this.logger.Warn(error));
          } else {
            this.presentToast('No mobile number found for that contact.');
          }
        }
      })
      .catch(error=> {
        this.logger.Warn(error);
      });
  }


  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: 'top',
      duration: 3000
    });
    toast.present();
  }
}