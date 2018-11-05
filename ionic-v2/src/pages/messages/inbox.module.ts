import { NgModule } from '@angular/core';
import { InboxPage } from './inbox';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    InboxPage,
  ],
  imports: [
    IonicPageModule.forChild(InboxPage),
  ],
  exports: [
    InboxPage
  ]
})
export class InboxPageModule {}
