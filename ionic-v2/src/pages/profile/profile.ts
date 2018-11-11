import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController ,ToastController } from 'ionic-angular';
import {  AngularFireDatabase ,  FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { Facebook } from '@ionic-native/facebook';
import { IntroPage } from '../intro/intro';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  profile:  FirebaseObjectObservable<any[]>;
  editMode: boolean = false;
  loadingPopup;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    private fb: Facebook) {

    this.loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: ''
    });
    this.loadingPopup.present();
    this.profile = afDB.object('/profile/1');

    //// TODO: Get geocode information from user string location, save in DB

    // var geocoderOptions: NativeGeocoderOptions = {
    //   useLocale: true,
    //   maxResults: 1
    // };
    // var data: NativeGeocoderForwardResult[] = await this.nativeGeocoder.forwardGeocode(strLocation, this.geocoderOptions);
    // if(!data || data.length == 0){
    //   console.error(`Unable to geocode: ${strLocation}`);
    //   return null;
    // }

    // return new google.maps.LatLng(data[0].latitude, data[0].longitude);

  }

  ionViewDidLoad(){
    this.loadingPopup.dismiss();
  }

  onClickEdit(){
    this.editMode = true;
  }

  logout(){
    this.fb.logout()
      .then(()=>{
        this.presentToast('top', 'Logout successful!');
        this.navCtrl.setRoot(IntroPage);
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
