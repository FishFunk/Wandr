import { Component, ViewChild } from "@angular/core";
import { ViewController, NavParams, Slides, LoadingController, ToastController } from "ionic-angular";
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
  currentUserId: string;
  locationStringFormat: string;

  constructor(
    public viewCtrl: ViewController, 
    params: NavParams,
    private firebaseFunctionsModule: AngularFireFunctions,
    private firestore: AngularFirestore,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) {
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

    // Enable or Disable message button and go to slide
    this._checkIfChatExists()
      .then((doesExist)=>{
        if(doesExist){
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

    const createChat = this.firebaseFunctionsModule.functions.httpsCallable('createChat');
    
    createChat(data)
      .then((result)=>{
        this.disableMessageButton = true;
        loading.dismiss();
        // TODO: Navigate to new chat view?
        const toast = this.toastCtrl.create({
          message: "Message sent!",
          position: 'top',
          duration: 2000
        });
        toast.present();
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

  private async _checkIfChatExists(){
    // Check if chat exists to prevent duplicates
    let possibleRoomkey = this.currentUserId + '_' + this.focusedConnection.app_uid;
    let snapshot = await this.firestore.collection('chats').doc(possibleRoomkey).get().toPromise();
    if(snapshot.exists){
      // Chat with roomkey already exists
      return true;
    }
    
    possibleRoomkey = this.focusedConnection.app_uid + '_' + this.currentUserId;
    snapshot = await this.firestore.collection('chats').doc(possibleRoomkey).get().toPromise();

    if(snapshot.exists){
      // Chat with roomkey already exists
      return true;
    }

    return false;
  }
}