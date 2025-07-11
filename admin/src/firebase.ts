// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0qTEFcQrQvzc5YmyTA2nkehdd4oHKKIE",
  authDomain: "ciftler-yarisiyor.firebaseapp.com",
  projectId: "ciftler-yarisiyor",
  storageBucket: "ciftler-yarisiyor.appspot.com",
  messagingSenderId: "389789681526",
  appId: "1:389789681526:web:cb4665acf3b2d63dd99c57",
  measurementId: "G-EM9S19B7L8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);