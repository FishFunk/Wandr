import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapTutorialPopover } from './tutorial-popover';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MapTutorialPopover],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [MapTutorialPopover]
})
export class MapTutorialPopoverModule {}
