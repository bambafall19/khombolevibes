// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Function to initialize Firebase
function initializeFirebase() {
    // Check if all required environment variables are set
    const requiredVars = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
        console.error(`Firebase initialization failed: Missing environment variables: ${missingVars.join(', ')}`);
        // Return a mock or dummy object to prevent app from crashing when services are called
        return {
            app: null,
            auth: null,
            db: null,
            storage: null,
        };
    }
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return {
        app,
        auth: getAuth(app),
        db: getFirestore(app),
        storage: getStorage(app),
    };
}

const { app, auth, db, storage } = initializeFirebase();

// We check for null before exporting to ensure services are only exported if initialized.
if (!app || !auth || !db || !storage) {
    console.error("Firebase services could not be initialized. The app might not function correctly.");
}

export { app, auth, db, storage };
