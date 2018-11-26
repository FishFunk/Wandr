import { Injectable } from '@angular/core';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import * as firebase from 'firebase/app';

@Injectable()
export class FacebookApi{

    private facebookPermissions: ['public_profile','user_location','email','user_friends','user_gender'];

    constructor(private fb: Facebook){
    }

    public getFriendList(userId): Promise<string[]>
    {
        return this.executeApiCall<string[]>(`/${userId}/friends`, 'data');
    }
  
    public getUser(userId, accessToken)
    {
        return this.executeApiCall(`/${userId}?fields=id,name,link,gender,picture.width(150).height(150),location&access_token=${accessToken}`);
    }

    public getProfilePhoto(userId)
    {
        return this.executeApiCall(`/${userId}/picture`);
    }

    public facebookLogout(): Promise<any>
    {
        return this.fb.logout();
    }

    public facebookLoginStatus(): Promise<FacebookLoginResponse>
    {
      return new Promise<FacebookLoginResponse>((resolve, reject)=>{
        this.fb.getLoginStatus()
            .then((response)=> {
                if(!response) {
                    reject("facebookLoginStatus => No response");
                } else {
                    resolve(response);
                }
            })
            .catch((error)=> reject(error));
      });
    }

    public facebookLogin(): Promise<FacebookLoginResponse>
    {
        return new Promise((resolve, reject) =>{
            this.fb.login(this.facebookPermissions)
            .then((response: FacebookLoginResponse)=> {
                if(!response) {
                    reject("facebookLogin => No response");
                } else {
                    resolve(response);
                }
            })
            .catch((error) => reject(error));
        });
    }

    public firebaseLogin(facebookAccessToken: string): Promise<firebase.User>
    {
        return new Promise((resolve, reject)=>{
            const credentials: firebase.auth.AuthCredential = 
            firebase.auth.FacebookAuthProvider.credential(facebookAccessToken);
        
            firebase.auth().signInWithCredential(credentials)
                .then((userData: any)=> resolve(userData))
                .catch((error) => reject(error));
        });
    }

    private executeApiCall<T>(endPointStr, fieldStr = "")
    {
        return new Promise<T>((resolve, reject)=>
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