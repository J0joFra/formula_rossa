// components/standings/SeasonSelector.jsx
export default function SeasonSelector({ season, onSeasonChange }) {
  const seasons = [2025, 2024, 2023, 2022, 2021];
  
  return (
    <div className="flex items-center space-x-4 mb-6">
      <label className="text-lg font-medium">Select Season:</label>
      <select 
        value={season}
        onChange={(e) => onSeasonChange(Number(e.target.value))}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
      >
        {seasons.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}