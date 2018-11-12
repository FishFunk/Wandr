import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Slides } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class InboxPage {

  @ViewChild(Slides) slides: Slides;
  messages:  FirebaseObjectObservable<any[]>;
  showChatSlide: boolean = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }

  //***** start Bound Events *****//
  forwardSlide(){
    this.slides.lockSwipes(false);
    this.showChatSlide = true;
    this.slides.slideNext(500);
    this.slides.lockSwipes(true);
  }

  backSlide(){
    this.slides.lockSwipes(false);
    this.showChatSlide = false;
    this.slides.slidePrev(500);
    this.slides.lockSwipes(true);
  }

  onClickSendMessage(){
    alert("not yet implemented");
  }
  //***** end Bound Events *****//
}