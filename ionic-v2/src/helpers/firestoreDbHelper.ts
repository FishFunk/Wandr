import { Injectable } from "@angular/core";
import { IUser } from "../models/user";
import _ from 'underscore';
import { AngularFirestore } from "angularfire2/firestore";

@Injectable()
export class FirestoreDbHelper {
    constructor(private firestore: AngularFirestore){

    }

    public async ReadUserByFirebaseUid(firebaseUserId: string){
      const snapshot = await this.firestore.collection('users').doc(firebaseUserId).get().toPromise();
      if(!snapshot.exists){
        return Promise.reject("No user matching ID: " + firebaseUserId);
      }

      return <IUser> snapshot.data();
    }

    public async ReadFirstConnections(firebaseUserId: string){
      let firstConnections: IUser[] = [];

      const snapshot = await this.firestore.collection('users').doc(firebaseUserId).get().toPromise();
      if(!snapshot.exists){
        return Promise.reject("No user matching ID: " + firebaseUserId);
      }

      const user = <IUser> snapshot.data();
      const promises = user.friends.map((friend)=> {
        return this.firestore
          .collection('users', ref=> ref.where('facebook_uid', '==', friend.id))
          .get()
          .toPromise();
      });

      var querySnapshots = await Promise.all(promises).catch((error)=> {
          console.error(error);
          return Promise.reject(error);
      });
      
      querySnapshots.forEach((querySnapshot)=> {
        let docSnapshots = querySnapshot.docs;        
        docSnapshots.forEach((snapshot)=>{
          if(snapshot.exists){
            let usr = <IUser> snapshot.data();
            firstConnections.push(usr);
          }
        });
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
        return this.firestore
          .collection('users', ref=> ref.where('facebook_uid', '==', facebook_uid))
          .get()
          .toPromise();
      });
  
      var querySnapshots = await Promise.all(promises).catch((error)=> {
          console.error(error);
          return Promise.reject(error);
        });
  
      querySnapshots.forEach((querySnapshot)=> {
        let docSnapshots = querySnapshot.docs;        
        docSnapshots.forEach((snapshot)=>{
          if(snapshot.exists){
            let usr = <IUser> snapshot.data();
            secondConnections.push(usr);
          }
        });
      });
  
      return Promise.resolve(secondConnections);
    }
}