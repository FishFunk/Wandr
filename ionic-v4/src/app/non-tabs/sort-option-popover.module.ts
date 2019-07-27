import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SortOptionsPopover } from './sort-option-popover';

@NgModule({
  declarations: [SortOptionsPopover],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [SortOptionsPopover]
})
export class SortOptionsPopoverModule {}
