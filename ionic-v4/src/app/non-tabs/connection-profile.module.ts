import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectionProfileModal } from './connection-profile';

@NgModule({
  declarations: [ConnectionProfileModal],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  entryComponents: [ConnectionProfileModal]
})
export class ConnectionProfileModalModule {}
