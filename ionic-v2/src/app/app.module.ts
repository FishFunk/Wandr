import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

//*********** ionic Native **************/
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
//import { Geolocation } from '@ionic-native/geolocation';

import { MyApp } from './app.component';

//***********  Angularfire2 v5 **************/

//import { AngularFireModule } from 'angularfire2';
// New imports to update based on AngularFire2 version 4
// import { AngularFireDatabaseModule } from 'angularfire2/database-deprecated';
//import { AngularFireAuthModule } from 'angularfire2/auth';

//***********  Facebook **************/
import { Facebook } from '@ionic-native/facebook';
//***********  Google plus **************/
//import { GooglePlus } from '@ionic-native/google-plus';

//*********** Provider **************/
// import { AuthData } from '../providers/auth-data';


import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';


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
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  
    // AngularFireModule.initializeApp(config),
    // AngularFireDatabaseModule,
    //AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    // Geolocation,
    // {
    //   provide: HAMMER_GESTURE_CONFIG,
    // },
    // {provide: ErrorHandler, useClass: IonicErrorHandler},
    // AuthData,
    // GooglePlus,
     Facebook
  ]
})
export class AppModule {}
