import firebase from "firebase/app";
import "firebase/storage";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC77ic2-U82LCsTInIx26gCpOdPEuTFn20",
  authDomain: "clicker-6c6a8.firebaseapp.com",
  projectId: "clicker-6c6a8",
  storageBucket: "clicker-6c6a8.appspot.com",
  messagingSenderId: "815911860999",
  appId: "1:815911860999:web:9cfb67f8a5f432429963a2",
  measurementId: "G-06PNWSBEFL",
};

// Initialize Firebase
export const fb = firebase.initializeApp(firebaseConfig);
