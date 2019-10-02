import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
 
@Component({
  templateUrl: 'eula.html',
  styleUrls: ['eula.scss']
})

export class EulaModal {
  constructor(private modalCtrl: ModalController){
  }


  onClickClose(){
    this.modalCtrl.dismiss();
  }
}