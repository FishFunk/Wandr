import { Component, ViewChild } from "@angular/core";
import { ViewController, NavParams, Slides, LoadingController } from "ionic-angular";
import { IUser } from '../../models/user';
import _ from "underscore";
import { AngularFireFunctions } from "angularfire2/functions";
import { Constants } from "../../helpers/constants";
import { IChat } from "../../models/chat";
import { AngularFirestore } from "angularfire2/firestore";

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
    private firestore: AngularFirestore,
    private loadingCtrl: LoadingController) {
      let firstConnections = params.get('firstConnections'); 
      let secondConnections = params.get('secondConnections');
      this.firstConnections = firstConnections;
      this.secondConnections = secondConnections;
      this.focusedConnection = _.first(firstConnections) || _.first(secondConnections);
      this.locationStringFormat = this.focusedConnection.location.stringFormat;
      this.currentUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
  }

  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }

  onClickProfile(user: IUser){
    this.slides.lockSwipes(false);
    this.focusedConnection = user;

    this.roomkey = this.currentUserId + '_' + this.focusedConnection.app_uid;

    // Enable or Disable message button and go to slide
    this.firestore.collection('chats').doc(this.roomkey).get().toPromise()
      .then((snapshot)=>{
        if(snapshot.exists){
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
    loading.present();

    const currentUserFirstName = window.localStorage.getItem(Constants.userFirstNameKey);
    const currentUserPhotoUrl = window.localStorage.getItem(Constants.profileImageUrlKey);

    const focusedConnectionUid = this.focusedConnection.app_uid;
    const roomkey = this.currentUserId + '_' + focusedConnectionUid;

    const data: IChat = {
      roomkey: roomkey,
      userA_id: this.currentUserId,
      userA_name: currentUserFirstName,
      userA_photoUrl: currentUserPhotoUrl,
      userA_unread: true,
      userB_id: focusedConnectionUid,
      userB_name: this.focusedConnection.first_name,
      userB_photoUrl: this.focusedConnection.profile_img_url,
      userB_unread: true,
      lastMessage: '',
      timestamp: new Date().getTime().toString()
    };

    const sendMessage = this.firebaseFunctionsModule.functions.httpsCallable('createChat');
    
    sendMessage(data).then((result)=>{
      alert("Message sent!"); // TODO: Navigate to chat?
      this.disableMessageButton = true;
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