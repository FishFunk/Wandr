"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const express = require("express");
const rp = require('request-promise');
const app = express();
const weatherApiKey = 'eiWAikLyHInkK2oVffGtWBR8lp50hUvM';
const holidayApiKey = '50059bac-4ff6-4353-b67a-e99f72b303a4';
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.post('/getHolidays', (req, res) => {
    let response = {};
    let countryCode = '';
    holidayApiGetHolidays(countryCode)
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
        console.error(err);
        response.ErrorMessage = err;
        response.ErrorCode = 200;
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    });
});
function holidayApiGetHolidays(countryCode) {
    return rp({
        method: 'GET',
        uri: `https://holidayapi.com/v1/holidays?key=${holidayApiKey}&country=${countryCode}&year=2018&pretty`,
        json: true
    });
}
app.post('/getRegions', (req, res) => {
    let response = {};
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
        console.error(err);
        response.ErrorMessage = err;
        response.ErrorCode = 200;
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    });
});
function weatherApiGetRegions() {
    return rp({
        method: 'GET',
        uri: `http://dataservice.accuweather.com/locations/v1/regions?apikey=${weatherApiKey}&language=en`,
        json: true
    });
}
exports.birdy = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map