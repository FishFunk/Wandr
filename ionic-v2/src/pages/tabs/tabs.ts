import { Component, ViewChild } from '@angular/core';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../messages/inbox';
import { InvitePage } from '../invite/invite';
import { MapPage } from '../explore/map';
import { Tabs, Platform, ToastController } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { FcmProvider } from '../../providers/fcm/fcm';
import { tap } from 'rxjs/operators';

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

  useFabButton: boolean;

  constructor(
    public toastCtrl: ToastController,
    public fcm: FcmProvider,
    private platform: Platform) {

    this.useFabButton = !this.platform.is('ios');
  }

  ionViewDidLoad(){
    this.fcm.getToken();
    this.fcm.listenToNotifications().pipe(
      tap(msg =>{
        const toast = this.toastCtrl.create({
          message: msg.body,
          duration: 3000,
          position: 'top'
        });

        toast.present();
      })
    ).subscribe();
  }


  // FAB button action for Android/Windows Only
  onClickExploreButton(){
    this.tabRef.select(2);
  }
}