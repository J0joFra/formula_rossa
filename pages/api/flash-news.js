/**
 * pages/api/flash-news.js
 * Le flash news della home, lette dal feed RSS di Motorsport.com lato server.
 *
 * Prima il browser passava da api.rss2json.com: un servizio gratuito con un
 * tetto di richieste, che quando lo superava rispondeva con un errore e la
 * sezione restava vuota. Qui il feed si legge direttamente e la risposta resta
 * in cache sulla CDN per mezz'ora, quindi a Motorsport.com arriva una richiesta
 * ogni trenta minuti, non una per visitatore.
 */

const RSS_URL = 'https://it.motorsport.com/rss/f1/news/';

/** Il testo di un tag, con o senza CDATA; stringa vuota se manca. */
function tag(xml, nome) {
  const m = xml.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`, 'i'));
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
}

const ENTITA = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
const decodifica = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&(amp|lt|gt|quot|apos|#39);/g, (e) => ENTITA[e]);

/** L'immagine sta nell'enclosure o in un <img> dentro la descrizione. */
function immagine(item) {
  const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosure) return enclosure[1];
  const media = item.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i);
  if (media) return media[1];
  const img = decodifica(tag(item, 'description')).match(/<img[^>]+src="([^">]+)"/i);
  return img ? img[1] : null;
}

export default async function handler(req, res) {
  try {
    const risposta = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FormulaRossaBot/1.0; +https://formula-rossa.it)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!risposta.ok) throw new Error(`feed HTTP ${risposta.status}`);
    const xml = await risposta.text();

    const items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)]
      .slice(0, 6)
      .map(([item]) => ({
        title: decodifica(tag(item, 'title')),
        link: tag(item, 'link'),
        guid: tag(item, 'guid'),
        pubDate: tag(item, 'pubDate'),
        description: decodifica(tag(item, 'description')).replace(/<[^>]*>?/gm, '').trim(),
        thumbnail: immagine(item),
      }))
      .filter((i) => i.title && i.link);

    if (!items.length) throw new Error('feed vuoto');

    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({ items });
  } catch (err) {
    console.error('Flash news:', err);
    /* Cache breve anche sull'errore: se il feed è giù non serve martellarlo. */
    res.setHeader('Cache-Control', 'public, s-maxage=120');
    return res.status(502).json({ items: [] });
  }
}
