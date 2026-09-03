/**
 * lib/supabaseServer.js
 * Il client Supabase per il codice che gira sul server: getStaticProps,
 * getServerSideProps, la sitemap.
 *
 * Perché non riusare `lib/supabaseClient.js`: quello è `null` fuori dal
 * browser, di proposito — nasce per le query che partono da `useEffect`. Serve
 * un secondo client per il pre-rendering, ed è una cosa diversa abbastanza da
 * meritarsi un file: qui la chiave è la stessa anon (sola lettura, pubblica),
 * ma il client si costruisce alla chiamata e non all'import.
 *
 * Costruirlo alla chiamata non è un dettaglio: `next build` valuta ogni modulo,
 * e un client creato al momento dell'import fa fallire la build quando le
 * variabili d'ambiente non ci sono. Così invece la build passa e le pagine si
 * generano alla prima richiesta.
 */

import { createClient } from '@supabase/supabase-js';

let cache = null;

/** Il client, o `null` se il database non è configurato. */
export function db() {
  if (cache) return cache;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cache = createClient(url, key, { auth: { persistSession: false } });
  return cache;
}

/**
 * Una lettura che non fa cadere la build.
 *
 * In pre-rendering un database irraggiungibile non deve rompere il deploy:
 * meglio una pagina generata alla prima richiesta che un deploy fallito. Chi
 * chiama riceve `null` e decide — di solito `fallback: 'blocking'`.
 */
export async function leggi(costruisciQuery) {
  const client = db();
  if (!client) return null;
  try {
    const { data, error } = await costruisciQuery(client);
    if (error) {
      console.error('Supabase (server):', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Supabase (server) irraggiungibile:', e.message);
    return null;
  }
}
