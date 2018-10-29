import { Component } from '@angular/core';
import { ProfilePage } from '../profile/profile';


@Component({
  templateUrl: 'tabs.html'
})

export class TabsPage {
  tab1Root = ProfilePage;
  tab2Root = ProfilePage;//MessagesPage;
  tab3Root = ProfilePage;//ExplorePage;
  tab4Root =ProfilePage;// InvitationPage;
  tab5Root = ProfilePage;//HelpPage;

  constructor() {
  }
}