/**
 * GET /api/fanta/gp?year=2026&round=3
 * Tutto quello che serve alla pagina di gioco per un Gran Premio: scadenza,
 * griglia fra cui scegliere, e il pronostico già salvato di chi guarda.
 */

import { route } from '../../../lib/fanta/guardia';
import {
  caricaGara, caricaGriglia, gareAperte, scadenza, leggiPrevisione,
  prossimaGara, calendario,
} from '../../../lib/fanta/server';

export default route('GET', async (req, res, utente) => {
  /* Senza round si gioca sul Gran Premio corrente: la pagina si apre da un
     link semplice (`/fanta`) e ci pensa il server a dire quale sia. */
  const year = Number(req.query.year) || new Date().getUTCFullYear();
  const chiesto = Number(req.query.round);
  const race = Number.isInteger(chiesto)
    ? await caricaGara(year, chiesto)
    : await prossimaGara(year);
  const round = race.round;
  const aperto = gareAperte(race);

  return res.status(200).json({
    gara: {
      year: race.year,
      round: race.round,
      nome: race.official_name,
      data: race.date,
    },
    scadenza: scadenza(race)?.toISOString() || null,
    aperto,
    griglia: await caricaGriglia(race),
    // Il proprio pronostico si rilegge sempre; quello degli altri mai da qui.
    miaPrevisione: utente ? await leggiPrevisione(utente.id, year, round) : null,
    calendario: await calendario(year),
  });
}, { richiediLogin: false });
