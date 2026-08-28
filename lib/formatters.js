// lib/formatters.js
// Funzioni di formattazione condivise tra le pagine

// Punti F1 per posizione (1°→25pts, 2°→18pts, ...)
const PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const ptsFor = (position) =>
  position >= 1 && position <= 10 ? PTS[position - 1] : 0;

// Formatta secondi → "1:23.456"
export const formatLapTime = (seconds) => {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
};

// Formatta delta → "+0.342s" o "—"
export const formatDelta = (delta) => {
  if (delta == null) return '—';
  return (delta > 0 ? '+' : '') + delta.toFixed(3) + 's';
};

// Peso anno per le predizioni (anni recenti pesano di più)
export const yearWeight = (year, currentYear) => {
  const diff = currentYear - year;
  if (diff === 0) return 3.0;
  if (diff === 1) return 2.0;
  if (diff <= 3)  return 1.5;
  if (diff <= 5)  return 1.0;
  if (diff <= 10) return 0.6;
  return 0.3;
};