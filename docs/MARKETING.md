# Piano marketing — inverno 2026 / inizio stagione 2027

Obiettivo: far conoscere Formula Rossa ai tifosi Ferrari italiani, portare
traffico al sito e alle app, e raccogliere i primi link da altri siti — la
cosa che oggi manca di più (vedi `LINK-BUILDING.md` per le regole).

## Da dove si parte (novembre 2026)

| Cosa | Situazione |
| --- | --- |
| Link da altri siti | 1 dominio (innolope.com), che punta a `/en`: ora reindirizzato alla home |
| Social | YouTube ~50 iscritti; Instagram e TikTok appena aperti |
| Contenuti | archivio Ferrari dal 1950, 900+ schede pilota, analisi di ogni GP, commenti editoriali sulle pagine principali |
| App | GridUp su Google Play; Driver Clash in test, giocabile dal sito |
| AdSense | rifiutato per "contenuto di scarso valore" |
| Calendario | ultime gare: Las Vegas 22/11, Qatar 29/11, Abu Dhabi 6/12. Poi pausa fino a marzo |

La pausa invernale è il momento giusto: le testate F1 cercano contenuti, i
tifosi hanno fame di numeri e bilanci, e nessuna gara ruba l'attenzione.

## L'idea della campagna: «La stagione Ferrari 2026 in numeri»

Una sola idea forte, declinata su sito, social e outreach, invece di tante
cose sparse.

**Il contenuto di punta** è una pagina del sito con il bilancio della
stagione Ferrari fatto con i dati dell'archivio: vittorie, pole, podi,
confronto fra i due piloti, i record battuti o sfiorati, il confronto con le
stagioni passate. Una pagina sola, ricca di grafici, con un commento scritto
da te. È il contenuto che altri siti possono citare: un riassunto di notizie
no, un numero che non trovano altrove sì.

