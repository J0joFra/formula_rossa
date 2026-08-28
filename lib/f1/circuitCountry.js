/**
 * lib/f1/circuitCountry.js
 * Circuito → codice nazione, per le bandiere del Live Timing.
 * Estratto da pages/live-timing.jsx (1.770 righe) per separare i dati dalla UI.
 */

export const CIRCUIT_COUNTRY = {
  'monza': 'it', 'autodromo_nazionale_di_monza': 'it', 'milan': 'it', 'imola': 'it', 'enzo_e_dino_ferrari': 'it',
  'mugello': 'it', 'bologna': 'it', 'pescara': 'it', 'silverstone': 'gb', 'silverstone_circuit': 'gb',
  'northamptonshire': 'gb', 'brands_hatch': 'gb', 'kent': 'gb', 'donington': 'gb', 'aintree': 'gb',
  'liverpool': 'gb', 'spa': 'be', 'spa_francorchamps': 'be', 'stavelot': 'be', 'zolder': 'be',
  'heusden_zolder': 'be', 'nivelles': 'be', 'brussels': 'be', 'zandvoort': 'nl', 'circuit_zandvoort': 'nl',
  'catalunya': 'es', 'barcelona': 'es', 'montmelo': 'es', 'jerez': 'es', 'valencia': 'es',
  'valencia_street_circuit': 'es', 'pedralbes': 'es', 'montjuic': 'es', 'madrid': 'es', 'madring': 'es', 'jarama': 'es',
  'hungaroring': 'hu', 'budapest': 'hu', 'mogyorod': 'hu', 'red_bull_ring': 'at', 'spielberg': 'at',
  'zeltweg': 'at', 'oesterreichring': 'at', 'styria': 'at', 'magny_cours': 'fr', 'nevers': 'fr',
  'paul_ricard': 'fr', 'le_castellet': 'fr', 'ricard': 'fr', 'reims': 'fr', 'dijon': 'fr',
  'dijon_prenois': 'fr', 'rouen': 'fr', 'essarts': 'fr', 'charade': 'fr', 'clermont_ferrand': 'fr',
  'lemans': 'fr', 'nurburgring': 'de', 'nurburg': 'de', 'hockenheimring': 'de', 'hockenheim': 'de',
  'avus': 'de', 'berlin': 'de', 'estoril': 'pt', 'cascais': 'pt', 'portimao': 'pt',
  'algarve': 'pt', 'boavista': 'pt', 'oporto': 'pt', 'monsanto': 'pt', 'lisbon': 'pt',
  'bremgarten': 'ch', 'bern': 'ch', 'anderstorp': 'se', 'scandinavian_raceway': 'se', 'monaco': 'mc',
  'monte_carlo': 'mc', 'circuit_de_monaco': 'mc', 'bakú': 'az', 'baku': 'az', 'azerbaijan': 'az',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'circuit_of_the_americas': 'us', 'miami': 'us',
  'miami_international_autodrome': 'us', 'vegas': 'us', 'las_vegas': 'us', 'las_vegas_strip': 'us', 'caesars_palace': 'us',
  'indianapolis': 'us', 'indianapolis_motor_speedway': 'us', 'watkins_glen': 'us', 'long_beach': 'us', 'phoenix': 'us',
  'detroit': 'us', 'dallas': 'us', 'sebring': 'us', 'riverside': 'us', 'villeneuve': 'ca',
  'montreal': 'ca', 'circuit_gilles_villeneuve': 'ca', 'mosport': 'ca', 'bowmanville': 'ca', 'tremblant': 'ca',
  'st_jovite': 'ca', 'interlagos': 'br', 'sao_paulo': 'br', 'são_paulo': 'br', 'jose_carlos_pace': 'br',
  'jacarepagua': 'br', 'rio_de_janeiro': 'br', 'rodriguez': 'mx', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'galvez': 'ar', 'buenos_aires': 'ar', 'oscar_galvez': 'ar',
  'juan_y_oscar_galvez': 'ar', 'juan_y_ignacio_cobos': 'ar', 'carlos_pace': 'br', 'juan_y_ignacio_cobos': 'ar',
  'suzuka': 'jp', 'suzuka_circuit': 'jp', 'mie': 'jp', 'fuji': 'jp', 'fuji_speedway': 'jp',
  'oyama': 'jp', 'okayama': 'jp', 'ti_circuit': 'jp', 'shanghai': 'cn', 'shanghai_international_circuit': 'cn',
  'marina_bay': 'sg', 'singapore': 'sg', 'sepang': 'my', 'kuala_lumpur': 'my', 'yeongam': 'kr',
  'korea_international_circuit': 'kr', 'buddh': 'in', 'greater_noida': 'in', 'bahrain': 'bh', 'sakhir': 'bh',
  'manama': 'bh', 'bahrain_international_circuit': 'bh', 'losail': 'qa', 'lusail': 'qa', 'lusail_international_circuit': 'qa',
  'jeddah': 'sa', 'jeddah_corniche_circuit': 'sa', 'yas_marina': 'ae', 'abu_dhabi': 'ae', 'yas_marina_circuit': 'ae',
  'istanbul': 'tr', 'istanbul_park': 'tr', 'sochi': 'ru', 'sochi_autodrom': 'ru', 'kyalami': 'za',
  'midrand': 'za', 'george': 'za', 'prince_george': 'za', 'adelaide': 'au', 'albert_park': 'au',
  'melbourne': 'au', 'ain_diab': 'ma', 'casablanca': 'ma',
  'albert_park': 'au', 'marina_bay': 'sg', 'yas_marina': 'ae', 'paul_ricard': 'fr', 'watkins_glen': 'us',
  'long_beach': 'us', 'las_vegas': 'us', 'jose_carlos_pace': 'br', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'red_bull_ring': 'at', 'silverstone_circuit': 'gb', 'spa_francorchamps': 'be', 'circuit_de_monaco': 'mc', 'fuji_speedway': 'jp'
};
var getFlagCode = (loc = '') => {
  const l = loc.toLowerCase();
  for (const [k, v] of Object.entries(CIRCUIT_COUNTRY)) if (l.includes(k)) return v;
  return '';
};
var formatTime = (s) => {
  if (!s) return '—';
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(3).padStart(6, '0')}`;
};
var formatDelta = (d) => d == null ? '—' : (d > 0 ? '+' : '') + d.toFixed(3) + 's';
var FALLBACK_COLORS = ['#ef4444','#3b82f6','#f59e0b','#22c55e','#a855f7',
  '#ec4899','#06b6d4','#f97316','#84cc16','#14b8a6'];

// ─── Hooks ────────────────────────────────────────────────────────────────────
