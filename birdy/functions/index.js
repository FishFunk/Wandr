//import * as functions from 'firebase-functions';
var functions = require('firebase-functions');
var admin = require('firebase-admin');
var express = require('express');
var requestPromise = require('request-promise');
var app = express();
// --------- todo: i think this is only for dev...
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// TODO: disable this, and enable token based authorization logic below.
var authenticate = function (req, res, next) {
    next();
};
app.use(authenticate);
// Expose the API as a function
// this is your root path https://something.com/api/...
exports.api = functions.https.onRequest(app);
// -----------------------------------------
// --- Service name: /getRegions ---
// -----------------------------------------
app.post('/getHolidays', function (req, res) {
    var response = {};
    var countryCode = '';
    holidayApiGetHolidays(countryCode)
        .then(function (resp) {
        console.log(resp);
        response.data = resp;
        response.ErrorMessage = "OK";
        response.ErrorCode = 200;
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    })
        .catch(function (err) {
        response.ErrorMessage = err;
        response.ErrorCode = 200;
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    });
});
function holidayApiGetHolidays(countryCode) {
    return requestPromise({
        method: 'GET',
        uri: 'https://holidayapi.com/v1/holidays?key=50059bac-4ff6-4353-b67a-e99f72b303a4&country=' + countryCode + '&year=2018&pretty',
        json: true
    });
}
// -----------------------------------------
// --- Service name: /getRegions ---
// -----------------------------------------
app.post('/getRegions', function (req, res) {
    var response = {};
    weatherApiGetRegions()
        .then(function (resp) {
        console.log(resp);
        response.data = resp;
        response.ErrorMessage = "OK";
        response.ErrorCode = 200;
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    })
        .catch(function (err) {
        response.ErrorMessage = err;
        response.ErrorCode = 200;
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    });
});
function weatherApiGetRegions() {
    return requestPromise({
        method: 'GET',
        uri: 'http://dataservice.accuweather.com/locations/v1/regions?apikey=eiWAikLyHInkK2oVffGtWBR8lp50hUvM&language=en',
        json: true
    });
}
//# sourceMappingURL=index.js.map