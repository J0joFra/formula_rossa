/**
 * lib/tokens.js
 * Gli SF Token dei mini-giochi, salvati sul dispositivo.
 *
 * Prima stavano su Firestore e servivano l'accesso con Google. L'accesso è
 * stato tolto: i token ora restano nel browser di chi gioca, senza account.
 * Si perdono cancellando i dati del sito, ed è un prezzo accettabile per un
 * punteggio che non dà accesso a nulla.
 */

const KEY = 'fr-sf-tokens';

/** Il saldo attuale; 0 se lo storage non è disponibile (navigazione privata). */
export function getTokens() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Aggiunge `amount` token e restituisce il nuovo saldo. */
export function addTokens(amount) {
  const totale = getTokens() + Math.max(0, Math.floor(amount));
  try {
    localStorage.setItem(KEY, String(totale));
  } catch {
    /* Storage pieno o bloccato: la partita vale lo stesso, il saldo no. */
  }
  return totale;
}
