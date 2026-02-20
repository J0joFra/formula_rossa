import React, { useState } from 'react';
import { Activity, Clock, Zap, Radio, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveTiming() {
  const [activeSession, setActiveSession] = useState('Race');

  // Dati fittizi che poi verranno sostituiti dalle API di OpenF1
  const mockStandings = [
    { pos: 1, car: '16', driver: 'Charles Leclerc', gap: 'LEADER', interval: '-', lastLap: '1:14.562', sector1: '22.1', sector2: '31.4', sector3: '21.0', tyres: 'S', tyreAge: 5 },
    { pos: 2, car: '44', driver: 'Lewis Hamilton', gap: '+1.245', interval: '+1.245', lastLap: '1:14.890', sector1: '22.3', sector2: '31.5', sector3: '21.0', tyres: 'S', tyreAge: 6 },
    { pos: 3, car: '1', driver: 'Max Verstappen', gap: '+3.567', interval: '+2.322', lastLap: '1:15.102', sector1: '22.4', sector2: '31.8', sector3: '21.1', tyres: 'M', tyreAge: 12 },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      {/* Header - Pit Wall Style */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-600 font-bold uppercase tracking-widest text-xs">Live Telemetry</span>
            </div>
            <h1 className="text-3xl font-black uppercase italic">Grand Prix Centre</h1>
            <p className="text-gray-400 text-sm">Real-time data stream from OpenF1 API</p>
          </div>
          
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
            {['Practice', 'Qualifying', 'Race'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSession(tab)}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${
                  activeSession === tab ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Standings Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80">
              <h2 className="font-bold uppercase text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" /> Live Timing
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">LAP 42/70</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800 text-[10px] uppercase">
                    <th className="p-4">Pos</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4">Gap</th>
                    <th className="p-4">Interval</th>
                    <th className="p-4">Last Lap</th>
                    <th className="p-4 text-center">Tyre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {mockStandings.map((driver, i) => (
                    <tr key={i} className={`hover:bg-red-900/10 transition-colors ${driver.driver.includes('Leclerc') || driver.driver.includes('Hamilton') ? 'bg-red-600/5' : ''}`}>
                      <td className="p-4 font-bold">{driver.pos}</td>
                      <td className="p-4 font-bold flex items-center gap-2">
                        <div className={`w-1 h-4 ${driver.driver.includes('Leclerc') ? 'bg-red-600' : 'bg-blue-600'}`} />
                        {driver.driver}
                      </td>
                      <td className="p-4 text-gray-400">{driver.gap}</td>
                      <td className="p-4 text-gray-300">{driver.interval}</td>
                      <td className="p-4 text-ferrari-yellow">{driver.lastLap}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${driver.tyres === 'S' ? 'border-red-600 text-red-600' : 'border-yellow-600 text-yellow-600'}`}>
                          {driver.tyres}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Track Info */}
        <div className="space-y-6">
          {/* Track Map Placeholder */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px] relative">
            <MapIcon className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500 uppercase font-bold text-xs">Track Map Visualization</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="mt-4 grid grid-cols-2 gap-4 w-full text-[10px] uppercase font-bold">
                <div className="bg-gray-800 p-2 rounded">Air Temp: 24°C</div>
                <div className="bg-gray-800 p-2 rounded">Track Temp: 38°C</div>
            </div>
          </div>

          {/* Ferrari Live Telemetry Focus */}
          <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
            <h3 className="text-red-600 font-black uppercase text-xs mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-ferrari-yellow" /> Leclerc Telemetry
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Speed', value: '312 km/h', progress: 85 },
                { label: 'RPM', value: '11,400', progress: 70 },
                { label: 'Throttle', value: '100%', progress: 100 },
                { label: 'Brake', value: '0%', progress: 0 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                    <span>{item.label}</span>
                    <span className="text-gray-300">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      className={`h-full ${item.label === 'Brake' ? 'bg-blue-500' : 'bg-red-600'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radio Messages */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-bold uppercase text-[10px] mb-3 flex items-center gap-2">
              <Radio className="w-3 h-3" /> Team Radio Log
            </h3>
            <div className="space-y-2 text-[10px] font-mono">
              <p className="text-blue-400">14:32:01 - Leclerc: "Pitting this lap."</p>
              <p className="text-gray-500">14:31:45 - Engineering: "Box box, confirm."</p>
              <p className="text-yellow-400">14:28:10 - Yellow Flag Sector 2</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}