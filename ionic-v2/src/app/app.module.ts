import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

//*********** ionic Native **************/
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NativeGeocoder } from '@ionic-native/native-geocoder';

import { MyApp } from './app.component';

//***********  Angularfire2 v5 **************/

//import { AngularFireModule } from 'angularfire2';
//import {AngularFireModule} from 'Angularfire2';
import {AngularFireModule} from 'angularfire2';
// New imports to update based on AngularFire2 version 4
//import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database-deprecated';
//import { AngularFireDatabase} from 'angularfire2/database';
// for AngularFireAuth
import { AngularFireAuth } from 'angularfire2/auth';



//***********  Facebook **************/
import { Facebook } from '@ionic-native/facebook';
// import { MockFacebookApi } from '../helpers/mockFacebookApi';

//***********  Tabs **************/
import { TabsPage } from '../pages/tabs/tabs';

//***********  Views **************/
import { ProfilePage } from '../pages/profile/profile';
import { InboxPage } from '../pages/messages/inbox';
import { InvitePage } from '../pages/invite/invite';
import { MapPage } from '../pages/explore/map';
import { SettingsPage } from '../pages/settings/settings';
import { MessagesPage } from '../pages/messages/messages';
import { ContactPage } from '../pages/settings/contact';
import { AboutPage } from '../pages/settings/about';


//*********** Provider **************/
// import { AuthData } from '../providers/auth-data';
import { WebDataService } from '../helpers/webDataService';
import { ModalPage } from '../pages/explore/modal';
import { FacebookApi } from '../helpers/facebookApi';

//import firebase from 'firebase';
//********** firebase configuration  ************ */
export const config = { 
  apiKey: "AIzaSyCDSds5vBVew16tGl7hRr8CAbtYGMJwvhE",
  authDomain: "wanderlust-277a8.firebaseapp.com",
  databaseURL: "https://wanderlust-277a8.firebaseio.com",
  projectId: "wanderlust-277a8",
  storageBucket: "wanderlust-277a8.appspot.com",
  messagingSenderId: "346418379043"
};
  
@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    ProfilePage,
    InboxPage,
    InvitePage,
    MapPage,
    ModalPage,
    SettingsPage,
    MessagesPage,
    ContactPage,
    AboutPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(config)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    ProfilePage,
    InboxPage,
    InvitePage,
    MapPage,
    ModalPage,
    SettingsPage,
    MessagesPage,
    ContactPage,
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ErrorHandler,
    IonicErrorHandler,
    SocialSharing,
    Facebook,
    NativeGeocoder,
    WebDataService,
    FacebookApi
  ]
})
export class AppModule {}


