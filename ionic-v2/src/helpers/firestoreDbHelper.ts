import { Injectable } from "@angular/core";
import { IUser } from "../models/user";
import _ from 'underscore';
import { AngularFirestore } from "angularfire2/firestore";
import { IChat } from "../models/chat";
import { firestore } from "firebase";
import { Observable } from "rxjs";

@Injectable()
export class FirestoreDbHelper {
    constructor(private angularFirestore: AngularFirestore){

    }

    public UpdateMessages(roomkey: string, messageData: any): Promise<void>{
      return this.angularFirestore.collection('messages').doc(roomkey).update(messageData);
    }

    public UpdateChat(roomkey: string, chatData: any): Promise<void>{
      return this.angularFirestore.collection('chats').doc(roomkey).update(chatData);
    }

    public SendMessage(roomkey: string, messageUpdate: any, chatUpdate: any): Promise<void>{
      // Batch chat and message DB updates
      var batch = this.angularFirestore.firestore.batch();
      batch.update(this.angularFirestore.collection('messages').doc(roomkey).ref, messageUpdate);
      batch.update(this.angularFirestore.collection('chats').doc(roomkey).ref, chatUpdate);

      return batch.commit();
    }

    public CreateNewReport(reportData: any): Promise<firestore.DocumentReference>{
      return this.angularFirestore.collection('reports').add(reportData);
    }

    public GetMessagesObservable(roomkey: string): Observable<{}>{
      return this.angularFirestore.collection('messages').doc(roomkey).valueChanges();
    }

    public async ReadSingleChat(roomeky: string): Promise<IChat>{
      let snapshot = await this.angularFirestore.collection('chats').doc(roomeky).get().toPromise();
      if(snapshot.exists){
        // Chat with roomkey already exists
        return <IChat> snapshot.data();
      } else {
        return null;
      }
    }

    public async ReadUserChats(roomkeys: string[]): Promise<IChat[]>{

      var promises = roomkeys.map((key)=> {
        return this.angularFirestore.collection('chats').doc(key).get().toPromise();
      });
  
      var snapshots = await Promise.all(promises)
        .catch((error)=> {
          return Promise.reject(error);
        });
  
      
      let temp: IChat[] = [];
      snapshots.forEach((snapshot)=> {
        if(snapshot.exists){
          const chatObj = <IChat> snapshot.data();
          temp.push(chatObj);
        }
      });
  
      return _.sortBy(temp, (chat)=> +chat.timestamp * -1);
    }

    public async GetUnreadChatCount(firebaseUserId: string){
      
      const snapshot = await this.angularFirestore.collection('users').doc(firebaseUserId).get().toPromise();
      if(!snapshot.exists){
        // User doesn't exist yet
        return Promise.resolve(0);
      }

      const usr = <IUser> snapshot.data();
      const promises = usr.roomkeys.map((key)=> {
        return this.angularFirestore
          .collection('chats')
          .doc(key)
          .get()
          .toPromise();
      });

      const querySnapshots = await Promise.all(promises).catch((error)=> {
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

    public SetNewUserData(firebaseUserId: string, newUserData: IUser): Promise<void>{
      return this.angularFirestore.collection('users').doc(firebaseUserId).set(newUserData);
    }

    public async ReadUserByFirebaseUid(firebaseUserId: string){
      const snapshot = await this.angularFirestore.collection('users').doc(firebaseUserId).get().toPromise();
      if(!snapshot.exists){
        return Promise.reject("No user matching ID: " + firebaseUserId);
      }

      return <IUser> snapshot.data();
    }

    public async UpdateUser(firebaseUserId: string, updateData: any){
      return this.angularFirestore.collection('users').doc(firebaseUserId).update(updateData);
    }

    public async DeleteUserByFirebaseUid(firebaseUserId){
      
      const userSnapshot = await this.angularFirestore.collection('users').doc(firebaseUserId).get().toPromise();
      const tokenSnapshots = await this.angularFirestore
        .collection('devices', ref=> ref.where('userId', '==', firebaseUserId))
        .get()
        .toPromise();

      // Create batch operation
      var batch = this.angularFirestore.firestore.batch();

      // For each doc, add a delete operation to the batch
      batch.delete(userSnapshot.ref);
      tokenSnapshots.forEach(function(doc) {
          batch.delete(doc.ref);
      });

      // Commit the batch
      await batch.commit();
    }

    public async ReadFirstConnections(firebaseUserId: string){
      let firstConnections: IUser[] = [];

      const snapshot = await this.angularFirestore.collection('users').doc(firebaseUserId).get().toPromise();
      if(!snapshot.exists){
        return Promise.reject("No user matching ID: " + firebaseUserId);
      }

      const user = <IUser> snapshot.data();
      const promises = user.friends.map((friend)=> {
        return this.angularFirestore
          .collection('users', ref=> ref.where('facebook_uid', '==', friend.id))
          .get()
          .toPromise();
      });

      const querySnapshots = await Promise.all(promises).catch((error)=> {
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
  
      _.each(firstConnections, (firstConnectionUser)=>{
        firstConnectionFacebookIds.push(firstConnectionUser.facebook_uid);
        _.each(firstConnectionUser.friends, (secondConnectionFriendObj) => {
          // Exclude current user
          if(secondConnectionFriendObj.id != targetFacebookId){
            secondConnectionFacebookIds.push(secondConnectionFriendObj.id);
          }
        });
      });
  
      // Exclude duplicates
      secondConnectionFacebookIds = _.uniq(secondConnectionFacebookIds);
      secondConnectionFacebookIds = _.difference(secondConnectionFacebookIds, firstConnectionFacebookIds);
  
      // Get 2nd Connections Users from DB by Facebook UID
      const promises = secondConnectionFacebookIds.map((facebook_uid)=> {
        return this.angularFirestore
          .collection('users', ref=> ref.where('facebook_uid', '==', facebook_uid))
          .get()
          .toPromise();
      });
  
      const querySnapshots = await Promise.all(promises).catch((error)=> {
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