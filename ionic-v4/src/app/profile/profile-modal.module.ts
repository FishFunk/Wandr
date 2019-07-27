import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileModal } from './profile-modal';

@NgModule({
  declarations: [ProfileModal],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [ProfileModal]
})
export class ProfileModalModule {}
