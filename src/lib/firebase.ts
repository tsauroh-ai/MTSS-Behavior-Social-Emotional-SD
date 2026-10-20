import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration using project mtss-a23e4
export const firebaseConfig = {
  apiKey: "AIzaSyC27yQcOF1QZUL480IufDenSvYOGFbxb_4",
  authDomain: "mtss-a23e4.firebaseapp.com",
  projectId: "mtss-a23e4",
  storageBucket: "mtss-a23e4.firebasestorage.app",
  messagingSenderId: "3549062740",
  appId: "1:3549062740:web:2752a4ba33b56360acefc1",
  measurementId: "G-F0J16NEZCK"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the project's provisioned database ID
export const firestoreDatabaseId = "ai-studio-sistemmtssbehavi-5ae3cefa-bb4f-462e-a4f6-7c229be705f5";
export const db: Firestore = getFirestore(app, firestoreDatabaseId);

// Initialize Analytics conditionally
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional in preview environment
  });
}

// Connection test state
export interface FirebaseConnectionStatus {
  connected: boolean;
  checked: boolean;
  projectId: string;
  databaseId?: string;
  error?: string;
}

let connectionStatus: FirebaseConnectionStatus = {
  connected: false,
  checked: false,
  projectId: firebaseConfig.projectId,
};

export async function testConnection(): Promise<FirebaseConnectionStatus> {
  try {
    // Test read from test/connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    connectionStatus = {
      connected: true,
      checked: true,
      projectId: firebaseConfig.projectId,
    };
  } catch (error: any) {
    // Even if the document doesn't exist, if it reached server without offline error, connection is valid
    if (error && error.code === 'unavailable' || (error?.message && error.message.includes('the client is offline'))) {
      console.warn("Please check your Firebase configuration or network connection:", error);
      connectionStatus = {
        connected: false,
        checked: true,
        projectId: firebaseConfig.projectId,
        error: error.message,
      };
    } else {
      // Permission-denied, not-found, etc. means the connection to the Firebase server succeeded!
      connectionStatus = {
        connected: true,
        checked: true,
        projectId: firebaseConfig.projectId,
      };
    }
  }
  return connectionStatus;
}

// Run initial connection test
if (typeof window !== 'undefined') {
  testConnection();
}

export {
  doc,
  collection,
  getDocs,
  getDocFromServer,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
};
