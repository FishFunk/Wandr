import { NgModule } from '@angular/core';
import { ForumDetailPage } from './forum_detail';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    ForumDetailPage
  ],
  imports: [
    IonicPageModule.forChild(ForumDetailPage)
  ],
  exports: [
    ForumDetailPage
  ]
})

export class ForumDetailPageModule {}