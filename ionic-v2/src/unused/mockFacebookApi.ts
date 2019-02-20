import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { MockDataGenerator } from './mockDataGenerator';
import { FacebookLoginResponse } from '@ionic-native/facebook';

@Injectable()
export class MockFacebookApi{

    private mockData: MockDataGenerator;

    constructor()
        {
            this.mockData = new MockDataGenerator();
        }

    public api(endPoint: string, permissions: string[]): Promise<any>
    {
        if(endPoint.indexOf('fields') > 0) {
            return Promise.resolve(this.mockData.getMockFacebookUser());
        }  else if (endPoint.indexOf('friends') > 0) {
            return Promise.resolve([]);
        } else if (endPoint.indexOf('picture') > 0) {
            return Promise.resolve("");
        }
    }

    public getLoginStatus(): Promise<any>
    {
        return Promise.resolve();
    }

    public login(): Promise<any>
    {
        return Promise.resolve();
    }

    public logout(): Promise<any>
    {
        return Promise.resolve();
    }

    public getFriendList(userId, accessToken): Promise<any[]>
    {
        return Promise.resolve([]);
    }
  
    public getUser(userId, accessToken)
    {
        return Promise.resolve(this.mockData.getMockFacebookUser());
    }

    public facebookLogout(): Promise<any>
    {
        return Promise.resolve();
    }

    public facebookLoginStatus(): Promise<FacebookLoginResponse>
    {
        return new Promise<FacebookLoginResponse>((resolve, reject)=> {
                resolve(this.mockData.getMockFacebookLoginResponse());
            });
    }

    public facebookLogin(): Promise<FacebookLoginResponse>
    {
        return new Promise<FacebookLoginResponse>((resolve, reject)=> {
            resolve(this.mockData.getMockFacebookLoginResponse());
        });
    }

    public firebaseLogin(facebookAccessToken: string): Promise<firebase.User>
    {
        return Promise.resolve(this.mockData.getMockFirebaseResponse());
    }
}