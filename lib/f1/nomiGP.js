/**
 * lib/f1/nomiGP.js
 * I nomi italiani dei Gran Premi, a partire dall'id di F1DB (grand_prix.id).
 *
 * Nel database i nomi sono in inglese ("Great Britain", "United States"):
 * per i testi del sito servono "GP di Gran Bretagna", "GP degli Stati Uniti".
 * Se un id manca, `nomeGP` usa il nome inglese che gli si passa.
 */

const NOMI = {
  'abu-dhabi': 'GP di Abu Dhabi',
  argentina: 'GP d’Argentina',
  australia: 'GP d’Australia',
  austria: 'GP d’Austria',
  azerbaijan: 'GP dell’Azerbaigian',
  bahrain: 'GP del Bahrein',
  'barcelona-catalunya': 'GP di Barcellona',
  belgium: 'GP del Belgio',
  brazil: 'GP del Brasile',
  canada: 'GP del Canada',
  china: 'GP di Cina',
  'emilia-romagna': 'GP dell’Emilia-Romagna',
  europe: 'GP d’Europa',
  france: 'GP di Francia',
  germany: 'GP di Germania',
  'great-britain': 'GP di Gran Bretagna',
  hungary: 'GP d’Ungheria',
  india: 'GP d’India',
  italy: 'GP d’Italia',
  japan: 'GP del Giappone',
  'las-vegas': 'GP di Las Vegas',
  madrid: 'GP di Madrid',
  malaysia: 'GP di Malesia',
  mexico: 'GP del Messico',
  'mexico-city': 'GP di Città del Messico',
  miami: 'GP di Miami',
  monaco: 'GP di Monaco',
  netherlands: 'GP d’Olanda',
  portugal: 'GP del Portogallo',
  qatar: 'GP del Qatar',
  russia: 'GP di Russia',
  'san-marino': 'GP di San Marino',
  'sao-paulo': 'GP di San Paolo',
  'saudi-arabia': 'GP d’Arabia Saudita',
  singapore: 'GP di Singapore',
  'south-africa': 'GP del Sudafrica',
  spain: 'GP di Spagna',
  styria: 'GP di Stiria',
  turkey: 'GP di Turchia',
  tuscany: 'GP di Toscana',
  'united-states': 'GP degli Stati Uniti',
};

export function nomeGP(id, fallback) {
  return NOMI[id] || (fallback ? `GP ${fallback}` : id);
}
