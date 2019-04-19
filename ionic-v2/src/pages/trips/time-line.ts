import { Component, Input, OnChanges } from '@angular/core';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'time-line',
    templateUrl: 'time-line.html'
})
export class TimeLine implements OnChanges{
  // @Input('data') 
  data: any;
  @Input('events') events: any;

  animateItems = [];
  animateClass: any;
  constructor() {
    this.animateClass = { 'fade-in-item': true };

    this.data = this.getDataForLayout1();
  }

  ngOnChanges(changes: { [propKey: string]: any }) {
    this.data = this.getDataForLayout1();
  }

  

  getDataForLayout1() :any {
     
    return {
      "items": [
          {
              "id": 1,
              "title": "San Diego",
              "time": "March 29, 2019 AT 2:20PM",
              "image": "assets/images/background/3.jpg"
          },
          {
              "id": 2,
              "title": "Miami",
              "time": "March 29, 2018 AT 2:20PM",
              "image": "assets/images/background/2.jpg"
          },
          {
              "id": 3,
              "title": "Washington, DC.",
              "time": "March 29, 2017 AT 2:20PM",
              "image": "assets/images/background/3.jpg"
          },
          {
              "id": 4,
              "title": "Mexico City",
              "time": "March 29, 2016 AT 2:20PM",
              "image": "assets/images/background/2.jpg"
          }
      ]
  };
}
  
  onEvent = (event: string, item: any, e: any): void => {
    if (e) {
      e.stopPropagation();
    }
    if (this.events[event]) {
        this.events[event](item);
    }
  }
}
