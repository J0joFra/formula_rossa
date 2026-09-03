/**
 * lib/fanta/guardia.js
 * Il preambolo comune delle route del Fanta.
 *
 * Ogni route parte da qui: metodo giusto, sessione vera, errori tradotti in
 * risposte. Sta in `lib/` e non in `pages/api/`: lì dentro Next pubblica ogni
 * file come endpoint, underscore compreso, e questo non ha un handler da
 * esporre — sarebbe una rotta che risponde solo 500.
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../authOptions';
import { ErroreFanta } from './server';

/** L'utente della sessione, o `null`. L'identità non arriva mai dal client. */
export async function utenteDi(req, res) {
  const sessione = await getServerSession(req, res, authOptions);
  if (!sessione?.user?.id) return null;
  return {
    id: sessione.user.id,
    nome: sessione.user.name || null,
    avatar: sessione.user.image || null,
  };
}

/**
 * Avvolge una route: controlla il metodo, richiede la sessione se serve, e
 * trasforma gli errori in risposte invece di lasciarli esplodere.
 */
export function route(metodi, gestore, { richiediLogin = true } = {}) {
  const ammessi = Array.isArray(metodi) ? metodi : [metodi];
  return async function handler(req, res) {
    if (!ammessi.includes(req.method)) {
      res.setHeader('Allow', ammessi);
      return res.status(405).json({ errore: `Metodo ${req.method} non ammesso.` });
    }
    try {
      const utente = await utenteDi(req, res);
      if (richiediLogin && !utente) {
        return res.status(401).json({ errore: 'Serve accedere per giocare.' });
      }
      return await gestore(req, res, utente);
    } catch (e) {
      if (e instanceof ErroreFanta) return res.status(e.stato).json({ errore: e.message });
      // Il messaggio tecnico resta nei log del server: fuori esce una frase.
      console.error('Fanta:', e);
      return res.status(500).json({ errore: 'Qualcosa è andato storto. Riprova.' });
    }
  };
}
