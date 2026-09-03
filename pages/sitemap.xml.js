/**
 * pages/sitemap.xml.js
 * La sitemap, generata dal database invece che scritta a mano.
 *
 * Quella statica in `public/sitemap.xml` elencava 21 indirizzi. Il sito ne ha
 * qualche migliaio: 917 schede pilota, 78 circuiti, oltre mille Gran Premi.
 * Tutto il resto era invisibile a Google — non perché fosse escluso, ma perché
 * nessuno gli aveva detto che esisteva, e una pagina raggiungibile solo dopo
 * due clic dentro un elenco caricato in JavaScript, di fatto, non si trova.
 *
 * Un file a mano non è la soluzione: sarebbe già vecchio la domenica dopo.
 * Questa si ricostruisce da sola a ogni gara nuova.
 *
 * Il limite del formato è 50.000 URL per file; con qualche migliaio siamo
 * larghi, ma se un giorno si superasse serve un sitemap index.
 */

import { leggi } from '../lib/supabaseServer';

const BASE = 'https://formula-rossa.it';

/* Le pagine fisse, con la frequenza con cui cambiano davvero: la home e le
   classifiche si muovono a ogni gara, le pagine legali quasi mai. Dichiarare
   "daily" su tutto è il modo più veloce per farsi ignorare questi campi. */
const STATICHE = [
  ['/',                     '1.0', 'daily'],
  ['/standings',            '0.9', 'daily'],
  ['/statistics',           '0.9', 'weekly'],
  ['/piloti',               '0.9', 'weekly'],
  ['/circuiti',             '0.8', 'monthly'],
  ['/gp',                   '0.8', 'weekly'],
  ['/news',                 '0.8', 'daily'],
  ['/fanta',                '0.8', 'weekly'],
  ['/fanzone',              '0.7', 'monthly'],
  ['/games/trivia',         '0.5', 'monthly'],
  ['/games/pitstop',        '0.5', 'monthly'],
  ['/games/circuit-rush',   '0.5', 'monthly'],
  ['/about',                '0.5', 'yearly'],
  ['/stats/wins',           '0.7', 'weekly'],
  ['/stats/podiums',        '0.7', 'weekly'],
  ['/stats/poles',          '0.7', 'weekly'],
  ['/stats/fastest-laps',   '0.7', 'weekly'],
  ['/stats/points',         '0.7', 'weekly'],
  ['/stats/grand-slams',    '0.7', 'weekly'],
  ['/legal/privacy',        '0.3', 'yearly'],
  ['/legal/cookies',        '0.3', 'yearly'],
  ['/legal/terms',          '0.3', 'yearly'],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const nodo = ({ loc, lastmod, priority, changefreq }) => [
  '  <url>',
  `    <loc>${esc(BASE + loc)}</loc>`,
  lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
  changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
  priority ? `    <priority>${priority}</priority>` : null,
  '  </url>',
].filter(Boolean).join('\n');

export async function getServerSideProps({ res }) {
  const oggi = new Date().toISOString().slice(0, 10);

  /* Tre letture in parallelo. Se il database non risponde, `leggi` torna
     `null` e la sitemap esce con le sole pagine fisse: una sitemap ridotta è
     comunque meglio di un 500, che Search Console interpreta come "sparita". */
  const [piloti, circuiti, gare] = await Promise.all([
    leggi(c => c.from('driver').select('id').order('id')),
    leggi(c => c.from('circuit').select('id').order('id')),
    leggi(c => c.from('race').select('year, round, date').order('year', { ascending: false }).order('round')),
  ]);

  const url = [
    ...STATICHE.map(([loc, priority, changefreq]) => ({ loc, lastmod: oggi, priority, changefreq })),

    ...(piloti || []).map(p => ({
      loc: `/piloti/${p.id}`, priority: '0.6', changefreq: 'monthly',
    })),

    ...(circuiti || []).map(c => ({
      loc: `/circuiti/${c.id}`, priority: '0.6', changefreq: 'monthly',
    })),

    /* Le gare passate non cambiano più: `lastmod` è il giorno della corsa e
       `changefreq` è "never". È l'informazione che fa risparmiare a Google le
       visite inutili — e con mille pagine la differenza si sente. */
    ...(gare || []).map(g => {
      const passata = g.date && new Date(g.date) < new Date();
      return {
        loc: `/gp/${g.year}/${g.round}`,
        lastmod: g.date || undefined,
        priority: passata ? '0.5' : '0.7',
        changefreq: passata ? 'never' : 'daily',
      };
    }),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...url.map(nodo),
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  // Un'ora di cache, poi si rigenera in background: la sitemap non è una
  // pagina da ricalcolare a ogni passaggio di un crawler.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() { return null; }
