import { Injectable } from "@angular/core";
import { IUser, IMutualConnectionInfo } from "../models/user";
import _ from 'underscore';
import { AngularFirestore } from "angularfire2/firestore";
import { IChat } from "../models/chat";

@Injectable()
export class FirestoreDbHelper {
    constructor(private firestore: AngularFirestore){

    }

    public async GetUnreadChatCount(firebaseUserId: string){
      
      const snapshot = await this.firestore.collection('users').doc(firebaseUserId).get().toPromise();
      if(!snapshot.exists){
        return Promise.reject("No user matching ID: " + firebaseUserId);
      }

      const usr = <IUser> snapshot.data();
      const promises = usr.roomkeys.map((key)=> {
        return this.firestore
          .collection('chats')
          .doc(key)
          .get()
          .toPromise();
      });

      const querySnapshots = await Promise.all(promises).catch((error)=> {
        console.error(error);
        return Promise.reject(error);
      });


      let count = 0;
      querySnapshots.forEach((snapshot)=> {
          if(snapshot.exists){
            let chatObj = <IChat> snapshot.data();
            if(firebaseUserId == chatObj.userA_id){
              if(chatObj.userA_unread) count++;
            }
            else if (firebaseUserId == chatObj.userB_id){
              if(chatObj.userB_unread) count++;
            }
          }
      });

      return count;
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

      const querySnapshots = await Promise.all(promises).catch((error)=> {
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
      let facebookIdToMutualMap: _.Dictionary<IMutualConnectionInfo> = {};
  
      _.each(firstConnections, (user)=>{
        firstConnectionFacebookIds.push(user.facebook_uid);
        _.each(user.friends, (friendObj) => {
          // Exclude current user
          if(friendObj.id != targetFacebookId){
            secondConnectionFacebookIds.push(friendObj.id);
            facebookIdToMutualMap[friendObj.id] = {
              app_uid: user.app_uid,
              facebook_uid: user.facebook_uid,
              first_name: user.first_name,
              last_name: user.last_name,
              profile_img_url: user.profile_img_url
            };
          }
        });
      });
  
      // Exclude duplicates
      secondConnectionFacebookIds = _.uniq(secondConnectionFacebookIds);
      secondConnectionFacebookIds = _.difference(secondConnectionFacebookIds, firstConnectionFacebookIds);
  
      // Get 2nd Connections Users from DB by Facebook UID
      const promises = secondConnectionFacebookIds.map((facebook_uid)=> {
        return this.firestore
          .collection('users', ref=> ref.where('facebook_uid', '==', facebook_uid))
          .get()
          .toPromise();
      });
  
      const querySnapshots = await Promise.all(promises).catch((error)=> {
          console.error(error);
          return Promise.reject(error);
        });
  
      querySnapshots.forEach((querySnapshot)=> {
        let docSnapshots = querySnapshot.docs;        
        docSnapshots.forEach((snapshot)=>{
          if(snapshot.exists){
            let usr = <IUser> snapshot.data();
            usr.mutualConnectionInfo = facebookIdToMutualMap[usr.facebook_uid];
            secondConnections.push(usr);
          }
        });
      });
  
      return Promise.resolve(secondConnections);
    }
}