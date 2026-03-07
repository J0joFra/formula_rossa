/**
 * lib/fantaF1.js
 * Logica Firebase per il sistema FantaF1 — predizioni pre-gara
 */

import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, orderBy, limit,
  getDocs, serverTimestamp, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { addTokens } from './tokens';

// ─── CALENDARIO 2026 ─────────────────────────────────────────────────────────
// Fonte: calendario ufficiale aggiornato
export const FANTA_CALENDAR = [
  { round: 1,  raceId: '2026-R01', name: 'Australian GP',      circuitId: 'albert-park',      date: '2026-03-08', lockDate: '2026-03-07' },
  { round: 2,  raceId: '2026-R02', name: 'Chinese GP',         circuitId: 'shanghai',          date: '2026-03-15', lockDate: '2026-03-14' },
  { round: 3,  raceId: '2026-R03', name: 'Japanese GP',        circuitId: 'suzuka',            date: '2026-03-29', lockDate: '2026-03-28' },
  { round: 4,  raceId: '2026-R04', name: 'Bahrain GP',         circuitId: 'bahrain',           date: '2026-04-12', lockDate: '2026-04-11' },
  { round: 5,  raceId: '2026-R05', name: 'Saudi Arabia GP',    circuitId: 'jeddah',            date: '2026-04-19', lockDate: '2026-04-18' },
  { round: 6,  raceId: '2026-R06', name: 'Miami GP',           circuitId: 'miami',             date: '2026-05-03', lockDate: '2026-05-02' },
  { round: 7,  raceId: '2026-R07', name: 'Canadian GP',        circuitId: 'villeneuve',        date: '2026-05-24', lockDate: '2026-05-23' },
  { round: 8,  raceId: '2026-R08', name: 'Monaco GP',          circuitId: 'monte-carlo',       date: '2026-06-07', lockDate: '2026-06-06' },
  { round: 9,  raceId: '2026-R09', name: 'Spanish GP',         circuitId: 'barcelona',         date: '2026-06-14', lockDate: '2026-06-13' },
  { round: 10, raceId: '2026-R10', name: 'Austrian GP',        circuitId: 'red-bull-ring',     date: '2026-06-28', lockDate: '2026-06-27' },
  { round: 11, raceId: '2026-R11', name: 'British GP',         circuitId: 'silverstone',       date: '2026-07-05', lockDate: '2026-07-04' },
  { round: 12, raceId: '2026-R12', name: 'Belgian GP',         circuitId: 'spa-francorchamps', date: '2026-07-19', lockDate: '2026-07-18' },
  { round: 13, raceId: '2026-R13', name: 'Hungarian GP',       circuitId: 'hungaroring',       date: '2026-07-26', lockDate: '2026-07-25' },
  { round: 14, raceId: '2026-R14', name: 'Dutch GP',           circuitId: 'zandvoort',         date: '2026-08-23', lockDate: '2026-08-22' },
  { round: 15, raceId: '2026-R15', name: 'Italian GP',         circuitId: 'monza',             date: '2026-09-06', lockDate: '2026-09-05' },
  { round: 16, raceId: '2026-R16', name: 'Madrid GP',          circuitId: 'ifema-madrid',      date: '2026-09-13', lockDate: '2026-09-12' },
  { round: 17, raceId: '2026-R17', name: 'Azerbaijan GP',      circuitId: 'baku',              date: '2026-09-26', lockDate: '2026-09-25' },
  { round: 18, raceId: '2026-R18', name: 'Singapore GP',       circuitId: 'marina-bay',        date: '2026-10-11', lockDate: '2026-10-10' },
  { round: 19, raceId: '2026-R19', name: 'US GP',              circuitId: 'austin',            date: '2026-10-25', lockDate: '2026-10-24' },
  { round: 20, raceId: '2026-R20', name: 'Mexico City GP',     circuitId: 'rodriguez',         date: '2026-11-01', lockDate: '2026-10-31' },
  { round: 21, raceId: '2026-R21', name: 'Brazilian GP',       circuitId: 'interlagos',        date: '2026-11-08', lockDate: '2026-11-07' },
  { round: 22, raceId: '2026-R22', name: 'Las Vegas GP',       circuitId: 'las-vegas',         date: '2026-11-21', lockDate: '2026-11-20' },
  { round: 23, raceId: '2026-R23', name: 'Qatar GP',           circuitId: 'lusail',            date: '2026-11-29', lockDate: '2026-11-28' },
  { round: 24, raceId: '2026-R24', name: 'Abu Dhabi GP',       circuitId: 'yas-marina',        date: '2026-12-06', lockDate: '2026-12-05' },
];

