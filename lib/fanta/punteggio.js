/**
 * lib/fanta/punteggio.js
 * Le regole del Fanta GP e il calcolo del punteggio.
 *
 * Tutto qui dentro è funzione pura: entrano una previsione e un risultato,
 * esce un punteggio con la sua spiegazione. Nessuna rete, nessun database,
 * niente sessione. È voluto — il punteggio è la cosa che deve essere sopra
 * ogni sospetto, quindi dev'essere leggibile, ripetibile e verificabile senza
 * far girare il sito.
 *
 * Il calcolo NON va fatto nel browser. Queste funzioni girano sul server, sul
 * risultato ufficiale letto dall'archivio: se il punteggio arrivasse dal
 * client, la classifica varrebbe quanto la buona fede di chi ci gioca.
 */

/* ─── I numeri, tutti in un posto ────────────────────────────────────────────
   Sono tarati perché nessuna singola voce decida la giornata. Il grosso viene
   dall'azzeccare le posizioni una per una (fino a 100 punti); i bonus valgono
   quanto basta a premiare la lettura giusta della gara senza scavalcare il
   lavoro fatto sulla classifica.

   Si gioca a griglia già nota, dopo le qualifiche. Questo cambia due cose e
   le regole ne tengono conto:
   - indovinare vincitore e podio è più facile, quindi quei bonus pesano meno
     di quanto peserebbero giocando al buio;
   - il merito si sposta sul prevedere cosa succede *durante* la gara, non su
     ricopiare la griglia. Da qui la "scommessa": vale solo se metti qualcuno
     molto più avanti di dove parte e la gara ti dà ragione.

   Cambiare qui dentro cambia il gioco: sono pensati per un massimo teorico di
   184 e una buona giocata sui 60-100. */
export const REGOLE = {
  posizioni: {
    esatta:      10,  // il pilota è proprio lì
    scartoUno:    6,  // sbagliato di una posizione
    scartoDue:    4,  // sbagliato di due
    inTopDieci:   2,  // c'è, ma lontano da dove l'avevi messo
  },
  podio: {
    esatto:      20,  // i tre giusti, nell'ordine giusto
    ordineErrato: 10, // i tre giusti, ordine sbagliato
    dueSuTre:     5,
  },
  vincitore:     12,
  insieme: {
    dieciSuDieci: 20, // hai indovinato *chi* va a punti, ordine a parte
    ottoONove:     8,
  },
  /* La scommessa: un pilota che metti almeno quattro posizioni più avanti di
     dove parte, e che finisce lì o meglio. È l'unica voce che non si può
     ottenere ricopiando la griglia, e vale il doppio di una posizione esatta.
     Massimo due, altrimenti conviene sparare rimonte a caso. */
  scommessa:      12,
  scommesseMax:    2,

  pilotaDelGiorno: 10,
  ritiri: {
    esatti:      10,
    scartoUno:    4,
  },
  /* I malus.
     Il criterio è uno solo: si paga per le scelte che si è deciso di fare,
     non per aver sbagliato una posizione. Chi rischia deve poterlo fare senza
     essere punito due volte — il rischio si paga già da sé, perché una
     posizione sbagliata non porta punti.
     Quello che invece si paga è: mettere qualcuno dove non è arrivato
     nemmeno vicino, sparare numeri a caso, e — soprattutto — non giocare. */
  malus: {
    podioFuoriDaiPunti: -5,
    vincitoreFuoriDaiCinque: -3,
    /* Podio completamente sbagliato: nessuno dei tuoi tre ci sale. Non è
       sfortuna, è aver letto la gara al contrario. */
    podioTuttoSbagliato: -6,
    /* Il pilota del giorno finisce fuori dai punti o si ritira. Era una
       scelta gratis: adesso costa qualcosa sceglierlo a caso. */
    pilotaDelGiornoFuoriDaiPunti: -3,
    /* Una scommessa che va a rovescio: hai messo un pilota almeno quattro
       posizioni davanti alla sua griglia e lui ha invece perso posizioni.
       È il rovescio esatto del bonus, e vale meno del bonus: la rimonta
       resta conveniente da provare. */
    scommessaFallita: -4,
    scommesseFalliteMax: 2,
    /* Ritiri sparati a caso: sbagliare di quattro o più. Prima il numero dei
       ritiri era una lotteria gratuita — scrivere 10 non costava niente. */
    ritiriLontani: -5,
    /* La schedina fotocopia: otto o più piloti lasciati esattamente dove
       partono. È giocare senza giocare, e il Fanta a griglia nota esiste per
       prevedere la gara, non per ricopiare le qualifiche. */
    grigliaRicopiata: -8,
    grigliaRicopiataDa: 8,
  },
};

