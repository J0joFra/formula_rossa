/**
 * scripts/fetchDriverPhotos.mjs
 * Raccoglie i ritratti dei piloti da Wikidata / Wikimedia Commons.
 *
 *   node scripts/fetchDriverPhotos.mjs            # tutti i piloti
 *   node scripts/fetchDriverPhotos.mjs --limit 20 # prova su venti
 *   node scripts/fetchDriverPhotos.mjs --force    # riscarica anche i già presi
 *
 * Perché non immagini generate: il sito vive del fatto che i suoi numeri si
 * possono controllare. Un volto inventato accanto a un nome vero lavora contro
 * quella promessa — e per i piloti in vita è anche un problema di diritto
 * all'immagine. Su Commons ci sono ritratti veri, con licenza libera: costano
 * solo la fatica di andarli a prendere e l'obbligo di citare l'autore.
 *
 * Lo script:
 * 1. cerca il pilota su Wikidata per nome, e conferma con la data di nascita —
 *    i nomi si ripetono, le date quasi mai;
 * 2. legge P18 (immagine) e scarica il ritaglio a 400px;
 * 3. salva l'autore e la licenza, che vanno mostrati: è la condizione a cui
 *    quelle immagini si possono usare;
 * 4. scrive `lib/driverPhotos.json`, che il sito legge per sapere chi ha una
 *    foto senza dover interrogare il disco a ogni render.
 *
 * Wikimedia chiede uno User-Agent che dica chi sei: mettilo prima di lanciarlo.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const USER_AGENT = 'FormulaRossa/1.0 (https://formula-rossa.it; info@formula-rossa.it)';
const DESTINAZIONE = resolve('./public/data/piloti');
const MANIFESTO = resolve('./lib/driverPhotos.json');
const LARGHEZZA = 400;

/* Wikimedia non pubblica un limite fisso: chiede di non aprire più di una
   manciata di richieste in parallelo. Una alla volta con una pausa breve è
   lento (circa venti minuti per novecento piloti) ma non fa arrabbiare
   nessuno, e questo script si lancia una volta ogni tanto. */
const PAUSA_MS = 120;

const args = process.argv.slice(2);
const limite = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;
const forza = args.includes('--force');

const attesa = (ms) => new Promise(r => setTimeout(r, ms));

async function chiedi(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${res.status} su ${url}`);
  return res.json();
}

/** L'entità Wikidata del pilota, confermata dalla data di nascita. */
async function trovaEntita(nome, dataNascita) {
  const cerca = 'https://www.wikidata.org/w/api.php?action=wbsearchentities'
    + `&search=${encodeURIComponent(nome)}&language=en&type=item&limit=5&format=json&origin=*`;
  const { search = [] } = await chiedi(cerca);
  if (!search.length) return null;

  for (const risultato of search) {
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${risultato.id}.json`;
    const dati = await chiedi(url);
    const claims = dati.entities?.[risultato.id]?.claims;
    if (!claims) continue;

    // Dev'essere una persona (P31 = Q5): "Ferrari" è un'entità, non un pilota.
    const umano = claims.P31?.some(c => c.mainsnak?.datavalue?.value?.id === 'Q5');
    if (!umano) continue;

    /* Se conosciamo la data di nascita, dev'essere quella: i nomi si
       ripetono (ci sono due Jack Brabham in famiglia), le date no. Senza
       data si accetta il primo risultato umano, ed è il caso in cui gli
       errori si nascondono — per questo finiscono nel rapporto. */
    if (dataNascita) {
      const p569 = claims.P569?.[0]?.mainsnak?.datavalue?.value?.time; // +1997-10-16T00:00:00Z
      const anno = p569?.slice(1, 11);
      if (!anno) continue;
      if (anno !== dataNascita) continue;
    }

    const file = claims.P18?.[0]?.mainsnak?.datavalue?.value;
    return { qid: risultato.id, file: file || null, confermato: Boolean(dataNascita) };
  }
  return null;
}

