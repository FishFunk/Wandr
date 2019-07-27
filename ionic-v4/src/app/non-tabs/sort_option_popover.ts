import { PopoverController, Events } from "@ionic/angular";
import { Component } from "@angular/core";
import { Constants } from "../helpers/constants";

@Component({
    templateUrl: 'sort_option_popover.html'
})

export class SortOptionsPopover {

    constructor(public popoverCtrl: PopoverController,
        private events: Events) {}
  
    orderByFirst(){
        this.events.publish(Constants.orderConnectionsByFirstName);
        this.popoverCtrl.dismiss();
    }

    orderByLast(){
        this.events.publish(Constants.orderConnectionsByLastName);
        this.popoverCtrl.dismiss();
    }

    orderByMutual(){
        this.events.publish(Constants.orderConnectionsByMutual);
        this.popoverCtrl.dismiss();
    }
}