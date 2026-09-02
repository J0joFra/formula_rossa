/**
 * app/legal/layout.js
 * Guscio delle pagine legali.
 *
 * Aveva un fondo scritto a mano (`from-black via-zinc-900 to-black`) che
 * ignorava il tema: in tema chiaro queste pagine restavano nere. Il colore lo
 * mette `body`, come nel resto del sito; qui resta solo lo spazio per la barra
 * fissa, che prima mancava perché mancava la barra.
 */
export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen pt-[70px] text-[var(--fr-text)]">
      {children}
    </div>
  );
}
