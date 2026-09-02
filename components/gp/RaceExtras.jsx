'use client';
/**
 * components/gp/RaceExtras.jsx
 * Il weekend oltre l'ordine d'arrivo: giro veloce, pilota del giorno, soste e
 * ritiri.
 *
 * La scheda GP mostrava chi è arrivato dove e nient'altro. Sono le domande che
 * si fanno guardando una gara — chi ha girato più forte, chi si è ritirato e
 * perché, quante soste, la più veloce — e il dato per rispondere era già in
 * archivio, mai letto.
 *
 * Ogni riquadro compare solo se ha il suo dato: il pilota del giorno esiste dal
 * 2016 e i tempi delle soste dal 2011, quindi su una gara del 1975 questa
 * sezione è, correttamente, quasi vuota.
 */

import React from 'react';
import { Timer, Star, Wrench, Flag } from 'lucide-react';
import { Panel } from '../ui/PageShell';

/* Le cause di ritiro in archivio sono in inglese. Qui si traducono le più
   frequenti; per quelle rare resta la dicitura originale, che è comunque
   comprensibile ("Halfshaft") più di una traduzione inventata. */
const CAUSE_IT = {
  'accident': 'Incidente',
  'collision': 'Contatto',
  'collision damage': 'Danni da contatto',
  'spun off': 'Testacoda',
  'engine': 'Motore',
  'gearbox': 'Cambio',
  'transmission': 'Trasmissione',
  'suspension': 'Sospensioni',
  'electrical': 'Impianto elettrico',
  'brakes': 'Freni',
  'clutch': 'Frizione',
  'hydraulics': 'Idraulica',
  'fuel system': 'Impianto carburante',
  'fuel pump': 'Pompa benzina',
  'out of fuel': 'Benzina esaurita',
  'overheating': 'Surriscaldamento',
  'oil leak': 'Perdita d’olio',
  'oil pressure': 'Pressione olio',
  'ignition': 'Accensione',
  'throttle': 'Acceleratore',
  'turbo': 'Turbo',
  'wheel': 'Ruota',
  'puncture': 'Foratura',
  'differential': 'Differenziale',
  'withdrew': 'Ritirato dal team',
  'driveshaft': 'Semiasse',
  'halfshaft': 'Semiasse',
  'power unit': 'Power unit',
  'water leak': 'Perdita d’acqua',
  'radiator': 'Radiatore',
  'steering': 'Sterzo',
  'exhaust': 'Scarico',
  'disqualified': 'Squalificato',
};

const traduciCausa = (causa) =>
  CAUSE_IT[String(causa || '').toLowerCase().trim()] || causa;

/** Riquadro compatto: valore grande, chi l'ha fatto, dettaglio sotto. */
function Highlight({ icon: Icon, label, value, who, detail, accent }) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fr-text-faint)]">
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        {label}
      </div>
      <div
        className={`tabular text-[26px] font-bold leading-none mt-2.5 ${
          accent ? 'text-[var(--fr-red)]' : 'text-[var(--fr-text)]'
        }`}
      >
        {value}
      </div>
      {who && <div className="text-sm font-semibold text-[var(--fr-text)] mt-1.5">{who}</div>}
      {detail && <div className="text-xs text-[var(--fr-text-muted)] mt-0.5">{detail}</div>}
    </div>
  );
}

export function RaceHighlights({ extras, retirements, names, totalDrivers }) {
  const { fastestLap, driverOfTheDay, pitStops } = extras || {};
  const nome = (id) => names?.drivers?.[id] || id;

  const celle = [
    fastestLap?.time && (
      <Highlight
        key="fl"
        icon={Timer}
        label="Giro veloce"
        value={fastestLap.time}
        who={nome(fastestLap.driverId)}
        detail={fastestLap.lap ? `Giro ${fastestLap.lap}` : null}
        accent
      />
    ),
    driverOfTheDay && (
      <Highlight
        key="dotd"
        icon={Star}
        label="Pilota del giorno"
        value={
          driverOfTheDay.percentage != null
            ? `${driverOfTheDay.percentage.toLocaleString('it-IT', { maximumFractionDigits: 1 })}%`
            : '★'
        }
        who={nome(driverOfTheDay.driverId)}
        detail={driverOfTheDay.percentage != null ? 'dei voti del pubblico' : null}
      />
    ),
    pitStops && (
      <Highlight
        key="pit"
        icon={Wrench}
        label="Soste ai box"
        value={pitStops.total}
        who={pitStops.fastest ? `Più veloce: ${nome(pitStops.fastest.driverId)}` : null}
        detail={
          pitStops.fastest
            ? `${pitStops.fastest.time}s${pitStops.fastest.lap ? ` · giro ${pitStops.fastest.lap}` : ''}`
            : `Fino a ${pitStops.maxPerDriver} soste per pilota`
        }
      />
    ),
    retirements?.total > 0 && (
      <Highlight
        key="dnf"
        icon={Flag}
        label="Ritiri"
        value={totalDrivers ? `${retirements.total}/${totalDrivers}` : retirements.total}
        who={
          retirements.accidents
            ? `${retirements.accidents} per incidente o contatto`
            : 'Nessuno per incidente'
        }
        detail={retirements.mechanical ? `${retirements.mechanical} per problemi tecnici` : null}
      />
    ),
  ].filter(Boolean);

  if (!celle.length) return null;

  return (
    <Panel title="Il Gran Premio in numeri" icon={Timer}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-[var(--fr-border)] sm:divide-x">
        {celle}
      </div>
    </Panel>
  );
}

