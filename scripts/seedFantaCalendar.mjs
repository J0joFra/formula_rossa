/**
 * scripts/seedFantaCalendar.mjs
 * ============================
 * Popola la collezione fantaF1Races su Firestore
 * con tutte le 24 gare del calendario 2026.
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import { CALENDAR_2026 } from '../config/f1-2026.js';

const require = createRequire(import.meta.url);
const serviceAccount = require('../firebase-credentials.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

function getStatus(dateStr, lockDateStr) {
  const now      = new Date();
  const raceDate = new Date(dateStr);
  const lockDate = new Date(lockDateStr);

  if (now > raceDate) return 'completed';
  if (now > lockDate) return 'locked';
  return 'upcoming';
}

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
    }, { merge: true });

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
