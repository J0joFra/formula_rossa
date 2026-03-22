
import { db } from '@/lib/firebase';
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, getDocs,
  serverTimestamp, increment, arrayUnion,
} from 'firebase/firestore';
import { calculateTotalPoints } from './scoring';

// ─── HELPER ───────────────────────────────────────────────────────────────────

function uid(session) {
  return session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // es. "K7X3QM"
}

// ─── LEGHE ────────────────────────────────────────────────────────────────────

/**
 * Crea una nuova lega. Restituisce il leagueId.
 */
export async function createLeague(session, leagueName) {
  const userId = uid(session);
  const inviteCode = generateInviteCode();

  const leagueRef = await addDoc(collection(db, 'fantaF1Leagues'), {
    name: leagueName,
    createdBy: userId,
    inviteCode,
    createdAt: serverTimestamp(),
    memberCount: 1,
  });

  // Aggiunge il creatore come primo membro
  await setDoc(
    doc(db, 'fantaF1Leagues', leagueRef.id, 'members', userId),
    {
      displayName: session.user.name,
      avatar: session.user.image,
      email: session.user.email,
      fantaScore: 0,
      joinedAt: serverTimestamp(),
    }
  );

  return { leagueId: leagueRef.id, inviteCode };
}

/**
 * Unisciti a una lega tramite codice invito.
 */
export async function joinLeague(session, inviteCode) {
  const userId = uid(session);

  // Cerca la lega con quel codice
  const q = query(
    collection(db, 'fantaF1Leagues'),
    where('inviteCode', '==', inviteCode.toUpperCase())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error('Codice invito non valido.');

  const leagueDoc = snapshot.docs[0];
  const leagueId = leagueDoc.id;

  // Controlla se è già membro
  const memberRef = doc(db, 'fantaF1Leagues', leagueId, 'members', userId);
  const memberSnap = await getDoc(memberRef);
  if (memberSnap.exists()) throw new Error('Sei già in questa lega.');

  // Aggiunge come membro
  await setDoc(memberRef, {
    displayName: session.user.name,
    avatar: session.user.image,
    email: session.user.email,
    fantaScore: 0,
    joinedAt: serverTimestamp(),
  });

  await updateDoc(leagueDoc.ref, { memberCount: increment(1) });

  return { leagueId, leagueName: leagueDoc.data().name };
}

/**
 * Recupera tutte le leghe di un utente.
 */
export async function getUserLeagues(session) {
  const userId = uid(session);
  const leagues = [];

  // Cerca in tutte le leghe dove l'utente è membro
  // (Firestore non supporta collectionGroup queries senza index — usiamo un approccio alternativo)
  const allLeagues = await getDocs(collection(db, 'fantaF1Leagues'));

  for (const leagueDoc of allLeagues.docs) {
    const memberRef = doc(db, 'fantaF1Leagues', leagueDoc.id, 'members', userId);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      leagues.push({
        id: leagueDoc.id,
        ...leagueDoc.data(),
        myScore: memberSnap.data().fantaScore ?? 0,
      });
    }
  }

  return leagues;
}

export async function getLeagueStandings(leagueId) {
  const membersSnap = await getDocs(
    query(
      collection(db, 'fantaF1Leagues', leagueId, 'members'),
      orderBy('fantaScore', 'desc')
    )
  );

  return membersSnap.docs.map((d, i) => ({
    rank: i + 1,
    userId: d.id,
    ...d.data(),
  }));
}

// ─── SCELTA PILOTA (PICK) ─────────────────────────────────────────────────────

export async function submitPick(session, leagueId, raceId, driverNumber) {
  const userId = uid(session);

  // Controlla che la gara non sia già iniziata
  const raceRef = doc(db, 'fantaF1Races', raceId);
  const raceSnap = await getDoc(raceRef);
  if (raceSnap.exists() && raceSnap.data().status === 'completed') {
    throw new Error('Gara già completata, non puoi cambiare il pilota.');
  }
  if (raceSnap.exists() && raceSnap.data().status === 'locked') {
    throw new Error('I pick sono chiusi per questa gara.');
  }

  await setDoc(
    doc(db, 'fantaF1Leagues', leagueId, 'picks', raceId, 'userPicks', userId),
    {
      driverNumber,
      displayName: session.user.name,
      pickedAt: serverTimestamp(),
    }
  );
}

