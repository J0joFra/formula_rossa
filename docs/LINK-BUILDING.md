# Link building

I link da altri siti verso formula-rossa.it sono il segnale che oggi manca di
più. Nessuna modifica al codice li produce: servono contenuti che valga la
pena citare e qualcuno che li faccia conoscere. Questo è il piano.

## Le regole

- **Pochi e pertinenti battono tanti e casuali.** Un link da un blog F1
  italiano vale più di cento link da directory generiche.
- **Mai link comprati, scambi in serie, PBN o "pacchetti SEO".** Google li
  riconosce e penalizza il dominio: è il modo più veloce per perdere quello
  che si è costruito. Vale anche per i commenti con link sui blog altrui.
- **Wikipedia no.** I link sono `nofollow` e l'autopromozione viola le regole
  dell'enciclopedia: si rischia solo di essere segnalati.
- **Anchor text naturale.** Va bene "Formula Rossa", "formula-rossa.it",
  "le statistiche di Formula Rossa", il nome di una pagina. Non chiedere mai
  un link con la parola chiave esatta ("statistiche Ferrari F1") ogni volta:
  è il segnale tipico dei link costruiti a tavolino.

## Cosa abbiamo di "linkabile"

Si linka quello che non si trova altrove. Formula Rossa ha:

1. **L'archivio Ferrari dal 1950**, con classifiche già pronte
   (`/stats/wins`, `/stats/poles`, …) e le schede di 917 piloti: utili a chi
   scrive un articolo e cerca un numero da citare.
2. **I commenti editoriali** (`content/editoriale.js`): il punto di vista che
   altri siti non hanno.
3. **Due app e un gioco web**: GridUp e Driver Clash, entrambe giocabili dal
   sito (`/gioca/gridup`, `/gioca/driver-clash`). Le app si promuovono in
   posti dove un sito di statistiche non entrerebbe mai.

## Fase 1 — i link che dipendono solo da te (prima settimana)

Sono facili, sicuri e ci vogliono pochi minuti ciascuno.

- [ ] **Schede Google Play** di GridUp e Driver Clash: nel campo "Sito web"
      dello sviluppatore metti `https://formula-rossa.it`, e nella descrizione
      una riga "Fa parte di Formula Rossa — formula-rossa.it".
- [ ] **Le web app** (`fanta-f1-three.vercel.app`, `f1cardbattle.vercel.app`):
      un link "by Formula Rossa" verso il sito, in fondo o nelle impostazioni.
- [ ] **Profili social**: link al sito nella bio di Instagram, X, YouTube,
      Twitch, LinkedIn (pagina aziendale), Ko-fi.
- [ ] **GitHub**: il README del profilo (fatto) e i README dei repository
      pubblici delle app.
- [ ] **Medium**: i recap ripubblicati devono avere il link canonico verso
      l'articolo originale (vedi `RIPUBBLICARE-SU-MEDIUM.md`).
- [ ] **Google Search Console** e **Bing Webmaster Tools**: verifica il sito
      e invia la sitemap. Non sono link, ma senza non vedi quelli che arrivano.

## Fase 2 — le app come porta d'ingresso (primo mese)

Le app aprono canali che un sito di dati non ha.

- [ ] **Driver Clash**: schede su directory di giochi web e su AlternativeTo,
      e un post di presentazione su r/formula1 e r/scuderiaferrari quando esce
      dal test. Su Reddit leggi prima le regole di ogni subreddit sulla
      promozione: in genere si accettano progetti personali presentati come
      tali, una volta, con una storia dietro ("ho fatto un gioco di carte F1
      con le statistiche reali di 794 piloti").
- [ ] **GridUp**: stessa cosa nelle settimane calde del Mondiale, quando la
      domanda "chi può ancora vincere il titolo?" è sulla bocca di tutti.
- [ ] **Product Hunt** per Driver Clash al lancio pubblico.

## Fase 3 — outreach nel mondo F1 italiano (continuo)

Qui servono costanza e messaggi personali, non email in serie.

**A chi scrivere**
- Blog e testate F1 italiane, grandi e piccole. Le grandi (es. FormulaPassion,
  P300, F1inGenerale) rispondono di rado: punta prima ai blog personali e alle
  pagine dei fan.
- **Scuderia Ferrari Club** locali: molti hanno un sito o una pagina, e un
  archivio Ferrari gratuito è un contenuto utile da segnalare ai soci.
- **Podcast e canali YouTube F1 italiani**: proponiti come ospite per parlare
  di statistiche Ferrari, o offri grafici pronti per le loro puntate in cambio
  della citazione con link nella descrizione.
- Forum e community (anche Discord e Telegram di tifosi): partecipa davvero,
  e linka una pagina solo quando risponde alla domanda di qualcuno.

**Cosa offrire**
- Un dato pronto da usare: "Leclerc a Monza: il confronto con i suoi
  precedenti", con il link alla scheda.
- Grafici e tabelle su richiesta, con la sola condizione della fonte citata.
- Un articolo ospite con un'analisi originale (non un riassunto di notizie).

**Messaggio tipo** (da adattare ogni volta):

> Ciao [nome], seguo [sito/canale] da tempo — mi è piaciuto il pezzo su
> [articolo specifico]. Curo Formula Rossa, un archivio indipendente delle
> statistiche Ferrari dal 1950. Se ti serve un dato per un prossimo articolo
> (vittorie, pole, confronti tra piloti o tra epoche) te lo preparo volentieri,
> anche come grafico. Qui per esempio c'è la classifica delle pole Ferrari:
> formula-rossa.it/stats/poles.

## Fase 4 — contenuti nati per essere citati (ogni weekend di gara)

Il calendario F1 è il miglior alleato: ogni gara crea una domanda nuova.

- **Il dato della settimana**: dopo ogni GP un'immagine con un record o una
  curiosità Ferrari tratta dall'archivio, pubblicata sui social con il link
  alla pagina che la contiene. È il formato che i giornalisti riprendono.
- **Pagine record**: quando un pilota Ferrari eguaglia o supera un record,
  la classifica che lo dimostra è la pagina da linkare. Aggiorna il commento
  della pagina (`content/editoriale.js`) prima della gara, non dopo.
- **Un report annuale** a fine stagione ("La stagione Ferrari in 20 numeri"):
  una pagina sola, ricca di grafici, da proporre a blog e podcast a dicembre.

## Come misurare

- **Search Console → Link**: quali siti ti linkano e verso quali pagine.
  Controllalo una volta al mese.
- **Obiettivo realistico**: 3-5 link nuovi e pertinenti al mese nei primi sei
  mesi. Più che il numero conta la provenienza: siti F1, motorsport, sport
  italiani.
- Tieni un foglio con chi hai contattato, quando e con che esito: l'outreach
  funziona sul secondo e terzo contatto, non sul primo.
