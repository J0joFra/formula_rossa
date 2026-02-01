import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// ISO 3166-1 alpha-3 -> alpha-2 (lowercase, per flag)
const countryCodeToFlag = {
  // Europa
  ITA: 'it', FRA: 'fr', DEU: 'de', ESP: 'es', PRT: 'pt',
  NLD: 'nl', BEL: 'be', CHE: 'ch', AUT: 'at', SWE: 'se',
  NOR: 'no', DNK: 'dk', FIN: 'fi', POL: 'pl', CZE: 'cz',
  GRC: 'gr', HUN: 'hu', IRL: 'ie', UKR: 'ua', ROU: 'ro',
  BGR: 'bg', HRV: 'hr', SVK: 'sk', SVN: 'si', EST: 'ee',
  LVA: 'lv', LTU: 'lt', ISL: 'is', LUX: 'lu', MCO: 'mc',

  // Americhe
  USA: 'us', CAN: 'ca', MEX: 'mx', BRA: 'br', ARG: 'ar',
  CHL: 'cl', COL: 'co', PER: 'pe', URY: 'uy', VEN: 've',

  // Asia
  CHN: 'cn',
  JPN: 'jp',
  KOR: 'kr',
  IND: 'in',
  THA: 'th',
  VNM: 'vn',
  MYS: 'my',
  SGP: 'sg',
  IDN: 'id',
  PHL: 'ph',
  TWN: 'tw',
  HKG: 'hk',
  ISR: 'il',
  SAU: 'sa',
  ARE: 'ae',
  QAT: 'qa',
  KWT: 'kw',
  BHR: 'bh',
  OMN: 'om',

  // Africa
  ZAF: 'za',
  MAR: 'ma',
  DZA: 'dz',
  TUN: 'tn',
  EGY: 'eg',
  NGA: 'ng',
  KEN: 'ke',
  GHA: 'gh',

  // Oceania
  AUS: 'au',
  NZL: 'nz',

  // Altri
  TUR: 'tr',
  RUS: 'ru',
  AZE: 'az',

  // Alias NON ISO (comodi ma opzionali)
  UK: 'gb',
  GB: 'gb',
  ENG: 'gb',
  GER: 'de',
  SUI: 'ch',
  UAE: 'ae',
  KSA: 'sa',
  RSA: 'za'
};

const getFlagCodeFromCountry = (countryCode) => {
  if (!countryCode) return '';
  
  const upperCode = countryCode.toUpperCase();
  
  if (countryCodeToFlag[upperCode]) {
    return countryCodeToFlag[upperCode];
  }
  
  if (countryCode.length === 2) {
    return countryCode.toLowerCase();
  }
  
  return countryCode.slice(0, 2).toLowerCase();
};

const getPositionBackground = (position) => {
  const pos = parseInt(position);
  
  switch(pos) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/50 to-yellow-600/10 border-l-4 border-yellow-500';
    case 2:
      return 'bg-gradient-to-r from-gray-300/50 to-gray-400/50 border-l-4 border-gray-300';
    case 3:
      return 'bg-gradient-to-r from-amber-700/50 to-amber-800/50 border-l-4 border-amber-700';
    case 4:
      return 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-l-4 border-blue-500';
    case 5:
      return 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-l-4 border-blue-500';
    case 6:
      return 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-l-4 border-blue-500';
    case 7:
      return 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-l-4 border-blue-500';
    case 8:
      return 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-l-4 border-blue-500';
    case 9:
      return 'bg-gradient-to-r from-blue-500/25 to-blue-600/25 border-l-4 border-blue-500';
    case 10:
      return 'bg-gradient-to-r from-amber-900/25 to-amber-950/25 border-l-4 border-amber-900';
    default:
      return 'bg-gradient-to-r from-zinc-900/15 to-zinc-900/15 border-l-4 border-zinc-800';
  }
};

const getPositionTextColor = (position) => {
  const pos = parseInt(position);
  
  switch(pos) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-gray-300';
    case 3:
      return 'text-amber-700';
    case 10:
      return 'text-amber-900';
    default:
      return 'text-zinc-500';
  }
};

