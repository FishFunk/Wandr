import { Component, ViewChild } from '@angular/core';
import { ToastController, AlertController, ModalController, Events, IonTabs, Platform, LoadingController, NavController } from '@ionic/angular';
import { FcmProvider } from 'src/providers/fcm/fcm';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import { ProfileModal } from '../profile/profile-modal';
import { Constants } from '../helpers/constants';
import { tap } from 'rxjs/operators';
import { FacebookApi } from '../helpers/facebookApi';
import { Utils } from '../helpers/utils';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('appTabs') tabRef: IonTabs;
  badgeCount = 0;
  loadingPopup;

  constructor(public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public fcm: FcmProvider,
    private modalController: ModalController,
    private firestoreDbHelper: FirestoreDbHelper,
    private facebookApi: FacebookApi,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private platform: Platform,
    private logger: Logger,
    private events: Events){

  }

  ngOnInit(){
    this.load()
      .catch(error=>{
        this.loadingPopup.dismiss();
        this.logger.Error(error);
        alert("App startup failure. Please close and try again.");
        return;
      });
  }

  private async showOnBoardingPrompt(){
    // TODO: implement better
    const modal = await this.modalController.create({
      component: ProfileModal
    });
    modal.present();

    const alert = await this.alertCtrl.create({
      header: "Welcome to Wandr!",
      message: "Update your profile to get started.",
      buttons: [
        {text: "OK"}
      ]
    });

    alert.present();
  }

  private async load(){
    const uid = window.localStorage.getItem(Constants.firebaseUserIdKey);

    if(!uid){
      this.navCtrl.navigateRoot('/intro');
      return;     
    }

    this.loadingPopup = await this.loadingCtrl.create({
      spinner: 'dots'
    });
    this.loadingPopup.present();

    const user = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid);

    if(this.platform.is('cordova')){
      var facebookUid = window.localStorage.getItem(Constants.facebookUserIdKey);
      var facebookToken = window.localStorage.getItem(Constants.accessTokenKey);
      var fbUserData = await <any> this.facebookApi.getUser(facebookUid, facebookToken);
      var status = await this.facebookApi.facebookLoginStatus();
  
      if(!fbUserData || !user || status.status != 'connected'){
        // Need to login to Facebook again
        this.loadingPopup.dismiss();
        this.navCtrl.navigateRoot('/intro')
        this.presentToast('Login expired. Please login again.');
        return;
      } else {
        // Update user friend list
        const userData = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid);
        userData.friends = await this.facebookApi.getFriendList(facebookUid, facebookToken);
        const updateData = Utils.getPlainUserObject(userData);
        await this.firestoreDbHelper.UpdateUser(userData.app_uid, updateData);
      }

      const token = await this.fcm.getToken();
      await this.fcm.saveTokenToFirestore(token);
    
      this.fcm.listenToNotifications().pipe(
        tap(async (msg: INotificationPayload)=>{
          const selectedTab = this.tabRef.getSelected();

          // New message notifications
          if(msg.title.indexOf('message') > 0 && selectedTab != 'inbox'){
            const toast = await this.toastCtrl.create({
              message: msg.title,
              duration: 3000,
              position: 'top'
            });
    
            toast.present();
            this.updateBadgeCount();
          }
          else {
            const toast = await this.toastCtrl.create({
              message: msg.title,
              duration: 3000,
              position: 'top'
            });

            toast.present();
          }

          // New friend/user notifications
          if(msg.title.indexOf('network') > 0){
            this.events.publish(Constants.refreshMapDataEventName);
          }

        })
      ).subscribe();
    }

    this.events.subscribe(Constants.updateBadgeCountEventName, (newCount: number)=>{
      this.badgeCount = newCount;
    });

    await this.updateBadgeCount();

    if(!user.onboardcomplete){
      this.showOnBoardingPrompt();
    }

    this.loadingPopup.dismiss();
  }

  private async updateBadgeCount(){
    const firebaseUid = window.localStorage.getItem(Constants.firebaseUserIdKey);
    return this.firestoreDbHelper.GetUnreadChatCount(firebaseUid)
      .then((count)=>{
        this.badgeCount = count;
      })
      .catch(error=>{
        this.logger.Warn(error);
      });
  }

  private async presentToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      position: 'top',
      duration: 1000
    });
    toast.present();
  }
}

interface INotificationPayload{
  title: string;
  body: string;
}
