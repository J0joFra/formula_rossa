/**
 * GET /api/fanta/classifica?year=2026[&round=3][&lega=<id>]
 * Le classifiche: di stagione, di una singola gara, o di una lega privata.
 */

import { route } from '../../../lib/fanta/guardia';
import { classificaStagione, classificaGara, classificaLega } from '../../../lib/fanta/server';

export default route('GET', async (req, res, utente) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const round = req.query.round ? Number(req.query.round) : null;
  const lega = req.query.lega || null;

  if (lega) {
    if (!utente) return res.status(401).json({ errore: 'Serve accedere.' });
    return res.status(200).json({ righe: await classificaLega({ utente, legaId: lega, year }) });
  }
  if (round) {
    return res.status(200).json({ righe: await classificaGara(year, round) });
  }
  return res.status(200).json({ righe: await classificaStagione(year) });
}, { richiediLogin: false });
