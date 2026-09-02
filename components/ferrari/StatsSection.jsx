/**
 * components/ferrari/StatsSection.jsx
 * Scheda tecnica della SF-26, in fondo alla home.
 *
 * Il componente leggeva da Supabase le vittorie per pilota e i punti per anno
 * e li metteva in due stati che nessuna riga del JSX andava a leggere: i
 * grafici che li usavano erano stati tolti, le query no. Erano due richieste
 * di rete a ogni apertura della home, buttate via. Via anche gli import di
 * recharts, che nessun grafico usa più.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity, ChevronRight, Settings, Shield } from 'lucide-react';

/* Le tre colonne della scheda: etichette e note sono chiavi, i valori no —
   "770 KG" e "1.600 CC" non cambiano con la lingua. Prima era tutto scritto
   in italiano dentro il JSX, e restava in italiano su tutto il sito. */
const SCHEDA = [
  {
    titolo: 'Vettura',
    icon: Shield,
    tinta: 'var(--fr-red)',
    voci: [
      { k: 'Peso totale',  v: '770 kg',       s: 'Con pilota e liquidi' },
      { k: 'Telaio', v: 'Composito', s: 'Carbonio a nido d’ape' },
      { k: 'Cambio', v: '8 marce + RM', s: 'Longitudinale Ferrari' },
      { k: 'Freni',  v: 'Brembo',       s: 'Carbonio autoventilanti' },
      { k: 'Ruote',  v: '18 pollici', s: 'Anteriore e posteriore' },
    ],
  },
  {
    titolo: 'Power unit',
    icon: Cpu,
    tinta: 'var(--fr-red)',
    evidenza: true,
    voci: [
      { k: 'Nome modello',  v: '067/6',      s: 'V6 90° sovralimentato' },
      { k: 'Cilindrata',  v: '1.600 cc',   s: 'Max 15.000 giri/min' },
      { k: 'Iniezione', v: '350 bar',    s: 'Diretta ad alta pressione' },
      { k: 'Turbo',  v: 'Singolo', s: '150.000 giri/min max' },
      { k: 'Energia', v: '3.000 MJ/h', s: 'Portata energetica benzina' },
    ],
  },
  {
    titolo: 'Sistema ERS',
    icon: Zap,
    tinta: 'var(--fr-gold)',
    voci: [
      { k: 'Potenza MGU-K',   v: '350 kW',  s: 'Recupero di energia singolo' },
      { k: 'Tensione max',   v: '1.000 V', s: 'Elettronica di controllo' },
      { k: 'Batteria',   v: '4 MJ',    s: 'Ioni di litio (35 kg)' },
      { k: 'MGU-K giri/min',    v: '60.000',  s: 'Giri al minuto massimi' },
      { k: 'Ricarica', v: '9 MJ max', s: 'Energia in ricarica' },
    ],
  },
];

export default function StatsSection() {
  return (
    <section
      className="snap-section py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--fr-border)]"
      aria-labelledby="sf26-heading"
    >
      <div className="max-w-wrap mx-auto">

        <header className="mb-9">
          <span className="fr-eyebrow inline-flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            Scheda tecnica 2026
          </span>
          <h2 id="sf26-heading" className="uppercase mt-3">
            Engineering <span className="text-[var(--fr-red)]">Legend</span>
          </h2>
        </header>

        {/* Foto della vettura */}
        <motion.div
          initial={{ opacity: 0, scale: .98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: .5 }}
          className="relative w-full aspect-[21/9] rounded-[var(--radius)] overflow-hidden border border-[var(--fr-border)] shadow-[var(--fr-shadow)] mb-6 group"
        >
          <img
            src="/data/images/sf26.jpg"
            alt="Ferrari SF-26 — monoposto di Formula 1 della stagione 2026"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            width={1400}
            height={600}
            loading="lazy"
          />
          {/* La scritta sta sopra una foto, quindi non può contare sui token
              del tema: la sfumatura scura sotto vale in chiaro come in scuro, e
              l'ombra tiene il testo staccato anche dove la carrozzeria è
              chiara. */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute bottom-6 left-6 right-6 [text-shadow:0_2px_12px_rgba(0,0,0,.7)]">
            <p className="font-head text-4xl md:text-6xl font-black uppercase leading-none text-fixed-white">SF-26</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="bg-[var(--fr-red)] text-white px-2.5 py-1 rounded-[7px] text-[10px] font-bold uppercase tracking-[0.14em]">
                Nuova era
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                Codice progetto: 677
              </span>
            </div>
          </div>
        </motion.div>

        {/* Scheda tecnica */}
        <div className="grid md:grid-cols-3 gap-5">
          {SCHEDA.map((col, i) => (
            <motion.div
              key={col.titolo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: .45, delay: i * .08 }}
              className={`relative rounded-[var(--radius)] border bg-[var(--fr-surface)] shadow-[var(--fr-shadow-sm)] p-6 ${
                col.evidenza ? 'border-[var(--fr-red)]/35' : 'border-[var(--fr-border)]'
              }`}
            >
              {col.evidenza && (
                <Activity className="absolute top-5 right-5 w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
              )}
              <h3 className="flex items-center gap-2.5 uppercase text-lg pb-4 mb-5 border-b border-[var(--fr-border)]">
                <col.icon className="w-5 h-5 shrink-0" style={{ color: col.tinta }} aria-hidden="true" />
                {col.titolo}
              </h3>
              <ul className="space-y-4">
                {col.voci.map((v) => (
                  <TechItem
                    key={v.k}
                    label={v.k}
                    value={v.v}
                    sub={v.s}
                  />
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-6 text-center">
          <a
            href="https://it.motorsport.com/f1/news/f1-ferrari-la-scheda-tecnica-della-sf-26-di-leclerc-e-hamilton/10792203/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--fr-text-faint)] hover:text-[var(--fr-red)] transition-colors"
          >
            Fonte tecnica: Motorsport.com
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}

function TechItem({ label, value, sub }) {
  return (
    <li className="flex flex-col border-l-2 border-[var(--fr-border)] pl-3.5 hover:border-[var(--fr-red)] transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fr-text-faint)] mb-1">
        {label}
      </span>
      <span className="text-lg font-bold leading-tight text-[var(--fr-text)]">{value}</span>
      <span className="text-xs text-[var(--fr-text-muted)] mt-0.5">{sub}</span>
    </li>
  );
}
