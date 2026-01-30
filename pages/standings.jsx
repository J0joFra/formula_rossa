// pages/standings.jsx
import { useState } from 'react';
import SeasonSelector from '@/components/standings/SeasonSelector';
import DriverStandings from '@/components/standings/DriverStandings';
import ConstructorStandings from '@/components/standings/ConstructorStandings';
import StatsOverview from '@/components/standings/StatsOverview';
import MaidenSection from '@/components/standings/MaidenSection';

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
          <StatsOverview season={selectedSeason} />
          <MaidenSection season={selectedSeason} />
        </div>
      </div>
    </div>
  );
}