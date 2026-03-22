/**
 * scripts/seedFantaCalendar.js
 * ============================
 * Popola la collezione fantaF1Races su Firestore
 * con tutte le 24 gare del calendario 2026.
 *
 * Esegui UNA VOLTA SOLA dalla root del progetto:
 *   node scripts/seedFantaCalendar.js
 *
 * Richiede: firebase-admin, dotenv
 * (già installati nel tuo progetto)
 */

const admin = require('firebase-admin');
const path  = require('path');

// ─── INIT FIREBASE ADMIN ──────────────────────────────────────────────────────
const serviceAccount = require('../firebase-credentials.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ─── CALENDARIO 2026 ─────────────────────────────────────────────────────────
// Stesso calendario di lib/fantaF1.js — aggiungendo i campi extra per fantaF1Races
const CALENDAR_2026 = [
  { id: '2026-R01', round: 1,  name: 'Australian GP',   country: 'Australia', circuit: 'Albert Park',              date: '2026-03-15T05:00:00Z', lockDate: '2026-03-14T23:59:00Z' },
  { id: '2026-R02', round: 2,  name: 'Chinese GP',      country: 'China',     circuit: 'Shanghai International',   date: '2026-03-22T07:00:00Z', lockDate: '2026-03-21T23:59:00Z' },
  { id: '2026-R03', round: 3,  name: 'Japanese GP',     country: 'Japan',     circuit: 'Suzuka',                   date: '2026-03-29T05:00:00Z', lockDate: '2026-03-28T23:59:00Z' },
  { id: '2026-R04', round: 4,  name: 'Bahrain GP',      country: 'Bahrain',   circuit: 'Bahrain International',    date: '2026-04-12T15:00:00Z', lockDate: '2026-04-11T23:59:00Z' },
  { id: '2026-R05', round: 5,  name: 'Saudi Arabia GP', country: 'Arabia',    circuit: 'Jeddah Corniche',          date: '2026-04-19T17:00:00Z', lockDate: '2026-04-18T23:59:00Z' },
  { id: '2026-R06', round: 6,  name: 'Miami GP',        country: 'USA',       circuit: 'Miami International',      date: '2026-05-03T19:00:00Z', lockDate: '2026-05-02T23:59:00Z' },
  { id: '2026-R07', round: 7,  name: 'Canadian GP',     country: 'Canada',    circuit: 'Circuit Gilles Villeneuve',date: '2026-05-24T18:00:00Z', lockDate: '2026-05-23T23:59:00Z' },
  { id: '2026-R08', round: 8,  name: 'Monaco GP',       country: 'Monaco',    circuit: 'Circuit de Monaco',        date: '2026-06-07T13:00:00Z', lockDate: '2026-06-06T23:59:00Z' },
  { id: '2026-R09', round: 9,  name: 'Spanish GP',      country: 'Spain',     circuit: 'Circuit de Barcelona',     date: '2026-06-14T13:00:00Z', lockDate: '2026-06-13T23:59:00Z' },
  { id: '2026-R10', round: 10, name: 'Austrian GP',     country: 'Austria',   circuit: 'Red Bull Ring',            date: '2026-06-28T13:00:00Z', lockDate: '2026-06-27T23:59:00Z' },
  { id: '2026-R11', round: 11, name: 'British GP',      country: 'UK',        circuit: 'Silverstone',              date: '2026-07-05T14:00:00Z', lockDate: '2026-07-04T23:59:00Z' },
  { id: '2026-R12', round: 12, name: 'Belgian GP',      country: 'Belgium',   circuit: 'Spa-Francorchamps',        date: '2026-07-19T13:00:00Z', lockDate: '2026-07-18T23:59:00Z' },
  { id: '2026-R13', round: 13, name: 'Hungarian GP',    country: 'Hungary',   circuit: 'Hungaroring',              date: '2026-07-26T13:00:00Z', lockDate: '2026-07-25T23:59:00Z' },
  { id: '2026-R14', round: 14, name: 'Dutch GP',        country: 'Netherlands',circuit: 'Zandvoort',               date: '2026-08-23T13:00:00Z', lockDate: '2026-08-22T23:59:00Z' },
  { id: '2026-R15', round: 15, name: 'Italian GP',      country: 'Italy',     circuit: 'Monza',                    date: '2026-09-06T13:00:00Z', lockDate: '2026-09-05T23:59:00Z' },
  { id: '2026-R16', round: 16, name: 'Madrid GP',       country: 'Spain',     circuit: 'IFEMA Madrid',             date: '2026-09-13T13:00:00Z', lockDate: '2026-09-12T23:59:00Z' },
  { id: '2026-R17', round: 17, name: 'Azerbaijan GP',   country: 'Azerbaijan',circuit: 'Baku City Circuit',        date: '2026-09-26T11:00:00Z', lockDate: '2026-09-25T23:59:00Z' },
  { id: '2026-R18', round: 18, name: 'Singapore GP',    country: 'Singapore', circuit: 'Marina Bay Street',        date: '2026-10-11T08:00:00Z', lockDate: '2026-10-10T23:59:00Z' },
  { id: '2026-R19', round: 19, name: 'US GP',           country: 'USA',       circuit: 'Circuit of the Americas',  date: '2026-10-25T19:00:00Z', lockDate: '2026-10-24T23:59:00Z' },
  { id: '2026-R20', round: 20, name: 'Mexico City GP',  country: 'Mexico',    circuit: 'Autodromo Hermanos Rodriguez',date: '2026-11-01T19:00:00Z', lockDate: '2026-10-31T23:59:00Z' },
  { id: '2026-R21', round: 21, name: 'Brazilian GP',    country: 'Brazil',    circuit: 'Interlagos',               date: '2026-11-08T17:00:00Z', lockDate: '2026-11-07T23:59:00Z' },
  { id: '2026-R22', round: 22, name: 'Las Vegas GP',    country: 'USA',       circuit: 'Las Vegas Strip',          date: '2026-11-21T06:00:00Z', lockDate: '2026-11-20T23:59:00Z' },
  { id: '2026-R23', round: 23, name: 'Qatar GP',        country: 'Qatar',     circuit: 'Lusail International',     date: '2026-11-29T14:00:00Z', lockDate: '2026-11-28T23:59:00Z' },
  { id: '2026-R24', round: 24, name: 'Abu Dhabi GP',    country: 'UAE',       circuit: 'Yas Marina',               date: '2026-12-06T13:00:00Z', lockDate: '2026-12-05T23:59:00Z' },
];

// ─── DETERMINA STATUS ─────────────────────────────────────────────────────────
function getStatus(dateStr, lockDateStr) {
  const now      = new Date();
  const raceDate = new Date(dateStr);
  const lockDate = new Date(lockDateStr);

  if (now > raceDate) return 'completed';
  if (now > lockDate) return 'locked';
  return 'upcoming';
}

// ─── SEED ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🏎️  Seeding fantaF1Races...\n');

  const batch = db.batch();

  for (const race of CALENDAR_2026) {
    const { id, ...data } = race;
    const status = getStatus(data.date, data.lockDate);

    const ref = db.collection('fantaF1Races').doc(id);
    batch.set(ref, {
      ...data,
      year:   2026,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }); // merge:true = non sovrascrive se esiste già

    console.log(`  ✓ ${id} — ${data.name} — ${status}`);
  }

  await batch.commit();
  console.log('\n✅ Tutte le gare inserite su Firestore!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});