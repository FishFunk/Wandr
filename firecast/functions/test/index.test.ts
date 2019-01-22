declare var require: any;

const test = require('firebase-functions-test')({
    database_url: "https://wanderlust-app-220020.firebaseio.com",
    storage_bucket: "wanderlust-app-220020.appspot.com",
    project_id: "wanderlust-app-220020"
}, './wanderlust-app-220020-8b6593aa5400.json');

const myFunctions = require('../src/index');


// Make new user snapshot
const newUserSnap = test.firestore.makeDocumentSnapshot({
    app_uid: '1',
    facebook_uid: 'A',
    first_name: 'Testy',
    last_name: 'McTesterson',
    location: {
        stringFormat: 'Washington, DC'
    },
    friends: [{
        name: "Johnny Appleseed",
        id: "B"
    }]
}, 'users/1');

// Add token data
test.firestore.makeDocumentSnapshot({
    token: "test_token",
    userId: "2"
}, 'devices/test')

// Add existing user to be notified
test.firestore.makeDocumentSnapshot({
    app_uid: '2',
    facebook_uid: 'B',
    first_name: 'Chris',
    last_name: 'Henry',
    location: {
        stringFormat: 'Washington, DC'
    },
    friends: []
}, 'users/2')

// Call wrapped function with the new user snapshot
const wrapped = test.wrap(myFunctions.newUserNotification);
wrapped(newUserSnap);

test.cleanup();