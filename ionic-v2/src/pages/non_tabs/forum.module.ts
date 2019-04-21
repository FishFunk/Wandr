import { NgModule } from '@angular/core';
import { ForumPage } from './forum';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    ForumPage
  ],
  imports: [
    IonicPageModule.forChild(ForumPage)
  ],
  exports: [
    ForumPage
  ]
})

export class ForumModule {}