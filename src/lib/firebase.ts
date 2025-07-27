// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi6ajdmiB6l4uPlmR_v5RBewRqiPdxzkk",
  authDomain: "khombolevibes-45594.firebaseapp.com",
  projectId: "khombolevibes-45594",
  storageBucket: "khombolevibes-45594.appspot.com",
  messagingSenderId: "684505984621",
  appId: "1:684505984621:web:930edbadc8c39f4c381964",
  measurementId: "G-JEQX9W6JNW"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
