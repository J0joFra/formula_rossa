import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

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
const auth = getAuth(app);

export async function signInToFirebase() {
  if (auth.currentUser) return; // già autenticato

  try {
    const res = await fetch('/api/firebase-token');
    if (!res.ok) throw new Error('Token API error');
    const { token } = await res.json();
    await signInWithCustomToken(auth, token);
  } catch (error) {
    console.error('Errore login Firebase:', error);
  }
}

export { db, auth };