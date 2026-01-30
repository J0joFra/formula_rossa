// components/standings/DriverStandings.jsx
import { getDriverStandings } from '@/lib/services/standingsService';

export default function DriverStandings({ season }) {
  const [standings, setStandings] = useState([]);
  
  useEffect(() => {
    const data = getDriverStandings(season);
    setStandings(data.slice(0, 10)); // Top 10
  }, [season]);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Driver Standings {season}</h2>
      <table className="w-full">
        <thead><tr><th>Pos</th><th>Driver</th><th>Team</th><th>Points</th></tr></thead>
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
  );
}