// ─── GRIGLIA PILOTI 2026 ──────────────────────────────────────────────────────
export const DRIVERS_2026 = [
  { id: 'charles-leclerc',    name: 'Leclerc',     team: 'Ferrari',       color: '#DC0000' },
  { id: 'lewis-hamilton',     name: 'Hamilton',    team: 'Ferrari',       color: '#DC0000' },
  { id: 'max-verstappen',     name: 'Verstappen',  team: 'Red Bull',      color: '#3671C6' },
  { id: 'isack-hadjar',       name: 'Hadjar',      team: 'Red Bull',      color: '#3671C6' },
  { id: 'george-russell',     name: 'Russell',     team: 'Mercedes',      color: '#27F4D2' },
  { id: 'kimi-antonelli',     name: 'Antonelli',   team: 'Mercedes',      color: '#27F4D2' },
  { id: 'lando-norris',       name: 'Norris',      team: 'McLaren',       color: '#FF8000' },
  { id: 'oscar-piastri',      name: 'Piastri',     team: 'McLaren',       color: '#FF8000' },
  { id: 'fernando-alonso',    name: 'Alonso',      team: 'Aston Martin',  color: '#358C75' },
  { id: 'lance-stroll',       name: 'Stroll',      team: 'Aston Martin',  color: '#358C75' },
  { id: 'pierre-gasly',       name: 'Gasly',       team: 'Alpine',        color: '#FF87BC' },
  { id: 'franco-colapinto',   name: 'Colapinto',   team: 'Alpine',        color: '#FF87BC' },
  { id: 'carlos-sainz-jr',    name: 'Sainz',       team: 'Williams',      color: '#64C4FF' },
  { id: 'alexander-albon',    name: 'Albon',       team: 'Williams',      color: '#64C4FF' },
  { id: 'nico-hulkenberg',    name: 'Hülkenberg',  team: 'Audi',          color: '#A8A8A8' },
  { id: 'gabriel-bortoleto',  name: 'Bortoleto',   team: 'Audi',          color: '#A8A8A8' },
  { id: 'esteban-ocon',       name: 'Ocon',        team: 'Haas',          color: '#B6BABD' },
  { id: 'oliver-bearman',     name: 'Bearman',     team: 'Haas',          color: '#B6BABD' },
  { id: 'liam-lawson',        name: 'Lawson',      team: 'Racing Bulls',  color: '#6692FF' },
  { id: 'arvid-lindblad',     name: 'Lindblad',    team: 'Racing Bulls',  color: '#6692FF' },
  { id: 'sergio-perez',       name: 'Pérez',       team: 'Cadillac',      color: '#FFFFFF' },
  { id: 'valtteri-bottas',    name: 'Bottas',      team: 'Cadillac',      color: '#FFFFFF' },
];

// ─── SISTEMA PUNTI ────────────────────────────────────────────────────────────
export const POINTS = {
  // Griglia principale
  exactPosition:       100,  // Posizione esatta
  podiumWrong:          25,  // Nel podio ma posizione sbagliata
  top10Wrong:           17,  // In top 10 ma posizione sbagliata
  // Zona coda (pos 11-22)
  lastTailExact:        20,  // Posizione esatta nella zona coda
  lastTailZone:         10,  // Pilota nella zona coda ma pos sbagliata
  // Bonus gara
  fastestLapExact:      15,  // Giro veloce esatto
  safetyCarCorrect:      5,  // Safety car (sì/no) corretta
  polePositionExact:    10,  // Pole position esatta
  dnfCorrect:            8,  // DNF previsto correttamente (per pilota)
  teamDoublePodium:     12,  // Doppietta team sul podio
  winningConstructor:    5,  // Costruttore con il vincitore (1° posto)
};