export const POSIZIONI_DA_PRONOSTICARE = 10;

/** Le posizioni sono 1-based verso l'utente, 0-based nell'array. */
const posizioneReale = (ordine, driverId) => {
  const i = ordine.indexOf(driverId);
  return i === -1 ? null : i + 1;
};

/**
 * Punteggio di una previsione contro il risultato ufficiale.
 *
 * `previsione.top10`  — dieci id pilota, dal primo al decimo
 * `previsione.pilotaDelGiorno` — un id, o null
 * `previsione.ritiri` — quanti piloti non vedranno la bandiera a scacchi
 *
 * `risultato.ordine`  — la classifica finale, dal primo all'ultimo
 * `risultato.griglia` — { driverId: posizione di partenza }, per le scommesse
 * `risultato.pilotaDelGiorno`, `risultato.ritiri`
 *
 * Restituisce `{ totale, voci }`, dove `voci` è l'elenco di cosa ha dato o
 * tolto punti: serve a mostrare all'utente perché ha preso quel punteggio,
 * che è metà del divertimento.
 */
export function calcolaPunteggio(previsione, risultato) {
  const voci = [];
  const aggiungi = (etichetta, punti, dettaglio) => {
    if (punti !== 0) voci.push({ etichetta, punti, dettaglio });
  };

  const top10 = (previsione?.top10 || []).slice(0, POSIZIONI_DA_PRONOSTICARE);
  const ordine = risultato?.ordine || [];
  const topRealeDieci = ordine.slice(0, POSIZIONI_DA_PRONOSTICARE);

  // ── Posizione per posizione ──
  let puntiPosizioni = 0;
  let esatte = 0;
  top10.forEach((driverId, i) => {
    const previstaUno = i + 1;
    const reale = posizioneReale(ordine, driverId);
    if (reale === null || reale > POSIZIONI_DA_PRONOSTICARE) return;
    const scarto = Math.abs(reale - previstaUno);
    if (scarto === 0)      { puntiPosizioni += REGOLE.posizioni.esatta; esatte++; }
    else if (scarto === 1) puntiPosizioni += REGOLE.posizioni.scartoUno;
    else if (scarto === 2) puntiPosizioni += REGOLE.posizioni.scartoDue;
    else                   puntiPosizioni += REGOLE.posizioni.inTopDieci;
  });
  aggiungi('Posizioni', puntiPosizioni, `${esatte} in posizione esatta su ${top10.length}`);

  // ── Podio ──
  const podioPrevisto = top10.slice(0, 3);
  const podioReale = ordine.slice(0, 3);
  const azzeccatiSulPodio = podioPrevisto.filter(d => podioReale.includes(d)).length;
  const podioEsatto = podioPrevisto.length === 3
    && podioPrevisto.every((d, i) => d === podioReale[i]);

  if (podioEsatto) {
    aggiungi('Podio esatto', REGOLE.podio.esatto, podioReale.join(' · '));
  } else if (azzeccatiSulPodio === 3) {
    aggiungi('Podio giusto, ordine sbagliato', REGOLE.podio.ordineErrato);
  } else if (azzeccatiSulPodio === 2) {
    aggiungi('Due piloti su tre sul podio', REGOLE.podio.dueSuTre);
  }

  // ── Vincitore ──
  if (top10[0] && top10[0] === ordine[0]) {
    aggiungi('Vincitore', REGOLE.vincitore, top10[0]);
  }

  // ── I dieci come insieme, ordine a parte ──
  const azzeccatiInTop = top10.filter(d => topRealeDieci.includes(d)).length;
  if (azzeccatiInTop === POSIZIONI_DA_PRONOSTICARE) {
    aggiungi('Tutti e dieci a punti', REGOLE.insieme.dieciSuDieci);
  } else if (azzeccatiInTop >= 8) {
    aggiungi('Otto o nove su dieci a punti', REGOLE.insieme.ottoONove, `${azzeccatiInTop}/10`);
  }

  // ── Scommesse: rimonte previste e riuscite ──
  const griglia = risultato?.griglia || {};
  const scommesseVinte = [];
  top10.forEach((driverId, i) => {
    const previstaUno = i + 1;
    const partenza = griglia[driverId];
    if (!partenza) return;
    // Almeno quattro posizioni di rimonta prevista…
    if (partenza - previstaUno < 4) return;
    const reale = posizioneReale(ordine, driverId);
    // …e la gara deve darti ragione: arriva lì o meglio.
    if (reale !== null && reale <= previstaUno) scommesseVinte.push(driverId);
  });
  if (scommesseVinte.length) {
    const contate = scommesseVinte.slice(0, REGOLE.scommesseMax);
    aggiungi(
      contate.length > 1 ? 'Rimonte previste' : 'Rimonta prevista',
      REGOLE.scommessa * contate.length,
      contate.join(' · '),
    );
  }

  // ── Pilota del giorno ──
  if (previsione?.pilotaDelGiorno
      && risultato?.pilotaDelGiorno
      && previsione.pilotaDelGiorno === risultato.pilotaDelGiorno) {
    aggiungi('Pilota del giorno', REGOLE.pilotaDelGiorno, risultato.pilotaDelGiorno);
  }

  // ── Ritiri ──
  if (Number.isInteger(previsione?.ritiri) && Number.isInteger(risultato?.ritiri)) {
    const scarto = Math.abs(previsione.ritiri - risultato.ritiri);
    if (scarto === 0)      aggiungi('Ritiri esatti', REGOLE.ritiri.esatti, `${risultato.ritiri}`);
    else if (scarto === 1) aggiungi('Ritiri per uno', REGOLE.ritiri.scartoUno, `previsti ${previsione.ritiri}, reali ${risultato.ritiri}`);
  }

  // ── Malus ──
  const fuoriDaiPunti = podioPrevisto.filter(d => {
    const reale = posizioneReale(ordine, d);
    return reale === null || reale > POSIZIONI_DA_PRONOSTICARE;
  });
  if (fuoriDaiPunti.length) {
    aggiungi(
      'Podio fuori dai punti',
      REGOLE.malus.podioFuoriDaiPunti * fuoriDaiPunti.length,
      fuoriDaiPunti.join(' · '),
    );
  }

  const posVincitorePrevisto = top10[0] ? posizioneReale(ordine, top10[0]) : null;
  if (top10[0] && (posVincitorePrevisto === null || posVincitorePrevisto > 5)) {
    aggiungi('Vincitore previsto fuori dai primi cinque', REGOLE.malus.vincitoreFuoriDaiCinque, top10[0]);
  }

  /* Podio tutto sbagliato: si applica solo se un podio l'avevi davvero
     pronosticato — con meno di tre nomi non c'è niente da sbagliare. */
  if (podioPrevisto.length === 3 && azzeccatiSulPodio === 0 && podioReale.length === 3) {
    aggiungi('Nessuno del tuo podio ci sale', REGOLE.malus.podioTuttoSbagliato, podioPrevisto.join(' · '));
  }

  if (previsione?.pilotaDelGiorno && ordine.length) {
    const posPdg = posizioneReale(ordine, previsione.pilotaDelGiorno);
    if (posPdg === null || posPdg > POSIZIONI_DA_PRONOSTICARE) {
      aggiungi(
        'Pilota del giorno fuori dai punti',
        REGOLE.malus.pilotaDelGiornoFuoriDaiPunti,
        previsione.pilotaDelGiorno,
      );
    }
  }

  /* Scommesse andate a rovescio: stesse candidate del bonus (rimonta di
     almeno quattro posizioni prevista), ma il pilota ha perso posizioni
     rispetto alla griglia — o non è arrivato affatto. */
  const scommesseFallite = top10.filter((driverId, i) => {
    const partenza = griglia[driverId];
    if (!partenza || partenza - (i + 1) < 4) return false;
    const reale = posizioneReale(ordine, driverId);
    return reale === null || reale > partenza;
  });
  if (scommesseFallite.length) {
    const contate = scommesseFallite.slice(0, REGOLE.malus.scommesseFalliteMax);
    aggiungi(
      contate.length > 1 ? 'Rimonte finite peggio della griglia' : 'Rimonta finita peggio della griglia',
      REGOLE.malus.scommessaFallita * contate.length,
      contate.join(' · '),
    );
  }

  if (Number.isInteger(previsione?.ritiri) && Number.isInteger(risultato?.ritiri)
      && Math.abs(previsione.ritiri - risultato.ritiri) >= 4) {
    aggiungi(
      'Ritiri lontanissimi',
      REGOLE.malus.ritiriLontani,
      `previsti ${previsione.ritiri}, reali ${risultato.ritiri}`,
    );
  }

  /* La fotocopia della griglia. Si misura sulla schedina, non sul risultato:
     è una penalità per come hai giocato, quindi non dipende da come è andata
     la gara. */
  const ricopiati = top10.filter((driverId, i) => griglia[driverId] === i + 1).length;
  if (ricopiati >= REGOLE.malus.grigliaRicopiataDa) {
    aggiungi(
      'Schedina ricopiata dalla griglia',
      REGOLE.malus.grigliaRicopiata,
      `${ricopiati} piloti su ${top10.length} lasciati dove partono`,
    );
  }

  const totale = voci.reduce((s, v) => s + v.punti, 0);
  return { totale, voci };
}