export async function getUserPick(session, leagueId, raceId) {
  const userId = uid(session);
  const snap = await getDoc(
    doc(db, 'fantaF1Leagues', leagueId, 'picks', raceId, 'userPicks', userId)
  );
  return snap.exists() ? snap.data() : null;
}

export async function getAllPicksForRace(leagueId, raceId) {
  const snap = await getDocs(
    collection(db, 'fantaF1Leagues', leagueId, 'picks', raceId, 'userPicks')
  );
  return snap.docs.map(d => ({ userId: d.id, ...d.data() }));
}

// ─── GARE ─────────────────────────────────────────────────────────────────────

export async function upsertRace(raceData) {
  const { id, ...data } = raceData;
  const raceRef = id
    ? doc(db, 'fantaF1Races', id)
    : doc(collection(db, 'fantaF1Races'));

  await setDoc(raceRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return raceRef.id;
}

export async function getSeasonRaces(year) {
  const snap = await getDocs(
    query(
      collection(db, 'fantaF1Races'),
      where('year', '==', year),
      orderBy('date', 'asc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getNextRace() {
  const now = new Date();
  const snap = await getDocs(
    query(
      collection(db, 'fantaF1Races'),
      where('status', '==', 'upcoming'),
      orderBy('date', 'asc')
    )
  );
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ─── CALCOLO E SALVATAGGIO PUNTEGGI ──────────────────────────────────────────

/**
 * FUNZIONE PRINCIPALE — chiamata dall'admin dopo ogni gara.
 *
 * 1. Prende i risultati OpenF1 già processati (buildRaceResults)
 * 2. Prende i bonus/malus manuali inseriti dall'admin
 * 3. Per ogni lega + ogni membro: calcola i punti del pilota scelto
 * 4. Salva tutto su Firestore e aggiorna il punteggio cumulativo
 *
 * @param {string} raceId
 * @param {Map} raceResultsMap - da buildRaceResults() in openf1Client.js
 * @param {object} manualEventsMap - { [driverNumber]: { EPIC_TEAM_RADIO: bool, ... } }
 */
export async function processRaceScores(raceId, raceResultsMap, manualEventsMap = {}) {
  const raceRef = doc(db, 'fantaF1Races', raceId);
  const resultsToSave = {};
  for (const [driverNum, result] of raceResultsMap) {
    resultsToSave[driverNum] = result;
  }
  await updateDoc(raceRef, {
    results: resultsToSave,
    manualEvents: manualEventsMap,
    status: 'completed',
    processedAt: serverTimestamp(),
  });

  const leaguesSnap = await getDocs(collection(db, 'fantaF1Leagues'));

  for (const leagueDoc of leaguesSnap.docs) {
    const leagueId = leagueDoc.id;

    const picksSnap = await getDocs(
      collection(db, 'fantaF1Leagues', leagueId, 'picks', raceId, 'userPicks')
    );

    for (const pickDoc of picksSnap.docs) {
      const userId = pickDoc.id;
      const driverNumber = pickDoc.data().driverNumber;

      const raceResult = raceResultsMap.get(driverNumber);
      if (!raceResult) continue;

      const manualEvents = manualEventsMap[driverNumber] ?? {};
      const score = calculateTotalPoints(raceResult, manualEvents);

      await setDoc(
        doc(db, 'fantaF1Leagues', leagueId, 'scores', `${raceId}_${userId}`),
        {
          userId,
          raceId,
          driverNumber,
          driverName: raceResult.driverName,
          ...score,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, 'fantaF1Leagues', leagueId, 'members', userId),
        { fantaScore: increment(score.total) }
      );
    }
  }
}

// Recupera lo storico dei punteggi di un utente in una lega.
export async function getUserScoreHistory(leagueId, userId) {
  const snap = await getDocs(
    query(
      collection(db, 'fantaF1Leagues', leagueId, 'scores'),
      where('userId', '==', userId),
      orderBy('createdAt', 'asc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}