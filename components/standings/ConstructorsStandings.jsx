// components/standings/ConstructorStandings.jsx
'use client';

import { useState, useEffect } from 'react';

export default function ConstructorStandings({ season }) {
  const [standings, setStandings] = useState([]);
  
  useEffect(() => {
    // Dati mock per ora
    const data = [
      { constructorId: 1, name: 'Red Bull', points: 650 },
      { constructorId: 2, name: 'Ferrari', points: 500 },
      { constructorId: 3, name: 'Mercedes', points: 480 },
      { constructorId: 4, name: 'McLaren', points: 450 },
      { constructorId: 5, name: 'Aston Martin', points: 350 },
    ];
    setStandings(data);
  }, [season]);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Constructor Standings {season}</h2>
      {standings.length === 0 ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {standings.map((team, idx) => (
            <div key={team.constructorId} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md">
                  <span className="font-bold">{idx + 1}</span>
                </div>
                <div>
                  <div className="font-medium">{team.name}</div>
                </div>
              </div>
              <div className="text-xl font-bold">{team.points}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}