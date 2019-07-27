import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTripModal } from './create-trip-modal';

@NgModule({
  declarations: [CreateTripModal],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents:[CreateTripModal]
})

export class CreateTripModalModule {}
