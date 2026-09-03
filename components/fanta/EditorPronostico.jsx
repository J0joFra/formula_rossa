'use client';
/**
 * components/fanta/EditorPronostico.jsx
 * La schedina: dieci posizioni, il pilota del giorno e i ritiri.
 *
 * Niente drag & drop. Sembra la scelta ovvia per una classifica, ma su
 * telefono — dove si gioca — trascinare dentro una pagina che scorre è la
 * strada più corta per perdere la giocata a metà. Qui si tocca un pilota per
 * metterlo in lista e si sposta con due frecce: funziona col dito, con il
 * mouse e con la tastiera, e non serve una libreria per farlo.
 */

import React from 'react';
import { ChevronUp, ChevronDown, X, Flag, Users, AlertTriangle } from 'lucide-react';
import { POSIZIONI_DA_PRONOSTICARE as N } from '../../lib/fanta/punteggio';

/** Etichetta della scommessa: la griglia dice quando una scelta è coraggiosa. */
function distintivoScommessa(pilota, posizione) {
  if (!pilota?.partenza) return null;
  const guadagno = pilota.partenza - posizione;
  if (guadagno < 4) return null;
  return `+${guadagno} sulla griglia`;
}

function Slot({ posizione, pilota, onSu, onGiu, onTogli }) {
  const scommessa = pilota && distintivoScommessa(pilota, posizione);
  return (
    <li className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface-2)]">
      <span className="tabular w-7 text-center text-sm font-bold text-[var(--fr-text-faint)]">
        {posizione}
      </span>

      {pilota ? (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-[var(--fr-text)]">{pilota.nome}</span>
            <span className="block truncate text-[11px] text-[var(--fr-text-muted)]">
              {pilota.scuderia}
              {pilota.partenza ? ` · parte ${pilota.partenza}°` : ''}
            </span>
          </span>

          {scommessa && (
            <span className="badge badge-yellow hidden sm:inline shrink-0">
              {scommessa}
            </span>
          )}

          <span className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={onSu} disabled={posizione === 1}
              className="icon-btn" aria-label={`Sposta ${pilota.nome} in ${posizione - 1}ª posizione`}>
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onGiu} disabled={posizione === N}
              className="icon-btn" aria-label={`Sposta ${pilota.nome} in ${posizione + 1}ª posizione`}>
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onTogli}
              className="icon-btn" aria-label={`Togli ${pilota.nome} dalla schedina`}>
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </span>
        </>
      ) : (
        <span className="flex-1 text-sm text-[var(--fr-text-faint)]">— scegli un pilota —</span>
      )}
    </li>
  );
}

export default function EditorPronostico({
  griglia, top10, pilotaDelGiorno, ritiri, aperto,
  onCambiaTop10, onCambiaPilotaDelGiorno, onCambiaRitiri,
}) {
  const perId = React.useMemo(
    () => Object.fromEntries(griglia.map(g => [g.driverId, g])),
    [griglia],
  );
  const scelti = new Set(top10);
  const liberi = griglia.filter(g => !scelti.has(g.driverId));

  const aggiungi = (driverId) => {
    if (top10.length >= N || scelti.has(driverId)) return;
    onCambiaTop10([...top10, driverId]);
  };
  const togli = (i) => onCambiaTop10(top10.filter((_, j) => j !== i));
  const sposta = (i, delta) => {
    const j = i + delta;
    if (j < 0 || j >= top10.length) return;
    const copia = [...top10];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onCambiaTop10(copia);
  };

  const slots = Array.from({ length: N }, (_, i) => top10[i] || null);

  return (
    <fieldset disabled={!aperto} className="grid gap-5 lg:grid-cols-2 p-5">
      <legend className="sr-only">La tua schedina</legend>

      {/* La classifica che stai costruendo */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide mb-3">
          <Flag className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
          Il tuo ordine d’arrivo
          <span className="ml-auto tabular text-xs font-semibold text-[var(--fr-text-faint)]">
            {top10.length}/{N}
          </span>
        </h3>
        <ol className="grid gap-1.5">
          {slots.map((id, i) => (
            <Slot
              key={i}
              posizione={i + 1}
              pilota={id ? perId[id] : null}
              onSu={() => sposta(i, -1)}
              onGiu={() => sposta(i, +1)}
              onTogli={() => togli(i)}
            />
          ))}
        </ol>
      </div>

      <div className="grid gap-5 content-start">
        {/* Chi resta da scegliere */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide mb-3">
            <Users className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
            Piloti disponibili
          </h3>
          {liberi.length === 0 ? (
            <p className="text-sm text-[var(--fr-text-muted)]">
              Li hai schierati tutti. Per cambiare, togline uno dalla lista.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {liberi.map(p => (
                <button
                  key={p.driverId}
                  type="button"
                  onClick={() => aggiungi(p.driverId)}
                  className="px-3 py-2 rounded-[10px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-left hover:border-[var(--fr-red)]/50 disabled:opacity-40 transition-colors"
                  disabled={top10.length >= N}
                >
                  <span className="block text-sm font-semibold text-[var(--fr-text)]">{p.nome}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-[var(--fr-text-faint)]">
                    {p.partenza ? `${p.partenza}° in griglia` : p.scuderia}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Le due domande che non riguardano l'ordine d'arrivo */}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)]">
              Pilota del giorno
            </span>
            <select
              value={pilotaDelGiorno || ''}
              onChange={e => onCambiaPilotaDelGiorno(e.target.value || null)}
              className="w-full px-3 py-2 rounded-[10px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)]"
            >
              <option value="">— nessuno —</option>
              {griglia.map(p => (
                <option key={p.driverId} value={p.driverId}>{p.nome}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)]">
              Quanti ritiri
            </span>
            <input
              type="number" min={0} max={20} inputMode="numeric"
              value={ritiri === null || ritiri === undefined ? '' : ritiri}
              onChange={e => onCambiaRitiri(e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-[10px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)] tabular"
            />
          </label>
        </div>

        {!aperto && (
          <p className="flex items-start gap-2 text-sm text-[var(--fr-text-muted)]">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--fr-gold)]" aria-hidden="true" />
            Le giocate per questo Gran Premio sono chiuse: la schedina resta
            visibile, ma non si può più modificare.
          </p>
        )}
      </div>
    </fieldset>
  );
}
