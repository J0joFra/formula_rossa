/**
 * scripts/adminScoreGP.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ADMIN ONLY — Script universale per ufficializzare qualsiasi GP della stagione.
 *
 * USO:
 *   1. Riempi l'oggetto RACE_RESULTS[raceId] con i dati del GP appena corso
 *   2. Esegui:  node scripts/adminScoreGP.js 2026-R01
 *      oppure:  node scripts/adminScoreGP.js  (usa l'ultimo GP disputato)
 *
 * Il raceId accettato è sempre nella forma '2026-RXX' (es. 2026-R01, 2026-R14)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection, query, where, getDocs,
  doc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import {
  FANTA_CALENDAR, DRIVERS_2026,
  getRaceResult, calculateScore, saveScore, awardPredictionTokens,
} from '../lib/fantaF1.js';

const RACE_RESULTS = {

  '2026-R01': {
    status: 'provisional',   // → 'official' dopo conferma steward
    fullGrid: [
      { pos: 1,  driverId: 'george-russell'    },
      { pos: 2,  driverId: 'kimi-antonelli'    },
      { pos: 3,  driverId: 'charles-leclerc'   },
      { pos: 4,  driverId: 'lewis-hamilton'    },
      { pos: 5,  driverId: 'lando-norris'      },
      { pos: 6,  driverId: 'max-verstappen'    },
      { pos: 7,  driverId: 'oliver-bearman'    },
      { pos: 8,  driverId: 'arvid-lindblad'    },
      { pos: 9,  driverId: 'gabriel-bortoleto' },
      { pos: 10, driverId: 'pierre-gasly'      },
    ],
    lastTail: [
      { pos: 11, driverId: 'esteban-ocon'      },
      { pos: 12, driverId: 'alexander-albon'   },
      { pos: 13, driverId: 'liam-lawson'       },
      { pos: 14, driverId: 'franco-colapinto'  },
      { pos: 15, driverId: 'carlos-sainz-jr'   },
      { pos: 16, driverId: 'sergio-perez'      },
    ],
    bonuses: {
      polePosition:       'george-russell',
      fastestLap:         'lewis-hamilton',   // 1:20.267 — provvisorio
      safetyCar:          true,               // VSC presente (conta come SC/VSC)
      dnfDrivers: [
        'lance-stroll',
        'fernando-alonso',
        'valtteri-bottas',
        'isack-hadjar',
        'oscar-piastri',    // DNS → trattato come DNF
        'nico-hulkenberg',  // DNS → trattato come DNF
      ],
      winningConstructor: 'mercedes',
      teamDoublePodium:   'mercedes',         // Russell 1°, Antonelli 2°
    },
  },

  // ── R02 · Chinese GP · Shanghai · 15 mar 2026 ────────────────────────────
  '2026-R02': null,  // ← compila dopo la gara

  // ── R03 · Japanese GP · Suzuka · 29 mar 2026 ─────────────────────────────
  '2026-R03': null,

  // ── R04 · Bahrain GP · Sakhir · 12 apr 2026 ──────────────────────────────
  '2026-R04': null,

  // ── R05 · Saudi Arabia GP · Jeddah · 19 apr 2026 ─────────────────────────
  '2026-R05': null,

  // ── R06 · Miami GP · Miami · 03 mag 2026 ─────────────────────────────────
  '2026-R06': null,

  // ── R07 · Canadian GP · Montréal · 24 mag 2026 ───────────────────────────
  '2026-R07': null,

  // ── R08 · Monaco GP · Monte-Carlo · 07 giu 2026 ──────────────────────────
  '2026-R08': null,

  // ── R09 · Spanish GP · Barcelona · 14 giu 2026 ───────────────────────────
  '2026-R09': null,

  // ── R10 · Austrian GP · Red Bull Ring · 28 giu 2026 ──────────────────────
  '2026-R10': null,

  // ── R11 · British GP · Silverstone · 05 lug 2026 ─────────────────────────
  '2026-R11': null,

  // ── R12 · Belgian GP · Spa · 19 lug 2026 ────────────────────────────────
  '2026-R12': null,

  // ── R13 · Hungarian GP · Hungaroring · 26 lug 2026 ───────────────────────
  '2026-R13': null,

  // ── R14 · Dutch GP · Zandvoort · 23 ago 2026 ─────────────────────────────
  '2026-R14': null,

  // ── R15 · Italian GP · Monza · 06 set 2026 ───────────────────────────────
  '2026-R15': null,

  // ── R16 · Madrid GP · IFEMA · 13 set 2026 ────────────────────────────────
  '2026-R16': null,

  // ── R17 · Azerbaijan GP · Baku · 26 set 2026 ─────────────────────────────
  '2026-R17': null,

  // ── R18 · Singapore GP · Marina Bay · 11 ott 2026 ────────────────────────
  '2026-R18': null,

  // ── R19 · US GP · Austin · 25 ott 2026 ───────────────────────────────────
  '2026-R19': null,

  // ── R20 · Mexico City GP · Rodríguez · 01 nov 2026 ───────────────────────
  '2026-R20': null,

  // ── R21 · Brazilian GP · Interlagos · 08 nov 2026 ────────────────────────
  '2026-R21': null,

  // ── R22 · Las Vegas GP · Las Vegas · 21 nov 2026 ─────────────────────────
  '2026-R22': null,

  // ── R23 · Qatar GP · Lusail · 29 nov 2026 ────────────────────────────────
  '2026-R23': null,

  // ── R24 · Abu Dhabi GP · Yas Marina · 06 dic 2026 ────────────────────────
  '2026-R24': null,
};

function normalizePrediction(raw) {
  const toObj = (arr, startPos = 1) =>
    (arr || []).map((entry, i) =>
      typeof entry === 'string'
        ? { pos: startPos + i, driverId: entry }
        : entry
    );
  return {
    ...raw,
    fullGrid: toObj(raw.fullGrid, 1),
    lastTail: toObj(raw.lastTail || raw.lastFive || [], 11),
  };
}

export async function processGP(raceId) {
  // ── 0. Valida raceId ──
  const race = FANTA_CALENDAR.find(r => r.raceId === raceId);
  if (!race) throw new Error(`❌ raceId non trovato nel calendario: ${raceId}`);

  const resultData = RACE_RESULTS[raceId];
  if (!resultData) throw new Error(`❌ Nessun risultato inserito per ${raceId} — compila RACE_RESULTS in questo file.`);

  console.log(`\n🏁 FantaF1 · ${race.name} (${raceId})`);
  console.log('═'.repeat(60));

  // ── 1. Salva risultato ufficiale su Firestore ──
  await setDoc(doc(db, 'fantaResults', raceId), {
    ...resultData,
    raceId,
    raceName:  race.name,
    scoredAt:  serverTimestamp(),
  });
  console.log(`✅ Risultato salvato → fantaResults/${raceId}`);
  console.log(`   Status    : ${resultData.status}`);
  console.log(`   Vincitore : ${resultData.fullGrid[0].driverId}`);
  console.log(`   Pole      : ${resultData.bonuses.polePosition}`);
  console.log(`   Giro vel. : ${resultData.bonuses.fastestLap}`);
  console.log(`   SC/VSC    : ${resultData.bonuses.safetyCar ? 'Sì' : 'No'}`);
  console.log(`   Doppietta : ${resultData.bonuses.teamDoublePodium ?? '—'}`);
  console.log(`   DNF       : ${resultData.bonuses.dnfDrivers.join(', ')}`);

  // ── 2. Carica tutte le predizioni per questa gara ──
  const snap = await getDocs(
    query(collection(db, 'fantaPredictions'), where('raceId', '==', raceId))
  );
  if (snap.empty) {
    console.warn('\n⚠️  Nessuna predizione trovata — nessun punteggio da calcolare.');
    return [];
  }
  console.log(`\n📋 Predizioni trovate: ${snap.size}`);
  console.log('─'.repeat(60));

  // ── 3. Calcola e salva punteggi ──
  const scores = [];
  for (const predDoc of snap.docs) {
    const raw        = predDoc.data();
    const prediction = normalizePrediction(raw);
    const score      = calculateScore(prediction, resultData);
    if (!score) { console.warn(`  ⚠️  Score null per ${raw.userId}`); continue; }

    await saveScore(raw.userId, raceId, score);
    scores.push({ userId: raw.userId, userName: raw.userName || raw.userId, ...score });

    const b = score.breakdown;
    console.log(`  👤 ${(raw.userName || raw.userId).padEnd(26)} ${String(score.total).padStart(4)} pt`);
    console.log(`     esatte:${b.posizioniEsatte} podio:${b.podioPartial} top10:${b.top10Partial} coda:${b.codaEsatte}+${b.codaZona} pole:${b.polePosition} FL:${b.giroVeloce} SC:${b.safetyCar} DNF:${b.dnfCorretti} cost:${b.costruttoreVincitore} dopp:${b.doppiettaTeam}`);
  }

  // ── 4. Assegna token ai top 10 ──
  scores.sort((a, b) => b.total - a.total);
  console.log('\n─'.repeat(60));
  console.log('🪙 Assegnazione token SFT...');
  const awarded = await awardPredictionTokens(raceId);

  // ── 5. Classifica finale ──
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 CLASSIFICA — ${race.name}`);
  console.log('═'.repeat(60));
  const medals = ['🥇','🥈','🥉'];
  scores.forEach((s, i) => {
    const tok = awarded.find(a => a.userId === s.userId);
    const tokStr = tok ? `  +${tok.tokensAwarded} SFT` : '';
    console.log(`  ${medals[i] ?? `${i+1}.`}  ${s.userName.padEnd(24)} ${String(s.total).padStart(4)} pt${tokStr}`);
  });
  console.log('═'.repeat(60));
  console.log(`\n✅ Done — ${scores.length} utenti, ${awarded.length} token assegnati.\n`);

  return scores;
}

const arg = process.argv[2];
const raceId = arg ?? Object.entries(RACE_RESULTS).filter(([, v]) => v !== null).at(-1)?.[0];

if (!raceId) {
  console.error('❌ Nessun raceId specificato e nessun risultato compilato in RACE_RESULTS.');
  process.exit(1);
}

processGP(raceId).catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});