// ─── GARA CORRENTE / PROSSIMA ─────────────────────────────────────────────────
export function getCurrentRace() {
  const now = new Date();
  const next = FANTA_CALENDAR.find(r => new Date(r.date) >= now);
  return next ?? FANTA_CALENDAR[FANTA_CALENDAR.length - 1];
}

export function isRaceLocked(race) {
  if (!race) return true;
  const lockDateTime = new Date(race.lockDate + 'T15:00:00');
  return new Date() >= lockDateTime;
}

// ─── SALVA PREDIZIONE ─────────────────────────────────────────────────────────
export async function savePrediction(session, raceId, prediction) {
  if (!session?.user?.email) throw new Error('Login richiesto');

  const race = FANTA_CALENDAR.find(r => r.raceId === raceId);
  if (!race) throw new Error('Gara non trovata');
  if (isRaceLocked(race)) throw new Error('Predizioni chiuse per questa gara');

  const docId = `${session.user.email}_${raceId}`;
  
  if (!prediction.fullGrid || !Array.isArray(prediction.fullGrid)) {
    throw new Error('Dati predizione non validi');
  }

  await setDoc(doc(db, 'fantaPredictions', docId), {
    userId:      session.user.email,
    userName:    session.user.name || session.user.email.split('@')[0],
    userAvatar:  session.user.image || null,
    raceId,
    raceName:    race.name,
    submittedAt: serverTimestamp(),
    locked:      false,
    fullGrid:    prediction.fullGrid,
    lastTail:    prediction.lastTail || prediction.lastFive || [],  // Ultimi 12 ordinati
    bonuses:     prediction.bonuses || { fastestLap: null, safetyCar: null },
  });
  return true;
}

// ─── CARICA PREDIZIONE UTENTE ─────────────────────────────────────────────────
export async function getUserPrediction(session, raceId) {
  if (!session?.user?.email) return null;
  const docId = `${session.user.email}_${raceId}`;
  const snap = await getDoc(doc(db, 'fantaPredictions', docId));
  return snap.exists() ? snap.data() : null;
}

// ─── CARICA RISULTATO UFFICIALE ───────────────────────────────────────────────
export async function getRaceResult(raceId) {
  const snap = await getDoc(doc(db, 'fantaResults', raceId));
  return snap.exists() ? snap.data() : null;
}

