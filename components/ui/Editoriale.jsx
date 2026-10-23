/**
 * components/ui/Editoriale.jsx
 * Il commento di Formula Rossa sotto (o sopra) i numeri.
 *
 * Le pagine di dati erano solo tabelle: tutto materiale che chiunque può
 * ricavare da F1DB, e che per Google e AdSense vale poco. Il commento è la
 * parte che esiste solo qui. I testi stanno in content/editoriale.js.
 *
 * Gira sul server come il resto della pagina: niente animazioni che partono
 * da `opacity: 0`, il testo deve esserci anche senza JavaScript.
 */

import { PenLine } from 'lucide-react';
import { FIRMA } from '../../content/editoriale';

export default function Editoriale({ testo, className = '' }) {
  if (!testo) return null;
  return (
    <section
      aria-label="Il commento"
      className={`rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-6 md:p-8 ${className}`}
    >
      <span className="fr-eyebrow inline-flex items-center gap-2">
        <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
        Il commento
      </span>
      {testo.titolo && (
        <h2 className="uppercase text-xl md:text-2xl mt-3 text-[var(--fr-text)]">{testo.titolo}</h2>
      )}
      {/* Testo giustificato su tutta la larghezza del riquadro; la sillabazione
          (la pagina è in italiano) evita i buchi fra le parole su mobile. */}
      <div lang="it" className="mt-4 space-y-3.5 text-justify hyphens-auto text-[15px] leading-relaxed text-[var(--fr-text-muted)]">
        {testo.paragrafi.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <p className="mt-5 text-xs text-[var(--fr-text-faint)]">— {FIRMA}</p>
    </section>
  );
}
