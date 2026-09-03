'use client';
/**
 * components/fanta/Leghe.jsx
 * Le leghe private: crearne una, entrare con un codice, guardare la tabella.
 *
 * La classifica pubblica premia chi gioca tutta la stagione; le leghe servono
 * a chi vuole solo battere i cinque amici con cui guarda la gara. È il motivo
 * per cui si torna la domenica dopo.
 */

import React, { useState } from 'react';
import { Users, Copy, Check, Plus, LogIn } from 'lucide-react';
import Classifica from './Classifica';

function CodiceCopiabile({ codice }) {
  const [copiato, setCopiato] = useState(false);
  const copia = async () => {
    try {
      await navigator.clipboard.writeText(codice);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 1800);
    } catch {
      /* Senza permesso per gli appunti il codice resta comunque leggibile a
         schermo: si copia a mano, non è un errore da mostrare. */
    }
  };
  return (
    <button type="button" onClick={copia}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] tabular text-xs font-bold tracking-widest"
      aria-label={`Copia il codice ${codice}`}>
      {codice}
      {copiato
        ? <Check className="w-3.5 h-3.5 text-[var(--fr-green,var(--fr-red))]" aria-hidden="true" />
        : <Copy className="w-3.5 h-3.5 text-[var(--fr-text-faint)]" aria-hidden="true" />}
    </button>
  );
}

export default function Leghe({ leghe, legaAperta, classificaLega, mioId, onCrea, onEntra, onApri }) {
  const [nome, setNome] = useState('');
  const [codice, setCodice] = useState('');
  const [errore, setErrore] = useState(null);
  const [inCorso, setInCorso] = useState(false);

  const invia = async (azione) => {
    setErrore(null);
    setInCorso(true);
    try {
      if (azione === 'crea') { await onCrea(nome); setNome(''); }
      else { await onEntra(codice); setCodice(''); }
    } catch (e) {
      setErrore(e.message);
    } finally {
      setInCorso(false);
    }
  };

  return (
    <div className="p-5 grid gap-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <form className="grid gap-2" onSubmit={e => { e.preventDefault(); invia('crea'); }}>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)]" htmlFor="fanta-nome-lega">
            Crea una lega
          </label>
          <div className="flex gap-2">
            <input
              id="fanta-nome-lega" value={nome} onChange={e => setNome(e.target.value)}
              placeholder="Nome della lega" maxLength={40}
              className="min-w-0 flex-1 px-3 py-2 rounded-[10px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)]"
            />
            <button type="submit" className="btn btn-outline" disabled={inCorso || nome.trim().length < 2}>
              <Plus className="w-4 h-4" aria-hidden="true" /> Crea
            </button>
          </div>
        </form>

        <form className="grid gap-2" onSubmit={e => { e.preventDefault(); invia('entra'); }}>
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)]" htmlFor="fanta-codice-lega">
            Entra con un codice
          </label>
          <div className="flex gap-2">
            <input
              id="fanta-codice-lega" value={codice}
              onChange={e => setCodice(e.target.value.toUpperCase())}
              placeholder="ABC234" maxLength={6}
              className="min-w-0 flex-1 px-3 py-2 rounded-[10px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)] tabular tracking-widest"
            />
            <button type="submit" className="btn btn-outline" disabled={inCorso || codice.trim().length !== 6}>
              <LogIn className="w-4 h-4" aria-hidden="true" /> Entra
            </button>
          </div>
        </form>
      </div>

      {errore && <p className="text-sm text-[var(--fr-red)]" role="alert">{errore}</p>}

      {leghe.length === 0 ? (
        <p className="text-sm text-[var(--fr-text-muted)]">
          Non sei in nessuna lega. Creane una e passa il codice a chi guarda la
          gara con te: la classifica sarà solo vostra.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Le tue leghe">
            {leghe.map(l => (
              <button
                key={l.id} type="button" role="tab"
                aria-selected={legaAperta === l.id}
                onClick={() => onApri(legaAperta === l.id ? null : l.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-[10px] border text-sm font-semibold transition-colors ${
                  legaAperta === l.id
                    ? 'border-[var(--fr-red)] bg-[var(--fr-red-soft)] text-[var(--fr-text)]'
                    : 'border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)]'
                }`}
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                {l.nome}
              </button>
            ))}
          </div>

          {legaAperta && (
            <div className="grid gap-3">
              <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--fr-text-muted)]">
                Codice d’invito:
                <CodiceCopiabile codice={leghe.find(l => l.id === legaAperta)?.codice || ''} />
              </p>
              <Classifica
                righe={classificaLega}
                mioId={mioId}
                vuota="Nessuno di questa lega ha ancora un punteggio: si comincia dal prossimo Gran Premio."
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
