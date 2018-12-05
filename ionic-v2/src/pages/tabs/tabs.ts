import { Component, ViewChild } from '@angular/core';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../messages/inbox';
import { InvitePage } from '../invite/invite';
import { MapPage } from '../explore/map';
import { Tabs, Platform } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';


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

  constructor(private platform: Platform){
    this.useFabButton = !this.platform.is('ios');
  }

  // FAB button action for Android/Windows Only
  onClickExploreButton(){
    this.tabRef.select(2);
  }
}