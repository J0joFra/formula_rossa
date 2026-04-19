/**
 * lib/fantaF1.js
 * Logica Firebase per il sistema FantaF1 — predizioni pre-gara
 */

import {
  doc, getDoc, setDoc, updateDoc, increment,
  collection, query, orderBy, limit,
  getDocs, serverTimestamp, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { DRIVERS_2026, CALENDAR_2026 } from '../config/f1-2026';

// ─── CALENDARIO 2026 ─────────────────────────────────────────────────────────
export const FANTA_CALENDAR = CALENDAR_2026;

// ─── GRIGLIA PILOTI 2026 ──────────────────────────────────────────────────────
// Esportato sia come DRIVERS_2026 (usato da FantaF1.jsx) che come DRIVERS_2026_GRID
export { DRIVERS_2026 };
export const DRIVERS_2026_GRID = DRIVERS_2026;

// ─── SISTEMA PUNTI ────────────────────────────────────────────────────────────
export const POINTS = {
  // Griglia principale
  exactPosition:       100,  // Posizione esatta
  podiumWrong:          25,  // Nel podio ma posizione sbagliata
  top10Wrong:           17,  // In top 10 ma posizione sbagliata
  // Zona coda (pos 11-22, tutti i 12 piloti rimanenti)
  lastTailExact:        20,  // Posizione esatta nella zona coda (pos 11-17)
  lastTailZone:         10,  // Pilota nella zona coda ma pos sbagliata
  lastFiveExact:        15,  // Posizione esatta negli ultimi 5 (pos 18-22)
  // Bonus collettivi griglia
  podiumBonus:           1,  // Almeno 2 dei 3 pronosticati sono sul podio reale
  top10Bonus:            3,  // Almeno 7 dei 10 pronosticati sono nella top 10 reale
  pos13Bonus:            5,  // Bonus bizzarro: azzecchi esattamente il 13° posto
  // Bonus gara
  fastestLapExact:      15,  // Giro veloce esatto
  safetyCarCorrect:      5,  // Safety car (sì/no) corretta
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
  const lockDateTime = new Date(race.lockDate + 'T23:59:00');
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

// ─── SALVA RISULTATO UFFICIALE (ADMIN ONLY) ───────────────────────────────────
// result: {
//   fullGrid: [{ pos: 1, driverId: 'george-russell' }, ...],  // top 10
//   lastTail: [{ pos: 11, driverId: '...' }, ...],            // pos 11–22 classificati
//   bonuses: {
//     polePosition:       string,    // driverId
//     fastestLap:         string,    // driverId
//     safetyCar:          boolean,   // true se SC o VSC
//     dnfDrivers:         string[],  // driverId[] — include DNS come DNF
//     winningConstructor: string,    // team id es. 'mercedes'
//     teamDoublePodium:   string,    // team id se doppietta podio, null altrimenti
//   },
//   status: 'provisional' | 'official',
// }
export async function saveRaceResult(raceId, result) {
  const race = FANTA_CALENDAR.find(r => r.raceId === raceId);
  if (!race) throw new Error(`Gara non trovata: ${raceId}`);

  await setDoc(doc(db, 'fantaResults', raceId), {
    ...result,
    raceId,
    raceName:  race.name,
    scoredAt:  serverTimestamp(),
  });
  return true;
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
    codaEsatte:         0,  // Pos esatta nella zona coda (11-17)
    codaZona:           0,  // In zona coda ma pos sbagliata
    ultimiCinqueEsatti: 0,  // Pos esatta negli ultimi 5 (18-22)
    podioBonus:         0,  // Almeno 2/3 sul podio
    top10Bonus:         0,  // Almeno 7/10 nella top 10
    pos13Bonus:         0,  // Bonus bizzarro 13° posto
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

  // ── Zona coda (pos 11-22) ──
  // lastTail include tutti e 12 i piloti dalla pos 11 alla 22
  // pos 11-17 → lastTailExact / lastTailZone
  // pos 18-22 → lastFiveExact (ultimi 5, +15 se esatta, altrimenti lastTailZone)
  const lastTail = prediction.lastTail || prediction.lastFive || [];
  const realTail = result.lastTail || [];
  const allRealGrid = [...realGrid, ...realTail]; // griglia completa 1-22

  lastTail.forEach(({ pos, driverId }) => {
    const realEntry = allRealGrid.find(r => r.driverId === driverId);
    if (!realEntry) return;
    const realInTail = realEntry.pos >= TAIL_START;
    if (!realInTail) return;

    const isLastFive = pos >= 18; // l'utente lo aveva pronosticato tra 18-22

    if (realEntry.pos === pos) {
      // Posizione esatta
      if (isLastFive) {
        pts += POINTS.lastFiveExact;
        breakdown.ultimiCinqueEsatti += POINTS.lastFiveExact;
      } else {
        pts += POINTS.lastTailExact;
        breakdown.codaEsatte += POINTS.lastTailExact;
      }
    } else {
      // Zona corretta ma posizione sbagliata
      pts += POINTS.lastTailZone;
      breakdown.codaZona += POINTS.lastTailZone;
    }
  });

  // ── Bonus bizzarro: 13° posto esatto ──
  const pred13 = [...predGrid, ...lastTail].find(e => e.pos === 13);
  const real13 = allRealGrid.find(r => r.pos === 13);
  if (pred13 && real13 && pred13.driverId === real13.driverId) {
    pts += POINTS.pos13Bonus;
    breakdown.pos13Bonus += POINTS.pos13Bonus;
  }

  // ── Bonus collettivo podio: almeno 2/3 pronosticati sul podio reale ──
  const predPodium = predGrid.filter(e => e.pos <= 3).map(e => e.driverId);
  const realPodium = realGrid.filter(r => r.pos <= 3).map(r => r.driverId);
  const podiumMatches = predPodium.filter(d => realPodium.includes(d)).length;
  if (podiumMatches >= 2) {
    pts += POINTS.podiumBonus;
    breakdown.podioBonus += POINTS.podiumBonus;
  }

  // ── Bonus collettivo top 10: almeno 7/10 pronosticati nella top 10 reale ──
  const predTop10 = predGrid.filter(e => e.pos <= 10).map(e => e.driverId);
  const realTop10 = realGrid.filter(r => r.pos <= 10).map(r => r.driverId);
  const top10Matches = predTop10.filter(d => realTop10.includes(d)).length;
  if (top10Matches >= 7) {
    pts += POINTS.top10Bonus;
    breakdown.top10Bonus += POINTS.top10Bonus;
  }

  const predBonuses   = prediction.bonuses   || {};
  const resultBonuses = result.bonuses       || {};

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

  // 2. Assegna i token ai primi 10 direttamente su Firestore (senza fakeSession)
  const awarded = [];
  for (const entry of results) {
    if (entry.tokensAwarded === 0) break;

    // Aggiorna tokens direttamente nel doc utente (userId = email)
    const uid = entry.userId.replace(/[^a-zA-Z0-9_.-]/g, '_');
    await setDoc(doc(db, 'users', uid), {
      tokens:    increment(entry.tokensAwarded),
      updatedAt: Date.now(),
    }, { merge: true });

    // Salva rank e token nel documento fantaScores
    const docId = `${entry.userId}_${raceId}`;
    await setDoc(doc(db, 'fantaScores', docId), {
      tokensAwarded: entry.tokensAwarded,
      rank:          entry.rank,
    }, { merge: true });

    awarded.push(entry);
  }

  return awarded;
}

/**
 * Ritorna la tabella premi token per la UI.
 */
export function getFantaTokenPrizes() {
  return FANTA_TOKEN_PRIZES.map((tokens, i) => ({ rank: i + 1, tokens }));
}
