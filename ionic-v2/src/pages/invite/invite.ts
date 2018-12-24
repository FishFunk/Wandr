import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { SocialSharing } from '@ionic-native/social-sharing';

@IonicPage()
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html'
})

export class InvitePage {
  shareMessage:  "I just joined Wanderlust! A fun and interactive \
  social network that enhances your travel experiences. Check it out!";
  imageSrc: "";
  shareUrl: "";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private socialSharing: SocialSharing) {
  }

  facebookShare(){
    this.socialSharing.shareViaFacebook(this.shareMessage, this.imageSrc, this.shareUrl)
    .then(() => {
    }).catch((error) => {
        console.error(error);
        this.presentToast('Unable to share via Facebook.');
    });
  }

  instagramShare(){
    this.socialSharing.shareViaInstagram(this.shareMessage, this.imageSrc)
    .then(() => {
    }).catch((error) => {
        console.error(error);
        this.presentToast('Unable to share via Instagram.');
    });
  }

  whatsAppShare(){
    this.socialSharing.shareViaWhatsApp(this.shareMessage, this.imageSrc, this.shareUrl)
    .then(() => {
    })
    .catch((error) => {
        console.error(error);
        this.presentToast('Unable to share via WhatsApp.');
    });
  }

  twitterShare(){
    this.socialSharing.shareViaTwitter(this.shareMessage, this.imageSrc, this.shareUrl)
    .then(() => {
    })
    .catch((error) => {
        console.error(error);
        this.presentToast('Unable to share via Twitter.');
    });
  }

  smsShare(){
    // TODO: I think need to open contacts and select one or multiple numbers to share with
    this.presentToast("Not yet implemented");

    // this.socialSharing.shareViaSMS(this.shareMessage, "mobile-no")
    // .then(()=>{

    // })
    // .catch((error)=>{
    //   console.log(error);
    //   this.presentToast('Unable to share via SMS');
    // });
  }


  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: 'bottom',
      duration: 1500
    });
    toast.present();
  }
}