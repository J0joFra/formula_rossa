/**
 * pages/api/admin/score-gp.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API Route protetta — riceve i risultati di un GP, li salva su Firestore,
 * calcola i punteggi di tutti i partecipanti e assegna i token SFT.
 *
 * POST /api/admin/score-gp
 * Header: x-admin-secret: <ADMIN_SECRET>
 * Body JSON: { raceId, status, fullGrid, lastTail, bonuses }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import {
  collection, query, where, getDocs,
  doc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  FANTA_CALENDAR,
  calculateScore,
  saveScore,
  awardPredictionTokens,
} from '../../../lib/fantaF1';

// ─── Lista email admin autorizzati ───────────────────────────────────────────
const ADMIN_EMAILS = [
  // aggiungi qui le tue email admin
  process.env.ADMIN_EMAIL,
].filter(Boolean);

function normalizePrediction(raw) {
  const toObj = (arr, startPos) =>
    (arr || []).map((entry, i) =>
      typeof entry === 'string'
        ? { pos: startPos + i, driverId: entry }
        : entry
    );
  return {
    ...raw,
    fullGrid: toObj(raw.fullGrid || [], 1),
    lastTail: toObj(raw.lastTail || raw.lastFive || [], 11),
  };
}

export default async function handler(req, res) {
  // Assicura sempre risposta JSON anche in caso di crash inatteso
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Auth: controlla sessione NextAuth ──
  let session;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (e) {
    return res.status(500).json({ error: 'Errore autenticazione: ' + e.message });
  }
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return res.status(403).json({ error: 'Non autorizzato' });
  }

  const { raceId, status = 'provisional', fullGrid, lastTail, bonuses } = req.body;

  // ── Validazione input ──
  if (!raceId) return res.status(400).json({ error: 'raceId mancante' });
  const race = FANTA_CALENDAR.find(r => r.raceId === raceId);
  if (!race)   return res.status(400).json({ error: `raceId non valido: ${raceId}` });
  if (!fullGrid?.length) return res.status(400).json({ error: 'fullGrid mancante' });
  if (!bonuses) return res.status(400).json({ error: 'bonuses mancante' });

  try {
    const resultData = { fullGrid, lastTail: lastTail || [], bonuses, status };

    // ── 1. Salva risultato ufficiale ──
    await setDoc(doc(db, 'fantaResults', raceId), {
      ...resultData,
      raceId,
      raceName:  race.name,
      scoredAt:  serverTimestamp(),
    });

    // ── 2. Carica tutte le predizioni ──
    const snap = await getDocs(
      query(collection(db, 'fantaPredictions'), where('raceId', '==', raceId))
    );

    const scores = [];
    for (const predDoc of snap.docs) {
      const raw        = predDoc.data();
      const prediction = normalizePrediction(raw);
      const score      = calculateScore(prediction, resultData);
      if (!score) continue;

      // ── 3. Salva punteggio + aggiorna leaderboard ──
      await saveScore(raw.userId, raceId, score);
      scores.push({
        userId:    raw.userId,
        userName:  raw.userName || raw.userId,
        total:     score.total,
        breakdown: score.breakdown,
      });
    }

    // ── 4. Assegna token SFT ai top 10 ──
    scores.sort((a, b) => b.total - a.total);
    const awarded = await awardPredictionTokens(raceId);

    return res.status(200).json({
      ok:           true,
      race:         race.name,
      participants: scores.length,
      tokenAwarded: awarded.length,
      leaderboard:  scores.map((s, i) => {
        const tok = awarded.find(a => a.userId === s.userId);
        return {
          rank:          i + 1,
          userId:        s.userId,
          userName:      s.userName,
          total:         s.total,
          breakdown:     s.breakdown,
          tokensAwarded: tok?.tokensAwarded ?? 0,
        };
      }),
    });

  } catch (err) {
    console.error('[score-gp]', err);
    return res.status(500).json({ error: err.message });
  }
}