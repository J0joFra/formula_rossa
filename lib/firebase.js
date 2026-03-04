import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBp5iqHu2M2q3nek8ikWolM1_74NtZx2Hk",
  authDomain: "formula-rossa-69c87.firebaseapp.com",
  projectId: "formula-rossa-69c87",
  storageBucket: "formula-rossa-69c87.firebasestorage.app",
  messagingSenderId: "425076646144",
  appId: "1:425076646144:web:0e51c30817d0d9659013e5",
  measurementId: "G-3LCZ509YDE"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Nessuna auth necessaria 
export { db };