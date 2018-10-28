var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
//***********  ionic-native **************/
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
var MyApp = /** @class */ (function () {
    function MyApp(platform, statusBar, splashScreen) {
        this.platform = platform;
        this.statusBar = statusBar;
        this.splashScreen = splashScreen;
        this.rootPage = 'IntroPage';
        this.menu = [];
        this.initializeApp();
        this.menu = [
            {
                title: 'Layout with firebase',
                myicon: '',
                iconLeft: 'ios-filing',
                icon: 'ios-add-outline',
                showDetails: false,
                items: [
                    { name: 'Authentication(Login)', component: 'MainPage' },
                    { name: 'Authentication(Register)', component: 'RegisterPage' },
                    { name: 'Authentication(Forgot)', component: 'ForgotPage' },
                    { name: 'Authentication(Profile)', component: 'AfterLoginPage' },
                    { name: 'Chart', component: 'ChartPage' },
                    { name: 'City guide', component: 'Category1Page' },
                    { name: 'Shopping', component: 'Category2Page' },
                    { name: 'Restaurant', component: 'Category3Page' },
                    { name: 'Google map', component: 'MapPage' },
                    { name: 'Image gallery', component: 'GalleryPage' },
                    { name: 'Feed', component: 'FeedPage' },
                    { name: 'Form', component: 'FormResultPage' },
                    { name: 'Intro', component: 'IntroPage' },
                    { name: 'Pinterest(Masonry)', component: 'MasonryPage' },
                    { name: 'Profile1', component: 'ProfilePage' },
                    { name: 'Profile2', component: 'Profile2Page' },
                    { name: 'Profile3', component: 'Profile3Page' },
                    { name: 'Profile4', component: 'Profile4Page' },
                    { name: 'Radio player', component: 'RadioListPage' },
                    { name: 'Search', component: 'SearchPage' },
                    { name: 'Timeline', component: 'TimelinePage' }
                ]
            }, {
                title: 'Components',
                iconLeft: 'ios-copy',
                icon: 'ios-add-outline',
                showDetails: false,
                items: [
                    { name: 'Accordion', component: 'AccordionPage' },
                    { name: 'Action sheet', component: 'ActionsheetPage' },
                    { name: 'Alert', component: 'AlertPage' },
                    { name: 'Animation', component: 'AnimationsPage' },
                    { name: 'Button', component: 'ButtonPage' },
                    { name: 'Datetime', component: 'DatetimePage' },
                    { name: 'Fab', component: 'FabPage' },
                    { name: 'Fading header', component: 'FadingHeaderPage' },
                    { name: 'Grid', component: 'GridPage' },
                    { name: 'Header', component: 'HeaderPage' },
                    { name: 'Input', component: 'InputPage' },
                    { name: 'Item', component: 'ItemPage' },
                    { name: 'Item sliding', component: 'ItemSlidingPage' },
                    { name: 'Label', component: 'LabelPage' },
                    { name: 'Radio button', component: 'RadioButtonPage' },
                    { name: 'Rating', component: 'RatingPage' },
                    { name: 'Range', component: 'RangePage' },
                    { name: 'Search bar', component: 'SearchBarPage' },
                    { name: 'Select option', component: 'SelectOptionPage' },
                    { name: 'Segment', component: 'SegmentPage' },
                    { name: 'Shrinking', component: 'ShrinkingPage' },
                    { name: 'Tag', component: 'TagPage' },
                    { name: 'Table', component: 'TablePage' },
                    { name: 'Transparent header', component: 'TransparentHeaderPage' },
                    { name: 'Toast', component: 'ToastPage' }
                ]
            }, {
                title: 'Theme',
                iconLeft: 'md-color-palette',
                icon: 'ios-add-outline',
                showDetails: false,
                items: [
                    {
                        name: 'Color',
                        component: 'ThemePage'
                    }
                ]
            }
        ];
        this.pages = [
            // { icon:'call', title:'Contact us', component: 'ContactPage' },
            { icon: 'bookmark', title: 'Version 2.0.2', component: "MainPage" }
        ];
    }
    MyApp.prototype.initializeApp = function () {
        var _this = this;
        this.platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            _this.statusBar.styleDefault();
            _this.splashScreen.hide();
        });
    };
    MyApp.prototype.toggleDetails = function (menu) {
        if (menu.showDetails) {
            menu.showDetails = false;
            menu.icon = 'ios-add-outline';
        }
        else {
            menu.showDetails = true;
            menu.icon = 'ios-remove-outline';
        }
    };
    MyApp.prototype.openPage = function (page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        // page.component = item array.component --> 
        //this.nav.setRoot(page.component);
        this.nav.setRoot(page.component);
    };
    __decorate([
        ViewChild(Nav),
        __metadata("design:type", Nav)
    ], MyApp.prototype, "nav", void 0);
    MyApp = __decorate([
        Component({
            templateUrl: 'app.html'
        }),
        __metadata("design:paramtypes", [Platform, StatusBar, SplashScreen])
    ], MyApp);
    return MyApp;
}());
export { MyApp };
//# sourceMappingURL=app.component.js.map