# Ripubblicare le news su Medium

## La risposta breve

**Non si può automatizzare del tutto, e non per un limite del sito.** Medium ha
chiuso l'API alle nuove integrazioni il **1° gennaio 2025**: non rilascia più
integration token, e senza token non esiste un modo lecito di pubblicare da uno
script. I token generati prima continuano a funzionare, ma se in
`medium.com/me/settings/security` non compare la voce "Integration tokens",
quella strada è chiusa.

Quello che resta è **lo strumento di import di Medium**, e fa una cosa che
l'API non faceva: si incolla l'indirizzo di un articolo, Medium ne ricrea una
bozza, imposta da solo il `rel=canonical` verso l'originale e retrodata il
pezzo. Quindi Google continua a considerare formula-rossa.it la fonte, e il
sito non viene penalizzato per contenuto duplicato — che è il rischio vero di
ripubblicare lo stesso testo in due posti.

## Come funziona adesso

Ogni volta che il bot pubblica un articolo, il workflow scrive in cima alla
pagina della run (il *job summary*, quello che arriva anche nella notifica):

> ### La Ferrari a Monza: cosa dicono i tempi
> - Online: https://formula-rossa.it/news/ferrari-monza-2026-analisi
> - [Ripubblica su Medium](https://medium.com/p/import) — incolla l'indirizzo,
>   rileggi la bozza, poi pubblica

Tre tocchi dal telefono: apri la notifica, apri il link di import, incolla.

Lo stesso promemoria finisce anche nel log del bot, per quando lo lanci a mano.

## Il feed RSS

`https://formula-rossa.it/news/feed.xml` — RSS 2.0 con il contenuto completo
degli articoli, dichiarato nel `<head>` di ogni pagina.

Serve a tre cose: farsi seguire da un lettore di feed, far trovare gli articoli
nuovi ai crawler senza aspettare la scansione della sitemap, e avere in un
posto solo tutti gli indirizzi da ripubblicare. Rispecchia la finestra di
conservazione dell'archivio (30 giorni): un feed che elenca articoli cancellati
manda i lettori su un 404.

## Perché la revisione a mano non è un ripiego

Questi articoli li scrive un modello linguistico a partire dai feed RSS di
dieci testate — FormulaPassion, Motorsport.com, Autosprint, Autosport e le
altre. Sul sito la cosa è dichiarata in fondo a ogni pezzo. Su Medium però ci
sono due regole che riguardano esattamente questo caso: quella sul contenuto
generato automaticamente e presentato come proprio, e quella sulla
pubblicazione automatica di massa, che Medium tratta come spam. Cinque articoli
a weekend di gara pubblicati da uno script sotto lo stesso profilo sono
precisamente il profilo che fa sospendere un account.

Una bozza che rileggi prima di pubblicare costa un minuto ed è la differenza
fra ripubblicare e spammare. Vale anche per il merito: se il modello ha scritto
una sciocchezza, te ne accorgi prima che stia sotto il tuo nome.

Un consiglio pratico: pubblica su Medium **una selezione**, non tutto. Il
recap del lunedì e l'analisi post-gara reggono da soli; l'anteprima del venerdì
invecchia in due giorni e su Medium non la leggerà nessuno.

## Se un giorno vuoi l'automazione completa

Le due strade possibili, entrambe con un costo:

1. **Un token legacy.** Se hai o recuperi un account con un integration token
   già generato, l'API `POST https://api.medium.com/v1/users/{id}/posts`
   accetta `contentFormat: "html"`, `canonicalUrl` e
   `publishStatus: "draft"`. Servirebbero una trentina di righe. Chiedimelo e
   le scrivo: quello che manca è il token, non il codice.
2. **Guidare il browser** con la tua sessione. Funziona, si rompe al primo
   cambio di interfaccia, e aggira una chiusura che Medium ha deciso: se
   l'automazione viene notata, il rischio è l'account.

La prima è legittima. La seconda te la sconsiglio.
