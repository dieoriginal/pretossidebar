import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};

// Initialize Firebase only if not already initialized
let app: FirebaseApp;
const apps = getApps();
if (apps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = apps[0];
}

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app); 