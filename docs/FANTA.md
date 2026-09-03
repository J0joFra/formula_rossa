# Fanta GP

Pronostico dell'ordine d'arrivo di un Gran Premio, con punteggio calcolato dal
server sul risultato ufficiale in archivio.

## Come funziona

1. Corse le qualifiche, la griglia è nota. Chi gioca mette in fila i primi
   dieci, sceglie il pilota del giorno e dice quanti ritiri ci saranno.
   Si gioca **solo il Gran Premio in corso**: non c'è un selettore delle gare
   future, e il server rifiuta un pronostico per un round diverso da quello
   corrente. Compilare in anticipo tutte le domeniche della stagione sarebbe
   giocare a caso venti volte in una sera, che è l'opposto del punto.
2. Le giocate si chiudono allo start (`race.date` + `race.time`, in UTC).
3. A gara conclusa il punteggio viene calcolato dal server e finisce in
   classifica: di stagione, di gara, e nelle leghe private.

Si gioca a griglia nota: le regole (`lib/fanta/punteggio.js`) ne tengono conto,
quindi vincitore e podio pesano meno di quanto peserebbero al buio, e la voce
che vale di più è la "scommessa" — un pilota messo almeno quattro posizioni
davanti a dove parte, che poi ci arriva davvero. Il massimo teorico è 196
punti a gara; una buona giocata ne fa fra 60 e 100.

I malus seguono un criterio solo: si paga per le scelte che si è deciso di
fare, non per aver sbagliato una posizione — sbagliare non porta punti, ed è
già abbastanza. Si paga quindi per il podio letto al contrario, per il pilota
del giorno scelto a caso, per la rimonta finita peggio della griglia, per il
numero di ritiri sparato a occhio, e — il più pesante, −8 — per la **schedina
ricopiata dalla griglia**: otto o più piloti lasciati esattamente dove
partono. È l'unico malus che non dipende da come è andata la gara, perché non
punisce un errore ma il non aver giocato.

## I pezzi

| File | Cosa fa |
| --- | --- |
| `lib/fanta/punteggio.js` | Le regole e il calcolo. Funzioni pure: niente rete, niente database. |
| `lib/fanta/server.js` | Scadenze, griglia, salvataggio, punteggi, classifiche, leghe. Solo lato server. |
| `lib/fanta/guardia.js` | Metodo, sessione ed errori: il preambolo di ogni route. |
| `pages/api/fanta/*` | Le route HTTP. |
| `pages/fanta.jsx` | La pagina di gioco. |
| `components/fanta/*` | Schedina, tabella classifica, leghe. |

## Sicurezza

Il punteggio non si calcola mai nel browser, e il pronostico si salva solo
passando da `POST /api/fanta/previsione`, che ricontrolla da capo tutto quello
che il client ha già controllato (griglia valida, nessun doppione, gara
ancora aperta).

Le quattro tabelle `fanta_*` hanno **RLS attivo e nessuna policy**: con la
chiave anon — che è pubblica, sta nel bundle JS — non si legge e non si scrive
niente. Ci si arriva solo dalle API route, che usano la service role key.

I pronostici altrui non sono leggibili finché la gara non è partita: prima,
mostrarli regalerebbe la giocata a chi apre la pagina per ultimo.

## Variabili d'ambiente

| Nome | Dove | Serve a |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | già presente | Il progetto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo server** | Scavalcare RLS sulle tabelle `fanta_*`. Non va mai esposta al client: niente prefisso `NEXT_PUBLIC_`. |
| `FANTA_CRON_SECRET` *oppure* `CRON_SECRET` | solo server | Protegge `/api/fanta/calcola`. Senza, la route risponde 503 invece di restare aperta. |

## Il calcolo dopo la gara

`/api/fanta/calcola` calcola i punteggi di una gara conclusa. Vuole
`Authorization: Bearer <segreto>`; senza corpo prende l'ultima gara corsa.

```bash
curl -X POST https://<sito>/api/fanta/calcola \
  -H "Authorization: Bearer $FANTA_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"year":2026,"round":3}'
```

`vercel.json` la chiama due volte (domenica sera e lunedì mattina UTC) perché
il risultato in archivio a volte arriva con qualche ora di ritardo. Rilanciarla
è sempre sicuro: il calcolo è idempotente, e infatti serve anche a rifare i
punteggi quando una squalifica cambia l'ordine d'arrivo a gara finita.
