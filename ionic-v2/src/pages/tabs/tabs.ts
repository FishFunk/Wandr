import { Component } from '@angular/core';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../messages/inbox';
import { InvitePage } from '../invite/invite';
import { MapPage } from '../explore/map';



@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  tab1Root = ProfilePage;
  tab2Root = InboxPage;
  tab3Root = MapPage;
  tab4Root = InvitePage;
  tab5Root = ProfilePage;//HelpPage;

  constructor() {
  }
}