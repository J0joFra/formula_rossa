/**
 * lib/driverPhoto.js
 * La foto di un pilota, e come inquadrarla.
 *
 * In public/data/ferrari-drivers/ ci sono due insiemi di immagini:
 *
 * - i render ufficiali della griglia 2026, in .avif, con il nome che usa la
 *   Formula 1: <anno><scuderia><3 lettere del nome><3 del cognome>01right.
 *   Da `2026ferrarichalec01right.avif` non si torna a `charles-leclerc` con
 *   una regola — "cha"+"lec" è una sigla, non una troncatura reversibile —
 *   quindi la corrispondenza è scritta a mano qui sotto. Sono ventidue file
 *   che finora nessuna riga di codice apriva.
 *
 * - le foto storiche dei piloti Ferrari, in .jpg, chiamate come l'id del
 *   pilota (`michael-schumacher.jpg`).
 *
 * A queste si aggiungono i ritratti raccolti da Wikimedia Commons con
 * `scripts/fetchDriverPhotos.mjs`, che stanno in public/data/piloti/ e sono
 * elencati in driverPhotos.json insieme all'autore e alla licenza. L'elenco
 * serve perché il browser non può guardare in una cartella: senza, ogni pilota
 * senza foto genererebbe una richiesta a vuoto. Finché lo script non gira il
 * file è vuoto e non cambia niente.
 *
 * I render vengono prima: sono ritagli su fondo trasparente, tutti inquadrati
 * allo stesso modo, quindi come avatar stanno bene insieme. Le foto storiche
 * coprono chi non è più in griglia. Chi non ha né l'uno né l'altro resta con
 * le iniziali, che è il ripiego già in uso.
 */

/** Griglia 2026 (più Gasly e Alonso, i cui render sono del 2025). */
const RENDER_2026 = {
  'pierre-gasly':      '2025alpinepiegas01right',
  'fernando-alonso':   '2025astonmartinferalo01right',
  'franco-colapinto':  '2026alpinefracol01right',
  'lance-stroll':      '2026astonmartinlanstr01right',
  'gabriel-bortoleto': '2026audigabbor01right',
  'nico-hulkenberg':   '2026audinichul01right',
  'sergio-perez':      '2026cadillacserper01right',
  'valtteri-bottas':   '2026cadillacvalbot01right',
  'charles-leclerc':   '2026ferrarichalec01right',
  'lewis-hamilton':    '2026ferrarilewham01right',
  'esteban-ocon':      '2026haasf1teamestoco01right',
  'oliver-bearman':    '2026haasf1teamolibea01right',
  'lando-norris':      '2026mclarenlannor01right',
  'oscar-piastri':     '2026mclarenoscpia01right',
  // Il file dice "and"+"ant": il nome completo è Andrea Kimi Antonelli,
  // mentre in archivio il pilota è registrato come Kimi.
  'kimi-antonelli':    '2026mercedesandant01right',
  'george-russell':    '2026mercedesgeorus01right',
  'arvid-lindblad':    '2026racingbullsarvlin01right',
  'liam-lawson':       '2026racingbullslialaw01right',
  'isack-hadjar':      '2026redbullracingisahad01right',
  'max-verstappen':    '2026redbullracingmaxver01right',
  'alexander-albon':   '2026williamsalealb01right',
  'carlos-sainz-jr':   '2026williamscarsai01right',
};

/** I piloti Ferrari con una foto storica in .jpg, per id. */
const STORICI = new Set([
  'alain-prost', 'alberto-ascari', 'ayrton-senna', 'carlos-reutemann',
  'carlos-sainz-jr', 'charles-leclerc', 'clay-regazzoni', 'eddie-irvine',
  'felipe-massa', 'fernando-alonso', 'gerhard-berger', 'gilles-villeneuve',
  'jacky-ickx', 'jody-scheckter', 'john-surtees', 'jose-froilan-gonzalez',
  'juan-manuel-fangio', 'kimi-raikkonen', 'lewis-hamilton',
  'michael-schumacher', 'michele-alboreto', 'mike-hawthorn', 'niki-lauda',
  'peter-collins', 'phil-hill', 'rene-arnoux', 'rubens-barrichello',
  'sebastian-vettel',
]);

import COMMONS from './driverPhotos.json';

const BASE = '/data/ferrari-drivers';
const BASE_COMMONS = '/data/piloti';

/**
 * Dal nome del pilota al suo id d'archivio.
 *
 * Serve dove si ha solo il nome per esteso, come nelle classifiche di
 * /statistics. Gli accenti spariscono (`Räikkönen` → `raikkonen`) perché così
 * sono scritti i nomi dei file e gli id.
 */
export function driverIdFromName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/** L'indirizzo della foto, o `null` se per quel pilota non ce n'è una. */
export function driverPhoto(driverId, name) {
  const id = driverId || driverIdFromName(name);
  if (!id) return null;
  if (RENDER_2026[id]) return `${BASE}/${RENDER_2026[id]}.avif`;
  if (STORICI.has(id)) return `${BASE}/${id}.jpg`;
  if (COMMONS[id]) return `${BASE_COMMONS}/${id}.jpg`;
  return null;
}

/**
 * Autore e licenza della foto, quando viene da Commons.
 *
 * Non è un dettaglio da rimandare: quelle immagini si possono pubblicare a
 * condizione di citare chi le ha scattate. I render della Formula 1 e le foto
 * storiche non passano di qui e restituiscono `null`.
 */
export function driverPhotoCredit(driverId, name) {
  const id = driverId || driverIdFromName(name);
  if (!id || RENDER_2026[id] || STORICI.has(id)) return null;
  return COMMONS[id] || null;
}

/**
 * Come inquadrare la foto dentro un cerchio.
 *
 * I render sono figure intere su fondo trasparente (440×1265): dentro un
 * cerchio, senza ritaglio, si vedrebbe un pilota alto due millimetri. Questi
 * valori — larghezza 170%, alzata del 6% — portano in inquadratura testa e
 * spalle, lasciando vedere il colletto della tuta: a colpo d'occhio si
 * riconosce anche la scuderia. Le foto storiche sono già ritratti e si
 * comportano da sole con `object-fit: cover`.
 */
export function inquadratura(src) {
  const render = src?.endsWith('.avif');
  /* `maxWidth: 'none'` non è di contorno: il reset di Tailwind mette
     `img { max-width: 100% }`, che azzererebbe l'ingrandimento al 170% e
     lascerebbe nel cerchio la figura intera, alta pochi pixel. */
  return render
    ? { position: 'absolute', width: '170%', maxWidth: 'none', left: '-35%', top: '-6%' }
    : { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
}