const calculateBoundingBox = (lat, lon, radiusKm = 10) => {
  const latPerKm = 1 / 111.32; // 1 grado latitudine ≈ 111.32 km
  const lonPerKm = 1 / (111.32 * Math.cos(lat * Math.PI / 180)); 
  
  const latDelta = radiusKm * latPerKm;
  const lonDelta = radiusKm * lonPerKm;
  
  return {
    minLon: lon - lonDelta,
    minLat: lat - latDelta,
    maxLon: lon + lonDelta,
    maxLat: lat + latDelta
  };
};

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [raceInfo, setRaceInfo] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullDrivers, setShowFullDrivers] = useState(false);

  async function loadJSON(path) {
    try {
      const response = await fetch(path);
      return response.ok ? await response.json() : null;
    } catch { return null; }
  }

  useEffect(() => {
    if (!id) return;
    async function loadRaceData() {
      setLoading(true);
      const [racesData, circuitsData, drStData, coStData, drData, coData] = await Promise.all([
        loadJSON('/data/f1db-races.json'),
        loadJSON('/data/f1db-circuits.json'),
        loadJSON('/data/f1db-races-driver-standings.json'),
        loadJSON('/data/f1db-races-constructor-standings.json'),
        loadJSON('/data/f1db-drivers.json'),
        loadJSON('/data/f1db-constructors.json')
      ]);

      const currentRace = racesData?.find(r => r.id === parseInt(id));
      if (currentRace) {
        setRaceInfo(currentRace);
        const circuit = circuitsData?.find(c => c.id === currentRace.circuitId);
        setCircuitInfo(circuit);
        
        const dMap = {}; drData?.forEach(d => dMap[d.id] = d);
        const cMap = {}; coData?.forEach(c => cMap[c.id] = c);
        setDrivers(dMap); setConstructors(cMap);

        setDriverStandings(drStData?.filter(s => s.raceId === currentRace.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
        setConstructorStandings(coStData?.filter(s => s.raceId === currentRace.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
      }
      setLoading(false);
    }
    loadRaceData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest">LOADING...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold">RACE NOT FOUND</div>;

  const flagCode = getFlagCodeFromCountry(circuitInfo?.countryId);
  const visibleDrivers = showFullDrivers ? driverStandings : driverStandings.slice(0, 10);
  
  // Calcola bounding box per la mappa se abbiamo coordinate
  let mapUrl = '';
  if (circuitInfo?.latitude && circuitInfo?.longitude) {
    const bbox = calculateBoundingBox(
      parseFloat(circuitInfo.latitude),
      parseFloat(circuitInfo.longitude)
    );
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon}%2C${bbox.minLat}%2C${bbox.maxLon}%2C${bbox.maxLat}&layer=mapnik&marker=${circuitInfo.latitude}%2C${circuitInfo.longitude}`;
  }

  // Funzione per controllare se è un pilota/scuderia Ferrari
  const isFerrari = (constructorId) => {
    const constructorName = constructors[constructorId]?.name?.toLowerCase();
    return constructorName?.includes('ferrari') || false;
  };

  const getConstructorName = (constructorId) => {
    return constructors[constructorId]?.name || '';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation activeSection="calendar" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-zinc-500 font-bold uppercase text-[10px] mb-8 inline-block hover:text-red-600 transition-colors tracking-widest">
          ← Back to Standings
        </Link>
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">
            Round {raceInfo.round} • {raceInfo.year}
          </div>

          {/* Layout Header a 3 Blocchi */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Info Circuito */}
            <div className="md:col-span-2 bg-zinc-900/50 border-l-4 border-red-600 p-6 flex flex-col justify-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Circuit</p>
              <p className="text-3xl font-black uppercase italic leading-none mb-2">{circuitInfo?.name}</p>
              <p className="text-sm text-zinc-400 font-bold uppercase">{circuitInfo?.placeName}, {circuitInfo?.countryId}</p>
            </div>

            {/* Bandiera */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex items-center justify-center rounded-sm">
              {flagCode ? (
                <img 
                  src={`https://flagcdn.com/h80/${flagCode}.png`} 
                  className="h-16 w-auto shadow-2xl rounded-sm object-contain" 
                  alt={circuitInfo?.countryId}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://flagcdn.com/h80/${circuitInfo?.countryId?.slice(0, 2).toLowerCase() || 'xx'}.png`;
                  }}
                />
              ) : (
                <div className="text-zinc-500 text-sm font-bold">No Flag</div>
              )}
            </div>

            {/* Mappa Piccola Quadrata */}
            <div className="bg-zinc-900/50 border border-zinc-800 aspect-square overflow-hidden rounded-sm relative group">
              {mapUrl ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  src={mapUrl}
                  className="grayscale invert opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                  title={`Map of ${circuitInfo?.name}`}
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-zinc-500 text-sm font-bold">Map Not Available</div>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none border border-white/5"></div>
            </div>

          </div>
        </header>

        {/* Sezione Classifiche */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Driver Standings con Tendina */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Driver Standings</h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {visibleDrivers.map((s, i) => {
                  const isFerrariDriver = isFerrari(s.constructorId);
                  const constructorName = getConstructorName(s.constructorId);
                  const position = s.positionText;
                  const bgClass = getPositionBackground(position);
                  const textClass = getPositionTextColor(position);
                  
                  return (
                    <tr key={i} className={`${bgClass} hover:bg-white/10 transition-all duration-300`}>
                      <td className="p-4 w-12 font-black italic">
                        <div className={`${textClass} group-hover:text-white transition-colors`}>
                          {position}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className={`font-bold uppercase tracking-tight ${isFerrariDriver ? 'text-[#ff2800]' : 'text-white'}`}>
                            {drivers[s.driverId]?.firstName} <span className={`${isFerrariDriver ? 'text-[#ff2800]' : 'text-red-600'}`}>
                              {drivers[s.driverId]?.lastName}
                            </span>
                          </div>
                          <div className={`text-xs font-bold uppercase mt-1 ${isFerrariDriver ? 'text-[#ff2800]' : 'text-zinc-400'}`}>
                            {constructorName}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {driverStandings.length > 10 && (
              <button 
                onClick={() => setShowFullDrivers(!showFullDrivers)}
                className="w-full py-4 bg-zinc-800/50 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                {showFullDrivers ? "↑ Show Top 10" : `↓ Show All ${driverStandings.length} Drivers`}
              </button>
            )}
          </section>

          {/* Constructor Standings */}
          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm h-fit">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Constructor Standings</h2>
            </div>
            <table className="w-full text-left text-sm">
              <tbody>
                {constructorStandings.map((s, i) => {
                  const isFerrariConstructor = isFerrari(s.constructorId);
                  const position = s.positionText;
                  const bgClass = getPositionBackground(position);
                  const textClass = getPositionTextColor(position);
                  
                  return (
                    <tr key={i} className={`${bgClass} hover:bg-white/10 transition-all duration-300`}>
                      <td className="p-4 w-12 font-black italic">
                        <div className={`${textClass} group-hover:text-white transition-colors`}>
                          {position}
                        </div>
                      </td>
                      <td className={`p-4 font-bold uppercase tracking-tight ${isFerrariConstructor ? 'text-[#ff2800]' : 'text-white'}`}>
                        {constructors[s.constructorId]?.name}
                      </td>
                      <td className="p-4 text-right font-black text-white">{s.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