Da quella pagina nascono:
- **5-10 grafiche** per Instagram (carosello) con un dato ciascuna;
- **5-10 video brevi** per TikTok e YouTube Shorts ("La Ferrari 2026 in 60
  secondi", "Il dato che nessuno ha notato", confronti fra piloti);
- **il materiale per l'outreach**: un dato pronto da proporre a blog e podcast.

## Calendario

### Fase 1 — Preparazione (fino al 6 dicembre)

- [ ] Search Console e Bing Webmaster Tools: verifica, invio della sitemap,
      richiesta di indicizzazione delle pagine principali.
- [ ] I link "a costo zero" della fase 1 di `LINK-BUILDING.md`: sito nelle
      schede Google Play, nelle bio social, nelle web app.
- [ ] Riscrivi con la tua voce i commenti in `content/editoriale.js`
      (almeno home, statistiche e i piloti Ferrari attuali).
- [ ] Ogni weekend di gara: un "dato della settimana" su Instagram e TikTok,
      con link alla pagina del sito da cui viene. Serve a rodare il formato.
- [ ] Prepara la lista dei contatti per l'outreach (vedi sotto).

### Fase 2 — Lancio del bilancio (7-21 dicembre)

- [ ] Pubblica la pagina «La stagione Ferrari 2026 in numeri» il giorno dopo
      Abu Dhabi, quando l'interesse è al massimo. La pagina è già pronta in
      `/bilancio/2026` e si aggiorna da sola dopo ogni gara: per pubblicarla
      scrivi il commento in `content/editoriale.js` (voce `BILANCI`) e metti
      `pubblicato: true`. Da quel momento è indicizzabile, entra nella
      sitemap e nel menu Stagione, e mostra i pulsanti di condivisione.
- [ ] Social: carosello Instagram il giorno stesso, poi un video al giorno
      per una settimana, ognuno con il link in bio alla pagina.
- [ ] Outreach: messaggi personali a 15-20 blog, pagine fan, podcast e canali
      YouTube italiani di F1, con un dato pronto da usare e il link.
- [ ] Reddit (r/formula1, r/scuderiaferrari): un post con il dato più
      interessante, rispettando le regole di ogni subreddit sulla promozione.
- [ ] Newsletter dei Scuderia Ferrari Club locali: proponi la pagina come
      risorsa gratuita per i soci.

### Fase 3 — Driver Clash e sfide fra tifosi (gennaio-febbraio)

- [ ] Quando Driver Clash esce dal test: lancio pubblico con un post per
      ogni social, scheda su Product Hunt e directory di giochi web.
- [ ] Una sfida ricorrente: "Il pilota Ferrari più forte di sempre" con i
      dati del sito, sondaggi nelle storie e risultati pubblicati sul sito.
      Coinvolge, fa condividere, e porta link verso le schede pilota.
- [ ] Contenuti di "ripasso" in attesa della nuova stagione: le stagioni
      Ferrari storiche, i record di ogni circuito del calendario 2027.

### Fase 4 — Inizio stagione 2027 (marzo)

- [ ] Aggiorna il calendario delle gare nel workflow delle news
      (`RACE_DAYS` in `.github/workflows/f1_race_publisher.yml`), che oggi
      contiene solo il 2026.
- [ ] Ogni weekend: anteprima con i precedenti Ferrari sul circuito, dato
      della settimana dopo la gara, GridUp spinto nelle settimane in cui il
      Mondiale si decide.
- [ ] A metà stagione, un secondo bilancio: è il formato che a dicembre avrà
      dimostrato di funzionare (o no).

## Social: cosa pubblicare e come

- **Frequenza sostenibile**: 3 post a settimana costanti valgono più di 10
  in una settimana e poi niente.
- **Un dato, un'immagine**: un solo numero grande, la fonte (formula-rossa.it)
  in basso, colori del sito. Su TikTok: voce o testo a schermo, 20-40 secondi.
- **Ogni contenuto rimanda a una pagina precisa**, non alla home: la scheda
  del pilota, la classifica, il GP. Usa link con parametri UTM
  (`?utm_source=instagram&utm_campaign=bilancio2026`) così in Analytics vedi
  cosa porta visite.
- **Rispondi ai commenti**, soprattutto alle obiezioni sui numeri: è lì che
  nascono le discussioni che fanno girare i contenuti.

## SEO: cosa resta da fare

Il lavoro tecnico è in buona parte fatto (pagine generate sul server, sitemap
con piloti, circuiti, GP e news, h1 con le parole chiave, immagini e font più
leggeri). Restano soprattutto contenuti e segnali esterni.

1. **Contenuto originale sulle pagine che contano.** Le parole su cui ha senso
   puntare sono quelle dell'archivio: statistiche e record Ferrari, piloti
   Ferrari, vittorie e pole, albo d'oro, schede dei singoli piloti. Prima di
   scrivere, guarda in Search Console per quali ricerche il sito compare già
   (Prestazioni → Query): spesso basta migliorare la pagina che è in seconda
   pagina per portarla in prima.
2. **Le news.** Oggi sono riassunti scritti da un'AI e vengono cancellate dopo
   30 giorni. Per Google sono contenuto di poco valore, e le pagine cancellate
   diventano errori 404 su indirizzi già indicizzati. Due strade:
   - aggiungere a ogni articolo un paragrafo tuo con un dato dell'archivio, e
     smettere di cancellarli;
   - oppure tenerle come servizio per i visitatori ma con `noindex`, e
     puntare la SEO sulle pagine d'archivio.
3. **Link interni.** Nei commenti editoriali e negli articoli, rimanda alle
   schede: da "Leclerc" alla sua scheda, da "Monza" al circuito, da "pole"
   alla classifica delle pole.
4. **Velocità.** Dopo l'ultimo intervento, rifai PageSpeed Insights: se il
   tempo da mobile resta alto, il prossimo passo è caricare framer-motion
   solo dove serve.
5. **AdSense.** Rifai la richiesta solo dopo i punti 1 e 2, e dopo che Google
   ha riscansionato il sito (qualche settimana).

## Link in entrata (backlink)

Le regole e il messaggio tipo sono in `LINK-BUILDING.md`. In questa campagna
il bilancio di fine stagione è la "scusa" per scrivere a tutti.

**Lista dei contatti da preparare** (un foglio con nome, sito, contatto,
data del messaggio, esito):
- blog F1 italiani personali e piccole testate;
- pagine e gruppi di tifosi Ferrari, Scuderia Ferrari Club con un sito;
- podcast e canali YouTube F1 in italiano;
- siti di statistiche F1 in inglese, per i dati sui piloti italiani;
- community di sviluppatori (per GridUp e Driver Clash come progetti).

**Obiettivo realistico**: 10-15 domini che ti linkano entro marzo 2027,
quasi tutti da siti di F1 o motorsport.

**Da evitare**: link comprati, scambi in serie, directory generiche,
commenti con link sui blog altrui. Il rischio è una penalizzazione del
dominio.

## Budget

La campagna si fa a costo zero. Se vuoi spendere qualcosa, il posto giusto
è il lancio di Driver Clash: 50-100 € di promozione di un singolo video su
TikTok o Instagram, rivolta a utenti italiani interessati alla Formula 1.
Prima del lancio dell'app non serve: un sito di statistiche vive di ricerche,
non di pubblicità.

## Come misurare

| Indicatore | Dove | Obiettivo a marzo 2027 |
| --- | --- | --- |
| Clic dalla ricerca Google | Search Console → Prestazioni | in crescita mese su mese |
| Domini che ti linkano | Search Console → Link | 10-15 |
| Visite dai social | Analytics, link con UTM | almeno un post al mese sopra la media |
| Follower Instagram e TikTok | app | crescita costante, non un picco |
| Installazioni GridUp / Driver Clash | Google Play Console | — |

Una revisione al mese basta: cosa ha portato visite e link, cosa no, e cosa
cambiare nel mese dopo.
