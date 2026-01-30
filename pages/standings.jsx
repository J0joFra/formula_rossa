// pages/standings.jsx
'use client';

import { useState } from 'react';
import DriverStandings from '../components/standings/DriverStandings';
import ConstructorStandings from '../components/standings/ConstructorStandings';
import MaidenSection from '../components/standings/MaidenSection';
import SeasonSelector from '../components/standings/SeasonSelector';

export default function StandingsPage() {
  const [selectedSeason, setSelectedSeason] = useState(2025);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-2">Formula 1 Statistics Hub</h1>
      <p className="text-gray-400 mb-8">Complete standings and historical data</p>
      
      {/* Selezione Stagione */}
      <SeasonSelector season={selectedSeason} onSeasonChange={setSelectedSeason} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Colonna Sinistra: Classifiche */}
        <div className="lg:col-span-2 space-y-6">
          <DriverStandings season={selectedSeason} />
          <ConstructorStandings season={selectedSeason} />
        </div>
        
        {/* Colonna Destra: Statistiche & "Maiden" */}
        <div className="space-y-6">
          <MaidenSection season={selectedSeason} />
          
          {/* Puoi aggiungere altri componenti qui */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Season Overview {selectedSeason}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Races:</span>
                <span className="font-bold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Champion:</span>
                <span className="font-bold">Max Verstappen</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Points Leader:</span>
                <span className="font-bold">Red Bull Racing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}