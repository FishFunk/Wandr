import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';
 
@Component({
  templateUrl: 'eula.html',
  styleUrls: ['eula.scss']
})

export class EulaModal {
  eula: any = "";

  constructor(private modalCtrl: ModalController,
    private angularFirestore: AngularFirestore){
      this.load();
  }

  async load(){
    var snapshot = await this.angularFirestore.collection('metadata').doc('terms_html').get().toPromise();
    var metadata = snapshot.data();
    this.eula = metadata.data;
  }

  onClickClose(){
    this.modalCtrl.dismiss();
  }
}