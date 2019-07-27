import { Component, ViewChild } from '@angular/core';
import { ToastController, AlertController, ModalController, Events, IonTabs } from '@ionic/angular';
import { FcmProvider } from 'src/providers/fcm/fcm';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import { ProfileModal } from '../profile/profile-modal';
import { Constants } from '../helpers/constants';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('appTabs') tabRef: IonTabs;
  badgeCount = 0;

  constructor(public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public fcm: FcmProvider,
    private modalController: ModalController,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger,
    private events: Events){

  }

  ngOnInit(){
    this.load()
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
    const user = await this.firestoreDbHelper.ReadUserByFirebaseUid(uid);
    if(!user.onboardcomplete){
      this.showOnBoardingPrompt();
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

    this.events.subscribe(Constants.updateBadgeCountEventName, (newCount: number)=>{
      this.badgeCount = newCount;
    });

    await this.updateBadgeCount();
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
}

interface INotificationPayload{
  title: string;
  body: string;
}
