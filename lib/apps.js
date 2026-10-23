/**
 * lib/apps.js
 * Le app di Formula Rossa, in un posto solo.
 *
 * Il sito ne parla in più punti (menu, Fan Zone, home, footer): testi e link
 * stanno qui, così quando Driver Clash esce dal test chiuso basta cambiare
 * `status` e `url` in questo file.
 */

import { GRIDUP_URL, GRIDUP_ICON_URL } from './gridup';

/** Indirizzo per chiedere di entrare nel test chiuso di Driver Clash. */
const TEST_MAIL = 'mailto:info@formula-rossa.it?subject=' + encodeURIComponent('Voglio provare Driver Clash');

export const GRIDUP = {
  id: 'gridup',
  name: 'GridUp',
  tagline: 'Il calcolatore del Mondiale F1',
  desc: 'Calcola i punti che servono per vincere il titolo, esplora gli scenari in tempo reale e consulta le classifiche di piloti e costruttori.',
  status: 'live',
  statusLabel: 'Su Google Play',
  url: GRIDUP_URL,
  cta: 'Scarica su Google Play',
  icon: GRIDUP_ICON_URL,
};

export const DRIVER_CLASH = {
  id: 'driver-clash',
  name: 'Driver Clash',
  tagline: 'Il gioco di sfide tra piloti',
  desc: 'Il nuovo gioco di Formula Rossa: scegli i tuoi piloti e sfida gli altri tifosi. È in test chiuso su Google Play: scrivici per provarlo prima di tutti.',
  status: 'test',
  statusLabel: 'Test chiuso',
  url: TEST_MAIL,
  cta: 'Chiedi di provarlo',
  icon: null,
};

export const APPS = [GRIDUP, DRIVER_CLASH];
