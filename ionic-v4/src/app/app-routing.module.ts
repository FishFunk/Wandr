import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IntroGuard } from './guards/intro.guard';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule', canActivate: [IntroGuard] },
  { path: 'intro', loadChildren: './intro/intro.module#IntroPageModule' },
  { path: 'connection-list/:location', loadChildren: './non-tabs/connection-list.module#ConnectionListPageModule' },
  //{ path: 'connection-profile/:userId/:showChatButton', loadChildren: './non-tabs/connection-profile.module#ConnectionProfilePageModule' },
  { path: 'messages/:roomkey/:showProfileButton', loadChildren: './chats/messages.module#MessagesPageModule' },
  { path: 'about', loadChildren: './settings/about.module#AboutPageModule' },
  { path: 'contact', loadChildren: './settings/contact.module#ContactPageModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
