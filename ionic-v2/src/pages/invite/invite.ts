import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';

@IonicPage()
@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html'
})
export class InvitePage {
  messages:  FirebaseObjectObservable<any[]>;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController) {
  }
}