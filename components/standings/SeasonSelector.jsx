// components/standings/SeasonSelector.jsx
'use client';

import { useState, useEffect } from 'react';
import { getAvailableSeasons } from '../../lib/services/standingsService';

export default function SeasonSelector({ season, onSeasonChange }) {
  const [seasons, setSeasons] = useState([2026, 2025, 2024, 2023]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function loadSeasons() {
      setLoading(true);
      try {
        const availableSeasons = await getAvailableSeasons();
        setSeasons(availableSeasons);
        
        // Se la stagione corrente non è nella lista, seleziona la prima
        if (!availableSeasons.includes(season) && availableSeasons.length > 0) {
          onSeasonChange(availableSeasons[0]);
        }
      } catch (error) {
        console.error('Error loading seasons:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSeasons();
  }, []);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-3 flex items-center">
          <span className="mr-2">📅</span>
          Select Season:
        </span>
        <div className="relative">
          <select 
            value={season}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            disabled={loading}
            className="bg-gray-800 text-white px-4 py-2 pr-8 rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <option value={season}>Loading seasons...</option>
            ) : (
              seasons.map(s => (
                <option key={s} value={s} className="bg-gray-800">
                  {s} Season
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
            ) : (
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center text-gray-300">
        <div className="flex items-center bg-gray-800/50 px-3 py-1 rounded-lg">
          <span className="mr-2">🏁</span>
          <span>
            {loading ? 'Loading...' : `${seasons.length} seasons available`}
          </span>
        </div>
      </div>
    </div>
  );
}
