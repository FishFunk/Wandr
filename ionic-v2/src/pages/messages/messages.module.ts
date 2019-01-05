import { NgModule } from '@angular/core';
import { MessagesPage } from './messages';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    MessagesPage
  ],
  imports: [
    IonicPageModule.forChild(MessagesPage)
  ],
  exports: [
    MessagesPage
  ]
})
export class MessagesPageModule {}
