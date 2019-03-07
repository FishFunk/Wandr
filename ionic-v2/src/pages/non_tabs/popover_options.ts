import { ViewController, Events } from "ionic-angular";
import { Component } from "@angular/core";
import { Constants } from "../../helpers/constants";

@Component({
    templateUrl: 'popover_options.html'
})

export class PopoverPage {

    constructor(public viewCtrl: ViewController,
        private events: Events) {}
  
    orderByFirst(){
        this.events.publish(Constants.orderConnectionsByFirstName);
        this.viewCtrl.dismiss();
    }

    orderByLast(){
        this.events.publish(Constants.orderConnectionsByLastName);
        this.viewCtrl.dismiss();
    }

    orderByMutual(){
        this.events.publish(Constants.orderConnectionsByMutual);
        this.viewCtrl.dismiss();
    }
}