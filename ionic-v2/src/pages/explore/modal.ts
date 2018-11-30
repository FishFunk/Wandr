import { Component, ViewChild } from "@angular/core";
import { ViewController, NavParams, Slides } from "ionic-angular";
import { IUser } from '../../models/user';
import _ from "underscore";

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
  currentUser = {};
  showProfileSlide: boolean = false;

  constructor(public viewCtrl: ViewController, params: NavParams) {
      let firstConnections = params.get('firstConnections'); 
      let secondConnections = params.get('secondConnections');
      this.firstConnections = firstConnections;
      this.secondConnections = secondConnections;
      this.currentUser = _.first(firstConnections);
  }

  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }

  onClickProfile(user: IUser){
    this.slides.lockSwipes(false);
    this.currentUser = user;
    this.showProfileSlide = true;
    this.slides.slideNext(500);
    this.slides.lockSwipes(true);
  }

  onClickSendMessage(){
    alert("not yet implemented");
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