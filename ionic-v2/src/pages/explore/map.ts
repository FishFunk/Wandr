import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
 
declare var google;
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  minZoomLevel: number = 2;
  maxZoomLevel: number = 14;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController) {
  }
 
  ionViewDidLoad(){
    this.loadMap();
  }
 
  loadMap(){
    var self = this;
    let latLng = new google.maps.LatLng(39.250223, -99.142097); // Kansas
 
    let mapOptions = {
      center: latLng,
      zoom: this.minZoomLevel,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
 
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Wait for map to initialize
    setTimeout(()=>{
        self.map.addListener('zoom_changed', function(e) {
            var currentZoomLevel = self.map.getZoom();
            self.presentToast(currentZoomLevel);
            if (currentZoomLevel < self.minZoomLevel || currentZoomLevel > self.maxZoomLevel){ 
                e.preventDefault();
            }
        });
    }, 1500);
  }

  presentToast(zoomLevel: number){
    var toast = this.toastCtrl.create({
        message: `${zoomLevel}`,
        position: 'bottom',
        duration: 1000
      });
    toast.present(); 
  }
}