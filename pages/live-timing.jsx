import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Activity, 
  Zap, 
  Settings, 
  User, 
  ChevronRight, 
  Clock 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Se vuoi ancora usare il vecchio componente LiveTiming, assicurati che il percorso sia corretto
import LiveTiming from '../components/LiveTiming';

export default function LiveTimingPage() {
  const [telemetryData, setTelemetryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driver, setDriver] = useState('LEC');

  // Funzione per recuperare i dati (Assicurati che il tuo backend Python sia attivo o usa un JSON locale)
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      // Nota: localhost non funzionerà su Vercel. 
      // Per il deploy dovrai caricare un file JSON statico o avere un'API pubblica.
      const res = await fetch(`http://localhost:8000/api/telemetry?year=2024&gp=Monza&session_type=Q&driver=${driver}`);
      if (res.ok) {
        const data = await res.json();
        setTelemetryData(data.telemetry);
      }
    } catch (err) {
      console.error("Errore nel caricamento dati FastF1:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [driver]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Live Timing & Telemetry | Formula Rossa</title>
        <meta name="description" content="Analisi telemetria e dati live F1" />
      </Head>

      {/* Header */}
      <header className="p-6 border-b border-red-900 flex justify-between items-center bg-zinc-950">
        <div>
          <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2 italic">
            <Zap className="fill-current" /> FORMULA ROSSA <span className="text-white not-italic font-light">| DATA ENGINE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded border border-zinc-800">
            <User size={16} className="text-red-500" />
            <select 
              className="bg-transparent outline-none text-sm font-mono"
              onChange={(e) => setDriver(e.target.value)}
              value={driver}
            >
              <option value="LEC">LECLERC</option>
              <option value="SAI">SAINZ</option>
              <option value="HAM">HAMILTON</option>
            </select>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Sezione Telemetria (Stile f1-tempo) */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-sm font-mono tracking-widest uppercase flex items-center gap-2">
              <Activity size={16} className="text-red-500" /> Speed Telemetry - {driver}
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Session: Qualifying Monza 2024</span>
          </div>
          
          <div className="h-[400px] w-full p-4">
            {telemetryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="Distance" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    tick={{fill: '#666', fontSize: 12}}
                    label={{ value: 'Distance (m)', position: 'bottom', fill: '#666' }}
                  />
                  <YAxis 
                    domain={[0, 360]} 
                    tick={{fill: '#666', fontSize: 12}}
                    label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#000', border: '1px solid #ff0000', color: '#fff'}}
                    itemStyle={{color: '#ff0000'}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Speed" 
                    stroke="#ff0000" 
                    dot={false} 
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <p>Nessun dato telemetrico ricevuto.</p>
                <p className="text-xs">Avvia il backend FastF1 o controlla la connessione.</p>
              </div>
            )}
          </div>
        </section>

        {/* Vecchio componente LiveTiming Classifica */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-red-500" /> LIVE CLASSIFICATION
          </h2>
          <LiveTiming />
        </section>

      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
            <p className="text-red-500 font-mono animate-pulse">EXTRACTING DATA FROM FASTF1...</p>
          </div>
        </div>
      )}
    </div>
  );
}
