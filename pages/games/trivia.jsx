/**
 * pages/games/trivia.jsx
 * Dieci domande sulla storia della Ferrari e della Formula 1.
 *
 * Cosa è cambiato rispetto alla prima versione:
 * - ogni partita pesca 10 domande nuove dall'archivio (3 facili, 4 medie,
 *   3 difficili): prima le dieci erano scelte una volta sola al caricamento e
 *   "Rigioca" rimescolava sempre le stesse;
 * - le risposte vengono mescolate: nel file la giusta era la prima più di una
 *   volta su due, e bastava accorgersene;
 * - se scade il tempo si perde la domanda, non la partita (prima un solo
 *   timeout chiudeva tutto con una penalità del 30%);
 * - la spiegazione resta finché non si preme "Avanti", invece di sparire dopo
 *   un secondo e mezzo;
 * - si gioca anche da tastiera (1-4 o A-D, Invio per andare avanti);
 * - colori del tema del sito, leggibili anche in chiaro.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Timer, Flame, Zap, RefreshCw, ArrowRight, AlertTriangle, Coins, Trophy,
} from 'lucide-react';
import GameShell, { Record } from '../../components/ui/GameShell';
import { addTokens, getTokens } from '../../lib/tokens';
import { getRecord, saveRecord } from '../../lib/records';

const SEO_TRIVIA = {
  title: 'F1 Trivia — quiz sulla storia della Ferrari',
  description: 'Quiz a tempo sulla storia della Scuderia Ferrari e della Formula 1: piloti, titoli, circuiti e record. Dieci domande nuove a ogni partita.',
  path: '/games/trivia',
};

const DOMANDE = 10;
const SECONDI = 15;
const MIX = { Easy: 3, Medium: 4, Hard: 3 };

const LIVELLI = {
  Easy:   { label: 'Facile',    fg: 'var(--fr-success)' },
  Medium: { label: 'Media',     fg: 'var(--fr-warning)' },
  Hard:   { label: 'Difficile', fg: 'var(--fr-danger)' },
};

function mescola(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Dieci domande col mix di difficoltà, e le risposte di ognuna mescolate. */
function nuovaPartita(archivio) {
  const scelte = Object.entries(MIX).flatMap(([livello, n]) =>
    mescola(archivio.filter((d) => d.difficulty === livello)).slice(0, n));
  // Se un livello ha meno domande del previsto, si completa con le altre.
  const resto = mescola(archivio.filter((d) => !scelte.includes(d)));
  return mescola([...scelte, ...resto].slice(0, DOMANDE)).map((d) => {
    const ordine = mescola(d.options.map((_, i) => i));
    return { ...d, options: ordine.map((i) => d.options[i]), correct: ordine.indexOf(d.correct) };
  });
}

const BOX = 'rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)]';

