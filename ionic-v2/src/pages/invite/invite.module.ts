import { NgModule } from '@angular/core';
import { InvitePage } from './invite';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    InvitePage,
  ],
  imports: [
    IonicPageModule.forChild(InvitePage),
  ],
  exports: [
    InvitePage
  ]
})
export class InvitePageModule {}
