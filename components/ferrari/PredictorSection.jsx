import React, { useState } from 'react';

const circuits2025 = [
  { id: 'bahrain', name: 'Bahrain GP', track: 'Sakhir', country: 'Bahrain' },
  { id: 'saudi', name: 'Saudi Arabian GP', track: 'Jeddah', country: 'Arabia Saudita' },
  { id: 'australia', name: 'Australian GP', track: 'Melbourne', country: 'Australia' },
  { id: 'japan', name: 'Japanese GP', track: 'Suzuka', country: 'Giappone' },
  { id: 'china', name: 'Chinese GP', track: 'Shanghai', country: 'Cina' },
  { id: 'miami', name: 'Miami GP', track: 'Miami', country: 'USA' },
  { id: 'imola', name: 'Emilia Romagna GP', track: 'Imola', country: 'Italia' },
  { id: 'monaco', name: 'Monaco GP', track: 'Monte Carlo', country: 'Monaco' },
  { id: 'spain', name: 'Spanish GP', track: 'Barcelona', country: 'Spagna' },
  { id: 'canada', name: 'Canadian GP', track: 'Montreal', country: 'Canada' },
  { id: 'austria', name: 'Austrian GP', track: 'Spielberg', country: 'Austria' },
  { id: 'britain', name: 'British GP', track: 'Silverstone', country: 'UK' },
  { id: 'hungary', name: 'Hungarian GP', track: 'Hungaroring', country: 'Ungheria' },
  { id: 'belgium', name: 'Belgian GP', track: 'Spa-Francorchamps', country: 'Belgio' },
  { id: 'netherlands', name: 'Dutch GP', track: 'Zandvoort', country: 'Olanda' },
  { id: 'italy', name: 'Italian GP', track: 'Monza', country: 'Italia' },
  { id: 'azerbaijan', name: 'Azerbaijan GP', track: 'Baku', country: 'Azerbaijan' },
  { id: 'singapore', name: 'Singapore GP', track: 'Marina Bay', country: 'Singapore' },
  { id: 'usa', name: 'United States GP', track: 'Austin', country: 'USA' },
  { id: 'mexico', name: 'Mexico City GP', track: 'Mexico City', country: 'Messico' },
  { id: 'brazil', name: 'Brazilian GP', track: 'Interlagos', country: 'Brasile' },
  { id: 'lasvegas', name: 'Las Vegas GP', track: 'Las Vegas', country: 'USA' },
  { id: 'qatar', name: 'Qatar GP', track: 'Lusail', country: 'Qatar' },
  { id: 'abudhabi', name: 'Abu Dhabi GP', track: 'Yas Marina', country: 'UAE' },
];

export default function PredictorSection() {
  const [selectedCircuit, setSelectedCircuit] = useState(circuits2025[0]);

  return (
    <div>
      <div className="mb-6">
        <label className="block text-gray-400 mb-3 font-medium">Gran Premio</label>
        <div className="relative">
          <select
            value={selectedCircuit.id}
            onChange={(e) => {
              const circuit = circuits2025.find(c => c.id === e.target.value);
              setSelectedCircuit(circuit || circuits2025[0]);
            }}
            className="w-full p-4 bg-gray-800/30 border border-gray-700 rounded-xl text-white appearance-none focus:outline-none focus:border-ferrari-red"
          >
            {circuits2025.map((circuit) => (
              <option key={circuit.id} value={circuit.id}>
                {circuit.name} - {circuit.track}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Selezionato: <span className="text-ferrari-gold">{selectedCircuit.name}</span> - {selectedCircuit.country}
        </p>
      </div>
    </div>
  );
}