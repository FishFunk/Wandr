import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, Loading } from 'ionic-angular';
import { IUser } from '../../models/user';
import { WebDataService } from '../../helpers/webDataService';
import { ModalPage } from './modal';
import _ from 'underscore';
import { first } from 'rxjs/operators';

declare var google;
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})

export class MapPage {
  maxZoomLevel = 12;
  minZoomLevel = 2;
  loadingPopup: Loading;
  users: IUser[] = [];
  searchItems: string[];
  map: google.maps.Map;
  heatmap: google.maps.visualization.HeatmapLayer;
  mapCenter = new google.maps.LatLng(39.250223, -99.142097);
  searchBox: google.maps.places.SearchBox;

  mapOptions = {
    center: this.mapCenter,
    minZoom: this.minZoomLevel,
    maxZoom: this.maxZoomLevel,
    zoom: this.minZoomLevel,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{"color": "#444444"}]},
      {"featureType": "administrative.land_parcel","stylers": [{"visibility": "off"}]},
      {"featureType": "administrative.neighborhood","stylers": [{"visibility": "off"}]},
      {"featureType": "landscape","stylers": [{"color": "#f2f2f2"}]},
      {"featureType": "poi","stylers": [{"visibility": "off"}]},
      {"featureType": "poi","elementType": "labels.text","stylers": [{"visibility": "off"}]},
      {"featureType": "poi.business","stylers": [{"visibility": "off"}]},
      {"featureType": "road","stylers": [{"saturation": -100},{"lightness": 45}]},
      {"featureType": "road","elementType": "labels","stylers": [{"visibility": "off"}]},
      {"featureType": "road","elementType": "labels.icon","stylers": [{"visibility": "off"}]},
      {"featureType": "road.arterial","stylers": [{"visibility": "off"}]},
      {"featureType": "road.arterial","elementType": "labels.icon","stylers": [{"visibility": "off"}]},
      {"featureType": "road.highway","stylers": [{"visibility": "simplified"}]},
      {"featureType": "road.highway","elementType": "labels","stylers": [{"visibility": "off"}]},
      {"featureType": "road.local","stylers": [{"visibility": "off"}]},
      {"featureType": "transit","stylers": [{"visibility": "off"}]},
      {"featureType": "water","stylers": [{"color": "#aeaeae"},{"visibility": "on"}]},
      {"featureType": "water","elementType": "labels.text","stylers": [{"visibility": "off"}]}]
  }

  minY = -70;
  maxY = 70;

  locationMap: _.Dictionary<google.maps.LatLng>; // { 'string_location' : LatLng Object }
  userMap: _.Dictionary<any> // First & Second degree connections mapped by string location

  constructor(public navCtrl: NavController,
    private webDataService: WebDataService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController) {
  }
 
  ionViewDidLoad(){
    this.loadMap();
  }
 
  async loadMap(){
    try {
      this.showLoadingPopup();
      this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);

      // Create the search box and link it to the UI element.
      var input = document.getElementById('searchInput');
      this.searchBox = new google.maps.places.SearchBox(input);
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

      let firstConnections = await this.webDataService.readUserFirstConnections();
      let secondConnections = await this.webDataService.readUserSecondConnections();

      this.createMarkersAndHeatMap(firstConnections, secondConnections);

      // Bind map events
      this.bindEvents();
      this.loadingPopup.dismiss();

    } catch(ex){
      console.error(ex);
      this.loadingPopup.dismiss();
    }
  }

  private createMarkersAndHeatMap(firstConnecitons: IUser[], secondConnections: IUser[]){
    this.locationMap = {}; // { 'location' : LatLng  }
    this.userMap = {}; // { 'location' : user[]  }
    var heatMapLatLngs: google.maps.LatLng[] = [];
    var markerLatLngs: google.maps.LatLng[] = [];

    for(var idx = 0; idx < firstConnecitons.length; idx++){
      this.geoCodeAndCacheData(firstConnecitons[idx], markerLatLngs, heatMapLatLngs, true);
    }

    for(var idx = 0; idx < secondConnections.length; idx++){
      this.geoCodeAndCacheData(secondConnections[idx], markerLatLngs, heatMapLatLngs, false);
    }

    this.setMarkers(markerLatLngs);    
    this.initHeatMap(heatMapLatLngs);
  }

  private geoCodeAndCacheData(
    user: IUser, 
    markerLatLngs: google.maps.LatLng[], 
    heatMapLatLngs: google.maps.LatLng[],
    firstDegree: boolean)
  {
    let formattedLocation = user.location.stringFormat;
      
    // Cache and map geocode information
    let geoCode: google.maps.LatLng;
    if(!this.locationMap[formattedLocation]){
      geoCode = new google.maps.LatLng(user.location.latitude, user.location.longitude);
      this.locationMap[formattedLocation] = geoCode;

      // Add clickable marker for each unique location
      markerLatLngs.push(geoCode);
    } else {
      geoCode = this.locationMap[formattedLocation];
    }

    // Cache user data grouped by common location
    if(!this.userMap[formattedLocation]){
      this.userMap[formattedLocation] = { '1': [], '2': []};
    } 
    
    if(firstDegree){
      this.userMap[formattedLocation]['1'].push(user);
    } else {
      this.userMap[formattedLocation]['2'].push(user);
    }

    // Add heatmap marker for every location instance
    heatMapLatLngs.push(geoCode);
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
    
    this.presentPopover(e, this.userMap[str_location]['1'], this.userMap[str_location]['2']);
  }

  private initHeatMap(geoData: google.maps.LatLng[]){
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: geoData,
      map: this.map,
      radius: 60,
      gradient: [
        'rgba(26, 188, 156, 0)',
        'rgba(26, 188, 156, 1)',
        'rgba(34, 167, 157, 1)',
        'rgba(43, 146, 158, 1)',
        'rgba(51, 125, 160, 1)',
        'rgba(60, 104, 161, 1)',
        'rgba(68, 83, 163, 1)',
        'rgba(77, 62, 164, 1)',
        'rgba(85, 41, 166, 1)',
        'rgba(94, 20, 167, 1)',
        'rgba(103, 0, 169, 1)'
      ]
    });
  }

  private presentPopover(myEvent, firstConnections: IUser[], secondConnections: IUser[]) {
    let popover = this.modalCtrl.create(ModalPage, 
      { firstConnections: firstConnections, secondConnections: secondConnections });
    popover.present({ ev: myEvent });
  }

  private bindEvents(){

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    this.searchBox.addListener('places_changed', ()=> {
      var places = this.searchBox.getPlaces();

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
        this.searchBox.setBounds(this.map.getBounds());
        return; 
      }

      // not valid anymore => return to last valid position
      this.map.panTo(this.mapCenter);
    });
  }

  private showLoadingPopup(){
    this.loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: ''
    });
    this.loadingPopup.present();
  }
}