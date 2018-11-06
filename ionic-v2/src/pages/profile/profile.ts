import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController ,ToastController } from 'ionic-angular';
import {  AngularFireDatabase ,  FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { Facebook } from '@ionic-native/facebook';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  profile:  FirebaseObjectObservable<any[]>;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private fb: Facebook) {

    let loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: ''
    });
    loadingPopup.present();
    this.profile = afDB.object('/profile/1');
    this.profile.subscribe(() => loadingPopup.dismiss());
  }

  logout(){
    this.fb.logout()
      .then(()=>{
        // TODO: Exit app - back to intro
        this.presentToast('top', 'Logout successful!');
      })
      .catch((error)=>{
        console.log(error);
        this.presentToast('top', 'Logout failed!');
      });
  }

  presentToast(position: string,message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 1000
    });
    toast.present();
  }

}
