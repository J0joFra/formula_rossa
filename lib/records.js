/**
 * lib/records.js
 * I record personali dei mini-giochi, salvati sul dispositivo come i token.
 *
 * Ogni gioco ha la sua chiave e il suo verso: nel Pit Stop vince il tempo più
 * basso, in Circuit Rush e nel Trivia il punteggio più alto.
 */

const chiave = (gioco) => `fr-record-${gioco}`;

/** Il record salvato, o null se non c'è (o lo storage non è disponibile). */
export function getRecord(gioco) {
  try {
    const v = localStorage.getItem(chiave(gioco));
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

/**
 * Confronta `valore` con il record e, se è migliore, lo salva.
 * Restituisce { record, nuovo }: il record aggiornato e se è appena cambiato.
 */
export function saveRecord(gioco, valore, verso = 'alto') {
  const attuale = getRecord(gioco);
  const meglio = attuale === null
    || (verso === 'alto' ? valore > attuale : valore < attuale);
  if (!meglio) return { record: attuale, nuovo: false };
  try {
    localStorage.setItem(chiave(gioco), String(valore));
  } catch {
    /* Storage bloccato: il record vale solo per questa partita. */
  }
  return { record: valore, nuovo: true };
}
