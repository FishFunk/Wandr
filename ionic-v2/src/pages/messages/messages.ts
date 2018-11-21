import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, Loading } from 'ionic-angular';
import { WebDataService } from '../../helpers/webDataService';

@IonicPage()
@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {

  messages: any[] = [];
  loading: Loading;

  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private webDataService: WebDataService) {
  }

  ionViewDidLoad(){
    this.loading = this.loadingCtrl.create();
    this.loadMessages();
  }

  async loadMessages(){
    this.messages = await this.webDataService.readMessages();
    this.messages.forEach(msg=>{
        msg.received = !! Math.round(Math.random());
        msg.profileImageUrl = "../../assets/avatar_man.png";
      });
    this.loading.dismiss();
  }

  onClickSendMessage(){
    alert("not yet implemented");
  }
}