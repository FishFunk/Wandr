var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
var IntroPage = /** @class */ (function () {
    function IntroPage(navCtrl, alertCtrl, fb) {
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.fb = fb;
        this.slides = [
            {
                title: "Welcome to the Local Travaller",
                description: "Explore new places. Meet new people",
                image: "./assets/slide2-2.png",
                color: "#1ABC9C"
            },
            {
                title: "Join the Tribe!",
                description: "Travel globally. Experience locally.",
                image: "./assets/slide1-1.png",
                color: "#C0C0B5"
            }
        ];
    }
    IntroPage.prototype.goToLogin = function () {
        this.presentAlert("Need to implement Facebook login");
        this.fb.login(['public_profile', 'user_location', 'email', 'user_age_range', 'user_friends', 'user_gender'])
            .then(function (res) { return console.log("Facebook login was successful!"); })
            .catch(function (e) { return console.log('Error logging into Facebook', e); });
    };
    IntroPage.prototype.presentAlert = function (title) {
        var alert = this.alertCtrl.create({
            title: title,
            buttons: ['OK']
        });
        alert.present();
    };
    IntroPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-intro',
            templateUrl: 'intro.html'
        }),
        __metadata("design:paramtypes", [NavController,
            AlertController,
            Facebook])
    ], IntroPage);
    return IntroPage;
}());
export { IntroPage };
//# sourceMappingURL=intro.js.map