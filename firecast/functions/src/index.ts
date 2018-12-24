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

    const userA_id = data.userA_id;
    const userB_id = data.userB_id;
    const roomkey = `${userA_id}_${userB_id}`;

    return _createChatRoom(roomkey, data)
        .then(()=>{
            return { status: 'chat-created' };
        })
        .catch(error => {
            throw error;
        });
});

async function _createChatRoom(roomkey: string, data: any){
    const snapshot = await admin.database().ref('/chats/' + roomkey).once('value')
        .catch((error)=>{
            throw new functions.https.HttpsError('internal', '', error);
        });

    if(snapshot.val()){
        // Chat already exists
        throw new functions.https.HttpsError('already-exists');
    } else {
        // Create new chat room
        return admin.database().ref('/chats/' + roomkey).set(data)
            .catch((error)=> {
                throw new functions.https.HttpsError('internal', '', error);
            });
    }
}