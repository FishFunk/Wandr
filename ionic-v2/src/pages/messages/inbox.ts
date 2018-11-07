import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class InboxPage {
  messages:  FirebaseObjectObservable<any[]>;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController) {
  }
}