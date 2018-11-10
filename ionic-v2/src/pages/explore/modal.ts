import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import { IUser } from '../../models/user';

@Component({
    templateUrl: 'modal.html'
  })

export class ModalPage 
{
    view: string = 'first';
    firstConnections: IUser[] = [];
    secondConnections: IUser[] = [];

    constructor(public viewCtrl: ViewController, params: NavParams) {
        let users = params.get('firstConnections');
        this.firstConnections = users;
    }
  
    closeModal() {
      this.viewCtrl.dismiss();
    }
}