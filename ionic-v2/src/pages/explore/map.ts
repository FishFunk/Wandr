import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { IUser } from '../../models/user';
import { WebDataService } from '../../helpers/webDataService';
import _ from 'underscore';

declare var google;
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})

export class MapPage {

  map: google.maps.Map;
  heatmap: google.maps.visualization.HeatmapLayer;
  minZoomLevel: number = 2;
  maxZoomLevel: number = 12;

  locationMap: _.Dictionary<google.maps.LatLng>; // { 'string_location' : LatLng Object }
  userMap: _.Dictionary<IUser[]> // Users mapped by string location

  constructor(public navCtrl: NavController,
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

    var users = await this.webDataService.readUserFirstConnections();
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

  private createMarkersAndHeatMap(users: IUser[]){
    this.locationMap = {}; // { 'location' : LatLng  }
    this.userMap = {}; // { 'location' : user[]  }
    var heatMapLatLngs: google.maps.LatLng[] = [];
    var markerLatLngs: google.maps.LatLng[] = [];

    for(var idx = 0; idx < users.length; idx++){
      let formattedLocation = users[idx].location.stringFormat;

      // Cache and map geocode information
      let geoCode: google.maps.LatLng;
      if(!this.locationMap[formattedLocation]){
        geoCode = new google.maps.LatLng(users[idx].location.latitude, users[idx].location.longitude);
        this.locationMap[formattedLocation] = geoCode; // What happens if geocode is null?

        // Add clickable marker for each unique location
        markerLatLngs.push(geoCode);
      } else {
        geoCode = this.locationMap[formattedLocation];
      }

      // Cache user data grouped by common location
      if(!this.userMap[formattedLocation]){
        this.userMap[formattedLocation] = [];
      } 
      
      this.userMap[formattedLocation].push(users[idx]); 

      // Add heatmap marker for every location instance
      heatMapLatLngs.push(geoCode);
    }

    this.setMarkers(markerLatLngs);    
    this.initHeatMap(heatMapLatLngs);
  }

  private setMarkers(geoData: google.maps.LatLng[]){
    geoData.forEach((latLng)=> {

      var image = {
        url: '../../assets/transparent.png',
        size: new google.maps.Size(45, 45),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 20)
      };

      var marker = new google.maps.Marker({
        position: latLng,
        icon: image
      });

      marker.setOpacity(0.05);

      marker.addListener('click', this.onMarkerClick.bind(this, latLng));

      marker.setMap(this.map);
    });
  }

  private onMarkerClick(latLng: google.maps.LatLng){
    var str_location = _.findKey(this.locationMap, (obj)=>{
      return obj == latLng;
    });
    
    alert(`You have ${this.userMap[str_location].length} connections in ${str_location}!`);
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