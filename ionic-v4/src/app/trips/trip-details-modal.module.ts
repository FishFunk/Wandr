import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripDetailsModal } from './trip-details-modal';

@NgModule({
  declarations: [TripDetailsModal],
  imports: [
    IonicModule,
    CommonModule
  ],
  entryComponents:[TripDetailsModal]
})

export class TripDetailsModalModule {}
