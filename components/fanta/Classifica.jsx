'use client';
/**
 * components/fanta/Classifica.jsx
 * La tabella delle classifiche del Fanta: stagione, singolo GP o lega.
 *
 * Una sola tabella per tre usi. Le colonne cambiano di poco fra un caso e
 * l'altro, e tre tabelle quasi uguali sono tre posti in cui sistemare lo
 * stesso allineamento.
 */

import React from 'react';
import { Trophy } from 'lucide-react';

const MEDAGLIE = ['🥇', '🥈', '🥉'];

export default function Classifica({ righe, mioId, perGara = false, vuota }) {
  if (!righe?.length) {
    return (
      <div className="empty-state">
        <Trophy className="empty-state-icon" aria-hidden="true" />
        <p className="empty-state-title">Classifica vuota</p>
        <p className="empty-state-description">
          {vuota || 'Nessuna giocata ancora registrata. La prima vale il primo posto.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Giocatore</th>
            {!perGara && <th scope="col" className="text-right">Gare</th>}
            {!perGara && <th scope="col" className="text-right">Miglior GP</th>}
            <th scope="col" className="text-right">Punti</th>
          </tr>
        </thead>
        <tbody>
          {righe.map((r, i) => {
            const id = r.userId || r.user_id;
            const io = !!mioId && id === mioId;
            const pos = r.posizione ?? i + 1;
            return (
              <tr key={id ?? i} className={io ? 'bg-[var(--fr-red-soft)]' : undefined}>
                <td className="tabular font-bold w-14">
                  {MEDAGLIE[pos - 1]
                    ? <span aria-label={`${pos}° posto`}>{MEDAGLIE[pos - 1]}</span>
                    : pos}
                </td>
                <td className={io ? 'font-semibold text-[var(--fr-text)]' : undefined}>
                  {r.nome || r.display_name || 'Anonimo'}
                  {io && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--fr-red)]">
                      tu
                    </span>
                  )}
                </td>
                {!perGara && <td className="tabular text-right">{r.gare_giocate ?? '—'}</td>}
                {!perGara && <td className="tabular text-right">{r.miglior_gara ?? '—'}</td>}
                <td className="tabular text-right font-bold">{r.punti ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
