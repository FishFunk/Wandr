import { Component } from '@angular/core';
import { LoadingController, Platform, ModalController, Events, NavController } from '@ionic/angular';
import { Location, User, IUser } from '../models/user';
import { Constants } from '../helpers/constants';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import _ from 'underscore';
import { ProfileModal } from './profile-modal';
import { ICheckboxOption } from '../models/metadata';
import { Observable } from 'rxjs';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})

export class ProfilePage {

  userInterests: ICheckboxOption[] = [];
  lifestyleOptions: ICheckboxOption[] = [];

  tripsObservable: Observable<any>;
  tripData = [];

  userData: IUser = new User('','','','', '',
    new Location(),[],[], [], '','','', { notifications: true }, []);

  firstConnectionCount: number = 0;
  secondConnectionCount: number = 0;
  defaultProfileImg = '../../assets/undraw/purple/undraw_profile_pic_ic5t.svg';

  constructor(
    public modalController: ModalController,
    public loadingCtrl: LoadingController, 
    public navCtrl: NavController,
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

    const loadingPopup = await this.loadingCtrl.create({
      spinner: 'dots'
    });
    loadingPopup.present();

    try{
      this.userInterests = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_interests');
      this.lifestyleOptions = await this.firestoreDbHelper.ReadMetadata<ICheckboxOption[]>('user_lifestyle');

      if(this.platform.is('cordova')){
        var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);

        this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);

        // Calculate connections
        const firstConnections = await this.firestoreDbHelper.ReadFirstConnections(firebaseUid);
        this.firstConnectionCount = firstConnections.length;
        this.secondConnectionCount = await this.countSecondConnections(firstConnections);
        
      } else {
        // ionic serve path
        const uid = 'SlQA4Yz8Pwhuv15d6ygmdo284UF2';
        this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid, false);
      }
      
      this.renderUserOptions();

      await this.readTrips();

      loadingPopup.dismiss();
    }
    catch(ex){
      await loadingPopup.dismiss();
      await this.logger.Error(ex);
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

  private async readTrips(){
    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.tripsObservable = this.firestoreDbHelper.ReadTripsObservableByUserId(uid);

    this.tripsObservable.subscribe(async trips =>{
      trips = _.reject(trips, (obj)=> !obj.data.public);
      this.tripData = _.sortBy(trips, (obj)=> obj.data.startDate ? new Date(obj.data.startDate) : 999999999999999);
    });
  }

  private async reloadUser(){
    var firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    this.userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(firebaseUid, false);
    this.renderUserOptions();
  }

  private async countSecondConnections(firstConnections: IUser[]): Promise<number>{

    const currentUserFacebookId = localStorage.getItem(Constants.facebookUserIdKey);

    const secondConnections = await this.firestoreDbHelper.ReadSecondConnections(currentUserFacebookId, firstConnections);

    return Promise.resolve(secondConnections.length);
  }

}
