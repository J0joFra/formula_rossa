/**
 * pages/games/pitstop.jsx
 * Pit Stop: il cambio gomme della Ferrari, cronometrato.
 *
 * Prima il gioco si chiamava Pit Stop ma era "ferma il cronometro a X
 * secondi". Ora è un pit stop vero: la macchina si ferma, le quattro ruote si
 * accendono una alla volta in ordine casuale e vanno toccate subito (la ruota
 * sbagliata costa mezzo secondo); poi il lecca-lecca passa al verde e si
 * riparte. Partire col rosso costa un secondo. Vince il tempo più basso.
 *
 * Si gioca col tocco o da tastiera: Q E A D per le ruote, spazio per ripartire.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Timer, RefreshCw, Coins, Trophy, Keyboard } from 'lucide-react';
import GameShell, { Record } from '../../components/ui/GameShell';
import { addTokens, getTokens } from '../../lib/tokens';
import { getRecord, saveRecord } from '../../lib/records';

const SEO = {
  title: 'Pit Stop Challenge — gioco di riflessi F1',
  description: 'Cambia le quattro gomme della Ferrari e riparti al verde: un pit stop cronometrato, al centesimo. Riesci a stare sotto i due secondi?',
  path: '/games/pitstop',
};

/* Le quattro ruote viste dall'alto (muso in alto), con il tasto che le cambia. */
const RUOTE = [
  { id: 'ant-sx',  label: 'Anteriore sinistra',  tasto: 'Q', pos: 'left-[6%] top-[18%]' },
  { id: 'ant-dx',  label: 'Anteriore destra',    tasto: 'E', pos: 'right-[6%] top-[18%]' },
  { id: 'post-sx', label: 'Posteriore sinistra', tasto: 'A', pos: 'left-[6%] bottom-[14%]' },
  { id: 'post-dx', label: 'Posteriore destra',   tasto: 'D', pos: 'right-[6%] bottom-[14%]' },
];
const TASTI = { q: 0, e: 1, a: 2, d: 3 };

const PENALITA_RUOTA = 0.5;
const PENALITA_PARTENZA = 1.0;
const RECORD_F1 = 1.80; // McLaren, Qatar 2023

const VALUTAZIONI = [
  { max: 2.2,      label: 'Da record',  testo: 'Un tempo da squadra di vertice. Il box Ferrari ti vuole.' },
  { max: 2.8,      label: 'Ottimo',     testo: 'Un pit stop da Formula 1 vera: sei rientrato davanti.' },
  { max: 3.5,      label: 'Buono',      testo: 'Pulito, ma qualche decimo è rimasto sulla pistola.' },
  { max: 4.5,      label: 'Lento',      testo: 'Il rivale ti ha passato con l’undercut.' },
  { max: Infinity, label: 'Disastro',   testo: 'Gara compromessa. Si torna a provare in fabbrica.' },
];

const fmt = (s) => s.toFixed(2).replace('.', ',');

