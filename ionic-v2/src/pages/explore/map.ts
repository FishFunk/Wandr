import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { IUser } from '../../models/user';
import { WebDataService } from '../../helpers/webDataService';
import { ModalPage } from './modal';
import _ from 'underscore';

declare var google;
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})

export class MapPage {
  users: IUser[] = [];
  searchItems: string[];
  map: google.maps.Map;
  heatmap: google.maps.visualization.HeatmapLayer;
  minZoomLevel: number = 2;
  maxZoomLevel: number = 12;
  mapCenter = new google.maps.LatLng(39.250223, -99.142097);
    
  mapOptions = {
    center: this.mapCenter,
    zoom: this.minZoomLevel,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  minY = -70;
  maxY = 70;

  locationMap: _.Dictionary<google.maps.LatLng>; // { 'string_location' : LatLng Object }
  userMap: _.Dictionary<IUser[]> // Users mapped by string location

  constructor(public navCtrl: NavController,
    private webDataService: WebDataService,
    private modalCtrl: ModalController) {
  }
 
  ionViewDidLoad(){
    this.loadMap();
  }
 
  async loadMap(){
    this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);

    this.users = await this.webDataService.readUserFirstConnections();
    this.createMarkersAndHeatMap(this.users);

    // Bind map events
    setTimeout(()=>{
      this.bindEvents();        
    }, 1000);
  }

  getItems(ev: any) {

    this.searchItems = _.map(this.users, (usr)=> `${usr.first_name} ${usr.last_name} (${usr.location.stringFormat})`);
    
    // set val to the value of the searchbar
    const val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.searchItems = this.searchItems.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
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
        this.locationMap[formattedLocation] = geoCode;

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

      marker.setOpacity(0);

      marker.addListener('click', this.onMarkerClick.bind(this, latLng));

      marker.setMap(this.map);
    });
  }

  private onMarkerClick(latLng: google.maps.LatLng, e: Event){
    var str_location = _.findKey(this.locationMap, (obj)=>{
      return obj == latLng;
    });
    
    this.presentPopover(e, this.userMap[str_location]);
  }

  private initHeatMap(geoData: google.maps.LatLng[]){
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: geoData,
      map: this.map,
      radius: 60,
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

  private presentPopover(myEvent, firstConnections: IUser[]) {
    let popover = this.modalCtrl.create(ModalPage, { firstConnections: firstConnections });
    popover.present({ ev: myEvent });
  }

  private bindEvents(){
    // Limit zoom level
    this.map.addListener('zoom_changed', ()=> {
      var currentZoomLevel = this.map.getZoom();
      if (currentZoomLevel < this.minZoomLevel){
        this.map.setZoom(this.minZoomLevel);
      } else if (currentZoomLevel > this.maxZoomLevel){ 
          this.map.setZoom(this.maxZoomLevel);
      }
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('searchInput');
    var searchBox = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', ()=> {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // For each place, get the location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach((place)=> {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      this.map.fitBounds(bounds);
      this.map.setZoom(this.maxZoomLevel);
    });

    // Prevent scrolling outside Y range
    this.map.addListener('idle', (e)=>{

      var c = this.map.getCenter(),
        y = c.lat();

      if (y > this.minY && y < this.maxY) {
        // still within valid bounds, so save the last valid position
        this.mapCenter = c;
      // Bias the SearchBox results towards current map's viewport.
        searchBox.setBounds(this.map.getBounds());
        return; 
      }

      // not valid anymore => return to last valid position
      this.map.panTo(this.mapCenter);
    });
  }
}