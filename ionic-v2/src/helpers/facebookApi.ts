import { Injectable } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import * as firebase from 'firebase/app';

@Injectable()
export class FacebookApi{

    private facebookPermissions: ['public_profile','user_location','email','user_age_range','user_friends','user_gender'];

    constructor(private fb: Facebook){

    }

    public getFriendList(userId)
    {
      return this.executeApiCall(`/${userId}/friends`, 'data');
    }
  
    public getUser(userId, accessToken)
    {
      return this.executeApiCall(`/${userId}?fields=location&access_token=${accessToken}`);
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
                    .then((userData: any)=> resolve(userData))
                    .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        });
    }

    private executeApiCall(endPointStr, fieldStr = "")
    {
        return new Promise((resolve, reject)=>
        {
            this.fb.api(endPointStr, this.facebookPermissions)
                .then((response)=>
                {
                    var possibleError = this.checkForError(response);
                    if(possibleError)
                    {
                        reject(possibleError);
                    }
                    else
                    {
                        console.log(endPointStr + ' returned: ' + JSON.stringify(response));
                        resolve(fieldStr ? response[fieldStr] : response);
                    }
                })
                .catch((error)=> reject(error));
        });
    }

    private checkForError(response)
    {
        if(!response)
        {
            return new Error("Service did not return an appropriate response");
        }
        if(response.error)
        {
            return response.error;
        }

        return null;
    }
}