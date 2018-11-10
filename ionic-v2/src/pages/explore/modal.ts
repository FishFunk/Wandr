import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
import { Observable } from 'rxjs/Observable';
import { IUser } from '../../models/user';

@Component({
    templateUrl: 'modal.html'
  })

export class ModalPage 
{
    view: string = 'first';
    firstConnections: Observable<IUser>[];
    secondConnections: Observable<IUser>[];

    constructor(public viewCtrl: ViewController,
      private params: NavParams) {
        let users = params.get('firstConnections');
        this.firstConnections = users;
    }
  
    closeModal() {
      this.viewCtrl.dismiss();
    }
}