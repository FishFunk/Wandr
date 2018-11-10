import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import { IUser } from '../../models/user';

@Component({
    selector: 'modal-page',
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

    onClickProfile(user: IUser){
      alert(user.first_name);
    }
  
    closeModal() {
      this.viewCtrl.dismiss();
    }
}