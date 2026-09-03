/**
 * scripts/generaOgImage.mjs
 * Genera public/og-formula-rossa.jpg, l'immagine che compare quando qualcuno
 * incolla un link del sito su WhatsApp, X, LinkedIn o Slack.
 *
 * Prima come og:image c'era il logo: un quadrato 500×500 dichiarato nei meta
 * come 1200×630. I social si aspettano quel formato e ritagliavano il logo
 * a caso.
 *
 * Si esegue a mano, quando cambiano il logo o i numeri:
 *   node scripts/generaOgImage.mjs
 *
 * È una pagina HTML fotografata a 1200×630 con il Chromium di Playwright, che
 * è già una dipendenza di sviluppo: nessuna libreria grafica in più per
 * un'immagine che si rifà una volta all'anno.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const logo = 'data:image/png;base64,' + fs.readFileSync('public/data/images/formula-rossa-logo.png').toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#0a0d10;color:#fff;
       font-family:'Helvetica Neue',Arial,sans-serif;position:relative;overflow:hidden}
  .glow{position:absolute;width:900px;height:900px;border-radius:50%;
        background:radial-gradient(circle,rgba(220,38,38,.35) 0%,transparent 62%);
        right:-260px;top:-300px}
  .glow2{position:absolute;width:700px;height:700px;border-radius:50%;
         background:radial-gradient(circle,rgba(231,184,78,.12) 0%,transparent 65%);
         left:-260px;bottom:-320px}
  .wrap{position:relative;height:100%;display:flex;flex-direction:column;
        justify-content:center;padding:0 84px}
  .brand{display:flex;align-items:center;gap:22px;margin-bottom:44px}
  .brand img{width:82px;height:82px;border-radius:20px;background:#12171c;padding:6px}
  .name{font-size:44px;font-weight:800;letter-spacing:-.5px}
  .name span{color:#e8373c}
  .kicker{font-size:15px;letter-spacing:.34em;text-transform:uppercase;
          color:#8b949e;margin-top:6px;font-weight:700}
  h1{font-size:74px;line-height:1.04;font-weight:800;letter-spacing:-2px;max-width:15ch}
  h1 em{font-style:normal;color:#e8373c}
  .sub{margin-top:26px;font-size:25px;color:#aab3bd;max-width:34ch;line-height:1.4}
  .bar{position:absolute;left:0;right:0;bottom:0;height:9px;
       background:linear-gradient(90deg,#e8373c 0%,#e8373c 62%,#E7B84E 62%,#E7B84E 100%)}
  .stats{position:absolute;right:84px;bottom:70px;text-align:right}
  .stats b{display:block;font-size:52px;font-weight:800;letter-spacing:-1px}
  .stats i{font-style:normal;font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:#8b949e}
</style></head><body>
  <div class="glow"></div><div class="glow2"></div>
  <div class="wrap">
    <div class="brand">
      <img src="${logo}" alt="">
      <div><div class="name">FORMULA<span>ROSSA</span></div>
      <div class="kicker">Data Intelligence</div></div>
    </div>
    <h1>Statistiche e storia della <em>Scuderia Ferrari</em></h1>
    <div class="sub">77 stagioni, oltre 1.100 Gran Premi, ogni pilota e ogni circuito.</div>
  </div>
  <div class="stats"><b>1950–2026</b><i>Archivio completo</i></div>
  <div class="bar"></div>
</body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: 'load' });
await p.screenshot({ path: 'public/og-formula-rossa.jpg', type: 'jpeg', quality: 88 });
await b.close();
console.log('public/og-formula-rossa.jpg — 1200×630');
