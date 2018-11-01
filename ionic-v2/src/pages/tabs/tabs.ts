import { Component } from '@angular/core';
import { ProfilePage } from '../profile/profile';
import { InboxPage } from '../messages/inbox';


@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  tab1Root = ProfilePage;
  tab2Root = InboxPage;
  tab3Root = ProfilePage;//ExplorePage;
  tab4Root =ProfilePage;// InvitationPage;
  tab5Root = ProfilePage;//HelpPage;

  constructor() {
  }
}