import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Slides, Loading } from 'ionic-angular';
import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database-deprecated';
import { WebDataService } from '../../helpers/webDataService';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class InboxPage {

  @ViewChild(Slides) slides: Slides;
  chats:  any[] = [];
  messages: any[] = [];
  showChatSlide: boolean = false;
  loading: Loading;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public afDB: AngularFireDatabase, 
    public loadingCtrl: LoadingController,
    private webDataService: WebDataService) {
  }

  ionViewDidLoad(){
    this.loading = this.loadingCtrl.create();
    this.slides.lockSwipes(true);
    this.loadChats();
  }

  async loadChats(){
    this.chats = await this.webDataService.readChatList();
    this.loading.dismiss();
  }

  //***** start Bound Events *****//
  async forwardSlide(){
    this.slides.lockSwipes(false);
    this.showChatSlide = true;
    this.slides.slideNext(500);

    this.loading = this.loadingCtrl.create();
    this.messages = await this.webDataService.readMessages();
    this.messages.forEach(msg=>{
      msg.received = !! Math.round(Math.random());
      msg.profileImageUrl = "../../assets/avatar_man.png";
    });
    this.loading.dismiss();

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