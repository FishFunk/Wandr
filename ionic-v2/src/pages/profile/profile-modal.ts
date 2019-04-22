import { Component, ViewChild } from "@angular/core";
import { ViewController, NavParams, Slides, LoadingController, NavController, AlertController, ItemSliding } from "ionic-angular";
// import { IUser } from '../../models/user';
import _ from "underscore";
import { Observable } from "rxjs";

import { Storage } from '@ionic/storage';
import { FormBuilder, Validators } from "@angular/forms";
@Component({
    selector: 'profile-modal',
    templateUrl: 'profile-modal.html'
  })

export class ProfileModal {
  private uid: string = "UNKNOWN_UID";
  public canSave: boolean = true;
  public faveForm;
  
  private index: number;
  private slidingItem: ItemSliding;

  constructor(
    params: NavParams,
    public viewCtrl: ViewController, 
    public fb: FormBuilder,
    
    public navParams: NavParams,
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController, 
    public alertCtrl: AlertController,) {

    // let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    // this.faveForm = fb.group({
    //   name: ['', Validators.compose([Validators.minLength(3), Validators.required])],
    //   phone: ['', Validators.compose([Validators.minLength(1), Validators.required])],
    // });
    // this.temp = _.clone(this.fave);
    this.slidingItem = navParams.get("slidingItem")
  }



  public ngOnInit(): void{
    
  }

private close(){
    this.slidingItem.close();
    this.viewCtrl.dismiss();
}
private onSelectChange(foo, foo1){
    
}

private addItem():void{
   
}
private onSave(): void {

    try{
    }
    catch(e){

    }
}


presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ['OK']
    });
    alert.present();
  }
}