export default function F1Trivia() {
  const [archivio, setArchivio] = useState(null);   // null = caricamento
  const [errore, setErrore] = useState(false);
  const [fase, setFase] = useState('intro');        // intro | gioco | fine
  const [domande, setDomande] = useState([]);
  const [indice, setIndice] = useState(0);
  const [scelta, setScelta] = useState(null);       // indice risposta, -1 = tempo scaduto
  const [tempo, setTempo] = useState(SECONDI);
  const [storia, setStoria] = useState([]);         // { giusta, punti, bonus }
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [esito, setEsito] = useState(null);         // { punteggio, token, nuovoRecord }
  const [token, setToken] = useState(0);
  const [record, setRecord] = useState(null);
  const avantiRef = useRef(null);

  useEffect(() => {
    fetch('/data/trivia-questions.json')
      .then((r) => r.json())
      .then((d) => setArchivio(d.questions || []))
      .catch(() => { setErrore(true); setArchivio([]); });
    setToken(getTokens());
    setRecord(getRecord('trivia'));
  }, []);

  const d = domande[indice];
  const risposto = scelta !== null;

  const inizia = () => {
    setDomande(nuovaPartita(archivio));
    setIndice(0);
    setScelta(null);
    setTempo(SECONDI);
    setStoria([]);
    setStreak(0);
    setMaxStreak(0);
    setEsito(null);
    setFase('gioco');
  };

  const rispondi = useCallback((i) => {
    if (fase !== 'gioco' || risposto || !d) return;
    const giusta = i === d.correct;
    const bonus = giusta && tempo > SECONDI - 5 ? Math.round(d.points * 0.2) : 0;
    const nuovoStreak = giusta ? streak + 1 : 0;
    setStreak(nuovoStreak);
    setMaxStreak((m) => Math.max(m, nuovoStreak));
    setScelta(i);
    setStoria((s) => [...s, { giusta, punti: giusta ? d.points + bonus : 0, bonus }]);
  }, [fase, risposto, d, tempo, streak]);

  const avanti = useCallback(() => {
    if (!risposto) return;
    if (indice + 1 < domande.length) {
      setIndice((n) => n + 1);
      setScelta(null);
      setTempo(SECONDI);
      return;
    }
    const base = storia.reduce((s, h) => s + h.punti, 0);
    const punteggio = base + maxStreak * 10;
    const guadagnati = 10 + Math.floor(punteggio / 10);
    setToken(addTokens(guadagnati));
    const r = saveRecord('trivia', punteggio, 'alto');
    setRecord(r.record);
    setEsito({ punteggio, token: guadagnati, nuovoRecord: r.nuovo });
    setFase('fine');
  }, [risposto, indice, domande.length, storia, maxStreak]);

  // Timer: allo scadere la domanda conta come sbagliata, e si va avanti.
  useEffect(() => {
    if (fase !== 'gioco' || risposto) return;
    if (tempo <= 0) { rispondi(-1); return; }
    const t = setTimeout(() => setTempo((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [fase, risposto, tempo, rispondi]);

  // Dopo la risposta il fuoco va su "Avanti", così Invio porta alla prossima.
  useEffect(() => { if (risposto) avantiRef.current?.focus(); }, [risposto]);

  // Tastiera: 1-4 o A-D per rispondere.
  useEffect(() => {
    if (fase !== 'gioco') return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const i = ['1', '2', '3', '4'].indexOf(k) >= 0 ? Number(k) - 1 : ['a', 'b', 'c', 'd'].indexOf(k);
      if (i >= 0 && d && i < d.options.length) rispondi(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fase, d, rispondi]);

  const shellProps = {
    seo: SEO_TRIVIA,
    title: 'F1',
    accent: 'Trivia',
    subtitle: 'Dieci domande sulla storia della Ferrari e della Formula 1, quindici secondi per ognuna. Rispondere in fretta e di fila vale di più.',
    tokens: token,
    record: <Record label="Record" value={record} />,
  };

  if (archivio === null) {
    return (
      <GameShell {...shellProps}>
        <div className={`${BOX} py-24 grid place-items-center`} role="status">
          <span className="w-10 h-10 border-4 border-[var(--fr-red)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Caricamento domande…</span>
        </div>
      </GameShell>
    );
  }

  if (errore || archivio.length < DOMANDE) {
    return (
      <GameShell {...shellProps}>
        <div className="empty-state">
          <AlertTriangle className="empty-state-icon" aria-hidden="true" />
          <h2 className="empty-state-title">Domande non disponibili</h2>
          <p className="empty-state-description">Non siamo riusciti a caricare le domande. Riprova fra poco.</p>
          <Link href="/fanzone" className="btn btn-outline mt-5">Torna alla Fan Zone</Link>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell {...shellProps}>
      <div className="max-w-3xl mx-auto">

        {/* ── INTRO ── */}
        {fase === 'intro' && (
          <div className={`${BOX} p-6 md:p-10`}>
            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {[
                { icon: Timer, titolo: `${SECONDI} secondi`, testo: 'per ogni domanda. Allo scadere, la risposta conta come sbagliata.' },
                { icon: Zap, titolo: 'Bonus velocità', testo: '+20% se rispondi giusto nei primi 5 secondi.' },
                { icon: Flame, titolo: 'Serie', testo: '+10 punti per ogni risposta della tua serie più lunga.' },
              ].map((r) => (
                <div key={r.titolo} className="rounded-[var(--radius-md)] bg-[var(--fr-surface-2)] p-4">
                  <r.icon className="w-5 h-5 text-[var(--fr-red)] mb-2" aria-hidden="true" />
                  <p className="font-bold text-sm text-[var(--fr-text)]">{r.titolo}</p>
                  <p className="text-xs text-[var(--fr-text-muted)] mt-1">{r.testo}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--fr-text-muted)] mb-6">
              {archivio.length} domande in archivio: ogni partita ne pesca dieci nuove, dalle più facili alle più difficili.
              Da tastiera rispondi con <kbd className="tabular">1</kbd>–<kbd className="tabular">4</kbd> e vai avanti con <kbd className="tabular">Invio</kbd>.
            </p>
            <button type="button" onClick={inizia} className="btn btn-primary w-full sm:w-auto">
              Inizia il quiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── GIOCO ── */}
        {fase === 'gioco' && d && (
          <div className={`${BOX} p-5 md:p-8`}>
            {/* Avanzamento, serie, punti */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--fr-text-faint)]">
                Domanda <span className="tabular text-[var(--fr-text)]">{indice + 1}</span> di {domande.length}
              </span>
              <span className="flex items-center gap-4">
                {streak > 1 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--fr-accent-orange)]">
                    <Flame className="w-3.5 h-3.5" aria-hidden="true" /> {streak} di fila
                  </span>
                )}
                <span className="tabular font-bold text-[var(--fr-text)]">
                  {storia.reduce((s, h) => s + h.punti, 0)} <span className="text-xs text-[var(--fr-text-faint)]">pt</span>
                </span>
              </span>
            </div>

            {/* Barra del tempo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 rounded-full bg-[var(--fr-surface-2)] overflow-hidden" aria-hidden="true">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                  style={{
                    width: `${(tempo / SECONDI) * 100}%`,
                    background: tempo > 10 ? 'var(--fr-success)' : tempo > 5 ? 'var(--fr-warning)' : 'var(--fr-danger)',
                  }}
                />
              </div>
              <span className="tabular text-sm font-bold w-8 text-right" aria-live="off">{tempo}s</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider">
              <span style={{ color: LIVELLI[d.difficulty]?.fg }}>{LIVELLI[d.difficulty]?.label ?? d.difficulty} · {d.points} pt</span>
              <span className="text-[var(--fr-text-dim)]" aria-hidden="true">·</span>
              <span className="text-[var(--fr-text-faint)]">{d.category}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold leading-snug text-[var(--fr-text)] mb-6 normal-case">{d.question}</h2>

            <div className="grid md:grid-cols-2 gap-3">
              {d.options.map((opt, i) => {
                const giusta = i === d.correct;
                const scelta_ = i === scelta;
                let stile = 'border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-border-strong)] hover:bg-[var(--fr-surface-2)]';
                if (risposto) {
                  if (giusta) stile = 'border-[var(--fr-success)] bg-[color-mix(in_srgb,var(--fr-success)_12%,transparent)]';
                  else if (scelta_) stile = 'border-[var(--fr-danger)] bg-[color-mix(in_srgb,var(--fr-danger)_12%,transparent)]';
                  else stile = 'border-[var(--fr-border)] bg-[var(--fr-surface)] opacity-50';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => rispondi(i)}
                    disabled={risposto}
                    className={`flex items-center gap-3 p-4 rounded-[var(--radius-md)] border-2 text-left transition-colors ${stile}`}
                  >
                    <span className="w-8 h-8 shrink-0 rounded-lg grid place-items-center bg-[var(--fr-surface-2)] text-xs font-bold text-[var(--fr-text-muted)]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-semibold text-sm text-[var(--fr-text)]">{opt}</span>
                    {risposto && giusta && <CheckCircle2 className="w-5 h-5 ml-auto shrink-0 text-[var(--fr-success)]" aria-label="Risposta giusta" />}
                    {risposto && scelta_ && !giusta && <XCircle className="w-5 h-5 ml-auto shrink-0 text-[var(--fr-danger)]" aria-label="Risposta sbagliata" />}
                  </button>
                );
              })}
            </div>

            {risposto && (
              <div className="mt-6 rounded-[var(--radius-md)] bg-[var(--fr-surface-2)] p-5" aria-live="polite">
                <p className="font-bold text-sm" style={{ color: scelta === d.correct ? 'var(--fr-success)' : 'var(--fr-danger)' }}>
                  {scelta === d.correct
                    ? `Giusto! +${storia[storia.length - 1]?.punti} punti${storia[storia.length - 1]?.bonus ? ' (con bonus velocità)' : ''}`
                    : scelta === -1 ? `Tempo scaduto. La risposta era: ${d.options[d.correct]}` : `Sbagliato. La risposta era: ${d.options[d.correct]}`}
                </p>
                {d.explanation && <p className="text-sm text-[var(--fr-text-muted)] mt-1.5">{d.explanation}</p>}
                <button ref={avantiRef} type="button" onClick={avanti} className="btn btn-primary mt-4">
                  {indice + 1 < domande.length ? 'Avanti' : 'Vedi il risultato'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FINE ── */}
        {fase === 'fine' && esito && (
          <div className={`${BOX} p-6 md:p-10 text-center`}>
            {esito.nuovoRecord && (
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--fr-gold)_18%,transparent)] text-[var(--fr-gold)] text-xs font-bold uppercase tracking-wider mb-4">
                <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> Nuovo record
              </p>
            )}
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--fr-text-faint)]">Punteggio</p>
            <p className="tabular text-6xl md:text-7xl font-bold text-[var(--fr-text)] mt-1">{esito.punteggio}</p>
            <p className="text-sm text-[var(--fr-text-muted)] mt-2">
              {storia.filter((h) => h.giusta).length} risposte giuste su {storia.length}
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto my-8">
              {[
                { label: 'Serie migliore', value: maxStreak },
                { label: 'Bonus velocità', value: `+${storia.reduce((s, h) => s + h.bonus, 0)}` },
                { label: 'SF Token', value: `+${esito.token}`, icon: Coins },
              ].map((s) => (
                <div key={s.label} className="rounded-[var(--radius-md)] bg-[var(--fr-surface-2)] p-3">
                  <p className="tabular text-xl font-bold text-[var(--fr-text)]">{s.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fr-text-faint)] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={inizia} className="btn btn-primary">
                <RefreshCw className="w-4 h-4" aria-hidden="true" /> Nuova partita
              </button>
              <Link href="/fanzone" className="btn btn-outline">Fan Zone</Link>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
