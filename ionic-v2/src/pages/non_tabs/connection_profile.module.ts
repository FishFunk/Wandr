import { NgModule } from '@angular/core';
import { ConnectionProfilePage } from './connection_profile';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    ConnectionProfilePage
  ],
  imports: [
    IonicPageModule.forChild(ConnectionProfilePage)
  ],
  exports: [
    ConnectionProfilePage
  ]
})

export class ConnectionProfileModule {}