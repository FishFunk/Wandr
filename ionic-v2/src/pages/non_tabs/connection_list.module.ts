import { NgModule } from '@angular/core';
import { ConnectionListPage } from './connection_list';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [
    ConnectionListPage
  ],
  imports: [
    IonicPageModule.forChild(ConnectionListPage)
  ],
  exports: [
    ConnectionListPage
  ]
})

export class ConnectionListModule {}