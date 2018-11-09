import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NativeGeocoderOptions, NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { IUser } from '../../models/user';
import { WebDataService } from '../../helpers/webDataService';
import { markParentViewsForCheck } from '@angular/core/src/view/util';

declare var google;
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})

// Sample Lat Longs
// Houston TX
// new google.maps.LatLng(29.7604, -95.3698),

// Austin TX
// new google.maps.LatLng(30.2672, -97.7431),

// Washington DC
// new google.maps.LatLng(38.9072, -77.0369),

// San Francisco
// new google.maps.LatLng(37.7749, -122.4194),

// Toulouse, France
// new google.maps.LatLng(43.6047, 1.4442)


export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  heatmap: any;
  minZoomLevel: number = 2;
  maxZoomLevel: number = 12;
  geocoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 1
  };

  constructor(public navCtrl: NavController,
    private nativeGeocoder: NativeGeocoder,
    private webDataService: WebDataService) {
  }
 
  ionViewDidLoad(){
    this.loadMap();
  }
 
  async loadMap(){
    var self = this;
    let latLng = new google.maps.LatLng(39.250223, -99.142097); // Kansas
 
    let mapOptions = {
      center: latLng,
      zoom: this.minZoomLevel,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
 
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var users = await this.webDataService.readUserConnections();
    this.createMarkersAndHeatMap(users);

    // Wait for map to initialize
    setTimeout(()=>{
        self.map.addListener('zoom_changed', function(e) {
            var currentZoomLevel = self.map.getZoom();
            if (currentZoomLevel < self.minZoomLevel || currentZoomLevel > self.maxZoomLevel){ 
                e.preventDefault();
            }
        });
    }, 1000);
  }

  onClickSearchButton(){
    alert("Search function not yet implemented");
  }

  private async createMarkersAndHeatMap(users: IUser[]){
    var locationMap: _.Dictionary<google.maps.LatLng> = {}; // { 'location' : 'LatLng'  }
    var heatMapLatLngs: google.maps.LatLng[] = [];
    var markerLatLngs: google.maps.LatLng[] = [];

    for(var idx = 0; idx < users.length; idx++){
      let formattedLocation = `${users[idx].location.city}, ${users[idx].location.stateOrCountry}`;

      // Cache/read geocode information
      let geoCode: google.maps.LatLng;
      if(!locationMap[formattedLocation]){
        geoCode = await this.getLatLong(formattedLocation);
        locationMap[formattedLocation] = geoCode; // What happens if geocode is null?

        // Add clickable marker for each unique location
        markerLatLngs.push(geoCode);
      } else {
        geoCode = locationMap[formattedLocation];
      }

      // Add heatmap marker for every location instance
      heatMapLatLngs.push(geoCode);
    }

    this.setMarkers(markerLatLngs);    
    this.initHeatMap(heatMapLatLngs);
  }

  private async getLatLong(strLocation: string): Promise<google.maps.LatLng>{
    var data: NativeGeocoderForwardResult[] = await this.nativeGeocoder.forwardGeocode(strLocation, this.geocoderOptions);
    if(!data || data.length == 0){
      console.error(`Unable to geocode: ${strLocation}`);
      return null;
    }

    return new google.maps.LatLng(data[0].latitude, data[0].longitude);
  }

  private setMarkers(geoData: google.maps.LatLng[]){
    var self = this;
    geoData.forEach((latLng)=> {

      var image = {
        url: '../../assets/transparent.png',
        size: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20)
      };

      var marker = new google.maps.Marker({
        position: latLng,
        icon: image
      });

      marker.setOpacity(0.1);

      marker.addListener('click', this.onMarkerClick.bind(this, latLng));


      marker.setMap(this.map);
    });
  }

  private onMarkerClick(latLng: google.maps.Marker){
    alert(latLng);
  }

  private initHeatMap(geoData: google.maps.LatLng[]){
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: geoData,
      map: this.map,
      radius: 100,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });
  }
}