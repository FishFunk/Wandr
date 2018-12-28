import { Injectable } from "@angular/core";
import { IUser } from "../models/user";
import { AngularFireDatabase, DatabaseSnapshot } from "angularfire2/database";
import _ from 'underscore';

@Injectable()
export class RealtimeDbHelper {
    constructor(private firebase: AngularFireDatabase){

    }

    public async ReadFirstConnections(firebaseUserId: string){
        var firstConnections: IUser[] = [];

        var snapshot = await this.firebase.database.ref('/users/' + firebaseUserId).once('value');
        var user = <IUser> snapshot.val();

        var promises = user.friends.map((friend)=> {
        return this.firebase.database.ref('users')
            .orderByChild('facebook_uid')
            .equalTo(friend.id)
            .once("value");
        });

        var snapshots = await Promise.all(promises).catch((error)=> {
            console.error(error);
            return Promise.reject(error);
        });

        snapshots.forEach((snapshot: DatabaseSnapshot<any>)=> {
        var dbObj = snapshot.val();
        if(dbObj){
            var key = _.keys(snapshot.val())[0];
            var user = <IUser> dbObj[key];
            firstConnections.push(user);
        }
        });

        return Promise.resolve(firstConnections);
    }

    public async ReadSecondConnections(targetFacebookId: string, firstConnections: IUser[]): Promise<IUser[]>{
        let firstConnectionFacebookIds = [];
        let secondConnectionFacebookIds = [];
        let secondConnections: IUser[] = [];
    
        _.each(firstConnections, (user)=>{
          firstConnectionFacebookIds.push(user.facebook_uid);
          _.each(user.friends, (friendObj) => {
            // Exclude current user
            if(friendObj.id != targetFacebookId){
              secondConnectionFacebookIds.push(friendObj.id);
            }
          });
        });
    
        // Exclude duplicates
        secondConnectionFacebookIds = _.uniq(secondConnectionFacebookIds);
        secondConnectionFacebookIds = _.difference(secondConnectionFacebookIds, firstConnectionFacebookIds);
    
        // Get 2nd Connections Users from DB by Facebook UID
        var promises = secondConnectionFacebookIds.map((facebook_uid)=> {
          return this.firebase.database.ref('users')
            .orderByChild('facebook_uid')
            .equalTo(facebook_uid)
            .once("value");
        });
    
        var snapshots = await Promise.all(promises).catch((error)=> {
            console.error(error);
            return Promise.reject(error);
          });
    
        snapshots.forEach((snapshot: DatabaseSnapshot<any>)=> {
          var dbObj = snapshot.val();
          if(dbObj){
            var key = _.keys(snapshot.val())[0];
            var user = <IUser> dbObj[key];
            secondConnections.push(user);
          }
        });
    
        return Promise.resolve(secondConnections);
    }
}