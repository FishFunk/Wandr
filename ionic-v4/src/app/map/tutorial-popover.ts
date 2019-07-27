import { PopoverController } from "@ionic/angular";
import { Component } from "@angular/core";
import { Constants } from "../helpers/constants";

@Component({
    templateUrl: 'tutorial-popover.html',
    selector: 'tutorial-popover',
    styleUrls: ['tutorial-popover.scss']
})

export class MapTutorialPopover {

    isChecked: boolean = false;

    constructor(public popCtrl: PopoverController) {}
  
    dismiss(){
        window.localStorage.setItem(Constants.hideMapTutorial, this.isChecked.toString());
        this.popCtrl.dismiss();
    }
}