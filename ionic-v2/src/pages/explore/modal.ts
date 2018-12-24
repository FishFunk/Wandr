import { Component, ViewChild } from "@angular/core";
import { ViewController, NavParams, Slides } from "ionic-angular";
import { IUser } from '../../models/user';
import _ from "underscore";
import { AngularFireFunctions } from "angularfire2/functions";

import { Constants } from "../../helpers/constants";

@Component({
    selector: 'modal-page',
    templateUrl: 'modal.html'
  })

export class ModalPage 
{
  @ViewChild(Slides) slides: Slides;
  view: string = 'first';
  firstConnections: IUser[] = [];
  secondConnections: IUser[] = [];
  focusedConnection = <IUser> {};
  showProfileSlide: boolean = false;

  constructor(
    public viewCtrl: ViewController, 
    params: NavParams,
    private firebaseFunctionsModule: AngularFireFunctions) {
      let firstConnections = params.get('firstConnections'); 
      let secondConnections = params.get('secondConnections');
      this.firstConnections = firstConnections;
      this.secondConnections = secondConnections;
      this.focusedConnection = _.first(firstConnections);
  }

  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }

  onClickProfile(user: IUser){
    this.slides.lockSwipes(false);
    this.focusedConnection = user;
    this.showProfileSlide = true;
    this.slides.slideNext(500);
    this.slides.lockSwipes(true);
  }

  onClickSendMessage(){
    var currentUserUid = window.sessionStorage.getItem(Constants.firebaseUserIdKey);
    var currentUserFirstName = window.sessionStorage.getItem(Constants.userFirstNameKey);
    var focusedConnectionUid = this.focusedConnection.app_uid;
    var roomkey = currentUserUid + '_' + focusedConnectionUid;

    var data = {
      roomkey: roomkey,
      userA_id: currentUserUid,
      userA_name: currentUserFirstName,
      userB_id: focusedConnectionUid,
      userB_name: this.focusedConnection.first_name
    };

    var sendMessage = this.firebaseFunctionsModule.functions.httpsCallable('addMessage');
    
    sendMessage(data).then((result)=>{
      alert("Message sent!");
    })
    .catch(error=>{
      console.error(error);
    });

  }

  backSlide(){
    this.slides.lockSwipes(false);
    this.showProfileSlide = false;
    this.slides.slidePrev(500);
    this.slides.lockSwipes(true);
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}