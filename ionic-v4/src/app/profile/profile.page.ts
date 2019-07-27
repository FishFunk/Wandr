import { Component } from '@angular/core';
import { LoadingController, ToastController, Platform, ModalController, Events, NavController } from '@ionic/angular';
import { Location, User, IUser } from '../models/user';
import { FacebookApi } from '../helpers/facebookApi';
import { Constants } from '../helpers/constants';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import _ from 'underscore';
import { ProfileModal } from './profile-modal';
import { ICheckboxOption } from '../models/metadata';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})

export class ProfilePage {

  userInterests: ICheckboxOption[] = [];
  lifestyleOptions: ICheckboxOption[] = [];

  userData: IUser = new User('','','','', '',
    new Location(),[],[],'','','', { notifications: true }, []);
  loadingPopup;
  secondConnectionCount: number = 0;
  defaultProfileImg = '../../assets/undraw/purple/undraw_profile_pic_ic5t.svg';

  constructor(
    public modalController: ModalController,
    public loadingCtrl: LoadingController, 
    public navCtrl: NavController,
    private toastCtrl: ToastController,
    private facebookApi: FacebookApi,
    private platform: Platform,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger,
    private events: Events) {

    this.events.subscribe(Constants.refreshProfileDataEvent, this.reloadUser.bind(this));
  }

  ngOnInit(){
    this.load();
  }

  async load(){
    this.showLoadingPopup();

    try{
      this.userInterests = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
      this.lifestyleOptions = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

      if(this.platform.is('cordova')){
        var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
        var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
        var token = window.localStorage.getItem(Constants.accessTokenKey);

        var fbUserData = await <any> this.facebookApi.getUser(facebookUid, token);

        if(!fbUserData){
          // Need to login to Facebook again
          this.loadingPopup.dismiss();
          this.navCtrl.navigateRoot('/intro')
          //this.appCtrl.getRootNav().setRoot(IntroPage);
          this.presentToast('Login expired. Please login again.');
          return;
        }

        this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);

        // Cache some user data
        window.localStorage.setItem(Constants.userFirstNameKey, this.userData.first_name);
        window.localStorage.setItem(Constants.userLastNameKey, this.userData.last_name);
        window.localStorage.setItem(Constants.profileImageUrlKey, this.userData.profile_img_url);
        window.localStorage.setItem(Constants.userFacebookFriendsKey, JSON.stringify(this.userData.friends));

        // Calculate second degree connections
        this.secondConnectionCount = await this.countSecondConnections();
      } else {
        // ionic serve path
        const uid = 'HN7yxROvzXhuoP80arDDmmmQUAj1'; // Johnny Appleseed
        this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid, false);
      }
      
      this.renderUserOptions();

      this.loadingPopup.dismiss();
    }
    catch(ex){
      this.loadingPopup.dismiss();
      this.logger.Error(ex);
    }
  }

  async onClickEdit(){
      const modal = await this.modalController.create({ component: ProfileModal });
      modal.present();
  }

  onClickBack(){
    this.navCtrl.back({animationDirection: 'back'});
  }

  private renderUserOptions(){
    if(this.userData.interests){
      this.userInterests.forEach(userOption=>{
        const match = _.find(this.userData.interests, (checked)=>{
          return userOption.label === checked.label;
        });
        if(match){
          userOption['checked'] = true;
        } else {
          userOption['checked'] = false;
        }
      });
    }

    if(this.userData.lifestyle){
      this.lifestyleOptions.forEach(userOption=>{
        const match = _.find(this.userData.lifestyle, (checked)=>{
          return userOption.label === checked.label;
        });
        if(match){
          userOption['checked'] = true;
        } else {
          userOption['checked'] = false;
        }
      });
    }
  }

  private async reloadUser(){
    var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);
  }

  private showLoadingPopup(){
    this.loadingPopup = this.loadingCtrl.create({
      spinner: 'dots'
    });
    this.loadingPopup.present();
  }

  private async presentToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      position: 'top',
      duration: 1000
    });
    toast.present();
  }

  private async countSecondConnections(): Promise<number>{

    const currentUserFirebaseId = localStorage.getItem(Constants.firebaseUserIdKey);
    const currentUserFacebookId = localStorage.getItem(Constants.facebookUserIdKey);

    const secondConnections = await this.firestoreDbHelper.ReadSecondConnections(currentUserFirebaseId, currentUserFacebookId);

    return Promise.resolve(secondConnections.length);
  }

}