// ─── CALCOLA PUNTEGGIO ────────────────────────────────────────────────────────
// 22 piloti · griglia principale 1-22 · zona coda 11-22
export function calculateScore(prediction, result) {
  if (!prediction || !result) return null;

  let pts = 0;
  const breakdown = {
    posizioniEsatte:    0,  // Posizione esatta nella griglia
    podioPartial:       0,  // Sul podio, pos sbagliata
    top10Partial:       0,  // In top 10, pos sbagliata
    codaEsatte:         0,  // Pos esatta nella zona coda (11-22)
    codaZona:           0,  // In zona coda (11-22), pos sbagliata
    polePosition:       0,  // Pole position esatta
    giroVeloce:         0,  // Giro veloce esatto
    safetyCar:          0,  // Safety car corretta
    dnfCorretti:        0,  // DNF previsto correttamente
    costruttoreVincitore: 0, // Costruttore vincitore
    doppiettaTeam:      0,  // Doppietta team sul podio
  };

  const realGrid   = result.fullGrid   || [];
  const predGrid   = prediction.fullGrid || [];
  const TAIL_START = 11; // Da questa posizione in poi = zona coda

  // ── Griglia principale ──
  predGrid.forEach(({ pos, driverId }) => {
    const realEntry = realGrid.find(r => r.driverId === driverId);
    if (!realEntry) return;

    if (realEntry.pos === pos) {
      pts += POINTS.exactPosition;
      breakdown.posizioniEsatte += POINTS.exactPosition;
    } else if (pos <= 3 && realEntry.pos <= 3) {
      pts += POINTS.podiumWrong;
      breakdown.podioPartial += POINTS.podiumWrong;
    } else if (pos <= 10 && realEntry.pos <= 10) {
      pts += POINTS.top10Wrong;
      breakdown.top10Partial += POINTS.top10Wrong;
    }
  });

  // ── Zona coda (ultimi 12 — pos 11-22) ──
  // lastTail è la predizione ordinata dell'utente per le posizioni 11-22
  const lastTail = prediction.lastTail || prediction.lastFive || [];
  lastTail.forEach(({ pos, driverId }) => {
    const realEntry = realGrid.find(r => r.driverId === driverId);
    if (!realEntry) return;
    const realInTail = realEntry.pos >= TAIL_START;
    if (!realInTail) return;
    if (realEntry.pos === pos) {
      pts += POINTS.lastTailExact;
      breakdown.codaEsatte += POINTS.lastTailExact;
    } else {
      pts += POINTS.lastTailZone;
      breakdown.codaZona += POINTS.lastTailZone;
    }
  });

  const predBonuses   = prediction.bonuses   || {};
  const resultBonuses = result.bonuses       || {};

  // ── Pole position ──
  if (predBonuses.polePosition && predBonuses.polePosition === resultBonuses.polePosition) {
    pts += POINTS.polePositionExact;
    breakdown.polePosition += POINTS.polePositionExact;
  }

  // ── Giro veloce ──
  if (predBonuses.fastestLap && predBonuses.fastestLap === resultBonuses.fastestLap) {
    pts += POINTS.fastestLapExact;
    breakdown.giroVeloce += POINTS.fastestLapExact;
  }

  // ── Safety car ──
  if (predBonuses.safetyCar !== undefined &&
      predBonuses.safetyCar === resultBonuses.safetyCar) {
    pts += POINTS.safetyCarCorrect;
    breakdown.safetyCar += POINTS.safetyCarCorrect;
  }

  // ── DNF corretti ──
  // L'utente predice chi ritira (array di driverId)
  const predDNFs   = predBonuses.dnfDrivers   || [];
  const resultDNFs = resultBonuses.dnfDrivers || [];
  predDNFs.forEach(driverId => {
    if (resultDNFs.includes(driverId)) {
      pts += POINTS.dnfCorrect;
      breakdown.dnfCorretti += POINTS.dnfCorrect;
    }
  });

  // ── Doppietta team sul podio ──
  const predTeamDouble   = predBonuses.teamDoublePodium;
  const resultTeamDouble = resultBonuses.teamDoublePodium;
  if (predTeamDouble && predTeamDouble === resultTeamDouble) {
    pts += POINTS.teamDoublePodium;
    breakdown.doppiettaTeam += POINTS.teamDoublePodium;
  }

  // ── Costruttore vincitore ──
  if (predBonuses.winningConstructor &&
      predBonuses.winningConstructor === resultBonuses.winningConstructor) {
    pts += POINTS.winningConstructor;
    breakdown.costruttoreVincitore += POINTS.winningConstructor;
  }

  return { total: pts, breakdown };
}

// ─── SALVA PUNTEGGIO (NON USARE DAL CLIENT) ───────────────────────────────────
export async function saveScore(userId, raceId, score) {
  const docId = `${userId}_${raceId}`;
  await setDoc(doc(db, 'fantaScores', docId), {
    userId, raceId,
    points:    score.total,
    breakdown: score.breakdown,
    scoredAt:  serverTimestamp(),
  });

  const lbRef = doc(db, 'fantaLeaderboard', userId);
  const lbSnap = await getDoc(lbRef);
  if (lbSnap.exists()) {
    const prev = lbSnap.data();
    await updateDoc(lbRef, {
      totalPoints:  (prev.totalPoints || 0) + score.total,
      racesPlayed:  (prev.racesPlayed || 0) + 1,
      bestScore:    Math.max(prev.bestScore || 0, score.total),
    });
  } else {
    const userPred = await getDoc(doc(db, 'fantaPredictions', `${userId}_${raceId}`));
    const userData = userPred.data();
    await setDoc(lbRef, {
      userId,
      name:        userData?.userName || userId,
      avatar:      userData?.userAvatar || null,
      totalPoints: score.total,
      racesPlayed: 1,
      bestScore:   score.total,
    });
  }
}

