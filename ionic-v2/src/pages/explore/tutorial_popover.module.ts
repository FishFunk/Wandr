import { NgModule } from '@angular/core';
import { MapTutorialPopover } from './tutorial_popover';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    MapTutorialPopover
  ],
  imports: [
    IonicPageModule.forChild(MapTutorialPopover)
  ],
  exports: [
    MapTutorialPopover
  ]
})

export class MapTutorialPopoverModule {}