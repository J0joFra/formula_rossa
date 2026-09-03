/**
 * POST /api/fanta/calcola  { year, round }
 * Calcola i punteggi di una gara conclusa.
 *
 * Non è una route pubblica: la protegge un segreto condiviso, perché la deve
 * chiamare un lavoro pianificato (il cron di Vercel, o una chiamata a mano
 * dopo la gara), non chi passa di lì. Senza FANTA_CRON_SECRET non risponde:
 * meglio inerte che aperta.
 */

import { calcolaGara, ultimaGaraCorsa, ErroreFanta } from '../../../lib/fanta/server';

export default async function handler(req, res) {
  /* GET oltre a POST perché il cron di Vercel chiama in GET e senza corpo:
     in quel caso la gara da calcolare la trova il server da solo. */
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ errore: 'Metodo non ammesso.' });
  }

  /* `CRON_SECRET` è il nome che usa Vercel per i suoi cron: accettandolo si
     evita di dover configurare due segreti per la stessa cosa. */
  const atteso = process.env.FANTA_CRON_SECRET || process.env.CRON_SECRET;
  if (!atteso) return res.status(503).json({ errore: 'Calcolo non configurato.' });
  if (req.headers.authorization !== `Bearer ${atteso}`) {
    return res.status(401).json({ errore: 'Non autorizzato.' });
  }

  try {
    const { year, round } = req.body || {};
    const gara = (Number.isInteger(year) && Number.isInteger(round))
      ? { year, round }
      : await ultimaGaraCorsa();
    return res.status(200).json({ ...gara, ...await calcolaGara(gara.year, gara.round) });
  } catch (e) {
    if (e instanceof ErroreFanta) return res.status(e.stato).json({ errore: e.message });
    console.error('Fanta calcolo:', e);
    return res.status(500).json({ errore: 'Calcolo fallito.' });
  }
}
