import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EulaModal } from './eula';

@NgModule({
  declarations: [EulaModal],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [EulaModal]
})
export class EulaModalModule {}
