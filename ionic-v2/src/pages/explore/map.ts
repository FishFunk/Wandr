import { Component } from '@angular/core';
import { NavController, LoadingController, Events, AlertController, PopoverController } from 'ionic-angular';
import { IUser } from '../../models/user';
import _ from 'underscore';
import { Constants } from '../../helpers/constants';
import { FirestoreDbHelper } from '../../helpers/firestoreDbHelper';
import { ConnectionListPage } from '../non_tabs/connection_list';
import { Logger } from '../../helpers/logger';
import { MapTutorialPopover } from './tutorial_popover';
 
@Component({
  selector: 'map-page',
  templateUrl: 'map.html'
})

// TODO: Add refresh button
export class MapPage {
  maxZoomLevel = 10;
  minZoomLevel = 2;
  users: IUser[] = [];
  searchItems: string[];
  map: google.maps.Map;
  heatmap: google.maps.visualization.HeatmapLayer;
  mapCenter = new google.maps.LatLng(39.250223, -99.142097);
  searchBox: google.maps.places.SearchBox;
  
  private firebaseUserId: string;

  mapOptions: google.maps.MapOptions = {
    center: this.mapCenter,
    minZoom: this.minZoomLevel,
    maxZoom: this.maxZoomLevel,
    zoom: this.minZoomLevel,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
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

  constructor(public navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private firestoreDbHelper: FirestoreDbHelper,
    private logger: Logger,
    private events: Events) {

    this.firebaseUserId = window.localStorage.getItem(Constants.firebaseUserIdKey);
  }
 
  async ionViewDidLoad(){
    // TODO: Splash/fade to hide map loading delay?
    const spinner = await this.showLoadingPopup();
    this.loadMap()
      .then(()=>{
        // TODO: Show one-time introductory dialog explaining how to use map (tutorial?)
        spinner.dismiss();
        const hideTutorial = window.localStorage.getItem(Constants.hideMapTutorial) == "true";
        if(!hideTutorial){
          setTimeout(()=>{
            const popover = this.popoverCtrl.create(MapTutorialPopover);
            popover.present();
          }, 250);
        }
      })
      .catch(async error=>{
        spinner.dismiss();        
        this.logger.Error(error)
          .then(()=>{
            this.showLoadFailurePrompt();
          })
          .catch(()=>{
            this.showLoadFailurePrompt();
          });
      });
  }
 
  async loadMap(){
    try {
      this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);

      // Create the search box and link it to the UI element.
      var input = <HTMLInputElement> document.getElementById('searchInput');
      this.searchBox = new google.maps.places.SearchBox(input);
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

      let allUsers = await this.firestoreDbHelper.ReadAllUsers(this.firebaseUserId);

      // Generate heat map data from users location information
      this.createMarkersAndHeatMap(allUsers);

      // Add custom controls to map
      this.createRandomControl();
      this.createListViewControl();

      // Bind map events
      this.bindEvents();

    } catch(ex){
      return Promise.reject(ex);
    }
  }

  async refreshMarkersAndHeatMap(){
    const spinner = await this.showLoadingPopup();

    try {
      let allUsers = await this.firestoreDbHelper.ReadAllUsers(this.firebaseUserId);

      // Generate heat map data from users location information
      this.createMarkersAndHeatMap(allUsers);

      spinner.dismiss();
    } catch(ex){
      spinner.dismiss();
      this.logger.Error(ex)
        .then(()=>{
          this.showLoadFailurePrompt();
        })
        .catch(()=>{
          this.showLoadFailurePrompt();
        });
    }
  }

  private showLoadFailurePrompt(){
    this.alertCtrl.create({
      title: "Hmm, looks like something went wrong...",
      buttons: [{
        text: "Reload the map?",
        handler: ()=>{
          this.ionViewDidLoad();
        }
      }]
    });
  }

