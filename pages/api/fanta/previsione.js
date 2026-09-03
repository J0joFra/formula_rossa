/**
 * POST /api/fanta/previsione
 * Salva la giocata. È l'unico modo per scrivere in `fanta_prediction`.
 */

import { route } from '../../../lib/fanta/guardia';
import { salvaPrevisione } from '../../../lib/fanta/server';

export default route('POST', async (req, res, utente) => {
  const { year, round, top10, pilotaDelGiorno, ritiri } = req.body || {};
  if (!Number.isInteger(year) || !Number.isInteger(round)) {
    return res.status(400).json({ errore: 'Servono anno e round.' });
  }
  const esito = await salvaPrevisione({
    utente, year, round,
    previsione: {
      top10: Array.isArray(top10) ? top10 : [],
      pilotaDelGiorno: pilotaDelGiorno || null,
      // Dal form arriva una stringa: qui diventa un numero, e se non lo è
      // la validazione lo rifiuta invece di salvare NaN.
      ritiri: Number.isInteger(ritiri) ? ritiri : Number.parseInt(ritiri, 10),
    },
  });
  return res.status(200).json(esito);
});
