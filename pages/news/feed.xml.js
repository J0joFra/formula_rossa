/**
 * pages/news/feed.xml.js
 * Il feed RSS delle news del sito.
 *
 * Serve a tre cose, in ordine di utilità:
 * 1. chi vuole seguire il sito da un lettore di feed può farlo;
 * 2. i motori di ricerca e i crawler degli LLM trovano gli articoli nuovi
 *    senza aspettare la prossima scansione della sitemap;
 * 3. è il punto di partenza per ripubblicare altrove — su Medium, per
 *    esempio, dove lo strumento di import vuole l'indirizzo di un articolo.
 *
 * L'archivio tiene gli articoli 30 giorni: il feed rispecchia quella finestra,
 * perché un feed che elenca articoli cancellati manda i lettori su un 404.
 */

import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE = 'https://formula-rossa.it';
const RETENTION_DAYS = 30;
const MAX_ITEMS = 30;

/* Nel testo di un feed vive dentro XML, quindi i cinque caratteri che
   romperebbero il documento vanno sostituiti. Per l'HTML dell'articolo si usa
   invece CDATA: farne l'escape carattere per carattere lo renderebbe
   illeggibile ai lettori di feed, che si aspettano marcatura vera. */
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/* `]]>` dentro il contenuto chiuderebbe la sezione CDATA in anticipo e
   spezzerebbe il feed. È raro, ma l'HTML arriva da un modello linguistico:
   "raro" e "impossibile" non sono la stessa cosa. */
const cdata = (s = '') => `<![CDATA[${String(s).replace(/]]>/g, ']]&gt;')}]]>`;

export async function getServerSideProps({ res }) {
  let articoli = [];
  try {
    const q = query(collection(db, 'news'), orderBy('published_at', 'desc'), limit(MAX_ITEMS));
    const snapshot = await getDocs(q);
    const limite = Date.now() - RETENTION_DAYS * 86400000;

    articoli = snapshot.docs
      .map((d) => {
        const dati = d.data();
        return {
          titolo: dati.title || '',
          slug: dati.slug || d.id,
          html: dati.html_content || '',
          estratto: dati.excerpt || '',
          tag: dati.tags || [],
          autore: dati.author || 'Redazione Formula Rossa',
          data: dati.published_at?.toDate?.() || null,
        };
      })
      .filter((a) => a.data && a.data.getTime() >= limite);
  } catch (e) {
    /* Un feed vuoto è un contrattempo; un 500 dice ai lettori che il feed non
       esiste più, e alcuni si disiscrivono da soli dopo qualche tentativo. */
    console.error('News — feed RSS:', e);
  }

  const aggiornato = articoli[0]?.data || new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Formula Rossa — News</title>
    <link>${BASE}/news</link>
    <atom:link href="${BASE}/news/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notizie di Formula 1 con il punto di vista sulla Scuderia Ferrari, da Formula Rossa.</description>
    <language>it-IT</language>
    <lastBuildDate>${aggiornato.toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
${articoli.map((a) => `    <item>
      <title>${esc(a.titolo)}</title>
      <link>${BASE}/news/${esc(a.slug)}</link>
      <guid isPermaLink="true">${BASE}/news/${esc(a.slug)}</guid>
      <pubDate>${a.data.toUTCString()}</pubDate>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${esc(a.autore)}</dc:creator>
      <description>${esc(a.estratto)}</description>
      <content:encoded>${cdata(a.html)}</content:encoded>
${a.tag.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`).join('\n')}
  </channel>
</rss>
`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Feed() { return null; }
