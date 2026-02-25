import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Zap, Radio, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import LiveTiming from '../components/LiveTiming';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Settings, Zap, User } from 'lucide-react';
import Head from 'next/head';

export default function TelemetryAnalysis() {
  const [telemetryData, setTelemetryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState('LEC'); // Default Leclerc

  // Funzione per recuperare i dati dal tuo backend Python
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      // Nota: Dovrai puntare all'URL del tuo server FastAPI
      const res = await fetch(`http://localhost:8000/api/telemetry?year=2024&gp=Monza&session_type=Q&driver=${driver}`);
      const data = await res.json();
      setTelemetryData(data.telemetry);
    } catch (err) {
      console.error("Errore nel caricamento dati FastF1", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTelemetry();
  }, [driver]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <Head>
        <title>Telemetry Analysis | Formula Rossa</title>
      </Head>

      <header className="flex justify-between items-center mb-8 border-b border-red-900 pb-4">
        <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
          <Zap /> ANALISI TELEMETRIA LIVE
        </h1>
        <div className="flex gap-4">
          <select 
            className="bg-zinc-900 border border-zinc-700 p-2 rounded"
            onChange={(e) => setDriver(e.target.value)}
            value={driver}
          >
            <option value="LEC">Leclerc</option>
            <option value="SAI">Sainz</option>
            <option value="HAM">Hamilton</option>
          </select>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6">
        {/* Grafico Velocità */}
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-lg mb-4 flex items-center gap-2 font-mono">
             <Settings size={18} /> SPEED (KM/H) vs DISTANCE
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="Distance" hide />
                <YAxis domain={['auto', 'auto']} stroke="#888" />
                <Tooltip 
                   contentStyle={{backgroundColor: '#111', border: '1px solid #444'}}
                   itemStyle={{color: '#e11d48'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="Speed" 
                  stroke="#e11d48" 
                  dot={false} 
                  strokeWidth={2}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qui potresti aggiungere altri grafici per Throttle e Brake */}
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
        </div>
      )}
    </div>
  );
}
export default function LiveTimingPage() {
  return (
    <>
      <Head>
        <title>Live Timing F1 | Formula Rossa</title>
        <meta name="description" content="Segui la classifica in tempo reale, telemetria e team radio della Formula 1. Dati live dalla Scuderia Ferrari e non solo." />
        <meta property="og:title" content="Live Timing F1 | Formula Rossa" />
        <meta property="og:description" content="Classifica live, telemetria e team radio in tempo reale" />
      </Head>
      
      <LiveTiming />
    </>
  );
}