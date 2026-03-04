import { db } from './firebase';
import { doc, getDoc, setDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * Aggiunge token al profilo utente su Firestore.
 * Crea il documento se non esiste ancora.
 */
export async function addTokens(session, amount) {
  if (!session?.user?.email) return;

  const userRef = doc(db, 'users', session.user.email);

  await setDoc(userRef, {
    email: session.user.email,
    name: session.user.name,
    avatar: session.user.image,
    tokens: increment(amount),
    updatedAt: Date.now(),
  }, { merge: true }); // merge:true = non sovrascrive i campi esistenti
}

/**
 * Legge i token attuali di un utente.
 */
export async function getTokens(session) {
  if (!session?.user?.email) return 0;

  const userRef = doc(db, 'users', session.user.email);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return 0;
  return snap.data().tokens ?? 0;
}

/**
 * Inizializza l'utente su Firestore al primo login.
 * Chiamalo quando session diventa disponibile.
 */
export async function initUser(session) {
  if (!session?.user?.email) return;

  const userRef = doc(db, 'users', session.user.email);
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

/**
 * Legge la top N della leaderboard da Firestore.
 */
export async function getLeaderboard(topN = 10) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('tokens', 'desc'), limit(topN));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, i) => ({
    rank: i + 1,
    email: doc.id,
    name: doc.data().name,
    avatar: doc.data().avatar,
    tokens: doc.data().tokens ?? 0,
  }));
}