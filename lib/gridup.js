/**
 * lib/gridup.js
 * Gli indirizzi di GridUp, in un posto solo.
 *
 * `https://gridup-f1.web.app` era ripetuto in sette file e mandava chi cliccava
 * sulla web app — che a sua volta rimbalzava su un indirizzo Vercel. Chi arriva
 * dal sito vuole installare l'app, quindi la destinazione di ogni "GridUp" è
 * ora la scheda su Google Play: un passaggio in meno e un indirizzo che non
 * cambia quando cambia l'hosting della web app.
 *
 * La versione web ora vive su Vercel ed è incorporata nel sito in /gioca/gridup
 * (vedi lib/apps.js); l'icona è servita da lì.
 */

/** Dove mandare chiunque clicchi "GridUp": la scheda su Google Play. */
export const GRIDUP_URL = 'https://play.google.com/store/apps/details?id=com.gridup.app';

/** Alias esplicito, per i punti in cui il codice parla proprio dello store. */
export const GRIDUP_PLAY_URL = GRIDUP_URL;

/** L'icona dell'app, servita dalla web app. */
export const GRIDUP_ICON_URL = 'https://fanta-f1-three.vercel.app/icons/icon-192.png';
