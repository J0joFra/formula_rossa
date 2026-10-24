/**
 * content/editoriale.js
 * I testi "Il commento" delle pagine di dati, in un posto solo.
 *
 * Sono una prima stesura: vanno riletti, corretti e riscritti con la propria
 * voce. È il contenuto che distingue il sito da un elenco di tabelle, ed è
 * quello che Google e AdSense guardano. Per aggiungere un pilota o un circuito
 * basta una nuova voce con lo stesso id dell'indirizzo (/piloti/<id>,
 * /circuiti/<id>).
 *
 * Regola: niente numeri che cambiano a ogni gara (vittorie di un pilota in
 * attività, totali di stagione). Quelli li mostrano le tabelle, che si
 * aggiornano da sole; il testo invece resterebbe vecchio.
 */

export const FIRMA = 'Joaquim Francalanci, Formula Rossa';

/* ─── / (home) ─────────────────────────────────────────────────────────── */

export const HOME = {
  titolo: 'Perché un archivio della Ferrari in Formula 1',
  paragrafi: [
    'La Scuderia Ferrari è la squadra più vincente e più longeva della Formula 1: c’è dal primo Mondiale, nel 1950, e non ha mai saltato una stagione. Dietro i titoli e le vittorie c’è un archivio enorme di gare, piloti e risultati, sparso fra siti diversi e quasi sempre in inglese.',
    'Formula Rossa nasce per metterlo in ordine e raccontarlo in italiano: le statistiche Ferrari dal 1950 a oggi, le classifiche dei piloti più vincenti in rosso, le schede di ogni pilota e circuito di F1, e l’analisi di ogni Gran Premio della stagione in corso. I numeri vengono da archivi pubblici e verificabili; il commento è nostro.',
  ],
};

/* ─── /statistics ──────────────────────────────────────────────────────── */

export const STATISTICHE = {
  titolo: 'Come leggere i numeri della Ferrari',
  paragrafi: [
    'La Ferrari è l’unica squadra che ha corso in ogni stagione del Mondiale, dal 1950 a oggi. È per questo che i suoi numeri sono così grandi, ma anche per questo vanno letti con un po’ di attenzione: dentro ci sono epoche che si somigliano pochissimo, con monoposto, calendari e regole diverse.',
    'La prima vittoria arriva a Silverstone nel 1951, con José Froilán González; i primi due titoli piloti l’anno dopo e quello dopo ancora, con Alberto Ascari. Poi la storia procede a ondate: gli anni Settanta di Lauda e della 312 T, il lungo digiuno fra il titolo di Scheckter nel 1979 e quello di Schumacher nel 2000, e il ciclo d’oro di Todt, Brawn e Schumacher, con sei Mondiali costruttori consecutivi dal 1999 al 2004. L’ultimo titolo piloti è di Räikkönen nel 2007, l’ultimo costruttori del 2008.',
    'Una cosa da tenere a mente guardando i grafici: i punti non sono confrontabili fra epoche. Una vittoria valeva 8 punti negli anni Cinquanta, 9 dal 1961, 10 dal 1991 e 25 dal 2010, e per decenni contavano solo i risultati migliori della stagione. Per questo, quando confrontiamo piloti di epoche diverse, guardiamo prima vittorie, pole e podi: sono gli stessi oggi come nel 1952.',
  ],
};

/* ─── /stats/[tipo] ────────────────────────────────────────────────────── */

