/**
 * lib/apps.js
 * Le app di Formula Rossa, in un posto solo.
 *
 * Il sito ne parla in più punti (menu, Fan Zone, home, footer, le pagine
 * /gioca/[app]): testi e link stanno qui. Quando Driver Clash esce dal test
 * chiuso basta cambiare `status`, `statusLabel`, `url` e `cta` in questo file.
 *
 * Ogni app ha due strade:
 *   - `webUrl`: la versione web, che il sito incorpora in /gioca/<id>;
 *   - `url`:    lo store (o, per Driver Clash, la mail per entrare nel test).
 */

import { GRIDUP_URL, GRIDUP_ICON_URL } from './gridup';

/** Indirizzo per chiedere di entrare nel test chiuso di Driver Clash. */
const TEST_MAIL = 'mailto:info@formula-rossa.it?subject=' + encodeURIComponent('Voglio provare Driver Clash su Android');

export const GRIDUP = {
  id: 'gridup',
  name: 'GridUp',
  tagline: 'Il calcolatore del Mondiale F1',
  desc: 'Calcola i punti che servono per vincere il titolo, esplora gli scenari in tempo reale e consulta le classifiche di piloti e costruttori.',
  status: 'live',
  statusLabel: 'Su Google Play',
  url: GRIDUP_URL,
  cta: 'Scarica su Google Play',
  webUrl: 'https://fanta-f1-three.vercel.app/',
  icon: GRIDUP_ICON_URL,
};

export const DRIVER_CLASH = {
  id: 'driver-clash',
  name: 'Driver Clash',
  tagline: 'Il gioco di carte della F1',
  desc: 'Un Top Trumps della Formula 1: ogni carta è un pilota con una scuderia e le sue statistiche reali. Costruisci i tuoi mazzi, sfida la CPU o un amico, apri pacchetti e completa la collezione: 794 piloti, 1.501 carte.',
  status: 'test',
  statusLabel: 'Android in test chiuso',
  url: TEST_MAIL,
  cta: 'Prova l’app Android',
  webUrl: 'https://f1cardbattle.vercel.app/',
  icon: '/data/images/driver-clash.png',
};

export const APPS = [GRIDUP, DRIVER_CLASH];

/** L'app con quell'id, o undefined. */
export const appById = (id) => APPS.find((a) => a.id === id);

/** La pagina del sito che incorpora la versione web dell'app. */
export const playPath = (app) => `/gioca/${app.id}`;