/**
 * Una previsione è valida?
 *
 * Si controlla qui e si ricontrolla sul server prima di salvare: è l'unico
 * punto in cui si può impedire che arrivi una giocata con venti piloti, o
 * con lo stesso pilota messo tre volte.
 */
export function validaPrevisione(previsione, pilotiAmmessi) {
  const errori = [];
  const top10 = previsione?.top10 || [];

  if (top10.length !== POSIZIONI_DA_PRONOSTICARE) {
    errori.push(`Servono ${POSIZIONI_DA_PRONOSTICARE} piloti, ne hai messi ${top10.length}.`);
  }
  if (new Set(top10).size !== top10.length) {
    errori.push('Lo stesso pilota compare più di una volta.');
  }
  if (pilotiAmmessi) {
    const ammessi = new Set(pilotiAmmessi);
    const estranei = [...new Set(top10.filter(d => !ammessi.has(d)))];
    if (estranei.length) errori.push(`Piloti non in griglia: ${estranei.join(', ')}.`);
    if (previsione?.pilotaDelGiorno && !ammessi.has(previsione.pilotaDelGiorno)) {
      errori.push('Il pilota del giorno scelto non è in griglia.');
    }
  }
  const r = previsione?.ritiri;
  if (!Number.isInteger(r) || r < 0 || r > 20) {
    errori.push('I ritiri previsti devono essere un numero fra 0 e 20.');
  }

  return { valida: errori.length === 0, errori };
}

/** Il massimo teorico, utile per mostrare "hai fatto 74 su 180". */
export function punteggioMassimo() {
  return REGOLE.posizioni.esatta * POSIZIONI_DA_PRONOSTICARE
    + REGOLE.podio.esatto
    + REGOLE.vincitore
    + REGOLE.insieme.dieciSuDieci
    + REGOLE.scommessa * REGOLE.scommesseMax
    + REGOLE.pilotaDelGiorno
    + REGOLE.ritiri.esatti;
}
