import { NgModule } from '@angular/core';
import { SortOptionsPopover } from './sort_option_popover';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    SortOptionsPopover
  ],
  imports: [
    IonicPageModule.forChild(SortOptionsPopover)
  ],
  exports: [
    SortOptionsPopover
  ]
})

export class SortOptionsPopoverModule {}