  private createMarkersAndHeatMap(allUsers: IUser[]){
    this.locationMap = {}; // { 'location' : LatLng  }
    var heatMapLatLngs: google.maps.LatLng[] = [];
    var markerLatLngs: google.maps.LatLng[] = [];

    for(let idx = 0; idx < allUsers.length; idx++){
      this.geoCodeAndCacheData(allUsers[idx], markerLatLngs, heatMapLatLngs);
    }

    this.setMarkers(markerLatLngs);    
    this.initHeatMap(heatMapLatLngs);
  }

  private geoCodeAndCacheData(
    user: IUser, 
    markerLatLngs: google.maps.LatLng[], 
    heatMapLatLngs: google.maps.LatLng[])
  {
    let formattedLocation = user.location.stringFormat;
      
    // Cache and map geocode information
    let geoCode: google.maps.LatLng;
    if(!this.locationMap[formattedLocation]){
      geoCode = new google.maps.LatLng(+user.location.latitude, +user.location.longitude);
      this.locationMap[formattedLocation] = geoCode;

      // Add clickable marker for each unique location
      markerLatLngs.push(geoCode);
    } else {
      geoCode = this.locationMap[formattedLocation];
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
    const currentZoom = this.map.getZoom();
    if(currentZoom < this.maxZoomLevel){
      this.map.setZoom(currentZoom * 2);
      this.map.panTo(latLng);
      return;
    }

    var str_location = _.findKey(this.locationMap, (obj)=>{
      return obj == latLng;
    });

    this.navCtrl.push(ConnectionListPage, 
      { locationStringFormat: str_location }, 
      { animate: true, direction: 'forward' });
  }

  private async onShowAllClick(){
    this.navCtrl.push(ConnectionListPage, {}, 
      { animate: true, direction: 'forward' });
  }

  private initHeatMap(geoData: google.maps.LatLng[]){
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: geoData,
      map: this.map,
      radius: 45,
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

    // Subscribe to event to refresh map data 
    this.events.subscribe(Constants.refreshMapDataEventName, this.refreshMarkersAndHeatMap.bind(this));
  }

  private async showLoadingPopup(){
    const spinner = this.loadingCtrl.create({
          spinner: 'hide',
          content:`<img src="../../assets/ring-loader.gif"/>`,
          cssClass: 'my-loading-class'
      });

    await spinner.present();

    return spinner;
  }

  /**
   * The RandomControl adds a control to the map that centers on random map spot
   */
  private createRandomControl() {

    var controlDiv = document.createElement('div');
    controlDiv.style.paddingTop = '5px';
    controlDiv.style.paddingRight = '5px';
    controlDiv.style.height = '50px';
    controlDiv.style.width = '50px';

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '50%';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Go to random city with connections';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '6px';
    controlText.style.paddingRight = '6px';
    controlText.style.paddingTop = '5px';
    controlText.innerHTML = '<i class="fas fa-dice fa-2x"></i>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    controlUI.addEventListener('click', ()=> {
      var keys = _.keys(this.locationMap);
      var randomIdx = _.random(0, keys.length - 1);
      var randomKey = keys[randomIdx];
      var latLng = this.locationMap[randomKey];
      this.map.panTo(latLng);
      this.map.setZoom(this.maxZoomLevel);
    });

    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);
  }

  /**
   * The ListViewControl adds a control to the map that shows a list of all connections
   */
  private createListViewControl() {

    var controlDiv = document.createElement('div');
    controlDiv.style.paddingTop = '5px';
    controlDiv.style.paddingLeft = '5px';
    controlDiv.style.height = '50px';
    controlDiv.style.width = '50px';

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '50%';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'See full list of connections';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '6px';
    controlText.style.paddingRight = '6px';
    controlText.style.paddingTop = '5px';
    controlText.innerHTML = '<i class="fas fa-list fa-2x"></i>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    controlUI.addEventListener('click', this.onShowAllClick.bind(this));

    this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
  }
}