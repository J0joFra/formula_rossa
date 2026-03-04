import { db, signInToFirebase } from './firebase';
import {
  doc, getDoc, setDoc, increment,
  collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';

async function ensureAuth() {
  await signInToFirebase();
}

export async function initUser(session) {
  if (!session?.user?.email) return;
  await ensureAuth();

  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.image,
      tokens: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

export async function addTokens(session, amount) {
  if (!session?.user?.email) return;
  await ensureAuth();

  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    email: session.user.email,
    name: session.user.name,
    avatar: session.user.image,
    tokens: increment(amount),
    updatedAt: Date.now(),
  }, { merge: true });
}

export async function getTokens(session) {
  if (!session?.user?.email) return 0;
  await ensureAuth();

  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return 0;
  return snap.data().tokens ?? 0;
}

export async function getLeaderboard(topN = 10) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('tokens', 'desc'), limit(topN));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, i) => ({
    rank: i + 1,
    email: doc.data().email,
    name: doc.data().name,
    avatar: doc.data().avatar,
    tokens: doc.data().tokens ?? 0,
  }));
}