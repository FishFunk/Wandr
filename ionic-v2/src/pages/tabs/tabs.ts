import { Component, ViewChild } from '@angular/core';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../messages/inbox';
import { InvitePage } from '../invite/invite';
import { MapPage } from '../explore/map';
import { Tabs, ToastController, Events } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { FcmProvider } from '../../providers/fcm/fcm';
import { tap } from 'rxjs/operators';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { Constants } from '../../helpers/constants';
import { Logger } from '../../helpers/logger';

@Component({
  selector: 'tabs-page',
  templateUrl: 'tabs.html'
})

export class TabsPage {

  @ViewChild('appTabs') tabRef: Tabs;

  tab1Root = ProfilePage;
  tab2Root = InboxPage;
  tab3Root = MapPage;
  tab4Root = InvitePage;
  tab5Root = SettingsPage;

  badgeCount = 0;

  constructor(
    public toastCtrl: ToastController,
    public fcm: FcmProvider,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger,
    private events: Events) {
  }

  ionViewDidLoad(){
    this.load()
      .catch(error=> {
        this.logger.Error(error);
      });
  }

  private async load(){
    const token = await this.fcm.getToken();
    await this.fcm.saveTokenToFirestore(token);

    this.fcm.listenToNotifications().pipe(
      tap((msg: INotificationPayload)=>{
        const selectedTab = this.tabRef.getSelected();

        // New message notifications
        if(msg.title.indexOf('message') > 0 && selectedTab.tabTitle != 'inbox'){
          const toast = this.toastCtrl.create({
            message: msg.title,
            duration: 3000,
            position: 'top'
          });
  
          toast.present();
          this.updateBadgeCount();
        }
        else {
          const toast = this.toastCtrl.create({
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