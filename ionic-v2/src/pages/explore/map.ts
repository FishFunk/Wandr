import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NativeGeocoderOptions, NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { HeatMapLocation, IHeatMapLocation } from './models/heatMapLocation';

declare var google;
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})
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
    private nativeGeocoder: NativeGeocoder) {
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

    var userLocationData = await this.readUserLocationData();
    var geoData = await this.geocodeLocations(userLocationData);

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

  getSamplePoints() {
    return [
      // Houston TX
      new google.maps.LatLng(29.7604, -95.3698),

      // Austin TX
      new google.maps.LatLng(30.2672, -97.7431),

      // Washington DC
      new google.maps.LatLng(38.9072, -77.0369),

      // San Francisco
      new google.maps.LatLng(37.7749, -122.4194),
      
      // Toulouse, France
      new google.maps.LatLng(43.6047, 1.4442)
    ];
  }

  async geocodeLocations(locations: IHeatMapLocation[]): Promise<google.maps.LatLng[]>
  {
    var formattedData: google.maps.LatLng[] = [];
    for(var i=0; i<locations.length; i++)
    {
      var loc = `${locations[i].city}, ${locations[i].stateOrCountry}`;
      var data: NativeGeocoderForwardResult[] = await this.nativeGeocoder.forwardGeocode(loc, this.geocoderOptions);
      if(data.length > 0){
        for(var x=0; x<locations[i].count; x++){
          formattedData.push(new google.maps.LatLng(data[0].latitude, data[0].longitude));
        }
      }
      else{
        console.log(`Unable to geocode location: ${JSON.stringify(locations[i])}`);
      }
    }

    return formattedData;
  }

  async readUserLocationData(): Promise<IHeatMapLocation[]>{
    return await new Promise<IHeatMapLocation[]>((resolve, reject)=>{
      resolve([
        new HeatMapLocation('San Diego', 'CA', 4),
        new HeatMapLocation('Houston', 'TX', 3),
        new HeatMapLocation('Washington', 'DC', 22),
        new HeatMapLocation('San Jose', 'CR', 6),
        new HeatMapLocation('Honolulu', 'HI', 2),
        new HeatMapLocation('Delray Beach', 'FL', 2),
        new HeatMapLocation('San Francisco', 'CA', 5),
        new HeatMapLocation('Los Angelos', 'CA', 4),
        new HeatMapLocation('Philadelphia', 'PA', 8)
      ]);
    });
  }

  onClickSearchButton(){
    alert("Search function not yet implemented");
  }
}