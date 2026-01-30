// components/standings/DriverStandings.jsx
'use client';

import { useState, useEffect } from 'react';
import { getDriverStandings } from '../../lib/services/standingsService';

export default function DriverStandings({ season }) {
  const [standings, setStandings] = useState([]);
  
  useEffect(() => {
    const data = getDriverStandings(season);
    setStandings(data);
  }, [season]);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Driver Standings {season}</h2>
      {standings.length === 0 ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3">Pos</th>
                <th className="text-left py-3">Driver</th>
                <th className="text-left py-3">Team</th>
                <th className="text-left py-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((driver, idx) => (
                <tr key={driver.driverId} className="border-t border-gray-700">
                  <td className="py-3">{idx + 1}</td>
                  <td className="py-3 font-medium">{driver.forename} {driver.surname}</td>
                  <td className="py-3 text-gray-400">{driver.constructor}</td>
                  <td className="py-3 text-xl font-bold">{driver.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}