import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ionic-native
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Device } from '@ionic-native/device/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';

// angular-fire
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule, FirestoreSettingsToken } from 'angularfire2/firestore';
import { AngularFireFunctionsModule } from 'angularfire2/functions';

// angular/common
import { HttpClientModule } from '@angular/common/http';

// Modals
import { TripDetailsModalModule } from './trips/trip-details-modal.module';
import { CreateTripModalModule } from './trips/create-trip-modal.module';
import { ProfileModalModule } from './profile/profile-modal.module';
import { ConnectionListPageModule } from './non-tabs/connection-list.module';
import { ConnectionProfileModalModule } from './non-tabs/connection-profile.module';
import { EulaModalModule } from './non-tabs/eula.module';
import { PermissionsNoticeModalModule } from './non-tabs/permissionsNotice.module';

// Popovers
import { MapTutorialPopoverModule } from './map/tutorial-popover.module';
import { SortOptionsPopoverModule } from './non-tabs/sort-option-popover.module';
import { FcmProvider } from '../providers/fcm/fcm';

// Pages
import { MessagesPageModule } from './chats/messages.module';

// Helpers
import { TripsApi } from './helpers/tripsApi';
import { Logger } from './helpers/logger';
import { FacebookApi } from './helpers/facebookApi';
import { FirestoreDbHelper } from './helpers/firestoreDbHelper';
import { GeoLocationHelper } from './helpers/geolocationHelper';


//********** firebase configuration  ************ */
export const config = { 
  apiKey: "AIzaSyDom_qhKKrsGwmYZjonTZSWc3qgTR_ioyE",
  authDomain: "brave-smile-236417.firebaseapp.com",
  databaseURL: "https://brave-smile-236417.firebaseio.com",
  projectId: "brave-smile-236417",
  storageBucket: "brave-smile-236417.appspot.com",
  messagingSenderId: "614834936291"
};

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({
      scrollAssist: false,
      scrollPadding: false
    }), 
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    TripDetailsModalModule,
    CreateTripModalModule,
    MessagesPageModule,
    ProfileModalModule,
    MapTutorialPopoverModule,
    ConnectionListPageModule,
    SortOptionsPopoverModule,
    ConnectionProfileModalModule,
    HttpClientModule,
    EulaModalModule,
    PermissionsNoticeModalModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: FirestoreSettingsToken, useValue: {} },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SocialSharing,
    Facebook,
    Keyboard,
    Firebase,
    FacebookApi,
    Logger,
    Device,
    FirestoreDbHelper,
    TripsApi,
    GeoLocationHelper,
    FcmProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
