import { ViewController } from "ionic-angular";
import { Component } from "@angular/core";
import { Constants } from "../../helpers/constants";

@Component({
    templateUrl: 'tutorial_popover.html',
    selector: 'tutorial-popover'
})

export class MapTutorialPopover {

    isChecked: boolean = false;

    constructor(public viewCtrl: ViewController) {}
  
    dismiss(){
        window.localStorage.setItem(Constants.hideMapTutorial, this.isChecked.toString());
        this.viewCtrl.dismiss();
    }
}