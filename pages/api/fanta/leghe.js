/**
 * GET  /api/fanta/leghe            — le mie leghe
 * POST /api/fanta/leghe            — { azione: 'crea', nome } | { azione: 'entra', codice }
 */

import { route } from '../../../lib/fanta/guardia';
import { creaLega, entraInLega, legheDi } from '../../../lib/fanta/server';

export default route(['GET', 'POST'], async (req, res, utente) => {
  if (req.method === 'GET') {
    return res.status(200).json({ leghe: await legheDi(utente) });
  }
  const { azione, nome, codice } = req.body || {};
  if (azione === 'crea')  return res.status(200).json({ lega: await creaLega({ utente, nome }) });
  if (azione === 'entra') return res.status(200).json({ lega: await entraInLega({ utente, codice }) });
  return res.status(400).json({ errore: "Azione sconosciuta: attese 'crea' o 'entra'." });
});
