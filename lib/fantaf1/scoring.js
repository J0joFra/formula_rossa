/**
 * lib/fantaf1/scoring.js
 * =====================
 * Motore di punteggio FantaF1 — Formula Rossa
 *
 * Due tipi di eventi:
 *  - AUTO: calcolati automaticamente dai dati OpenF1 dopo la gara
 *  - MANUAL: inseriti dall'admin nel pannello (team radio, errori muretto, ecc.)
 */

// ─── TABELLA PUNTI ────────────────────────────────────────────────────────────

export const SCORING_RULES = {
  // Risultato gara
  P1:                    { points: 25,  label: '🏆 Vittoria',              type: 'auto' },
  P2:                    { points: 15,  label: '🥈 2° posto',              type: 'auto' },
  P3:                    { points: 10,  label: '🥉 3° posto',              type: 'auto' },
  POINTS_FINISH:         { points: 4,   label: '✅ Zona punti (4°-10°)',   type: 'auto' },
  POSITION_GAINED:       { points: 2,   label: '📈 Posizione guadagnata',  type: 'auto' }, // per ogni pos
  POSITION_LOST:         { points: -1,  label: '📉 Posizione persa',       type: 'auto' }, // per ogni pos
  POLE_POSITION:         { points: 8,   label: '⚡ Pole Position',         type: 'auto' },
  FASTEST_LAP:           { points: 5,   label: '⏱️ Giro veloce',           type: 'auto' },
  DNF:                   { points: -15, label: '💥 Ritiro (DNF)',          type: 'auto' },

  // Pit stop (da OpenF1 /pit endpoint)
  PIT_UNDER_2S:          { points: 15,  label: '🔥 Pit stop < 2s',         type: 'auto' },
  PIT_UNDER_3S:          { points: 8,   label: '✅ Pit stop < 3s',         type: 'auto' },
  PIT_OVER_5S:           { points: -10, label: '🐢 Pit stop > 5s',         type: 'auto' },

  // Penalità ufficiali (da OpenF1 /race_control)
  TIME_PENALTY:          { points: -5,  label: '🚩 Penalità tempo',        type: 'auto' },
  DRIVE_THROUGH:         { points: -10, label: '🚩 Drive through',         type: 'auto' },
  DISQUALIFIED:          { points: -25, label: '❌ Squalifica',            type: 'auto' },

  // ── MANUALI (inseriti dall'admin) ────────────────────────────────────────
  EPIC_TEAM_RADIO:       { points: 15,  label: '📻 Team radio epico',      type: 'manual' },
  STRATEGY_ERROR:        { points: -15, label: '🤦 Errore strategia muretto', type: 'manual' },
  OVERTAKE_LAST_LAP:     { points: 20,  label: '🎯 Sorpasso ultimo giro',  type: 'manual' },
  SAFETY_CAR_VICTIM:     { points: -10, label: '🚗 Safety car rovina gara', type: 'manual' },
  SPIN_OR_MISTAKE:       { points: -10, label: '💫 Errore in solitaria',   type: 'manual' },
  PIT_LANE_INCIDENT:     { points: -20, label: '🔧 Incidente in pit lane', type: 'manual' },
  DRIVER_OF_THE_DAY:     { points: 10,  label: '⭐ Driver of the Day',     type: 'manual' },
  MEME_MOMENT:           { points: 10,  label: '😂 Momento meme',          type: 'manual' },
};

// ─── CALCOLO AUTO DA DATI OPENF1 ─────────────────────────────────────────────

/**
 * Calcola i punti automatici per un pilota in una gara.
 * @param {object} raceResult - dati dal tuo backend/OpenF1
 * @param {number} raceResult.position        - posizione finale (1-20)
 * @param {number} raceResult.gridPosition    - posizione di partenza
 * @param {number} raceResult.pitDuration     - durata pit stop in secondi (il più veloce del pilota)
 * @param {boolean} raceResult.fastestLap     - ha fatto il giro veloce?
 * @param {boolean} raceResult.dnf            - si è ritirato?
 * @param {number}  raceResult.timePenalties  - numero di penalità tempo ricevute
 * @param {boolean} raceResult.driveThrough   - ha avuto drive through?
 * @param {boolean} raceResult.disqualified   - è stato squalificato?
 * @param {boolean} raceResult.isPole         - ha fatto la pole?
 * @returns {{ total: number, breakdown: Array }}
 */
export function calculateAutoPoints(raceResult) {
  const breakdown = [];
  let total = 0;

  const add = (ruleKey, multiplier = 1) => {
    const rule = SCORING_RULES[ruleKey];
    const pts = rule.points * multiplier;
    breakdown.push({
      key: ruleKey,
      label: rule.label + (multiplier > 1 ? ` ×${multiplier}` : ''),
      points: pts,
    });
    total += pts;
  };

  if (raceResult.dnf) {
    add('DNF');
  } else {
    // Posizione finale
    if (raceResult.position === 1) add('P1');
    else if (raceResult.position === 2) add('P2');
    else if (raceResult.position === 3) add('P3');
    else if (raceResult.position <= 10) add('POINTS_FINISH');

    // Posizioni guadagnate/perse rispetto alla griglia
    const delta = raceResult.gridPosition - raceResult.position;
    if (delta > 0) add('POSITION_GAINED', delta);
    else if (delta < 0) add('POSITION_LOST', Math.abs(delta));

    // Pit stop
    if (raceResult.pitDuration !== null && raceResult.pitDuration !== undefined) {
      if (raceResult.pitDuration < 2.0)      add('PIT_UNDER_2S');
      else if (raceResult.pitDuration < 3.0) add('PIT_UNDER_3S');
      else if (raceResult.pitDuration > 5.0) add('PIT_OVER_5S');
    }
  }

  // Pole position (indipendente dalla gara)
  if (raceResult.isPole) add('POLE_POSITION');

  // Giro veloce
  if (raceResult.fastestLap) add('FASTEST_LAP');

  // Penalità
  if (raceResult.disqualified)    add('DISQUALIFIED');
  else if (raceResult.driveThrough) add('DRIVE_THROUGH');
  else if (raceResult.timePenalties > 0) add('TIME_PENALTY', raceResult.timePenalties);

  return { total, breakdown };
}

/**
 * Calcola i punti manuali inseriti dall'admin.
 * @param {object} manualEvents - es. { EPIC_TEAM_RADIO: true, STRATEGY_ERROR: true }
 * @returns {{ total: number, breakdown: Array }}
 */
export function calculateManualPoints(manualEvents = {}) {
  const breakdown = [];
  let total = 0;

  for (const [key, active] of Object.entries(manualEvents)) {
    if (!active) continue;
    const rule = SCORING_RULES[key];
    if (!rule || rule.type !== 'manual') continue;
    breakdown.push({ key, label: rule.label, points: rule.points });
    total += rule.points;
  }

  return { total, breakdown };
}

/**
 * Calcola il punteggio totale combinando auto + manuale.
 */
export function calculateTotalPoints(raceResult, manualEvents = {}) {
  const auto   = calculateAutoPoints(raceResult);
  const manual = calculateManualPoints(manualEvents);

  return {
    total: auto.total + manual.total,
    autoTotal: auto.total,
    manualTotal: manual.total,
    breakdown: [...auto.breakdown, ...manual.breakdown],
  };
}