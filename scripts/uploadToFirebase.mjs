/**
 * FORMULA ROSSA — Script di migrazione JSON → Firebase Firestore
 *
 * Come usarlo:
 * 1. Copia questo file nella root del tuo progetto Next.js
 * 2. Assicurati di avere il file .env.local con le variabili Firebase
 * 3. Esegui: node uploadToFirebase.mjs
 *
 * ATTENZIONE: eseguilo UNA SOLA VOLTA per non duplicare i dati.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || "AIzaSyBp5iqHu2M2q3nek8ikWolM1_74NtZx2Hk",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || "formula-rossa-69c87.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || "formula-rossa-69c87",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || "formula-rossa-69c87.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| "425076646144",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || "1:425076646144:web:0e51c30817d0d9659013e5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db  = getFirestore(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJson(filename) {
  const path = resolve(`./public/data/${filename}`);
  const raw  = readFileSync(path, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Carica un array di oggetti su Firestore usando batch writes (max 500 per batch).
 * @param {string} collectionName  - nome della collezione Firestore
 * @param {Array}  items           - array di oggetti da caricare
 * @param {Function} getDocId      - funzione che riceve l'item e restituisce l'id documento
 */
async function uploadCollection(collectionName, items, getDocId) {
  console.log(`\n📤 Caricamento "${collectionName}" — ${items.length} documenti...`);

  const BATCH_SIZE = 400; // margine di sicurezza sotto il limite 500
  let uploaded = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const docId  = String(getDocId(item));
      const docRef = doc(collection(db, collectionName), docId);
      // Rimuove i valori null per ridurre il peso su Firestore
      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== null && v !== undefined)
      );
      batch.set(docRef, cleaned);
    }

    await batch.commit();
    uploaded += chunk.length;
    console.log(`   ✅ ${uploaded}/${items.length} caricati`);
  }

  console.log(`   🎉 "${collectionName}" completato!`);
}

// ─── Mappatura file → collezioni ─────────────────────────────────────────────
//
// Struttura:
//   file:         nome del file JSON in public/data/
//   collection:   nome della collezione Firestore
//   getId:        funzione per generare l'id univoco del documento
//
const MIGRATIONS = [
  {
    file:       'f1db-circuits.json',
    collection: 'circuits',
    getId:      (item) => item.id,
  },
  {
    file:       'f1db-constructors.json',
    collection: 'constructors',
    getId:      (item) => item.id,
  },
  {
    file:       'f1db-drivers.json',
    collection: 'drivers',
    getId:      (item) => item.id,
  },
  {
    file:       'f1db-races.json',
    collection: 'races',
    getId:      (item) => item.id,
  },
  {
    file:       'f1db-races-race-results.json',
    collection: 'race-results',
    // id composto: raceId + positionDisplayOrder per unicità
    getId:      (item) => `${item.raceId}_${item.positionDisplayOrder}`,
  },
  {
    file:       'f1db-races-qualifying-results.json',
    collection: 'qualifying-results',
    getId:      (item) => `${item.raceId}_${item.positionDisplayOrder}`,
  },
  {
    file:       'f1db-races-qualifying-1-results.json',
    collection: 'qualifying-1-results',
    getId:      (item) => `${item.raceId}_${item.positionDisplayOrder}`,
  },
  {
    file:       'f1db-races-qualifying-2-results.json',
    collection: 'qualifying-2-results',
    getId:      (item) => `${item.raceId}_${item.positionDisplayOrder}`,
  },
  {
    file:       'f1db-races-sprint-qualifying-results.json',
    collection: 'sprint-qualifying-results',
    getId:      (item) => `${item.raceId}_${item.positionDisplayOrder}`,
  },
  {
    file:       'f1db-races-sprint-race-results.json',
    collection: 'sprint-race-results',
    getId:      (item) => `${item.raceId}_${item.positionDisplayOrder}`,
  },
  {
    file:       'f1db-races-driver-standings.json',
    collection: 'driver-standings',
    getId:      (item) => `${item.raceId}_${item.driverId}`,
  },
  {
    file:       'f1db-races-constructor-standings.json',
    collection: 'constructor-standings',
    getId:      (item) => `${item.raceId}_${item.constructorId}`,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Formula Rossa — Migrazione JSON → Firebase Firestore');
  console.log('=========================================================');

  let successCount = 0;
  let errorCount   = 0;

  for (const migration of MIGRATIONS) {
    try {
      const data = loadJson(migration.file);
      const items = Array.isArray(data) ? data : [data];
      await uploadCollection(migration.collection, items, migration.getId);
      successCount++;
    } catch (err) {
      console.error(`\n❌ Errore su "${migration.file}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n=========================================================');
  console.log(`✅ Collezioni caricate: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errori: ${errorCount}`);
  }
  console.log('\n🏁 Migrazione completata!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
