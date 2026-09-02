/**
 * lib/supabaseClient.js
 * Il client Supabase del sito, uno solo.
 *
 * Le stesse sei righe erano copiate in undici file. Sette avevano la guardia
 * `typeof window !== 'undefined'`, quattro no: e quelle quattro fanno fallire
 * `next build` con "supabaseUrl is required" appena manca una variabile
 * d'ambiente, perché Next valuta il modulo anche a build time, dove le
 * NEXT_PUBLIC_ non ci sono ancora.
 *
 * Vale anche per il runtime: undici moduli significano undici connessioni
 * realtime e undici copie della cache di sessione nello stesso browser.
 *
 * Sul server il client è `null`: tutte le query del sito partono da `useEffect`,
 * quindi girano nel browser. Chi lo usasse dal server deve controllarlo.
 */

import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (typeof window !== 'undefined' && URL && KEY)
  ? createClient(URL, KEY)
  : null;

export default supabase;
