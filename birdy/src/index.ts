//import * as functions from 'firebase-functions';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const requestPromise = require('request-promise');



const app = express();

// --------- todo: i think this is only for dev...
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// TODO: disable this, and enable token based authorization logic below.
const authenticate = (req, res, next) => {
  next();
};


app.use(authenticate);

// Expose the API as a function
// this is your root path https://something.com/api/...
exports.api = functions.https.onRequest(app);




// -----------------------------------------
// --- Service name: /getRegions ---
// -----------------------------------------
app.post('/getRegions', (req, res) => {
  
  let response : any = {};
  weatherApiGetRegions()
  .then((resp) => {
    console.log(resp);
    response.data = resp;
    response.ErrorMessage = "OK";
    response.ErrorCode = 200;
    
    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(response);
  })
  .catch((err) => {
    response.ErrorMessage = err;
    response.ErrorCode = 200;
    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.send(response);
  });
});

function weatherApiGetRegions(){
    return requestPromise({
      method: 'GET',
      uri: 'http://dataservice.accuweather.com/locations/v1/regions?apikey=eiWAikLyHInkK2oVffGtWBR8lp50hUvM&language=en',
      json: true
    });
}
 