/**
 * pages/games/circuit-rush.jsx
 * Circuit Rush: la Ferrari in pista, tre corsie, i rivali da schivare.
 *
 * Cosa è cambiato rispetto alla prima versione:
 * - la macchina si spostava di 107 px a corsia mentre le corsie erano in
 *   percentuale: su un telefono stretto finiva fra due corsie. Ora usa le
 *   stesse percentuali dei rivali;
 * - il gioco avanzava "di un passo per fotogramma": su uno schermo a 120 Hz
 *   andava al doppio della velocità. Ora il passo dipende dal tempo trascorso;
 * - si mette in pausa da solo quando si cambia scheda, e con P o il pulsante;
 * - dopo i primi chilometri arrivano anche due rivali affiancati (ma una
 *   corsia resta sempre libera);
 * - record personale, sorpassi contati, swipe oltre al tocco;
 * - l'altezza dell'area di gioco si adatta allo schermo invece di essere
 *   650 px fissi, che su un telefono uscivano dalla vista.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Pause, Play, RefreshCw, Gauge, Trophy, Coins, Keyboard } from 'lucide-react';
import GameShell, { Record } from '../../components/ui/GameShell';
import { addTokens, getTokens } from '../../lib/tokens';
import { getRecord, saveRecord } from '../../lib/records';

const SEO = {
  title: 'Circuit Rush — gioco F1 a tema Ferrari',
  description: 'Mini-gioco arcade a tema Ferrari: guida in pista su tre corsie, schiva i rivali e raccogli energia. Quanti chilometri riesci a fare?',
  path: '/games/circuit-rush',
};

const CORSIE = [18, 50, 82];     // centro di ogni corsia, in % della larghezza
const VITE = 3;
const V0 = 30;                   // velocità iniziale, in % dell'altezza al secondo
const VMAX = 110;
const AUTO_Y = 82;               // posizione verticale della Ferrari, in %
const AUTO_H = 11;               // altezza delle macchine, in %

const RIVALI = [
  { corpo: '#00a19c', tetto: '#006f6c' }, // Mercedes
  { corpo: '#ff8000', tetto: '#b35a00' }, // McLaren
  { corpo: '#1e41ff', tetto: '#122a9e' }, // Red Bull
  { corpo: '#0093cc', tetto: '#005f85' }, // Alpine
  { corpo: '#229971', tetto: '#14644a' }, // Aston Martin
];

function Macchina({ corpo, tetto, numero }) {
  return (
    <svg viewBox="0 0 40 70" className="w-full h-full" aria-hidden="true">
      <rect x="6" y="2" width="28" height="6" rx="2" fill={tetto} />
      <path d="M16 8 H24 L27 28 H13 Z" fill={corpo} />
      <path d="M11 28 H29 L32 56 L29 64 H11 L8 56 Z" fill={corpo} />
      <rect x="1" y="12" width="7" height="13" rx="3" fill="#111" />
      <rect x="32" y="12" width="7" height="13" rx="3" fill="#111" />
      <rect x="1" y="44" width="8" height="15" rx="3" fill="#111" />
      <rect x="31" y="44" width="8" height="15" rx="3" fill="#111" />
      <ellipse cx="20" cy="38" rx="4.5" ry="7" fill="#111" />
      {numero && <text x="20" y="57" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="monospace">{numero}</text>}
      <rect x="7" y="64" width="26" height="5" rx="2" fill={tetto} />
    </svg>
  );
}

function Energia() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="#3d2a00" stroke="#facc15" strokeWidth="3" />
      <polygon points="22,7 11,22 19,22 18,33 29,18 21,18" fill="#facc15" />
    </svg>
  );
}

export default function CircuitRush() {
  const [fase, setFase] = useState('pronto');   // pronto | gioco | pausa | fine
  const [, ridisegna] = useState(0);
  const [esito, setEsito] = useState(null);
  const [record, setRecord] = useState(null);
  const [token, setToken] = useState(0);

  // Lo stato della corsa vive in un ref: cambia sessanta volte al secondo e
  // non deve passare dalle code di aggiornamento di React.
  const g = useRef(null);
  const raf = useRef(0);
  const ultimo = useRef(0);
  const swipe = useRef(null);
  const areaRef = useRef(null);

  useEffect(() => {
    setRecord(getRecord('circuit-rush'));
    setToken(getTokens());
  }, []);

  const nuovaCorsa = () => ({
    corsia: 1, vite: VITE, km: 0, velocita: V0, sorpassi: 0,
    rivali: [], energie: [], prossimoRivale: 0.9, prossimaEnergia: 9,
    colpito: 0, carica: 0, id: 0,
  });

  const fine = useCallback(() => {
    const s = g.current;
    const km = Math.floor(s.km * 10) / 10;
    const punteggio = Math.floor(s.km * 10) + s.sorpassi * 5;
    const guadagnati = Math.floor(punteggio / 5);
    if (guadagnati) setToken(addTokens(guadagnati));
    const r = saveRecord('circuit-rush', punteggio, 'alto');
    setRecord(r.record);
    setEsito({ km, sorpassi: s.sorpassi, punteggio, guadagnati, nuovoRecord: r.nuovo });
    setFase('fine');
  }, []);

  const passo = useCallback((dt) => {
    const s = g.current;
    s.km += s.velocita * dt * 0.004;
    s.velocita = Math.min(VMAX, V0 + s.km * 4.5);
    s.colpito = Math.max(0, s.colpito - dt);
    s.carica = Math.max(0, s.carica - dt);

    // Nuovi rivali: sempre più fitti; oltre i 3 km a volte in coppia.
    s.prossimoRivale -= dt;
    if (s.prossimoRivale <= 0) {
      const coppia = s.km > 3 && Math.random() < Math.min(0.45, (s.km - 3) * 0.06);
      const corsie = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, coppia ? 2 : 1);
      corsie.forEach((c) => s.rivali.push({
        id: ++s.id, corsia: c, y: -AUTO_H, colore: RIVALI[Math.floor(Math.random() * RIVALI.length)],
      }));
      s.prossimoRivale = Math.max(0.42, 1.25 - s.km * 0.05) * (0.8 + Math.random() * 0.4);
    }
    s.prossimaEnergia -= dt;
    if (s.prossimaEnergia <= 0) {
      s.energie.push({ id: ++s.id, corsia: Math.floor(Math.random() * 3), y: -6 });
      s.prossimaEnergia = 9 + Math.random() * 6;
    }

    const dy = s.velocita * dt;
    const urta = (y, h) => y + h > AUTO_Y && y < AUTO_Y + AUTO_H;

    s.rivali = s.rivali.filter((r) => {
      r.y += dy * 0.75; // i rivali vanno nello stesso verso, più piano
      if (r.corsia === s.corsia && urta(r.y, AUTO_H) && s.colpito <= 0) {
        s.vite -= 1;
        s.colpito = 1.2; // un attimo di invulnerabilità dopo l'urto
        return false;
      }
      if (r.y > 100) { s.sorpassi += 1; return false; }
      return true;
    });
    s.energie = s.energie.filter((e) => {
      e.y += dy;
      if (e.corsia === s.corsia && urta(e.y, 6)) {
        s.vite = Math.min(VITE, s.vite + 1);
        s.km += 0.3;
        s.carica = 0.6;
        return false;
      }
      return e.y < 100;
    });

    if (s.vite <= 0) fine();
  }, [fine]);

  // Il ciclo di gioco, a passo di tempo reale (con un tetto, così dopo un
  // blocco del browser non si "salta" mezzo secondo di gara in un colpo).
  useEffect(() => {
    if (fase !== 'gioco') return;
    ultimo.current = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.05, (t - ultimo.current) / 1000);
      ultimo.current = t;
      passo(dt);
      ridisegna((n) => n + 1);
      if (g.current.vite > 0) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [fase, passo]);

  // Pausa automatica quando la scheda non è in primo piano.
  useEffect(() => {
    const onVis = () => { if (document.hidden) setFase((f) => (f === 'gioco' ? 'pausa' : f)); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const inizia = () => {
    g.current = nuovaCorsa();
    setEsito(null);
    setFase('gioco');
    // L'intestazione della pagina spinge la pista in basso: all'avvio la si
    // porta tutta in vista, altrimenti la Ferrari resta sotto il bordo.
    areaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };
  const sposta = useCallback((d) => {
    if (fase !== 'gioco') return;
    g.current.corsia = Math.max(0, Math.min(2, g.current.corsia + d));
    ridisegna((n) => n + 1);
  }, [fase]);
  const pausa = useCallback(() => setFase((f) => (f === 'gioco' ? 'pausa' : f === 'pausa' ? 'gioco' : f)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') { e.preventDefault(); sposta(-1); }
      else if (k === 'arrowright' || k === 'd') { e.preventDefault(); sposta(1); }
      else if (k === 'p' || k === 'escape') pausa();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sposta, pausa]);

  // Tocco: metà sinistra / destra, oppure uno swipe orizzontale.
  const onDown = (e) => { swipe.current = { x: e.clientX, t: performance.now() }; };
  const onUp = (e) => {
    if (!swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    if (Math.abs(dx) > 30) sposta(dx > 0 ? 1 : -1);
    else {
      const box = e.currentTarget.getBoundingClientRect();
      sposta(e.clientX - box.left < box.width / 2 ? -1 : 1);
    }
    swipe.current = null;
  };

  const s = g.current;
  const kmh = s ? Math.round(180 + (s.velocita - V0) * 2.2) : 0;
  const offset = s ? (s.km * 900) % 100 : 0;

  return (
    <GameShell
      seo={SEO}
      title="Circuit"
      accent="Rush"
      subtitle="Tre corsie, rivali sempre più fitti e solo tre vite. Schiva le altre monoposto, raccogli l’energia e fai più chilometri che puoi."
      tokens={token}
      record={<Record label="Record" value={record} />}
      className="select-none"
    >
      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start justify-center">

        {/* ── La pista ── */}
        <div ref={areaRef} className="scroll-mb-4">
          {/* HUD fuori dalla pista, così non copre i rivali */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="flex items-center gap-1" aria-label={`${s?.vite ?? VITE} vite`}>
              {Array.from({ length: VITE }).map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < (s?.vite ?? VITE) ? 'text-[var(--fr-red)] fill-[var(--fr-red)]' : 'text-[var(--fr-text-dim)]'}`} aria-hidden="true" />
              ))}
            </span>
            <span className="tabular font-bold text-[var(--fr-text)]">{s ? s.km.toFixed(1).replace('.', ',') : '0,0'} km</span>
            <span className="flex items-center gap-1.5 tabular text-xs font-bold text-[var(--fr-text-muted)]">
              <Gauge className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" /> {kmh} km/h
            </span>
            <button
              type="button"
              onClick={pausa}
              disabled={fase !== 'gioco' && fase !== 'pausa'}
              aria-label={fase === 'pausa' ? 'Riprendi' : 'Pausa'}
              className="p-2 rounded-lg border border-[var(--fr-border)] bg-[var(--fr-surface)] text-[var(--fr-text-muted)] disabled:opacity-40"
            >
              {fase === 'pausa' ? <Play className="w-4 h-4" aria-hidden="true" /> : <Pause className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          <div
            className={`relative w-full mx-auto max-w-[420px] h-[min(640px,calc(100dvh-150px))] min-h-[380px] rounded-[var(--radius)] overflow-hidden border-2 touch-none transition-colors ${
              s?.colpito > 0.9 ? 'border-[var(--fr-danger)]' : s?.carica > 0 ? 'border-[#facc15]' : 'border-[var(--fr-border)]'
            }`}
            onPointerDown={fase === 'gioco' ? onDown : undefined}
            onPointerUp={fase === 'gioco' ? onUp : undefined}
          >
            {/* Asfalto e cordoli: scuri in entrambi i temi */}
            <div className="absolute inset-0 bg-[#23292c]" aria-hidden="true" />
            {['left-0', 'right-0'].map((lato) => (
              <div
                key={lato}
                className={`absolute ${lato} top-0 bottom-0 w-[5%]`}
                style={{ backgroundImage: 'repeating-linear-gradient(180deg,#E8002D 0 22px,#fff 22px 44px)', backgroundPositionY: `${offset * 4.4}px` }}
                aria-hidden="true"
              />
            ))}
            {[34, 66].map((x) => (
              <div
                key={x}
                className="absolute top-0 bottom-0 w-[3px] -translate-x-1/2"
                style={{ left: `${x}%`, backgroundImage: 'repeating-linear-gradient(180deg,rgba(255,255,255,.45) 0 34px,transparent 34px 70px)', backgroundPositionY: `${offset * 7}px` }}
                aria-hidden="true"
              />
            ))}

            {s?.energie.map((e) => (
              <div key={e.id} className="absolute w-[11%] aspect-square -translate-x-1/2" style={{ left: `${CORSIE[e.corsia]}%`, top: `${e.y}%` }}>
                <Energia />
              </div>
            ))}
            {s?.rivali.map((r) => (
              <div key={r.id} className="absolute w-[14%] -translate-x-1/2" style={{ left: `${CORSIE[r.corsia]}%`, top: `${r.y}%`, height: `${AUTO_H}%` }}>
                <Macchina corpo={r.colore.corpo} tetto={r.colore.tetto} />
              </div>
            ))}

            {/* La Ferrari: stesse percentuali delle corsie dei rivali */}
            <div
              className={`absolute w-[14%] -translate-x-1/2 transition-[left] duration-150 ease-out ${s?.colpito > 0 ? 'animate-pulse' : ''}`}
              style={{ left: `${CORSIE[s?.corsia ?? 1]}%`, top: `${AUTO_Y}%`, height: `${AUTO_H}%` }}
            >
              <Macchina corpo="#E8002D" tetto="#a3001f" numero="16" />
            </div>

            {/* Schermate sopra la pista */}
            {fase !== 'gioco' && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center bg-black/65" aria-live="polite">
                {fase === 'pronto' && (
                  <div>
                    <p className="text-white font-head text-3xl font-black uppercase">Semaforo verde</p>
                    <p className="text-white/75 text-sm mt-1 mb-5">Tocca a sinistra o a destra della pista (o fai swipe) per cambiare corsia.</p>
                    <button type="button" onClick={inizia} className="btn btn-primary">Parti</button>
                  </div>
                )}
                {fase === 'pausa' && (
                  <div>
                    <p className="text-white font-head text-3xl font-black uppercase">Pausa</p>
                    <button type="button" onClick={pausa} className="btn btn-primary mt-4">
                      <Play className="w-4 h-4" aria-hidden="true" /> Riprendi
                    </button>
                  </div>
                )}
                {fase === 'fine' && esito && (
                  <div>
                    <p className="text-white font-head text-3xl font-black uppercase">Bandiera a scacchi</p>
                    <p className="text-white/80 text-sm mt-1">{esito.km.toFixed(1).replace('.', ',')} km · {esito.sorpassi} sorpassi</p>
                    <button type="button" onClick={inizia} className="btn btn-primary mt-5">
                      <RefreshCw className="w-4 h-4" aria-hidden="true" /> Riparti
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Pannello laterale ── */}
        <aside className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-6" aria-live="polite">
          {fase === 'fine' && esito ? (
            <>
              {esito.nuovoRecord && (
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--fr-gold)_18%,transparent)] text-[var(--fr-gold)] text-xs font-bold uppercase tracking-wider mb-3">
                  <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> Nuovo record
                </p>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--fr-text-faint)]">Punteggio</p>
              <p className="tabular text-5xl font-bold text-[var(--fr-text)] mt-1">{esito.punteggio}</p>
              <p className="text-sm text-[var(--fr-text-muted)] mt-2">10 punti a chilometro, 5 per ogni rivale superato.</p>
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--fr-text)] my-5">
                <Coins className="w-4 h-4 text-[var(--fr-gold)]" aria-hidden="true" /> +{esito.guadagnati} SF Token
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={inizia} className="btn btn-primary">
                  <RefreshCw className="w-4 h-4" aria-hidden="true" /> Nuova corsa
                </button>
                <Link href="/fanzone" className="btn btn-outline">Fan Zone</Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base font-black uppercase tracking-wide mb-3">Come si gioca</h2>
              <ul className="space-y-3 text-sm text-[var(--fr-text-muted)]">
                <li>Cambia corsia per non toccare le altre monoposto: ogni urto costa una vita, e ne hai tre.</li>
                <li>L’<strong className="text-[#ca8a04]">energia</strong> gialla restituisce una vita e regala strada.</li>
                <li>Più chilometri fai, più la gara accelera; dopo i 3 km i rivali arrivano anche in coppia.</li>
              </ul>
              <p className="hidden md:flex items-center gap-2 mt-5 text-xs text-[var(--fr-text-faint)]">
                <Keyboard className="w-4 h-4" aria-hidden="true" />
                Da tastiera: frecce o A / D per sterzare, P per la pausa.
              </p>
            </>
          )}
        </aside>
      </div>
    </GameShell>
  );
}