/**
 * Le soste giro per giro.
 *
 * La telemetria vera (gas, freno, marce) non è in archivio: quello che c'è, e
 * che racconta la gara altrettanto bene, è quando ciascuno si è fermato. Letto
 * per colonne, il grafico mostra le finestre di sosta e chi ne è uscito fuori.
 */
export function PitStopChart({ stops, names, totalLaps }) {
  const perPilota = React.useMemo(() => {
    const acc = new Map();
    for (const s of stops || []) {
      if (!s.lap) continue;
      if (!acc.has(s.driverId)) acc.set(s.driverId, []);
      acc.get(s.driverId).push(s);
    }
    return [...acc.entries()]
      .map(([driverId, soste]) => ({
        driverId,
        soste: soste.slice().sort((a, b) => a.lap - b.lap),
      }))
      // Chi si è fermato prima sta in alto: la sequenza delle strategie si legge
      // dall'alto verso il basso invece che a caso.
      .sort((a, b) => a.soste[0].lap - b.soste[0].lap);
  }, [stops]);

  if (!perPilota.length) return null;

  const giri = Math.max(
    totalLaps || 0,
    ...perPilota.flatMap(p => p.soste.map(s => s.lap)),
  );
  if (!giri) return null;

  const piuVeloce = (stops || [])
    .filter(s => s.millis > 0)
    .reduce((a, b) => (a && a.millis <= b.millis ? a : b), null);

  // Tacche ogni dieci giri: senza un riferimento i pallini dicono "prima" e
  // "dopo", non "al giro 14".
  const tacche = [];
  for (let g = 10; g < giri; g += 10) tacche.push(g);

  return (
    <Panel title="Quando si sono fermati" icon={Wrench}>
      <div className="p-4 space-y-1.5">
        {perPilota.map(({ driverId, soste }) => (
          <div key={driverId} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs font-semibold text-[var(--fr-text-muted)]">
              {names?.drivers?.[driverId] || driverId}
            </span>
            <div className="relative flex-1 h-6 rounded-full bg-[var(--fr-surface-2)] overflow-hidden">
              {tacche.map(g => (
                <span
                  key={`t-${g}`}
                  aria-hidden="true"
                  style={{ left: `${(g / giri) * 100}%` }}
                  className="absolute inset-y-0 w-px bg-[var(--fr-border)]"
                />
              ))}
              {soste.map((s) => {
                const best = piuVeloce && s.driverId === piuVeloce.driverId && s.lap === piuVeloce.lap;
                return (
                  <span
                    key={`${s.lap}-${s.stop}`}
                    title={`Giro ${s.lap}${s.time ? ` · ${s.time}s` : ''}${best ? ' · sosta più veloce della gara' : ''}`}
                    /* -4px porta il centro del pallino sul giro esatto invece
                       che sul suo bordo sinistro. */
                    style={{ left: `calc(${Math.min(100, (s.lap / giri) * 100)}% - 4px)` }}
                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                      best
                        ? 'ring-2 ring-[var(--fr-red)] bg-[var(--fr-red)]'
                        : 'bg-[var(--fr-text-faint)]'
                    }`}
                  />
                );
              })}
            </div>
            <span className="w-6 shrink-0 text-right tabular text-xs text-[var(--fr-text-faint)]">
              {soste.length}
            </span>
          </div>
        ))}

        {/* L'asse dei giri, allineato alle barre: `w-32 + gap-3` a sinistra e
            `w-6 + gap-3` a destra sono le stesse misure delle righe sopra. */}
        <div className="flex items-center gap-3 pt-1" aria-hidden="true">
          <span className="w-32 shrink-0" />
          <div className="relative flex-1 h-4">
            {[0, ...tacche, giri].map(g => (
              <span
                key={`l-${g}`}
                style={{ left: `${(g / giri) * 100}%` }}
                className="absolute top-0 -translate-x-1/2 tabular text-[10px] text-[var(--fr-text-faint)]"
              >
                {g}
              </span>
            ))}
          </div>
          <span className="w-6 shrink-0" />
        </div>

        <p className="pt-3 text-xs text-[var(--fr-text-muted)]">
          Ogni pallino è una sosta, posizionata sul giro in cui è avvenuta lungo i {giri} giri
          di gara. In rosso la più veloce del Gran Premio. A destra il numero di soste.
        </p>
      </div>
    </Panel>
  );
}

/** Chi non ha visto la bandiera a scacchi, e per cosa. */
export function RetirementList({ retirements, names }) {
  if (!retirements?.rows?.length) return null;

  return (
    <Panel title={`Ritiri · ${retirements.total}`} icon={Flag}>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th scope="col">Pilota</th>
              <th scope="col">Scuderia</th>
              <th scope="col">Giri</th>
              <th scope="col">Causa</th>
            </tr>
          </thead>
          <tbody>
            {retirements.rows.map(r => (
              <tr key={r.driverId}>
                <td className="font-semibold">{names?.drivers?.[r.driverId] || r.driverId}</td>
                <td>{names?.constructors?.[r.constructorId] || r.constructorId}</td>
                <td className="tabular">{r.laps ?? '—'}</td>
                <td>
                  <span
                    className={
                      r.accident
                        ? 'text-[var(--fr-danger)] font-medium'
                        : 'text-[var(--fr-text-muted)]'
                    }
                  >
                    {traduciCausa(r.reasonRetired)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
