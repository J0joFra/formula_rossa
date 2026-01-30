// components/standings/MaidenSection.jsx
import { getMaidenAchievements } from '@/lib/services/analysisService';

export default function MaidenSection({ season }) {
  const maidenData = getMaidenAchievements(season);
  
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Historic Firsts in {season}</h2>
      <div className="space-y-4">
        {maidenData.firstWins?.map(win => (
          <div key={win.driverId} className="bg-black/30 p-3 rounded-lg">
            <div className="text-sm text-purple-300">🏆 Maiden Win</div>
            <div className="font-bold">{win.driverName}</div>
            <div className="text-sm text-gray-400">{win.grandPrix}</div>
          </div>
        ))}
        {/* Aggiungi sezioni simili per podi e pole */}
      </div>
    </div>
  );
}