import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { QuerySnapshot } from '@google-cloud/firestore';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

exports.updateUser = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
    
      console.trace('Start updateUser function.');

      // Get an object representing the document
      const newValue = change.after.data();
      const newLocation = newValue.location.stringFormat;

      // Previous value before this update
      const previousValue = change.before.data();
      const oldLocation = previousValue.location.stringFormat;

      // If location has been modified, trigger notification event
      if(newLocation !== oldLocation){
        const friendsToNotify = _.map(newValue.friends, (friend)=>friend.id);
        const notificationTokens = await _getDeviceTokensFromFacebookIds(friendsToNotify);

        if(!notificationTokens || notificationTokens.length === 0){
            console.info("No device tokens to send notifications to.");
            return Promise.resolve();
        }

        const payload = {
            notification: {
                title: `${newValue.first_name} updated their home town!`,
                body: `Open Wandr and search for ${newLocation}`
            }
        }
        
        return admin.messaging().sendToDevice(notificationTokens, payload);
      }
});

exports.newUserNotification = 
    functions.firestore.document('users/{userId}')
        .onCreate(async event =>{

        const newUser = event.data();
        const userName = newUser.first_name;
        const userLoc = newUser.location.stringFormat;
        const friendsToNotify = _.map(newUser.friends, (friend)=>friend.id);

        console.trace('newUserNotification. \
            (User Name: ' + userName + ') \
            (Location: ' + userLoc );

        const notificationTokens = await _getDeviceTokensFromFacebookIds(friendsToNotify);
        
        if(!notificationTokens || notificationTokens.length === 0){
            console.info("No device tokens to send notifications to.");
            return Promise.resolve();
        }

        const title = userLoc ? 
            `${userName} has joined your network in ${userLoc}!` :
            `${userName} and their friends are now in your network!`

        const payload = {
            notification: {
                title: title,
                body: "Discover new connections on your map."
            }
        }
        
        return admin.messaging().sendToDevice(notificationTokens, payload);
    });


exports.newMessageNotification = 
    functions.firestore.document('messages/{roomkey}')
        .onUpdate(async event =>{

            const messages = event.after.data();
            const timestamps = _.keys(messages);
            const sorted = timestamps.sort();
            const latestMessageKey = _.last(sorted);
            const newMessage = messages[latestMessageKey];
            const idToNotify = newMessage.to_uid;

            return _sendNotificationToId(idToNotify, `New message from ${newMessage.name}!`, newMessage.text);
        });

exports.createChat = functions.https.onCall((chatData, context) => {

    chatData.lastMessage = `Hey ${chatData.userB_name}! Looks like you and ${chatData.userA_name} have a network connection! You can now message each other here!\n\n- Wandr Team`;

    return _createChatRoom(chatData)
        .then(()=>{
            return chatData;
        })
        .catch(error => {
            throw error;
        });
});

async function _createChatRoom(chatData: any){
    const docRef = await admin.firestore().collection('chats').doc(chatData.roomkey).get()
        .catch((error)=>{
            console.error(error);
            throw new functions.https.HttpsError('internal', 'Fetching chats/{roomkey}', error);
        });

    if(docRef.exists){
        // Chat already exists
        throw new functions.https.HttpsError('already-exists');
    } else {
        const batch = admin.firestore().batch();
        // Create new chat room
        
        batch.set(admin.firestore().collection('chats').doc(chatData.roomkey), chatData);
        
        // Give users roomkey
        await _updateUsersWithRoomkey(batch, chatData.userA_id, chatData.userB_id, chatData.roomkey);

        // Send first message in chat
        await _createAndSendFirstMessage(batch, chatData);

        await batch.commit()
            .catch(error=>{
                console.error(error);
                throw new functions.https.HttpsError('internal', 'Batch commit failed', error);
            });

        return _sendNotificationToId(chatData.userB_id, `${chatData.userA_name} connected with you!`, 
            "Continue the conversation here...");
    }
}

async function _updateUsersWithRoomkey(batch: FirebaseFirestore.WriteBatch, userA_id, userB_id, roomkey){

    if(!userA_id || !userB_id || !roomkey){
        console.error("_updateUsersWithRoomkey() - Invalid params");
        throw new functions.https.HttpsError(
            'internal', 
            '_updateUsersWithRoomkey Invalid Params', 
            '_updateUsersWithRoomkey Invalid Params');
    }

    const userA_docRef = await admin.firestore().collection('users').doc(userA_id).get()
        .catch((error)=>{
            console.error(error);
            throw new functions.https.HttpsError(
                'internal', 
                'Fetching user A by ID', 
                'Failed to read user A by ID');
        });

    const userB_docRef = await admin.firestore().collection('users').doc(userB_id).get()
        .catch((error)=>{
            console.error(error);
            throw new functions.https.HttpsError(
                'internal', 
                'Fetching user B by ID', 
                'Failed to read user B by ID');
        });

    if(!userA_docRef.exists){
        console.error("_updateUsersWithRoomkey() - User A doc doesn't exist");
        throw new functions.https.HttpsError(
            'internal', 
            'Fetching user B by ID', 
            'Failed to read user B by ID');
    }

    if(!userB_docRef.exists){
        console.error("_updateUsersWithRoomkey() - User B doc doesn't exist");
        throw new functions.https.HttpsError(
            'internal', 
            'Fetching user B by ID', 
            'Failed to read user B by ID');
    }
        
    const userA = userA_docRef.data();
    const userB = userB_docRef.data();

    userA.roomkeys = userA.roomkeys ? userA.roomkeys.concat([roomkey]) : [roomkey];
    userB.roomkeys = userB.roomkeys ? userB.roomkeys.concat([roomkey]) : [roomkey];

    batch.update(admin.firestore().collection('users').doc(userA_id), { roomkeys: userA.roomkeys});
    batch.update(admin.firestore().collection('users').doc(userB_id), { roomkeys: userB.roomkeys});
}

