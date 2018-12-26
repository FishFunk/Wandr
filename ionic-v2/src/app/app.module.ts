import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

//*********** ionic Native **************/
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Device } from '@ionic-native/device/ngx';

import { MyApp } from './app.component';

//***********  Angularfire2 v5 **************/
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireFunctionsModule } from 'angularfire2/functions';

//***********  Facebook **************/
import { Facebook } from '@ionic-native/facebook/ngx';
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
import { IntroPage } from '../pages/intro/intro';


//*********** Provider **************/
// import { AuthData } from '../providers/auth-data';
import { WebDataService } from '../helpers/webDataService';
import { ModalPage } from '../pages/explore/modal';
import { FacebookApi } from '../helpers/facebookApi';

//import firebase from 'firebase';
//********** firebase configuration  ************ */
export const config = { 
  // apiKey: "AIzaSyCDSds5vBVew16tGl7hRr8CAbtYGMJwvhE",
  // authDomain: "wanderlust-277a8.firebaseapp.com",
  // databaseURL: "https://wanderlust-277a8.firebaseio.com",
  // projectId: "wanderlust-277a8",
  // storageBucket: "wanderlust-277a8.appspot.com",
  // messagingSenderId: "346418379043"
  apiKey: "AIzaSyCJOye-L4aFVVZny4n9_XWz61ZPxbCBdyw",
  authDomain: "wanderlust-app-220020.firebaseapp.com",
  databaseURL: "https://wanderlust-app-220020.firebaseio.com",
  projectId: "wanderlust-app-220020",
  storageBucket: "wanderlust-app-220020.appspot.com",
  messagingSenderId: "430173647950"
};
  
@NgModule({
  declarations: [
    MyApp,
    IntroPage,
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
    IonicModule.forRoot(MyApp,{
      scrollPadding: false,
      scrollAssist: true, 
      autoFocusAssist: false
    }),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFireModule.initializeApp(config)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    IntroPage,
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
    FacebookApi,
    Keyboard,
    Device
  ]
})
export class AppModule {}


