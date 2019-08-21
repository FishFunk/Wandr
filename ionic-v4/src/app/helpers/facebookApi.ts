import { Injectable } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform } from '@ionic/angular';

@Injectable()
export class FacebookApi{

    private facebookPermissions: string[];

    constructor(
        private facebook: Facebook,
        private firebaseAuth: AngularFireAuth,
        private platform: Platform)
    {
        this.facebookPermissions = ['public_profile','user_location','email','user_friends','user_gender'];
    }

    public getFriendList(userId, accessToken): Promise<any[]>
    {
        return this.executeApiCall<any[]>(`/${userId}/friends?access_token=${accessToken}`, 'data');
    }
  
    public getUser(userId, accessToken)
    {
        return this.executeApiCall(`/${userId}?fields=id,name,email,link,gender,picture.width(360).height(360),location&access_token=${accessToken}`);
    }

    public facebookLogout(): Promise<any>
    {
        if(this.platform.is('cordova')){
            return this.facebook.logout();
        } else {
            return Promise.resolve();
        }
    }

    public facebookLoginStatus(): Promise<FacebookLoginResponse>
    {
        return this.facebook.getLoginStatus();
    }

    public facebookLogin(): Promise<FacebookLoginResponse>
    {
        return this.facebook.login(this.facebookPermissions);
    }

    public firebaseLogin(facebookAccessToken: string): Promise<any>
    {
        return new Promise((resolve, reject)=>{
            const credentials: firebase.auth.AuthCredential = 
                firebase.auth.FacebookAuthProvider.credential(facebookAccessToken);
        
            this.firebaseAuth.auth.signInAndRetrieveDataWithCredential(credentials)
                .then((userData: any)=> resolve(userData))
                .catch((error) => reject(error));
        });
    }

    private async executeApiCall<T>(endPointStr, fieldStr = "")
    {
        const response = await this.facebook.api(endPointStr, this.facebookPermissions)
        return fieldStr ? response[fieldStr] : response;
    }

    // private checkForError(response)
    // {
    //     if(!response)
    //     {
    //         return new Error("Service did not return an appropriate response");
    //     }
    //     if(response.error)
    //     {
    //         return response.error;
    //     }

    //     return null;
    // }
}