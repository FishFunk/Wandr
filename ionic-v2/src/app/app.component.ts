import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Content } from 'ionic-angular';

//***********  ionic-native **************/
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import firebase from 'firebase';
import { TabsPage } from '../pages/tabs/tabs';
import { IntroPage } from '../pages/intro/intro';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { FacebookApi } from '../helpers/facebookApi';
import { WelcomePage } from '../pages/welcome/welcome';

declare var google; // Declare global 'google' variable

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  @ViewChild(Content) content: Content;

  rootPage: any;

  constructor(public platform: Platform, 
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private keyboard: Keyboard,
    private facebookApi: FacebookApi) {
      this.initializeApp();
  }

//********** firebase configuration  ************ */
public readonly firebaseInitOptions: any = { 
  // apiKey: "AIzaSyCJOye-L4aFVVZny4n9_XWz61ZPxbCBdyw",
  // authDomain: "wanderlust-app-220020.firebaseapp.com",
  // databaseURL: "https://wanderlust-app-220020.firebaseio.com",
  // projectId: "wanderlust-app-220020",
  // storageBucket: "wanderlust-app-220020.appspot.com",
  // messagingSenderId: "430173647950"
  apiKey: "AIzaSyDom_qhKKrsGwmYZjonTZSWc3qgTR_ioyE",
  authDomain: "brave-smile-236417.firebaseapp.com",
  databaseURL: "https://brave-smile-236417.firebaseio.com",
  projectId: "brave-smile-236417",
  storageBucket: "brave-smile-236417.appspot.com",
  messagingSenderId: "614834936291"
};

  initializeApp() {
    this.platform.ready().then(() => {
      
      try
      {
        firebase.initializeApp(
          this.firebaseInitOptions
        );

        // Handle tab hiding defect for android devices
        if (this.platform.is('android')) {
          this.statusBar.styleLightContent(); // Make phone status bar visible
          this.keyboard.onKeyboardShow().subscribe(() => {
            document.body.classList.add('keyboard-is-open');
          });
      
          this.keyboard.onKeyboardHide().subscribe(() => {
            document.body.classList.remove('keyboard-is-open');
          });
        } else {
          this.statusBar.styleDefault();
        }

        if(this.platform.is('cordova')){
          this.facebookApi.facebookLoginStatus()
          .then((statusResponse)=>{
            if (statusResponse.status == 'connected') {
              this.rootPage = TabsPage;
            } else {
              this.rootPage = WelcomePage;
            }

            this.splashScreen.hide();
          })
          .catch(error=>{
            console.error(error);
            alert("Application failed to initialize.");
          });
        } else {
          // Running in web browser
          this.rootPage = WelcomePage;
        }
      }
      catch(ex){
        console.error(ex);
      }
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
