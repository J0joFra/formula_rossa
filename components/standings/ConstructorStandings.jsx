// components/standings/ConstructorStandings.jsx
'use client';

import { useState, useEffect } from 'react';
import { getConstructorStandings } from '../../lib/services/standingsService';

export default function ConstructorStandings({ season }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  
  useEffect(() => {
    async function loadStandings() {
      setLoading(true);
      console.log(`🔄 Loading constructor standings for ${season}...`);
      
      try {
        const data = await getConstructorStandings(season);
        setStandings(data);
        
        // Determina se sono dati reali o mock
        const isRealData = data.length > 0 && 
          data.some(team => team.constructorId && team.constructorId !== 1);
        setDataSource(isRealData ? 'real' : 'mock');
        
        console.log(`✅ Loaded ${data.length} constructors for ${season}`);
      } catch (error) {
        console.error('❌ Error loading constructor standings:', error);
        setDataSource('mock');
      } finally {
        setLoading(false);
      }
    }
    
    loadStandings();
  }, [season]);
  
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Constructor Standings {season}</h2>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <div className="text-gray-400">
            Loading constructor data for {season}...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Constructor Standings {season}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm px-3 py-1 rounded-full bg-gray-700">
            {standings.length} teams
          </span>
          <span className={`text-sm px-3 py-1 rounded-full ${
            dataSource === 'real' 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-yellow-900/30 text-yellow-400'
          }`}>
            {dataSource === 'real' ? '📊 Real Data' : '🔄 Mock Data'}
          </span>
        </div>
      </div>
      
      {standings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">🏭</div>
          <div className="text-xl">No constructor data available for {season}</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Pos</th>
                <th className="text-left py-3 px-4">Team</th>
                <th className="text-left py-3 px-4">Nationality</th>
                <th className="text-left py-3 px-4">Wins</th>
                <th className="text-left py-3 px-4">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => (
                <tr key={team.constructorId || idx} className="border-t border-gray-700 hover:bg-gray-900/50 transition">
                  <td className="py-4 px-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-md ${
                      idx === 0 ? 'bg-yellow-900/30 text-yellow-400' : 
                      idx === 1 ? 'bg-gray-700 text-gray-300' : 
                      idx === 2 ? 'bg-amber-900/30 text-amber-400' : 
                      'bg-gray-900 text-gray-400'
                    }`}>
                      <span className="font-bold text-lg">{idx + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-lg">{team.name}</div>
                    {team.nationality && (
                      <div className="text-sm text-gray-400">{team.nationality}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {team.nationality ? (
                      <span className="text-sm text-gray-300">{team.nationality}</span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">🏆</span>
                      <span className="font-bold text-lg">{team.wins}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-2xl font-bold">{team.points.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
