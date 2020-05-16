import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
 
@Component({
  templateUrl: 'permissionsNotice.html',
  styleUrls: ['permissionsNotice.scss']
})

export class PermissionsNoticeModal {

  constructor(private modalCtrl: ModalController){
  }

  onClickClose(){
    this.modalCtrl.dismiss();
  }
}