export const CLASSIFICHE = {
  wins: {
    titolo: 'Settantadue, e poi tutti gli altri',
    paragrafi: [
      'In cima a questa classifica c’è una distanza che non ha paragoni: le 72 vittorie di Michael Schumacher con la Ferrari, fra il 1996 e il 2006, sono più di quelle dei tre piloti che lo seguono messi insieme. È il segno di un’epoca in cui squadra, macchina e pilota sono rimasti insieme e al vertice per un decennio, cosa che a Maranello non era mai successa prima e non è più successa dopo.',
      'Scendendo si incontra la storia della Scuderia per strati: Niki Lauda e gli anni della 312 T, Alberto Ascari e i primi Mondiali, poi i piloti dell’era moderna — Vettel, Alonso, Massa, Räikkönen, Leclerc — tutti capaci di vincere ma quasi mai con la macchina migliore del gruppo. Il numero di vittorie dice tanto del pilota, ma dice altrettanto della Ferrari che ha avuto a disposizione.',
    ],
  },
  podiums: {
    titolo: 'La classifica della costanza',
    paragrafi: [
      'Le vittorie raccontano i giorni migliori, i podi raccontano le stagioni. Un pilota che arriva spesso fra i primi tre anche quando la Ferrari non è la macchina da battere è un pilota che porta a casa punti con continuità, ed è quello che a fine anno decide i campionati costruttori.',
      'Questa classifica premia le carriere lunghe in rosso: chi è rimasto a Maranello cinque, sei, dieci stagioni ha avuto più occasioni di salire sul podio di chi ci è passato per un anno o due. Per confrontare piloti con carriere di lunghezza diversa conviene guardare anche le gare disputate nella scheda di ciascuno.',
    ],
  },
  poles: {
    titolo: 'Il giro secco',
    paragrafi: [
      'La pole position è il risultato più “puro” della Formula 1: un solo giro, la macchina più leggera e le gomme migliori, senza strategie né doppiaggi di mezzo. Per questo la classifica delle pole racconta spesso un talento diverso da quello delle vittorie.',
      'È anche la classifica in cui Charles Leclerc si è fatto notare prima e di più: in poche stagioni ha raggiunto i primissimi posti, accanto a nomi come Schumacher e Lauda, spesso con Ferrari che in gara non riuscivano a difendere la posizione conquistata il sabato. Una pole senza vittoria non è un fallimento del pilota: molto spesso è la prova che il giro veloce lo aveva lui, e la macchina no.',
    ],
  },
  'fastest-laps': {
    titolo: 'Velocità pura, e un punto in più',
    paragrafi: [
      'Il giro più veloce in gara misura il ritmo, non il risultato: può farlo chi rimonta con gomme nuove nel finale, chi ha la macchina più leggera dopo l’ultima sosta, o chi non ha più niente da perdere. Per questo è la statistica più legata alle circostanze.',
      'Negli anni ha anche cambiato valore: dava un punto nel Mondiale dal 1950 al 1959 e di nuovo dal 2019 al 2024, e in quelle stagioni le squadre lo cercavano apposta con una sosta in più a fine gara. Nelle altre era solo una riga negli archivi.',
    ],
  },
  points: {
    titolo: 'Perché i piloti di oggi hanno più punti',
    paragrafi: [
      'Questa è la classifica da leggere con più cautela. I punti sono quelli conquistati davvero, con il sistema di punteggio dell’epoca: una vittoria valeva 8 punti negli anni Cinquanta e ne vale 25 dal 2010, e oggi si corrono più di venti Gran Premi l’anno contro i sette o otto delle prime stagioni, più le gare sprint.',
      'Il risultato è che i piloti dell’era moderna salgono in alto anche senza aver vinto un Mondiale, e i campioni degli anni Cinquanta e Settanta finiscono più in basso di quanto meritino. Per un confronto fra epoche diverse sono più giuste le classifiche di vittorie, pole e podi.',
    ],
  },
  'grand-slams': {
    titolo: 'Il weekend perfetto',
    paragrafi: [
      'Il Grand Slam è il risultato più raro della Formula 1: pole position, vittoria, giro più veloce e comando della gara dal primo all’ultimo giro. Basta un pit stop sfortunato o un giro in seconda posizione per perderlo, ed è per questo che anche i grandi campioni ne contano pochi.',
      'Alberto Ascari ne ha messi in fila diversi negli anni dei suoi due Mondiali, quando la Ferrari 500 dominava; nell’era moderna sono arrivati, fra gli altri, quello di Fernando Alonso a Singapore nel 2010 e quello di Charles Leclerc in Bahrain nel 2022, alla prima gara delle nuove regole.',
    ],
  },
};

/* ─── /piloti/[id] ─────────────────────────────────────────────────────── */

