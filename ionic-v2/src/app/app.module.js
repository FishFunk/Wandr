var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
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
//********** firebase configuration  ************ */
export var config = {
    apiKey: "AIzaSyCDSds5vBVew16tGl7hRr8CAbtYGMJwvhE",
    authDomain: "wanderlust-277a8.firebaseapp.com",
    databaseURL: "https://wanderlust-277a8.firebaseio.com",
    projectId: "wanderlust-277a8",
    storageBucket: "wanderlust-277a8.appspot.com",
    messagingSenderId: "346418379043"
};
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                MyApp
            ],
            imports: [
                BrowserModule,
                IonicModule.forRoot(MyApp),
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
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map