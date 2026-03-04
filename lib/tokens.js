import { db } from './firebase';
import {
  doc, getDoc, setDoc, increment,
  collection, query, orderBy, limit, getDocs
} from 'firebase/firestore';

function todayStr() {
  return new Date().toISOString().split('T')[0]; // "2025-03-04"
}

export async function initUser(session) {
  if (!session?.user?.email) return;
  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.image,
      tokens: 0,
      lastDailyClaim: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

export async function addTokens(session, amount) {
  if (!session?.user?.email) return;
  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  await setDoc(doc(db, 'users', uid), {
    email: session.user.email,
    name: session.user.name,
    avatar: session.user.image,
    tokens: increment(amount),
    updatedAt: Date.now(),
  }, { merge: true });
}

export async function getTokens(session) {
  if (!session?.user?.email) return 0;
  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return 0;
  return snap.data().tokens ?? 0;
}

/**
 * Controlla su Firestore se l'utente ha già riscattato il daily OGGI.
 * Si resetta automaticamente il giorno dopo (la data cambia).
 */
export async function hasDailyClaimed(session) {
  if (!session?.user?.email) return false;
  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return false;
  return snap.data().lastDailyClaim === todayStr();
}

export async function claimDailyBonus(session, amount = 75) {
  if (!session?.user?.email) return false;
  const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  // Blocco server-side 
  if (snap.exists() && snap.data().lastDailyClaim === todayStr()) return false;

  await setDoc(userRef, {
    email: session.user.email,
    name: session.user.name,
    avatar: session.user.image,
    tokens: increment(amount),
    lastDailyClaim: todayStr(),
    updatedAt: Date.now(),
  }, { merge: true });

  return true;
}

export async function getLeaderboard(topN = 10) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('tokens', 'desc'), limit(topN));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d, i) => ({
    rank: i + 1,
    email: d.data().email,
    name: d.data().name,
    avatar: d.data().avatar,
    tokens: d.data().tokens ?? 0,
  }));
}