export const PILOTI = {
  'alberto-ascari': {
    titolo: 'Il primo campione della Ferrari',
    paragrafi: [
      'Alberto Ascari è il pilota che ha portato alla Ferrari i primi due titoli Mondiali, nel 1952 e nel 1953, con la 500 F2. In quelle due stagioni è stato quasi imbattibile: la sua serie di vittorie consecutive è rimasta un record per sessant’anni.',
      'Milanese, figlio del pilota Antonio Ascari, era famoso per la guida pulita e per la scaramanzia. Lasciò Maranello alla fine del 1953 e morì a Monza nel 1955, durante una prova con una Ferrari sport. Per i tifosi italiani resta l’ultimo campione del mondo nato in Italia.',
    ],
  },
  'niki-lauda': {
    titolo: 'Il campione che tornò dal fuoco',
    paragrafi: [
      'Niki Lauda arrivò alla Ferrari nel 1974 e l’anno dopo, con la 312 T, riportò a Maranello il titolo piloti che mancava dal 1964. Era un pilota diverso da quelli venuti prima: metodico, ossessionato dalla messa a punto, capace di lavorare con gli ingegneri come pochi altri.',
      'Il 1976 è la stagione che tutti ricordano: il rogo del Nürburgring ad agosto, il ritorno in pista a Monza appena sei settimane dopo, e il ritiro volontario sotto il diluvio del Fuji che lasciò il titolo a James Hunt per un punto. L’anno dopo Lauda vinse il suo secondo Mondiale in rosso e lasciò la Ferrari prima della fine della stagione.',
    ],
  },
  'gilles-villeneuve': {
    titolo: 'Il pilota che i tifosi non hanno mai dimenticato',
    paragrafi: [
      'Gilles Villeneuve non ha vinto un Mondiale e ha vinto relativamente poche gare, eppure per molti tifosi è il pilota Ferrari per eccellenza. Enzo Ferrari lo scelse nel 1977 quasi sconosciuto, e lui ripagò con uno stile di guida senza mezze misure: il duello ruota a ruota con René Arnoux a Digione nel 1979 è ancora una delle sequenze più viste della storia della F1.',
      'Nel 1979 accettò il ruolo di secondo pilota e aiutò Jody Scheckter a vincere il titolo. Morì nelle qualifiche di Zolder nel 1982, due settimane dopo la lite con Didier Pironi a Imola. A Imola c’è una variante che porta il suo nome; a Montréal, un intero circuito.',
    ],
  },
  'jody-scheckter': {
    titolo: 'Il titolo che aprì un lungo digiuno',
    paragrafi: [
      'Jody Scheckter vinse il Mondiale 1979 con la 312 T4, in una stagione in cui la Ferrari ebbe la macchina più affidabile del gruppo e lui la squadra dalla sua parte, con Gilles Villeneuve a fargli da scudiero. Il titolo arrivò a Monza, davanti al pubblico di casa.',
      'Nessuno allora poteva immaginarlo, ma sarebbe stato l’ultimo titolo piloti della Ferrari per ventun anni, fino a Schumacher nel 2000. L’anno dopo, con una macchina ormai superata, Scheckter chiuse la carriera.',
    ],
  },
  'michael-schumacher': {
    titolo: 'L’uomo che ha cambiato la Ferrari',
    paragrafi: [
      'Quando Michael Schumacher arrivò a Maranello nel 1996, da campione del mondo in carica, la Ferrari non vinceva un titolo piloti dal 1979. Con Jean Todt, Ross Brawn e Rory Byrne costruì in pochi anni la squadra più forte della storia della F1, e dal 2000 al 2004 vinse cinque Mondiali di fila.',
      'Le sue 72 vittorie in rosso sono il record della Scuderia con un margine che probabilmente resterà per sempre. Ma il suo segno più profondo è nel metodo: i test infiniti a Fiorano, il lavoro con gli ingegneri, la squadra costruita attorno a un obiettivo. Ci sono state anche pagine scure, come Jerez 1997, e l’incidente di Silverstone nel 1999 che gli costò metà stagione. Tutto il resto è nelle tabelle qui sotto.',
    ],
  },
  'felipe-massa': {
    titolo: 'Campione del mondo per trenta secondi',
    paragrafi: [
      'Felipe Massa è stato in Ferrari dal 2006 al 2013, prima accanto a Schumacher e poi a Räikkönen e Alonso. Il suo momento è Interlagos 2008: vinse la gara di casa e per una manciata di secondi fu campione del mondo, finché Hamilton non superò Glock negli ultimi metri e si prese il titolo per un punto.',
      'L’anno dopo una molla persa dalla vettura di Barrichello lo colpì al casco nelle qualifiche dell’Ungheria. Tornò a correre nel 2010, ma non ritrovò più la continuità di prima. Resta uno dei piloti più amati dal box di Maranello.',
    ],
  },
  'kimi-raikkonen': {
    titolo: 'L’ultimo campione in rosso',
    paragrafi: [
      'Kimi Räikkönen vinse il Mondiale 2007 alla sua prima stagione in Ferrari, rimontando nelle ultime gare e superando in Brasile Lewis Hamilton e Fernando Alonso per un solo punto. È, ancora oggi, l’ultimo pilota ad aver vinto il titolo con la Ferrari.',
      'Lasciò Maranello alla fine del 2009 e ci tornò dal 2014 al 2018, in un ruolo diverso: compagno di squadra affidabile, poco incline alle polemiche e molto amato dai tifosi. La sua ultima vittoria in Formula 1 è arrivata con la Ferrari, ad Austin nel 2018.',
    ],
  },
  'fernando-alonso': {
    titolo: 'Due Mondiali sfiorati',
    paragrafi: [
      'Fernando Alonso arrivò in Ferrari nel 2010 da due volte campione del mondo e per cinque stagioni fu probabilmente il pilota più completo del gruppo, quasi mai con la macchina più veloce. Nel 2010 perse il titolo all’ultima gara di Abu Dhabi, per una strategia sbagliata che lo lasciò imbottigliato dietro Petrov; nel 2012 lo perse per tre punti contro Vettel, dopo una stagione in cui aveva tirato fuori dalla F2012 molto più di quanto sembrasse possibile.',
      'Lasciò la Ferrari alla fine del 2014 con undici vittorie e la sensazione, condivisa da molti tifosi, di un’occasione mancata da entrambe le parti.',
    ],
  },
  'sebastian-vettel': {
    titolo: 'Il sogno di diventare Schumacher',
    paragrafi: [
      'Sebastian Vettel arrivò a Maranello nel 2015 con quattro titoli vinti alla Red Bull e un modello dichiarato: Michael Schumacher. Vinse già alla seconda gara, in Malesia, e nel 2017 e nel 2018 lottò davvero per il Mondiale contro Hamilton e la Mercedes.',
      'Entrambe le volte la seconda metà della stagione gli girò contro, con errori che pesarono: su tutti l’uscita di pista a Hockenheim nel 2018, mentre era al comando della gara di casa. Con l’arrivo di Leclerc il rapporto con la squadra si incrinò, e alla fine del 2020 Vettel lasciò la Ferrari.',
    ],
  },
  'charles-leclerc': {
    titolo: 'Il pilota della nuova Ferrari',
    paragrafi: [
      'Charles Leclerc è arrivato in Ferrari nel 2019 dopo una sola stagione in Sauber, e alla prima occasione ha vinto due gare di fila, Spa e Monza: la prima vittoria Ferrari al Gran Premio d’Italia dal 2010. Da allora è il pilota attorno a cui la Scuderia ha costruito il suo futuro.',
      'Il suo punto di forza è il giro secco, come dicono le pole accumulate in poche stagioni. Il 2022 è stato l’anno in cui è andato più vicino al titolo, prima che affidabilità e strategie lo allontanassero; il 2024 quello della vittoria più attesa, a Monaco, la gara di casa. Le sue statistiche aggiornate sono qui sotto.',
    ],
  },
  'lewis-hamilton': {
    titolo: 'Il sette volte campione in rosso',
    paragrafi: [
      'Lewis Hamilton è passato alla Ferrari nel 2025 dopo dodici stagioni e sei titoli con la Mercedes: il trasferimento più clamoroso degli ultimi anni, per il pilota con più vittorie e più pole della storia della Formula 1.',
      'La prima vittoria in rosso è arrivata in una gara sprint, in Cina, alla seconda uscita stagionale. Il resto della sua storia con la Ferrari è ancora da scrivere: i numeri aggiornati di questa scheda la raccontano gara dopo gara.',
    ],
  },
};

