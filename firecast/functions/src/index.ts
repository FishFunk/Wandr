import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.createChat = functions.https.onCall((chatData, context) => {

    chatData.lastMessage = `Hey ${chatData.userB_name}! Looks like you and ${chatData.userA_name} have a network connection! Why don't you get to know eachother?`;
    
    return _createChatRoom(chatData)
        .then(()=>{
            return { status: 'chat-created' };
        })
        .catch(error => {
            throw error;
        });
});

async function _createChatRoom(chatData: any){
    const snapshot = await admin.database().ref('/chats/' + chatData.roomkey).once('value')
        .catch((error)=>{
            throw new functions.https.HttpsError('internal', 'Fetching chats/{roomkey}', error);
        });

    if(snapshot.val()){
        // Chat already exists
        throw new functions.https.HttpsError('already-exists');
    } else {
        // Create new chat room
        await admin.database().ref('/chats/' + chatData.roomkey).set(chatData)
            .catch((error)=> {
                throw new functions.https.HttpsError('internal', 'Setting chats/{roomkey}', error);
            });
        
        // Give users roomkey
        await _updateUsersWithRoomkey(chatData.userA_id, chatData.userB_id, chatData.roomkey)
            .catch(error =>{
                throw new functions.https.HttpsError('internal', 'Assigning roomkey to users', error);
            })

        // Send first message in chat
        return _createAndSendFirstMessage(chatData);
    }
}

async function _updateUsersWithRoomkey(userA_id, userB_id, roomkey){

    const userIds = [userA_id, userB_id];

    const promises = userIds.map((id)=> {
        return admin.database().ref("/users/").child(id).once("value");
    });

    const snapshots = await Promise.all(promises)
        .catch((error)=> {
            throw new functions.https.HttpsError('internal', 'Fetching users by ID', error);
        });

    let updates = {};
    snapshots.forEach(snap=>{
        let user = snap.val();
        if(user.roomkeys){
            user.roomkeys.push(roomkey);
        } else {
            user.roomkeys = [roomkey];
        }

        updates['/users/' + user.app_uid] = user;
    });

    return admin.database().ref().update(updates)
        .catch(error =>{
            throw new functions.https.HttpsError('internal', 'Updating user roomkeys', error);
        });
}

async function _createAndSendFirstMessage(chatData: any){
    const snapshot = await admin.database().ref('/messages/' + chatData.roomkey).once('value');
    if(snapshot.val()){
        throw new functions.https.HttpsError('already-exists');
    } else {
        return admin.database().ref('/messages/' + chatData.roomkey).child(chatData.timestamp).set({
            uid: 'travel_guru_bot',
            name: 'Travel Guru Bot',
            text: chatData.lastMessage,
            timestamp: chatData.timestamp
        })
        .catch(error =>{
            throw new functions.https.HttpsError('internal', 'Setting messages/{roomkey}/{timestamp}', error); 
        });
    }
}