import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { QuerySnapshot } from '@google-cloud/firestore';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


// TODO: Need to test this function
exports.newUserNotification = 
    functions.firestore.document('users/{userId}')
    .onCreate(async event =>{

        const newUser = event.data();
        const userName = newUser.first_name;
        const userLoc = newUser.location.stringFormat;
        const friendsToNotify = _.map(newUser.friends, (friend)=>friend.id);

        console.trace('newUserNotification. \
            (User Name: ' + userName + ') \
            (Location: ' + userLoc + ') \
            (Friends:' + JSON.stringify(friendsToNotify));

        if(!friendsToNotify || friendsToNotify.length === 0){
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

        const db = admin.firestore();

        // Get user IDs to be notified
        const userPromises = 
            friendsToNotify.map((friendFacebookId)=>{
                return db.collection('users')
                    .select('app_uid')
                    .where('facebook_uid', '==', friendFacebookId)
                    .get();
            });
        
        let querySnapshots = await Promise.all(userPromises).catch((error)=> {
            console.error('newUserNotification - userPromises', error);
            return Promise.reject(error);
        });

        const appIdsToNotify = _collectDataFromSnapshots(
            querySnapshots, 'app_uid', 'newUserNotification - query user IDs');
        console.trace('UIDs to be notified: ' + JSON.stringify(appIdsToNotify));


        // Get device tokens
        const tokenPromises = appIdsToNotify.map((userId)=>{
            return admin.firestore()
                .collection('devices')
                .where('userId', '==', userId)
                .get();
        });

        querySnapshots = await Promise.all(tokenPromises).catch((error)=>{
            console.error('newUserNotification - tokenPromises', error);
            return Promise.reject(error);
        });

        const notificationTokens = _collectDataFromSnapshots(
            querySnapshots, 'token', 'newUserNotification - query tokens');
        console.trace('Notification tokens: ' + JSON.stringify(notificationTokens));

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

        const payload = {
            notification: {
                title: `New message from ${newMessage.name}!`,
                body: newMessage.text
            }
        };

        const idToNotify = newMessage.to_uid;
        const devicesRef = await admin.firestore().collection('devices').where('userId', '==', idToNotify).get();
        const tokens = [];
        devicesRef.forEach(result =>{
            const token = result.data().token;
            tokens.push(token);
        });

        return admin.messaging().sendToDevice(tokens, payload);
    });

exports.createChat = functions.https.onCall((chatData, context) => {

    chatData.lastMessage = `Hey ${chatData.userB_name}! Looks like you and ${chatData.userA_name} have a network connection! You can now message each other here!\n\n- Travel Guru Bot`;

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
        // Create new chat room
        await admin.firestore().collection('chats').doc(chatData.roomkey).set(chatData)
            .catch((error)=> {
                console.error(error);
                throw new functions.https.HttpsError('internal', 'Setting chats/{roomkey}', error);
            });
        
        // Give users roomkey
        await _updateUsersWithRoomkey(chatData.userA_id, chatData.userB_id, chatData.roomkey);

        // Send first message in chat
        return _createAndSendFirstMessage(chatData);
    }
}

async function _updateUsersWithRoomkey(userA_id, userB_id, roomkey){

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

    await admin.firestore().collection('users').doc(userA_id).update({
            roomkeys: userA.roomkeys
        })
        .catch(error=>{
            console.error(error);
            throw new functions.https.HttpsError('internal', 'Updating user A roomkeys', error);
        });

    await admin.firestore().collection('users').doc(userB_id).update({
            roomkeys: userB.roomkeys
        })
        .catch(error=>{
            console.error(error);
            throw new functions.https.HttpsError('internal', 'Updating user B roomkeys', error);
        });
}

async function _createAndSendFirstMessage(chatData: any){
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
        from_uid: 'travel_guru_bot',
        name: 'Travel Guru Bot',
        text: chatData.lastMessage,
        timestamp: chatData.timestamp
    };
    
    return admin.firestore()
        .collection('messages')
        .doc(chatData.roomkey)
        .set(data)
        .catch(error=>{
            console.error(error);
            throw new functions.https.HttpsError(
                'internal', 
                'Setting messages/{roomkey}/{timestamp}', 
                error); 
        });
    
}

function _collectDataFromSnapshots(querySnapshots: QuerySnapshot[], property: string, traceFunctionName: string){
    const data = [];
    querySnapshots.forEach((querySnapshot)=> {
        const docSnapshots = querySnapshot.docs;        
        docSnapshots.forEach((snapshot)=>{
          if(snapshot.exists){
            const doc = snapshot.data();
            console.trace(traceFunctionName + ': ' + JSON.stringify(doc));
            console.trace(traceFunctionName + ': ' + doc[property]);
            data.push(doc[property]);
          } else {
            console.trace(traceFunctionName + ': snapshot does not exist');
          }
        });
    });

    return data;
}