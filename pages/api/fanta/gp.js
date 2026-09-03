/**
 * GET /api/fanta/gp
 * Tutto quello che serve alla pagina di gioco: scadenza, griglia fra cui
 * scegliere, e il pronostico già salvato di chi guarda.
 *
 * Il Gran Premio non si sceglie: è sempre quello in corso. Poter giocare le
 * gare di giugno a marzo vorrebbe dire compilare venti schedine a caso in una
 * sera e aspettare che qualcuna paghi — che è l'opposto di guardare le
 * qualifiche e farsi un'idea. Una gara alla volta, quella che si corre adesso.
 */

import { route } from '../../../lib/fanta/guardia';
import {
  caricaGriglia, gareAperte, scadenza, leggiPrevisione, prossimaGara,
} from '../../../lib/fanta/server';

export default route('GET', async (req, res, utente) => {
  const race = await prossimaGara(Number(req.query.year) || new Date().getUTCFullYear());
  const { year, round } = race;
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
  });
}, { richiediLogin: false });
