import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

//*********** ionic Native **************/
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Badge } from '@ionic-native/badge/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';

import { MyApp } from './app.component';

//***********  Angularfire2 v5 **************/
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireFunctionsModule } from 'angularfire2/functions';

//***********  Facebook **************/
import { Facebook } from '@ionic-native/facebook/ngx';

//***********  Tabs **************/
import { TabsPage } from '../pages/tabs/tabs';

//***********  Page Modules **************/
import { ProfilePageModule } from '../pages/profile/profile.module';
import { InboxPageModule } from '../pages/messages/inbox.module';
import { InvitePageModule } from '../pages/invite/invite.module';
import { MapPageModule } from '../pages/explore/map.module';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { MessagesPageModule } from '../pages/messages/messages.module';
import { IntroPageModule } from '../pages/intro/intro.module';
import { ConnectionListModule } from '../pages/non_tabs/connection_list.module';
import { ConnectionProfileModule } from '../pages/non_tabs/connection_profile.module';

//*********** Modal Pages **************/
import { ContactPage } from '../pages/settings/contact';
import { AboutPage } from '../pages/settings/about';

//*********** Provider **************/
import { FacebookApi } from '../helpers/facebookApi';
import { FirestoreDbHelper } from '../helpers/firestoreDbHelper';
import { Logger } from '../helpers/logger';
import { FcmProvider } from '../providers/fcm/fcm';
import { SortOptionsPopoverModule } from '../pages/non_tabs/sort_option_popover.module';
import { MapTutorialPopoverModule } from '../pages/explore/tutorial_popover.module';
import { ConnectivityServiceProvider } from '../providers/connectivity-service/connectivity-service';

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
  declarations: [
    MyApp,
    TabsPage,
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
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(config),
    IntroPageModule,
    ProfilePageModule,
    InboxPageModule,
    InvitePageModule,
    MapPageModule,
    SettingsPageModule,
    MessagesPageModule,
    ConnectionListModule,
    ConnectionProfileModule,
    SortOptionsPopoverModule,
    MapTutorialPopoverModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
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
    FirestoreDbHelper,
    FacebookApi,
    Logger,
    Keyboard,
    Device,
    Firebase,
    FcmProvider,
    Badge,
    Contacts,
    ConnectivityServiceProvider
  ]
})
export class AppModule {}


