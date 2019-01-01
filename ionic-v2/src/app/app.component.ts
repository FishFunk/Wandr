import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Content } from 'ionic-angular';

//***********  ionic-native **************/
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import firebase from 'firebase';
import { Constants } from '../helpers/constants';
import { TabsPage } from '../pages/tabs/tabs';
import { IntroPage } from '../pages/intro/intro';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild(Content) content: Content;

  rootPage: any;
  showIntro: boolean = false;

  constructor(public platform: Platform, 
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private keyboard: Keyboard) {
      this.initializeApp();
  }

//********** firebase configuration  ************ */
public readonly firebaseInitOptions: any = { 
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

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      this.statusBar.styleDefault();
      firebase.initializeApp(
        this.firebaseInitOptions
      );


      // Handle tab hiding defect for android devices
      if (this.platform.is('android')) {
        this.keyboard.onKeyboardShow().subscribe(() => {
          document.body.classList.add('keyboard-is-open');
        });
    
        this.keyboard.onKeyboardHide().subscribe(() => {
          document.body.classList.remove('keyboard-is-open');
        });
      }

      var dateInMilliSecStr = window.localStorage.getItem(Constants.facebookExpireKey);
      if(dateInMilliSecStr){
        var expireDate = +dateInMilliSecStr;
        var currentDate = new Date().getTime();
        if(expireDate >= currentDate){
          this.rootPage = IntroPage;
        } else {
          this.rootPage = TabsPage;
        }
      } else {
        this.rootPage = IntroPage;
      }
  
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
