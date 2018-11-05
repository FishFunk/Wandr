import { Component } from '@angular/core';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../messages/inbox';
import { InvitePage } from '../invite/invite';


@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  tab1Root = ProfilePage;
  tab2Root = InboxPage;
  tab3Root = ProfilePage;//ExplorePage;
  tab4Root =InvitePage;
  tab5Root = ProfilePage;//HelpPage;

  constructor() {
  }
}