function mescola(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* La monoposto vista dall'alto. Il colore usa il rosso del brand: è la
   macchina, non un elemento d'interfaccia, quindi non cambia col tema. */
function Monoposto() {
  return (
    <svg viewBox="0 0 120 240" className="w-full h-full" aria-hidden="true">
      <rect x="22" y="6" width="76" height="12" rx="3" fill="#a3001f" />
      <path d="M52 18 L68 18 L74 70 L46 70 Z" fill="#E8002D" />
      <path d="M40 70 L80 70 L90 150 L86 200 L34 200 L30 150 Z" fill="#E8002D" />
      <path d="M30 110 L18 150 L30 170 Z M90 110 L102 150 L90 170 Z" fill="#c4001f" />
      <ellipse cx="60" cy="112" rx="11" ry="18" fill="#111" />
      <path d="M49 100 Q60 88 71 100" stroke="#ddd" strokeWidth="3" fill="none" />
      <rect x="44" y="160" width="32" height="14" rx="3" fill="#fff" opacity=".9" />
      <text x="60" y="171" textAnchor="middle" fontSize="11" fontWeight="700" fill="#E8002D" fontFamily="monospace">16</text>
      <rect x="20" y="214" width="80" height="16" rx="3" fill="#a3001f" />
    </svg>
  );
}

export default function PitStopGame() {
  const [fase, setFase] = useState('pronto');   // pronto | ingresso | gomme | uscita | fine
  const [ordine, setOrdine] = useState([]);       // indici delle ruote, nell'ordine in cui si accendono
  const [fatte, setFatte] = useState(0);          // ruote cambiate
  const [errore, setErrore] = useState(null);     // indice della ruota toccata per sbaglio
  const [verde, setVerde] = useState(false);
  const [penalita, setPenalita] = useState(0);
  const [cronometro, setCronometro] = useState(0);
  const [esito, setEsito] = useState(null);
  const [record, setRecord] = useState(null);
  const [token, setToken] = useState(0);

  const t0 = useRef(0);
  const raf = useRef(0);
  const timeouts = useRef([]);
  const penalitaRef = useRef(0);
  const boxRef = useRef(null);

  useEffect(() => {
    setRecord(getRecord('pitstop'));
    setToken(getTokens());
    return () => { cancelAnimationFrame(raf.current); timeouts.current.forEach(clearTimeout); };
  }, []);

  const dopo = (ms, fn) => timeouts.current.push(setTimeout(fn, ms));

  // Cronometro a vista mentre la macchina è ferma ai box.
  useEffect(() => {
    if (fase !== 'gomme' && fase !== 'uscita') return;
    const tick = () => {
      setCronometro((performance.now() - t0.current) / 1000 + penalitaRef.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [fase]);

  const inizia = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setOrdine(mescola([0, 1, 2, 3]));
    setFatte(0);
    setErrore(null);
    setVerde(false);
    penalitaRef.current = 0;
    setPenalita(0);
    setCronometro(0);
    setEsito(null);
    setFase('ingresso');
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // La macchina entra nel box; il cronometro parte quando si ferma.
    dopo(900, () => { t0.current = performance.now(); setFase('gomme'); });
  };

  const aggiungiPenalita = (s) => {
    penalitaRef.current += s;
    setPenalita(penalitaRef.current);
  };

  const tocca = useCallback((i) => {
    if (fase !== 'gomme') return;
    if (i !== ordine[fatte]) {
      aggiungiPenalita(PENALITA_RUOTA);
      setErrore(i);
      dopo(250, () => setErrore(null));
      return;
    }
    const nuove = fatte + 1;
    setFatte(nuove);
    if (nuove === 4) {
      setFase('uscita');
      // Il lecca-lecca resta rosso per un tempo imprevedibile.
      dopo(300 + Math.random() * 500, () => setVerde(true));
    }
  }, [fase, ordine, fatte]);

  const riparti = useCallback(() => {
    if (fase !== 'uscita') return;
    if (!verde) { aggiungiPenalita(PENALITA_PARTENZA); return; }
    cancelAnimationFrame(raf.current);
    const totale = (performance.now() - t0.current) / 1000 + penalitaRef.current;
    const v = VALUTAZIONI.find((x) => totale < x.max);
    const guadagnati = Math.max(0, Math.min(100, Math.round((6 - totale) * 20)));
    if (guadagnati) setToken(addTokens(guadagnati));
    const r = saveRecord('pitstop', Number(totale.toFixed(2)), 'basso');
    setRecord(r.record);
    setCronometro(totale);
    setEsito({ totale, v, guadagnati, nuovoRecord: r.nuovo });
    setFase('fine');
  }, [fase, verde]);

  // Tastiera: Q E A D per le ruote, spazio o Invio per partire / ripartire.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k in TASTI) { tocca(TASTI[k]); return; }
      if (k === ' ' || k === 'enter') {
        if (fase === 'uscita') { e.preventDefault(); riparti(); }
        else if ((fase === 'pronto' || fase === 'fine') && e.target === document.body) { e.preventDefault(); inizia(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const attiva = fase === 'gomme' ? ordine[fatte] : null;
  const cambiata = (i) => ordine.indexOf(i) < fatte && (fase === 'gomme' || fase === 'uscita' || fase === 'fine');

  return (
    <GameShell
      seo={SEO}
      title="Pit Stop"
      accent="Challenge"
      subtitle="Cambia le quattro gomme nell’ordine in cui si accendono e riparti appena il lecca-lecca diventa verde. In Formula 1 il record è 1,80 secondi."
      tokens={token}
      record={<Record label="Record" value={record !== null ? `${fmt(record)} s` : null} />}
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">

        {/* ── Il box ── */}
        <div ref={boxRef} className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-4 sm:p-6 select-none">
          {/* Cronometro */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--fr-text-faint)]">Tempo ai box</p>
              <p className="tabular text-4xl sm:text-5xl font-bold text-[var(--fr-text)] leading-none mt-1" aria-live="off">
                {fmt(cronometro)}<span className="text-xl text-[var(--fr-text-faint)]"> s</span>
              </p>
            </div>
            {penalita > 0 && (
              <p className="tabular text-sm font-bold text-[var(--fr-danger)]">+{fmt(penalita)} s penalità</p>
            )}
          </div>

          {/* Corsia dei box: l'asfalto è scuro in entrambi i temi */}
          <div className="relative mx-auto w-full max-w-[min(340px,calc((100dvh-260px)*0.75))] aspect-[3/4] rounded-[var(--radius-md)] overflow-hidden bg-[#1b2124]">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[78%] border-y-2 border-dashed border-white/15" aria-hidden="true" />
            <div
              className="absolute left-1/2 top-1/2 w-[46%] h-[86%] transition-transform duration-[900ms] ease-out"
              style={{ transform: `translate(-50%, ${fase === 'pronto' ? '120%' : fase === 'fine' && esito ? '-130%' : '-50%'})` }}
            >
              <Monoposto />
            </div>

            {/* Le ruote */}
            {RUOTE.map((r, i) => {
              const accesa = attiva === i;
              const ok = cambiata(i);
              return (
                <button
                  key={r.id}
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); tocca(i); }}
                  disabled={fase !== 'gomme'}
                  aria-label={`${r.label} (tasto ${r.tasto})`}
                  className={`absolute ${r.pos} w-[24%] aspect-square rounded-2xl grid place-items-center border-4 transition-all duration-100 ${
                    errore === i ? 'border-[var(--fr-danger)] bg-[var(--fr-danger)]/30 scale-95'
                      : accesa ? 'border-[var(--fr-gold)] bg-[var(--fr-gold)]/25 scale-105 shadow-[0_0_24px_rgba(231,184,78,.6)]'
                      : ok ? 'border-[var(--fr-success)] bg-[var(--fr-success)]/20'
                      : 'border-white/15 bg-black/40'
                  }`}
                >
                  <span className="w-[62%] aspect-square rounded-full bg-[#0d0d0d] border-[5px] border-[#2d2d2d] grid place-items-center">
                    <span className={`text-[11px] font-bold ${accesa ? 'text-[var(--fr-gold)]' : ok ? 'text-[var(--fr-success)]' : 'text-white/50'}`}>
                      {ok ? '✓' : r.tasto}
                    </span>
                  </span>
                </button>
              );
            })}

            {/* Lecca-lecca */}
            {(fase === 'uscita' || fase === 'gomme') && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[3%] flex flex-col items-center" aria-hidden="true">
                <span className={`w-10 h-10 rounded-full border-4 border-white/80 ${verde ? 'bg-[#22c55e] shadow-[0_0_20px_#22c55e]' : 'bg-[#ef4444]'}`} />
                <span className="w-1 h-6 bg-white/70" />
              </div>
            )}

            {/* Schermate di inizio e fine, sopra la corsia */}
            {fase === 'pronto' && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center bg-black/55">
                <div>
                  <p className="text-white font-head text-2xl font-black uppercase">Box, box!</p>
                  <p className="text-white/75 text-sm mt-1 mb-5">La Ferrari sta per entrare ai box.</p>
                  <button type="button" onClick={inizia} className="btn btn-primary">
                    <Timer className="w-4 h-4" aria-hidden="true" /> Chiama il pit stop
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pulsante di ripartenza: grande, sotto la corsia, comodo col pollice */}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); riparti(); }}
            disabled={fase !== 'uscita'}
            className={`mt-4 w-full py-5 rounded-[var(--radius-md)] font-head text-2xl font-black uppercase tracking-wide transition-colors ${
              fase === 'uscita'
                ? verde ? 'bg-[#16a34a] text-white' : 'bg-[var(--fr-red-fill)] text-white'
                : 'bg-[var(--fr-surface-2)] text-[var(--fr-text-faint)]'
            }`}
          >
            {fase === 'uscita' ? (verde ? 'Via!' : 'Aspetta il verde…') : fase === 'gomme' ? `Gomme ${fatte}/4` : 'Via'}
          </button>
        </div>

        {/* ── Pannello laterale: esito o istruzioni ── */}
        <aside className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-6" aria-live="polite">
          {fase === 'fine' && esito ? (
            <>
              {esito.nuovoRecord && (
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--fr-gold)_18%,transparent)] text-[var(--fr-gold)] text-xs font-bold uppercase tracking-wider mb-3">
                  <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> Nuovo record
                </p>
              )}
              <p className="font-head text-3xl font-black uppercase text-[var(--fr-text)]">{esito.v.label}</p>
              <p className="text-sm text-[var(--fr-text-muted)] mt-1">{esito.v.testo}</p>
              <dl className="grid grid-cols-2 gap-3 my-5">
                <div className="rounded-[var(--radius-md)] bg-[var(--fr-surface-2)] p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fr-text-faint)]">Il tuo tempo</dt>
                  <dd className="tabular text-xl font-bold text-[var(--fr-text)]">{fmt(esito.totale)} s</dd>
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--fr-surface-2)] p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fr-text-faint)]">Record F1</dt>
                  <dd className="tabular text-xl font-bold text-[var(--fr-text)]">{fmt(RECORD_F1)} s</dd>
                </div>
              </dl>
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--fr-text)] mb-5">
                <Coins className="w-4 h-4 text-[var(--fr-gold)]" aria-hidden="true" />
                {esito.guadagnati ? `+${esito.guadagnati} SF Token` : 'Nessun token: sotto i 6 secondi si comincia a guadagnare.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={inizia} className="btn btn-primary">
                  <RefreshCw className="w-4 h-4" aria-hidden="true" /> Un altro pit stop
                </button>
                <Link href="/fanzone" className="btn btn-outline">Fan Zone</Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-black uppercase tracking-wide mb-3">Come si gioca</h2>
              <ol className="space-y-3 text-sm text-[var(--fr-text-muted)] list-decimal pl-5">
                <li>La macchina si ferma e il cronometro parte.</li>
                <li>Tocca la ruota che si <strong className="text-[var(--fr-gold)]">accende</strong>, una dopo l’altra. Quella sbagliata costa {fmt(PENALITA_RUOTA)} s.</li>
                <li>Quando il lecca-lecca diventa <strong className="text-[#16a34a]">verde</strong>, premi «Via». Partire col rosso costa {fmt(PENALITA_PARTENZA)} s.</li>
              </ol>
              <p className="hidden md:flex items-center gap-2 mt-5 text-xs text-[var(--fr-text-faint)]">
                <Keyboard className="w-4 h-4" aria-hidden="true" />
                Da tastiera: Q E A D per le ruote, spazio per ripartire.
              </p>
            </>
          )}
        </aside>
      </div>
    </GameShell>
  );
}