// ─── LEADERBOARD STAGIONALE ───────────────────────────────────────────────────
export async function getFantaLeaderboard(n = 10) {
  try {
    const q = query(
      collection(db, 'fantaLeaderboard'),
      orderBy('totalPoints', 'desc'),
      limit(n)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ 
      rank: i + 1, 
      ...d.data() 
    }));
  } catch (error) {
    console.error('Errore nel caricamento leaderboard:', error);
    return []; // Ritorna array vuoto in caso di errore
  }
}

// ─── QUANTE PREDIZIONI HA FATTO UN UTENTE ─────────────────────────────────────
export async function getUserStats(userId) {
  try {
    const q = query(
      collection(db, 'fantaScores'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const scores = snap.docs.map(d => d.data());
    return {
      racesPlayed: scores.length,
      totalPoints: scores.reduce((s, r) => s + (r.points || 0), 0),
      bestScore:   Math.max(0, ...scores.map(r => r.points || 0)),
      avgScore:    scores.length
        ? Math.round(scores.reduce((s, r) => s + (r.points || 0), 0) / scores.length)
        : 0,
    };
  } catch (error) {
    console.error('Errore nel caricamento stats utente:', error);
    return {
      racesPlayed: 0,
      totalPoints: 0,
      bestScore: 0,
      avgScore: 0,
    };
  }
}
// ─── TOKEN F1 AI VINCITORI PREDIZIONI ────────────────────────────────────────
// Punteggi F1 × 10: 1°→250, 2°→180, 3°→150, 4°→120, 5°→100,
//                   6°→80,  7°→60,  8°→40,  9°→30, 10°→20
const FANTA_TOKEN_PRIZES = [250, 180, 150, 120, 100, 80, 60, 40, 30, 20];

/**
 * Chiama questa funzione dopo aver aggiornato i punteggi di una gara.
 * Legge la classifica fantaPredictions per raceId, calcola le posizioni
 * e assegna i token ai partecipanti usando addTokens.
 *
 * @param {string} raceId  - es. '2026-R01'
 * @param {object} session - sessione NextAuth dell'admin (solo per logging)
 */
export async function awardPredictionTokens(raceId) {
  // 1. Carica tutti i punteggi per questa gara
  const q = query(
    collection(db, 'fantaScores'),
    where('raceId', '==', raceId),
    orderBy('points', 'desc'),
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    console.warn('awardPredictionTokens: nessun punteggio trovato per', raceId);
    return [];
  }

  const results = snap.docs.map((d, i) => ({
    rank: i + 1,
    userId: d.data().userId,
    points: d.data().points,
    tokensAwarded: FANTA_TOKEN_PRIZES[i] ?? 0,
  }));

  // 2. Assegna i token ai primi 10 (o meno se ci sono meno partecipanti)
  const awarded = [];
  for (const entry of results) {
    if (entry.tokensAwarded === 0) break;
    // Crea una session-like per addTokens
    const fakeSession = { user: { email: entry.userId } };
    await addTokens(fakeSession, entry.tokensAwarded);
    // Salva nota nel documento fantaScores
    const docId = `${entry.userId}_${raceId}`;
    await setDoc(doc(db, 'fantaScores', docId), {
      tokensAwarded: entry.tokensAwarded,
      rank: entry.rank,
    }, { merge: true });
    awarded.push(entry);
    console.log(`[FantaF1] ${entry.userId} → rank ${entry.rank} → +${entry.tokensAwarded} token`);
  }

  return awarded;
}

/**
 * Ritorna la tabella premi token per la UI.
 */
export function getFantaTokenPrizes() {
  return FANTA_TOKEN_PRIZES.map((tokens, i) => ({ rank: i + 1, tokens }));
}