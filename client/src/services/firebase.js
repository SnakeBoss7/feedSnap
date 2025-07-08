// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {getAuth,GoogleAuthProvider} from 'firebase/auth'
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const api = process.env.REACT_APP_FIREBASE_API;
if(!api)
    {
        console.log("firebase api key not found");
    }
const firebaseConfig = {
  apiKey: api,
  authDomain: "feedsnap-fe7a2.firebaseapp.com",
  projectId: "feedsnap-fe7a2",
  storageBucket: "feedsnap-fe7a2.firebasestorage.app",
  messagingSenderId: "310786462842",
  appId: "1:310786462842:web:c2914a31083acf596417c3",
  measurementId: "G-11T6WV2RCR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();