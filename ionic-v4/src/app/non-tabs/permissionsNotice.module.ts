import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionsNoticeModal } from './permissionsNotice';

@NgModule({
  declarations: [PermissionsNoticeModal],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [PermissionsNoticeModal]
})
export class PermissionsNoticeModalModule {}
