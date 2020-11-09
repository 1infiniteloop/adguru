const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const firebase = require("firebase")
const { map } = require('lodash')

var firebaseConfig = {
    apiKey: "AIzaSyCopBiPOLqmdL2NOY3IXZ00zGkRinvKKnM",
    authDomain: "adguru-67745.firebaseapp.com",
    databaseURL: "https://adguru-67745.firebaseio.com",
    projectId: "adguru-67745",
    storageBucket: "adguru-67745.appspot.com",
    messagingSenderId: "375236594422",
    appId: "1:375236594422:web:b7751781095bac6f7afad7"
};

firebase.initializeApp(firebaseConfig);

const app = express();

app.use(cors({ origin: true }))

app.post('/adset', (req, res) => {
    console.log('reqbody')
    console.log(req.body)
    let { ref, data } = req.body
    map(data, adset => firebase.database().ref(`${ref}/${adset.adset_id}${adset.end_date_id}`).set(adset))
    res.send('save adsets')
})

app.post('/report', (req, res) => {
    console.log('reqbody')
    console.log(req.body)
    let { ref, data } = req.body
    firebase.database().ref(`${ref}/${data.id}`).set(data)
    res.send('save report')
})

app.post('/audits', (req, res) => {
    let { ref, data } = req.body
    firebase.database().ref(`${ref}`).set(data)
})

exports.adguru = functions.https.onRequest(app)
