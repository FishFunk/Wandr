import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';

//***********  ionic-native **************/
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import firebase from 'firebase';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  
  rootPage: string = 'IntroPage';

  menu:Array<any> = [];
  pages: Array<any>;

  constructor(public platform: Platform, 
    private statusBar: StatusBar,
    private splashScreen: SplashScreen) {
      this.initializeApp();
  }

//********** firebase configuration  ************ */
public readonly firebaseInitOptions: any = { 
  apiKey: "AIzaSyCDSds5vBVew16tGl7hRr8CAbtYGMJwvhE",
  authDomain: "wanderlust-277a8.firebaseapp.com",
  databaseURL: "https://wanderlust-277a8.firebaseio.com",
  projectId: "wanderlust-277a8",
  storageBucket: "wanderlust-277a8.appspot.com",
  messagingSenderId: "346418379043"
};

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    firebase.initializeApp(
      this.firebaseInitOptions
    );
    this.platform.ready().then(this.onPlatformReady.bind(this));
  }

  onPlatformReady(){
    // TODO: this.logger.initialize();   
    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    // page.component = item array.component --> 
    this.nav.setRoot(page.component);
  }
}
