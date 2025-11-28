/**
 * Firebase Client Configuration
 * CityHealth - Healthcare Directory Platform
 * 
 * Migration from Supabase to Firebase
 * Date: November 2025
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
// TODO: Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDo8AhKuuXiH2yC9MhgCZr9TxaouBvEyWU",
  authDomain: "cityhealth-ec7e7.firebaseapp.com",
  projectId: "cityhealth-ec7e7",
  storageBucket: "cityhealth-ec7e7.firebasestorage.app",
  messagingSenderId: "817879071839",
  appId: "1:817879071839:web:cfe80f4a74f3db14bbafea"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create mock instances for offline mode
  app = {} as FirebaseApp;
  db = {} as Firestore;
  auth = {} as Auth;
  storage = {} as FirebaseStorage;
}

export { app, db, auth, storage };
export default app;
