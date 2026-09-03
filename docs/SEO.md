# SEO e GEO

Cosa è stato fatto perché il sito si trovi — su Google e dentro le risposte
degli LLM — e cosa resta da fare a mano.

## Il problema di fondo: le pagine erano vuote

Tutte le pagine caricavano i dati dal browser, dentro un `useEffect`. Chi
chiedeva la pagina senza eseguire JavaScript — Googlebot alla prima passata,
GPTBot, ClaudeBot, PerplexityBot, un'anteprima su WhatsApp — riceveva un HTML
che diceva "Caricamento pilota…" e nient'altro. Novecento schede piene di
statistiche erano, per chi indicizza, novecento pagine vuote e identiche.

La scheda di un pilota adesso serve 1.500-1.700 caratteri di testo reale.
Prima ne serviva zero.

| Pagina | Prima | Ora |
| --- | --- | --- |
| `/piloti` | guscio vuoto | ISR, 917 link alle schede nell'HTML |
| `/piloti/[slug]` | "Caricamento pilota…" | ISR, scheda completa |
| `/circuiti` | guscio vuoto | ISR, 78 link alle schede |
| `/circuiti/[slug]` | "Caricamento circuito…" | ISR, scheda completa |
| `/gp/[year]/[round]` | "Caricamento Gran Premio…" | ISR, risultati completi |

`fallback: 'blocking'` con `paths: []`: non si costruiscono duemila pagine a
ogni deploy, la prima richiesta genera e da lì è in cache (`revalidate` a un
giorno; cinque minuti per la gara in arrivo, che è la domenica in cui il
risultato cambia). Chi indicizza riceve comunque l'HTML completo.

Sulla scheda pilota c'era anche un `opacity: 0` in attesa del mount: una
dissolvenza in entrata che, per chi non esegue JavaScript, non finiva mai.

## La sitemap: 21 indirizzi su duemila

`public/sitemap.xml` era scritto a mano ed elencava 21 pagine. Le altre —
917 piloti, 78 circuiti, 1.171 Gran Premi — non erano dichiarate da nessuna
parte, e non erano raggiungibili da un crawler perché stavano dietro elenchi
caricati in JavaScript.

