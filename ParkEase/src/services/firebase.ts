import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_ID',
  appId: 'YOUR_APP_ID',
};

// Check if Firebase configuration is still set to placeholder values
export const isFirebaseMocked = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === 'YOUR_API_KEY' || 
  firebaseConfig.apiKey.includes('placeholder') ||
  firebaseConfig.projectId === 'YOUR_PROJECT_ID';

let app;
let auth: any = null;
let db: any = null;

if (!isFirebaseMocked) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[ParkEase Firebase] Initialized successfully.');
  } catch (error) {
    console.error('[ParkEase Firebase] Initialization failed:', error);
  }
} else {
  console.log('[ParkEase Firebase] Running in Local Mock Simulation mode.');
}

export { auth, db };
export default app;
