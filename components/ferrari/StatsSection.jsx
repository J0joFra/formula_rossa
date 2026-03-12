import { supabase } from '../../lib/supabase';
import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';
import { 
  Trophy, Gauge, Cpu, Zap, Activity, ChevronRight, 
  Settings, Weight, Shield, BarChart3, LineChart as LineChartIcon
} from 'lucide-react';

export default function StatsSection() {
  const [pilotWins, setPilotWins] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        
        const currentYear = new Date().getFullYear();

        // Top 8 piloti Ferrari per vittorie (aggregazione lato DB)
        const { data: winsData } = await supabase
          .from('race_results')
          .select('driver_id, drivers(last_name)')
          .eq('constructor_id', 'ferrari')
          .eq('position_number', 1);

        if (winsData) {
          const winsCount = {};
          winsData.forEach(r => {
            const name = r.drivers?.last_name || r.driver_id;
            winsCount[name] = (winsCount[name] || 0) + 1;
          });
          setPilotWins(
            Object.entries(winsCount)
              .map(([name, wins]) => ({ name, wins }))
              .sort((a, b) => b.wins - a.wins)
              .slice(0, 8)
          );
        }

        // Punti Ferrari per anno (ultimi 12 anni)
        const { data: pointsData } = await supabase
          .from('race_results')
          .select('year, points')
          .eq('constructor_id', 'ferrari')
          .gte('year', currentYear - 12);

        if (pointsData) {
          const pointsByYear = {};
          pointsData.forEach(r => {
            pointsByYear[r.year] = (pointsByYear[r.year] || 0) + (r.points || 0);
          });
          setPointsHistory(
            Object.entries(pointsByYear)
              .map(([year, points]) => ({ year: year.toString(), points: Math.floor(points) }))
              .sort((a, b) => a.year - b.year)
          );
        }
      } catch (err) {
        console.error("Errore caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section className="py-24 bg-black text-white overflow-hidden" aria-label="Statistiche e scheda tecnica Ferrari SF-26">
      <div className="max-w-7xl mx-auto px-4">

        {/* TITOLO SEZIONE */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-xs font-black uppercase tracking-[0.3em] mb-6"
          >
            <Settings className="w-4 h-4 animate-spin-slow" aria-hidden="true" />
            Technical Blueprint 2026
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
            Engineering <span className="text-red-600">Legend</span>
          </h2>
        </div>

        {/* SF-26 SHOWCASE IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-12 group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" aria-hidden="true" />
          <img
            src="/data/images/sf26.jpg"
            alt="Ferrari SF-26 — monoposto Formula 1 stagione 2026"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            width={1400}
            height={600}
            loading="lazy"
          />
          <div className="absolute bottom-8 left-8 z-20">
            <h3 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">SF-26</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="bg-red-600 px-3 py-1 text-xs font-black tracking-widest uppercase">New Era</span>
              <p className="text-zinc-400 font-bold tracking-[0.3em] uppercase text-sm">Project Code: 677</p>
            </div>
          </div>
        </motion.div>

        {/* SCHEDA TECNICA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

          {/* VETTURA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-red-600/30 pb-4">
              <Shield className="text-red-600 w-6 h-6" aria-hidden="true" />
              <h4 className="text-xl font-black uppercase italic">Vettura</h4>
            </div>
            <ul className="space-y-6">
              <TechItem label="Peso Totale"  value="770 KG"      sub="Con pilota e liquidi" />
              <TechItem label="Telaio"       value="Composito"   sub="Carbonio a nido d'ape" />
              <TechItem label="Cambio"       value="8 Marce + RM" sub="Longitudinale Ferrari" />
              <TechItem label="Freni"        value="Brembo"      sub="Carbonio autoventilanti" />
              <TechItem label="Ruote"        value="18 Pollici"  sub="Anteriore & Posteriore" />
            </ul>
          </motion.div>

          {/* POWER UNIT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-zinc-900/60 border border-red-600/20 p-8 rounded-3xl backdrop-blur-sm relative shadow-xl"
          >
            <Activity className="absolute top-4 right-4 text-red-600 w-4 h-4 animate-pulse" aria-hidden="true" />
            <div className="flex items-center gap-3 mb-8 border-b border-red-600/30 pb-4">
              <Cpu className="text-red-600 w-6 h-6" aria-hidden="true" />
              <h4 className="text-xl font-black uppercase italic">Power Unit</h4>
            </div>
            <ul className="space-y-6">
              <TechItem label="Nome Modello" value="067/6"       sub="V6 90° Supercharged" />
              <TechItem label="Cilindrata"   value="1.600 CC"    sub="Max 15.000 RPM" />
              <TechItem label="Iniezione"    value="350 BAR"     sub="Diretta High-Pressure" />
              <TechItem label="Turbo"        value="Singolo"     sub="150.000 RPM Max" />
              <TechItem label="Energia"      value="3.000 MJ/h"  sub="Portata energetica benzina" />
            </ul>
          </motion.div>

          {/* ERS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-red-600/30 pb-4">
              <Zap className="text-yellow-500 w-6 h-6" aria-hidden="true" />
              <h4 className="text-xl font-black uppercase italic">ERS System</h4>
            </div>
            <ul className="space-y-6">
              <TechItem label="Potenza MGU-K" value="350 KW"    sub="Recupero Energia Singolo" />
              <TechItem label="Tensione Max"  value="1.000 V"   sub="Elettronica di controllo" />
              <TechItem label="Batteria"      value="4 MJ"      sub="Ioni di litio (35kg)" />
              <TechItem label="MGU-K RPM"     value="60.000"    sub="Giri minuto massimi" />
              <TechItem label="Ricarica"      value="9 MJ Max"  sub="Energia in ricarica" />
            </ul>
          </motion.div>
        </div>

        {/* Credit Link */}
        <div className="text-center mt-4">
          <a
            href="https://it.motorsport.com/f1/news/f1-ferrari-la-scheda-tecnica-della-sf-26-di-leclerc-e-hamilton/10792203/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-yellow-600 hover:text-red-500 font-bold uppercase text-[9px] tracking-[0.4em] transition-colors"
          >
            Technical Reference: Motorsport.com
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function TechItem({ label, value, sub }) {
  return (
    <li className="flex flex-col border-l border-white/10 pl-4 group hover:border-red-600 transition-colors">
      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{label}</span>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl font-black text-white tracking-tight">{value}</span>
        <span className="text-xs text-zinc-400 italic font-medium">{sub}</span>
      </div>
    </li>
  );
}