Ora è `pages/sitemap.xml.js`, generata dal database a ogni richiesta (con
un'ora di cache). Le gare passate escono con `changefreq: never` e il
`lastmod` del giorno di gara: è l'informazione che fa risparmiare a Google
mille visite inutili.

## Identità: i dati erano sbagliati

Lo schema dichiarava come profili ufficiali del sito
`facebook.com/formularossa`, `instagram.com/formularossa` e
`twitter.com/formularossa` — account di qualcun altro — e `twitter:site` era
`@formularossa`. `sameAs` serve a dire "questa entità è anche quella lì": con
profili sbagliati il collegamento si fa lo stesso, con la persona sbagliata.
Ora ci sono i cinque account veri, gli stessi linkati nel footer.

Altre correzioni:
- `og:image` era il logo quadrato 500×500 dichiarato come 1200×630. Ora c'è
  una vera card 1200×630 (`public/og-formula-rossa.jpg`), e le misure si
  dichiarano solo quando sono quelle.
- Il logo nello schema puntava a `/logo.png`, che non esiste.
- I nodi (`WebSite`, `Organization`, `WebApplication`) si collegano per `@id`
  invece di essere tre entità slegate.

### Schema per pagina

| Pagina | Entità dichiarata |
| --- | --- |
| Scheda pilota | `Person` con vittorie, podi, pole, titoli come `PropertyValue` |
| Scheda circuito | `SportsActivityLocation` con indirizzo e coordinate |
| Analisi GP | `SportsEvent` con il podio come `competitor` e il vincitore |
| Tutte e tre | `BreadcrumbList` |

Le statistiche come proprietà dichiarate, non come celle di una tabella: un
LLM le legge così come sono invece di dedurle dal contorno grafico.

## llms.txt: diceva cose false

Il file esistente mandava gli LLM su `/stats` e `/predictions` — pagine che
non esistono più — descriveva un "Ferrari Oracle" con predizioni via machine
learning che il sito non ha mai avuto, e in un punto ammetteva che una pagina
restituisce 404. Poi diceva "Social: @formularossa su tutte le piattaforme".

Riscritto sui contenuti veri, con i numeri presi dal database (1.171 gare,
917 piloti, 78 circuiti, 16 titoli costruttori, 251 vittorie Ferrari) e con
la forma degli indirizzi delle schede, così un LLM sa costruire un link a un
pilota o a una gara. C'è anche cosa il sito **non** è: niente previsioni,
niente cronometraggio dal vivo, non è una fonte ufficiale.

## robots.txt

Aggiunti esplicitamente GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended. Erano già
ammessi dalla regola generica; scriverli è una dichiarazione d'intenti che
sopravvive a chi domani irrigidisce il file. `Disallow: /api/` ovunque: le
API non sono contenuto.

## Titoli e testi alternativi

- Gli `h1` delle pagine indice dicevano "Statistiche", "I circuiti del mondo",
  "Analisi GP": adesso "Statistiche Ferrari", "Circuiti di Formula 1",
  "Analisi Gran Premi", "Classifiche F1 2026".
- Il titolo di una scheda pilota era il solo nome. In una pagina di risultati
  "Max Verstappen" non dice perché aprire questo link invece degli altri
  venti: ora è "Max Verstappen — statistiche e carriera in Formula 1".
- I ritratti dei piloti e le immagini delle notizie avevano `alt=""`: ora
  hanno un testo che descrive cosa si vede.
- Le bandierine restano con `alt=""`, ed è corretto: il nome del paese è
  scritto lì accanto, e ripeterlo fa solo rumore per chi usa uno screen
  reader. Un controllo automatico le segnala comunque — è un falso positivo.

## Quello che non è stato fatto, e perché

**Local Business Schema.** Un `LocalBusiness` descrive un'attività con un
indirizzo e degli orari di apertura. Questo sito non ha né l'uno né gli altri:
dichiararlo sarebbe un dato falso dato a Google, con il rischio concreto di
una penalizzazione per structured data ingannevole. Al suo posto c'è uno
schema `Organization` completo, che è la cosa giusta e che i controlli
automatici riconoscono come "Identity Schema".

**Facebook Pixel.** Aggiunge tracciamento di terze parti, richiede un altro
consenso nel banner cookie, rallenta il caricamento, e serve solo se si
comprano inserzioni su Meta. Se un giorno si comprano, si mette. Oggi è costo
senza ritorno.

**Rimuovere gli stili inline.** Ce ne sono 77 nella scheda pilota e 58
nell'elenco. È vero ed è da sistemare, ma sul posizionamento non pesa quasi
niente: conta per una Content Security Policy severa e per il peso dell'HTML.
Vale la pena farlo, non come lavoro di SEO.

**Link building e iscritti YouTube.** Non sono lavoro di codice. I link in
entrata sono la voce con la priorità più alta del rapporto, e nessuna
modifica al sito li produce.

## Da fare a mano

1. **Search Console**: reinviare la sitemap (l'indirizzo non cambia,
   `https://formula-rossa.it/sitemap.xml`) e chiedere l'indicizzazione di
   qualche scheda pilota per far ripartire la scansione.
2. **Wikidata**: aggiungere in `pages/_document.jsx`, dentro `about.sameAs`,
   l'identificativo Wikidata della Scuderia Ferrari. È il collegamento più
   forte che si possa dichiarare per un'entità, ma va verificato su
   wikidata.org prima di scriverlo — un `sameAs` che punta all'entità
   sbagliata è peggio di un `sameAs` in meno.
3. **Rigenerare la card social** se cambiano logo o numeri:
   `node scripts/generaOgImage.mjs`.
