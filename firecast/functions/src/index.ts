import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { user } from 'firebase-functions/lib/providers/auth';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


// exports.newUserNotification = 
//     functions.firestore.document('users/{userId}')
//     .onCreate(async event =>{

//         const newUser = event.data();
//         const userId = newUser.app_uid;
//         const userName = newUser.first_name;
//         const userLoc = newUser.location.stringFormat;
//         const friendsToNotify = newUser.friends;

//         const msg = userLoc ? 
//             `${userName} has joined your network in ${userLoc}!` :
//             `${userName} is now in your network!`

//         const payload = {
//             notification: {
//                 title: "You Have a New Connection!",
//                 body: msg
//             }
//         }

//         const db = admin.firestore();

//     });


// exports.newMessageNotification = 
//     functions.firestore.document('messages/{timestamp}')
//     .onCreate(async event =>{
//         const newMessage = event.data();
//     });

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.createChat = functions.https.onCall((chatData, context) => {

    chatData.lastMessage = `Hey ${chatData.userB_name}! Looks like you and ${chatData.userA_name} have a network connection! Why don't you get to know each other?\n\n- Travel Guru Bot`;

    return _createChatRoom(chatData)
        .then(()=>{
            return { status: 'chat-created' };
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