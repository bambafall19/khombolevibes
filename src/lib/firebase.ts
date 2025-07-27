// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

interface FirebaseServices {
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    storage: FirebaseStorage | null;
}

let services: FirebaseServices | null = null;

// Function to initialize Firebase
function initializeFirebase(): FirebaseServices {
    if (services) {
        return services;
    }

    // Check if all required environment variables are set
    const requiredVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY', 
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
        console.error(`Firebase initialization failed: Missing environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
        services = { app: null, auth: null, db: null, storage: null };
        return services;
    }
    
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    services = {
        app,
        auth: getAuth(app),
        db: getFirestore(app),
        storage: getStorage(app),
    };
    return services;
}

const { app, auth, db, storage } = initializeFirebase();

// We check for null before exporting to ensure services are only exported if initialized.
if (!app || !auth || !db || !storage) {
    console.error("Firebase services could not be initialized. The app might not function correctly. Ensure all NEXT_PUBLIC_FIREBASE_ environment variables are set.");
}

export { app, auth, db, storage };
