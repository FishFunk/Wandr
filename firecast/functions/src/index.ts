import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
exports.addMessage = functions.https.onCall((data, context) => {

    const A_id = data.userA_id;
    const B_id = data.userB_id;
    const roomkey = `${A_id}_${B_id}`;

    return _createChatRoom(A_id, B_id, roomkey, data)
        .then(()=>{
            return { status: 'chat-created' };
        })
        .catch(error => {
            throw error;
        });
});

async function _createChatRoom(A_id: string, B_id: string, roomkey: string, data: any){
    const snapshot = await admin.database().ref('/chats/' + roomkey).once('value')
        .catch((error)=>{
            throw new functions.https.HttpsError('internal', '', error);
        });

    if(snapshot.val()){
        // Chat already exists
        throw new functions.https.HttpsError('already-exists');
    } else {
        // Create new chat room
        await admin.database().ref('/chats/' + roomkey).set(data)
            .catch((error)=> {
                throw new functions.https.HttpsError('internal', '', error);
            });
        
        await _updateUsersWithRoomkey(A_id, B_id, roomkey)
            .catch(error =>{
                throw new functions.https.HttpsError('internal', '', error);
            })

        return _createAndSendFirstMessage(roomkey);
    }
}

async function _updateUsersWithRoomkey(userA_id, userB_id, roomkey){

    const userIds = [userA_id, userB_id];

    const promises = userIds.map((id)=> {
        return admin.database().ref("/users/").child(id).once("value");
    });

    const snapshots = await Promise.all(promises)
        .catch((error)=> {
            return Promise.reject(error);
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

    return admin.database().ref().update(updates);
}

async function _createAndSendFirstMessage(roomkey){
    const snapshot = await admin.database().ref('/messages/' + roomkey).once('value');
    if(snapshot.val()){
        throw new functions.https.HttpsError('already-exists');
    } else {
        const timestamp = new Date().getTime().toString();

        return admin.database().ref('/messages/' + roomkey).child(timestamp).set({
            uid: 'travel_guru_bot',
            name: 'Travel Guru Bot',
            text: 'Hey you two! Start your conversation here.',
            timestamp: timestamp
        })
        .catch(error =>{
            throw new functions.https.HttpsError('internal', '', error); 
        });
    }
}