import { Injectable } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import * as firebase from 'firebase/app';

@Injectable()
export class FacebookApi{

    private facebookPermissions: ['public_profile','user_location','email','user_age_range','user_friends','user_gender'];

    constructor(private fb: Facebook){

    }

    public facebookLogout(): Promise<any>
    {
        return this.fb.logout();
    }

    public facebookLoginStatus(): Promise<string>
    {
      return new Promise<string>((resolve, reject)=>{
        this.fb.getLoginStatus()
        .then((response)=> resolve(response.status))
        .catch((error)=> reject(error));
      });
    }

    public facebookLogin(): Promise<firebase.User>
    {
        return new Promise((resolve, reject) =>{
            this.fb.login(this.facebookPermissions)
            .then((loginResponse: FacebookLoginResponse)=>
            {
                const credentials: firebase.auth.AuthCredential = 
                    firebase.auth.FacebookAuthProvider.credential(loginResponse.authResponse.accessToken);
                
                firebase.auth().signInWithCredential(credentials)
                    .then((user: firebase.User)=> resolve(user))
                    .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }
}