async function _createAndSendFirstMessage(batch: FirebaseFirestore.WriteBatch, chatData: any){
    const docRef = await admin.firestore().collection('messages').doc(chatData.roomkey).get()
        .catch(error=>{
            console.error(error);
            throw new functions.https.HttpsError('internal', 'Fetching messages/{roomkey}', error);
        });

    if(docRef.exists){
        console.warn("_createAndSendFirstMessage - attempted to create duplicate message");
        throw new functions.https.HttpsError(
            'already-exists', 
            '_createAndSendFirstMessage', 
            '_createAndSendFirstMessage');
    }

    const data = {};
    data[chatData.timestamp] = {
        roomkey: chatData.roomkey,
        to_uid: '',
        from_uid: 'wandr_bot',
        name: 'Wandr Bot',
        text: chatData.lastMessage,
        timestamp: chatData.timestamp
    };
    
    batch.set(admin.firestore().collection('messages').doc(chatData.roomkey), data);    
}

function _collectDataFromSnapshots(querySnapshots: QuerySnapshot[], property: string, traceFunctionName: string){
    const data = [];
    console.trace(`function: _collectDataFromSnapshots,
        trace function: ${traceFunctionName},
        target property: ${property}`);

    querySnapshots.forEach((querySnapshot)=> {
        const docSnapshots = querySnapshot.docs;        
        docSnapshots.forEach((snapshot)=>{
          if(snapshot.exists){
            const doc = snapshot.data();
            data.push(doc[property]);
          } else {
            console.trace(traceFunctionName + ': snapshot does not exist');
          }
        });
    });

    return data;
}

async function _sendNotificationToId(idToNotify: string, notificationTitle: string, notificationText: string): Promise<any>{
    console.trace(`New message notification to ID: ${idToNotify}`);

    // Check if user has notifications enabled
    let data: any;
    const querySnapshot = 
        await admin.firestore()
            .collection('users').where('app_uid', '==', idToNotify).select('settings').get();

    querySnapshot.forEach(result =>{
        data = result.data();
    });

    if(data.settings && data.settings.notifications){
        const payload = {
            notification: {
                title: notificationTitle,
                body: notificationText
            }
        };

        const devicesRef = await admin.firestore().collection('devices').where('userId', '==', idToNotify).get();
        const tokens = [];
        devicesRef.forEach(result =>{
            const token = result.data().token;
            tokens.push(token);
        });

        console.trace(`Notification tokens: ${JSON.stringify(tokens)}`);

        if(tokens.length > 0){
            return admin.messaging().sendToDevice(tokens, payload);
        } else {
            console.info("No notification tokens");
            return Promise.resolve();
        }

    } else {
        console.info("User disabled notification settings");
        return Promise.resolve();
    }
}

async function _getDeviceTokensFromFacebookIds(facebookIds: string[]): Promise<string[]>
{
    const db = admin.firestore();
        console.trace("Start method _getDeviceTokensFromFacebookIds");

        if(!facebookIds || facebookIds.length === 0){
            console.trace("No Facebook IDs. Terminating method.");
            return Promise.resolve([]);
        }

        console.trace(`Facebook IDs to notify: ${JSON.stringify(facebookIds)}`);

        // Get user IDs to be notified
        const userPromises = 
            facebookIds.map((facebookId)=>{
                return db.collection('users')
                    .select('app_uid')
                    .where('facebook_uid', '==', facebookId)
                    .where('settings.notifications', '==', true)
                    .get();
            });

        let querySnapshots = await Promise.all(userPromises).catch((error)=> {
            console.error('_getDeviceTokensFromFacebookIds - userPromises', error);
            return Promise.reject(error);
        });

        const appIdsToNotify = _collectDataFromSnapshots(
            querySnapshots, 'app_uid', '_getDeviceTokensFromFacebookIds - query user IDs');

        if(!appIdsToNotify || appIdsToNotify.length === 0){
            console.info("Query found no user IDs to send notifications to.");
            return Promise.resolve([]);
        }

        console.trace(`App IDs to notify ${JSON.stringify(appIdsToNotify)}`);

        // Get device tokens
        const tokenPromises = appIdsToNotify.map((userId)=>{
            return admin.firestore()
                .collection('devices')
                .where('userId', '==', userId)
                .get();
        });

        querySnapshots = await Promise.all(tokenPromises).catch((error)=>{
            console.error('_getDeviceTokensFromFacebookIds - tokenPromises', error);
            return Promise.reject(error);
        });

        const notificationTokens = _collectDataFromSnapshots(
            querySnapshots, 'token', '_getDeviceTokensFromFacebookIds - query tokens');
        
        console.trace(`Notification tokens: ${JSON.stringify(notificationTokens)}`);    

        return notificationTokens;
}