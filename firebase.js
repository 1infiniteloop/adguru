require("@firebase/firestore");
import firebase from "firebase";

var firebaseConfig = {
    apiKey: "AIzaSyCopBiPOLqmdL2NOY3IXZ00zGkRinvKKnM",
    authDomain: "adguru-67745.firebaseapp.com",
    databaseURL: "https://adguru-67745.firebaseio.com",
    projectId: "adguru-67745",
    storageBucket: "adguru-67745.appspot.com",
    messagingSenderId: "375236594422",
    appId: "1:375236594422:web:b7751781095bac6f7afad7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

export const database = firebase
export const auth = firebase.auth()
export const firestore = firebase.firestore
export const base = firebase.database()
export default db;
