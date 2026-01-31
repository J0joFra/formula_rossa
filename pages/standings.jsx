// pages/standings.jsx
/*'use client';

import { useState } from 'react';
import DriverStandings from '../components/standings/DriverStandings';
import ConstructorStandings from '../components/standings/ConstructorStandings';
import MaidenSection from '../components/standings/MaidenSection';
import SeasonSelector from '../components/standings/SeasonSelector'; */

import { useState, useEffect } from 'react';
import dataLoader from '../services/dataLoader';

export default function StandingsPage() {
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(2025);

  useEffect(() => {
    loadStandings();
  }, [selectedSeason]);

  async function loadStandings() {
    try {
      setLoading(true);
      setError(null);

      // Carica tutti i dati
      await dataLoader.loadAllData();

      // Ottieni classifiche per la stagione selezionata
      const drivers = dataLoader.getDriverStandings(selectedSeason);
      const constructors = dataLoader.getConstructorStandings(selectedSeason);

      console.log('🏎️ Driver standings:', drivers);
      console.log('🏭 Constructor standings:', constructors);

      setDriverStandings(drivers);
      setConstructorStandings(constructors);

    } catch (err) {
      console.error('❌ Error loading standings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-800 border-t-red-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-red-600 text-2xl font-bold">F1</div>
            </div>
          </div>
          <p className="text-gray-400 mt-6 text-lg">Caricamento classifiche...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl p-8 max-w-md backdrop-blur-sm">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-500 mb-3 text-center">Errore</h2>
          <p className="text-gray-300 text-center">{error}</p>
          <button 
            onClick={loadStandings}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-5xl font-black text-center mb-4 tracking-tight">
            Formula 1 {selectedSeason}
          </h1>
          <p className="text-center text-red-100 text-lg">
            World Championship Standings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Driver Standings */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <h2 className="text-3xl font-bold mx-6 text-red-500">
              🏆 Driver Championship
            </h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          </div>
          
          {driverStandings.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700">
              <p className="text-gray-400 text-lg">
                Nessun dato disponibile per la stagione {selectedSeason}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <th className="p-4 text-left font-bold">POS</th>
                      <th className="p-4 text-left font-bold">DRIVER</th>
                      <th className="p-4 text-left font-bold">NATIONALITY</th>
                      <th className="p-4 text-left font-bold">TEAM</th>
                      <th className="p-4 text-right font-bold">POINTS</th>
                      <th className="p-4 text-right font-bold">WINS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverStandings.map((standing, index) => (
                      <tr 
                        key={standing.driver.id}
                        className={`
                          border-b border-gray-700 transition-all duration-200
                          ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/40'}
                          hover:bg-red-900/20 hover:scale-[1.01]
                        `}
                      >
                        <td className="p-4">
                          <div className={`
                            font-black text-xl
                            ${index === 0 ? 'text-yellow-400' : ''}
                            ${index === 1 ? 'text-gray-300' : ''}
                            ${index === 2 ? 'text-orange-400' : ''}
                            ${index > 2 ? 'text-gray-400' : ''}
                          `}>
                            {standing.position}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-lg">
                            {standing.driver.givenName}{' '}
                            <span className="text-red-400">{standing.driver.familyName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">
                          {standing.driver.nationality || 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-700/50 px-3 py-1 rounded-full text-sm font-medium">
                            {standing.constructor.name}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-xl text-red-400">
                            {standing.points}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-300 font-semibold">
                          {standing.wins}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Constructor Standings */}
        <section>
          <div className="flex items-center mb-6">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            <h2 className="text-3xl font-bold mx-6 text-red-500">
              🏭 Constructor Championship
            </h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          </div>
          
          {constructorStandings.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700">
              <p className="text-gray-400 text-lg">
                Nessun dato disponibile per la stagione {selectedSeason}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <th className="p-4 text-left font-bold">POS</th>
                      <th className="p-4 text-left font-bold">TEAM</th>
                      <th className="p-4 text-left font-bold">NATIONALITY</th>
                      <th className="p-4 text-right font-bold">POINTS</th>
                      <th className="p-4 text-right font-bold">WINS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constructorStandings.map((standing, index) => (
                      <tr 
                        key={standing.constructor.id}
                        className={`
                          border-b border-gray-700 transition-all duration-200
                          ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-800/40'}
                          hover:bg-red-900/20 hover:scale-[1.01]
                          ${standing.constructor.id === 'ferrari' ? 'border-l-4 border-l-red-600' : ''}
                        `}
                      >
                        <td className="p-4">
                          <div className={`
                            font-black text-xl
                            ${index === 0 ? 'text-yellow-400' : ''}
                            ${index === 1 ? 'text-gray-300' : ''}
                            ${index === 2 ? 'text-orange-400' : ''}
                            ${index > 2 ? 'text-gray-400' : ''}
                          `}>
                            {standing.position}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-lg flex items-center">
                            {standing.constructor.id === 'ferrari' && (
                              <span className="mr-2 text-2xl">🏎️</span>
                            )}
                            <span className={standing.constructor.id === 'ferrari' ? 'text-red-400' : ''}>
                              {standing.constructor.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">
                          {standing.constructor.nationality || 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-bold text-xl text-red-400">
                            {standing.points}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-300 font-semibold">
                          {standing.wins}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