/** Autore e licenza dell'immagine: senza, non la si può pubblicare. */
async function creditiCommons(file) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo'
    + `&iiprop=extmetadata|url&titles=File:${encodeURIComponent(file)}&format=json&origin=*`;
  const dati = await chiedi(url);
  const pagine = dati.query?.pages || {};
  const info = Object.values(pagine)[0]?.imageinfo?.[0];
  const meta = info?.extmetadata || {};
  const testo = (v) => (v?.value || '').replace(/<[^>]*>/g, '').trim();
  return {
    autore: testo(meta.Artist) || 'sconosciuto',
    licenza: testo(meta.LicenseShortName) || 'sconosciuta',
    pagina: info?.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
  };
}

/* Commons ospita solo immagini libere, ma la licenza va comunque letta e
   mostrata. Queste sono quelle che sappiamo citare correttamente; una licenza
   che non riconosciamo fa saltare l'immagine, invece di pubblicarla senza
   sapere a quali condizioni. */
const LICENZE_NOTE = [
  'cc0', 'public domain', 'pd-', 'cc by', 'cc-by', 'cc by-sa', 'cc-by-sa',
];
const licenzaAmmessa = (l) => LICENZE_NOTE.some(x => l.toLowerCase().includes(x));

async function scarica(file, destinazione) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${LARGHEZZA}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`immagine ${res.status}`);
  writeFileSync(destinazione, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  if (!existsSync(DESTINAZIONE)) mkdirSync(DESTINAZIONE, { recursive: true });

  const piloti = JSON.parse(readFileSync(resolve('./data/f1db-drivers.json'), 'utf-8'))
    // Chi non ha mai preso il via non compare in nessuna classifica del sito.
    .filter(d => (d.totalRaceStarts || 0) > 0)
    // I più titolati per primi: se lo si interrompe, si è preso il meglio.
    .sort((a, b) => (b.totalRaceStarts || 0) - (a.totalRaceStarts || 0))
    .slice(0, limite);

  const manifesto = existsSync(MANIFESTO)
    ? JSON.parse(readFileSync(MANIFESTO, 'utf-8'))
    : {};

  let presi = 0, saltati = 0, senzaFoto = 0, errori = 0;
  const dubbi = [];

  for (const [i, d] of piloti.entries()) {
    const id = d.id;
    if (manifesto[id] && !forza) { saltati++; continue; }

    process.stdout.write(`[${i + 1}/${piloti.length}] ${d.fullName} … `);
    try {
      const ent = await trovaEntita(d.fullName, d.dateOfBirth || null);
      if (!ent?.file) { console.log('nessuna immagine'); senzaFoto++; await attesa(PAUSA_MS); continue; }

      const crediti = await creditiCommons(ent.file);
      if (!licenzaAmmessa(crediti.licenza)) {
        console.log(`licenza non riconosciuta (${crediti.licenza}) — saltata`);
        senzaFoto++; await attesa(PAUSA_MS); continue;
      }

      await scarica(ent.file, resolve(DESTINAZIONE, `${id}.jpg`));
      manifesto[id] = { ...crediti, qid: ent.qid };
      if (!ent.confermato) dubbi.push(`${id} (${d.fullName}) — senza data di nascita da confrontare`);
      presi++;
      console.log(`ok — ${crediti.licenza}`);
    } catch (e) {
      console.log(`errore: ${e.message}`);
      errori++;
    }
    await attesa(PAUSA_MS);

    // Si salva strada facendo: un'interruzione non butta via il lavoro fatto.
    if (presi % 25 === 0) writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 1));
  }

  writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 1));

  console.log(`\nscaricate ${presi} · già presenti ${saltati} · senza immagine ${senzaFoto} · errori ${errori}`);
  console.log(`totale in manifesto: ${Object.keys(manifesto).length}`);
  if (dubbi.length) {
    console.log(`\nDa controllare a mano — abbinati senza data di nascita (${dubbi.length}):`);
    dubbi.forEach(x => console.log('  ' + x));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
