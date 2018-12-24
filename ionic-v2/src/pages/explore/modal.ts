import { Component, ViewChild } from "@angular/core";
import { ViewController, NavParams, Slides, LoadingController } from "ionic-angular";
import { IUser } from '../../models/user';
import _ from "underscore";
import { AngularFireFunctions } from "angularfire2/functions";
import { Constants } from "../../helpers/constants";
import { IChat } from "../../models/chat";
import { AngularFireDatabase } from "angularfire2/database";

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
  disableMessageButton: boolean = false;
  roomkey: string;
  currentUserId: string;
  locationStringFormat: string;

  constructor(
    public viewCtrl: ViewController, 
    params: NavParams,
    private firebaseFunctionsModule: AngularFireFunctions,
    private firebase: AngularFireDatabase,
    private loadingCtrl: LoadingController) {
      let firstConnections = params.get('firstConnections'); 
      let secondConnections = params.get('secondConnections');
      this.firstConnections = firstConnections;
      this.secondConnections = secondConnections;
      this.focusedConnection = _.first(firstConnections) || _.first(secondConnections);
      this.locationStringFormat = this.focusedConnection.location.stringFormat;
      this.currentUserId = window.sessionStorage.getItem(Constants.firebaseUserIdKey);
  }

  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }

  onClickProfile(user: IUser){
    this.slides.lockSwipes(false);
    this.focusedConnection = user;

    this.roomkey = this.currentUserId + '_' + this.focusedConnection.app_uid;

    // Enable or Disable message button and go to slide
    this.firebase.database.ref('/chats/' + this.roomkey).once('value')
      .then((snapshot)=>{
        if(snapshot.val()){
          // Chat with roomkey already exists, disable contact button
          this.disableMessageButton = true;
        } else {
          this.disableMessageButton = false;
        }
        this.showProfileSlide = true;
        this.slides.slideNext(500);
        this.slides.lockSwipes(true);
      })
      .catch(error=>{
        console.error(error);
      });
  }

  onClickSendMessage(){

    if(this.disableMessageButton){
      // TODO: Navigate to open chat?
      return;
    }

    let loading = this.loadingCtrl.create();

    const currentUserFirstName = window.sessionStorage.getItem(Constants.userFirstNameKey);
    const currentUserPhotoUrl = window.sessionStorage.getItem(Constants.profileImageUrlKey);

    const focusedConnectionUid = this.focusedConnection.app_uid;
    const roomkey = this.currentUserId + '_' + focusedConnectionUid;

    const data: IChat = {
      roomkey: roomkey,
      userA_id: this.currentUserId,
      userA_name: currentUserFirstName,
      userA_photoUrl: currentUserPhotoUrl,
      userB_id: focusedConnectionUid,
      userB_name: this.focusedConnection.first_name,
      userB_photoUrl: this.focusedConnection.profile_img_url,
      lastMessage: '',
      timestamp: new Date().getTime().toString()
    };

    const sendMessage = this.firebaseFunctionsModule.functions.httpsCallable('createChat');
    
    sendMessage(data).then((result)=>{
      alert("Message sent!"); // TODO: Navigate to chat?
      loading.dismiss();
    })
    .catch(error=>{
      console.error(error);
      loading.dismiss();
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