/* ─── /circuiti/[id] ───────────────────────────────────────────────────── */

export const CIRCUITI = {
  monza: {
    titolo: 'Il Tempio della Velocità',
    paragrafi: [
      'Monza è il circuito più veloce del calendario. I suoi lunghi rettilinei — tra cui il Rettifilo Tribune, lungo oltre un chilometro — spingono le monoposto oltre i 350 km/h. Le squadre portano assetti con pochissimo carico aerodinamico, sacrificando la tenuta in curva alla velocità massima, e la frenata della Prima Variante è tra le più impegnative della stagione.',
      'Per la Ferrari è la gara di casa: ospita il Gran Premio d’Italia dal 1950, primo anno del Mondiale, con la sola eccezione del 1980. Vincere qui, davanti al mare rosso che invade il rettilineo dopo la bandiera a scacchi, vale per i tifosi quanto un titolo: lo sanno bene Schumacher, Alonso e Leclerc.',
    ],
  },
  imola: {
    titolo: 'Il circuito che porta il nome di Ferrari',
    paragrafi: [
      'L’Autodromo Enzo e Dino Ferrari è intitolato al fondatore della Scuderia e al figlio Dino, e si trova a meno di un’ora da Maranello. Ha ospitato il Gran Premio di San Marino dal 1981 al 2006 e, fra il 2020 e il 2025, quello dell’Emilia-Romagna.',
      'È una pista vecchio stampo, stretta e veloce, dove sorpassare è difficile e la qualifica conta moltissimo. È anche il luogo del weekend più tragico della F1 moderna, il 1994, in cui persero la vita Roland Ratzenberger e Ayrton Senna. Fra le sue curve c’è la Variante Villeneuve.',
    ],
  },
  mugello: {
    titolo: 'La pista di casa Ferrari',
    paragrafi: [
      'Il Mugello è di proprietà della Ferrari ed è stato per anni una delle sue piste di prova, oltre che uno dei circuiti più amati del motomondiale. In Formula 1 ha ospitato una sola gara, il Gran Premio di Toscana del 2020.',
      'Non una gara qualsiasi: era il millesimo Gran Premio della Ferrari, unica squadra ad aver raggiunto quel traguardo, corso con una livrea bordeaux ispirata alla prima Ferrari di Formula 1. Il risultato in pista fu deludente, ma la festa resta nella storia della Scuderia.',
    ],
  },
  monaco: {
    titolo: 'La corsa più prestigiosa',
    paragrafi: [
      'Monaco è l’opposto di Monza: il circuito più lento, più stretto e più iconico del mondo. Le barriere sono a pochi centimetri dalle ruote e non esiste margine di errore. La pole position è determinante perché sorpassare è quasi impossibile, e spesso vince chi parte davanti.',
      'Il tunnel, il Casino, il Portier e la chicane delle Piscine sono luoghi leggendari. Per Charles Leclerc, monegasco, è stato a lungo una maledizione: ritiri, guasti e occasioni perse alla gara di casa, fino alla vittoria del 2024.',
    ],
  },
  silverstone: {
    titolo: 'Dove tutto è cominciato',
    paragrafi: [
      'Silverstone ha ospitato il primo Gran Premio del Mondiale di Formula 1, nel 1950, e un anno dopo la prima vittoria della Ferrari, con José Froilán González. Le sue curve rapide — Copse, Maggots, Becketts — sono tra le più spettacolari del calendario e chiedono tanto carico aerodinamico e molta fiducia nella macchina.',
    ],
  },
  'spa-francorchamps': {
    titolo: 'Il circuito più amato dai piloti',
    paragrafi: [
      'Spa-Francorchamps è spesso citato come il circuito preferito dai piloti. L’Eau Rouge-Raidillon, la combinazione di curve in salita affrontata a tutta velocità, è il punto più iconico del calendario. Il meteo è imprevedibile: capita di avere sole da una parte della pista e pioggia dall’altra.',
      'Per la Ferrari è anche il luogo della prima vittoria di Charles Leclerc, nel 2019.',
    ],
  },
  suzuka: {
    titolo: 'Il circuito dei tecnici',
    paragrafi: [
      'Suzuka è la pista più tecnica del calendario, con la sequenza di curve a S del primo settore che mette alla prova l’equilibrio della vettura come nessun’altra. Il disegno a otto, con il sovrappasso, è unico nel Mondiale.',
      'Per la Ferrari è il circuito dei titoli: qui Michael Schumacher vinse il Mondiale 2000, il primo titolo piloti della Scuderia dopo ventun anni.',
    ],
  },
};
