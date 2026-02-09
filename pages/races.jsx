import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

const circuitToCountry = {
  'monza': 'it', 'autodromo-nazionale-di-monza': 'it', 'milan': 'it', 'imola': 'it', 'enzo-e-dino-ferrari': 'it',
  'mugello': 'it', 'bologna': 'it', 'pescara': 'it', 'silverstone': 'gb', 'silverstone-circuit': 'gb',
  'northamptonshire': 'gb', 'brands-hatch': 'gb', 'kent': 'gb', 'donington': 'gb', 'aintree': 'gb',
  'liverpool': 'gb', 'spa': 'be', 'spa-francorchamps': 'be', 'stavelot': 'be', 'zolder': 'be',
  'heusden-zolder': 'be', 'nivelles': 'be', 'brussels': 'be', 'zandvoort': 'nl', 'circuit-zandvoort': 'nl',
  'catalunya': 'es', 'barcelona': 'es', 'montmelo': 'es', 'jerez': 'es', 'valencia': 'es',
  'valencia-street-circuit': 'es', 'pedralbes': 'es', 'montjuic': 'es', 'madrid': 'es', 'madring': 'es', 'jarama': 'es',
  'hungaroring': 'hu', 'budapest': 'hu', 'mogyorod': 'hu', 'red-bull-ring': 'at', 'spielberg': 'at',
  'zeltweg': 'at', 'oesterreichring': 'at', 'styria': 'at', 'magny-cours': 'fr', 'nevers': 'fr',
  'paul-ricard': 'fr', 'le-castellet': 'fr', 'ricard': 'fr', 'reims': 'fr', 'dijon': 'fr',
  'dijon-prenois': 'fr', 'rouen': 'fr', 'essarts': 'fr', 'charade': 'fr', 'clermont-ferrand': 'fr',
  'lemans': 'fr', 'nurburgring': 'de', 'nurburg': 'de', 'hockenheimring': 'de', 'hockenheim': 'de',
  'avus': 'de', 'berlin': 'de', 'estoril': 'pt', 'cascais': 'pt', 'portimao': 'pt',
  'algarve': 'pt', 'boavista': 'pt', 'oporto': 'pt', 'monsanto': 'pt', 'lisbon': 'pt',
  'bremgarten': 'ch', 'bern': 'ch', 'anderstorp': 'se', 'scandinavian-raceway': 'se', 'monaco': 'mc',
  'monte-carlo': 'mc', 'circuit-de-monaco': 'mc', 'bakú': 'az', 'baku': 'az', 'azerbaijan': 'az',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'circuit-of-the-americas': 'us', 'miami': 'us',
  'miami-international-autodrome': 'us', 'vegas': 'us', 'las-vegas': 'us', 'las-vegas-strip': 'us', 'caesars-palace': 'us',
  'indianapolis': 'us', 'indianapolis-motor-speedway': 'us', 'watkins-glen': 'us', 'long-beach': 'us', 'phoenix': 'us',
  'detroit': 'us', 'dallas': 'us', 'sebring': 'us', 'riverside': 'us', 'villeneuve': 'ca',
  'montreal': 'ca', 'circuit-gilles-villeneuve': 'ca', 'mosport': 'ca', 'bowmanville': 'ca', 'tremblant': 'ca',
  'st-jovite': 'ca', 'interlagos': 'br', 'sao-paulo': 'br', 'são-paulo': 'br', 'jose-carlos-pace': 'br',
  'jacarepagua': 'br', 'rio-de-janeiro': 'br', 'rodriguez': 'mx', 'hermanos-rodriguez': 'mx', 'mexico-city': 'mx',
  'galvez': 'ar', 'buenos-aires': 'ar', 'oscar-galvez': 'ar',
  'juan-y-oscar-galvez': 'ar', 'juan-y-ignacio-cobos': 'ar', 'carlos-pace': 'br', 'juan-y-ignacio-cobos': 'ar',
  'suzuka': 'jp', 'suzuka-circuit': 'jp', 'mie': 'jp', 'fuji': 'jp', 'fuji-speedway': 'jp',
  'oyama': 'jp', 'okayama': 'jp', 'ti-circuit': 'jp', 'shanghai': 'cn', 'shanghai-international-circuit': 'cn',
  'marina-bay': 'sg', 'singapore': 'sg', 'sepang': 'my', 'kuala-lumpur': 'my', 'yeongam': 'kr',
  'korea-international-circuit': 'kr', 'buddh': 'in', 'greater-noida': 'in', 'bahrain': 'bh', 'sakhir': 'bh',
  'manama': 'bh', 'bahrain-international-circuit': 'bh', 'losail': 'qa', 'lusail': 'qa', 'lusail-international-circuit': 'qa',
  'jeddah': 'sa', 'jeddah-corniche-circuit': 'sa', 'yas-marina': 'ae', 'abu-dhabi': 'ae', 'yas-marina-circuit': 'ae',
  'istanbul': 'tr', 'istanbul-park': 'tr', 'sochi': 'ru', 'sochi-autodrom': 'ru', 'kyalami': 'za',
  'midrand': 'za', 'george': 'za', 'prince-george': 'za', 'adelaide': 'au', 'albert-park': 'au',
  'melbourne': 'au', 'ain-diab': 'ma', 'casablanca': 'ma',
};

const getFlagCodeFromCircuit = (circuitName) => {
  if (!circuitName) return '';
  const normalized = circuitName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  
  if (circuitToCountry[normalized]) return circuitToCountry[normalized];

  const lowerName = circuitName.toLowerCase();
  if (lowerName.includes('abu dhabi') || lowerName.includes('yas marina') || lowerName.includes('dubai') || lowerName.includes('emirates')) return 'ae';
  if (lowerName.includes('silverstone') || lowerName.includes('brands') || lowerName.includes('donington') || lowerName.includes('aintree') || lowerName.includes('british') || lowerName.includes('england') || lowerName.includes('uk')) return 'gb';
  if (lowerName.includes('monza') || lowerName.includes('imola') || lowerName.includes('mugello') || lowerName.includes('pescara') || lowerName.includes('italian') || lowerName.includes('italy')) return 'it';
  if (lowerName.includes('monaco') || lowerName.includes('monte carlo')) return 'mc';
  if (lowerName.includes('spa') || lowerName.includes('francorchamps') || lowerName.includes('zolder') || lowerName.includes('nivelles') || lowerName.includes('belgian') || lowerName.includes('belgium')) return 'be';
  if (lowerName.includes('nürburgring') || lowerName.includes('nurburgring') || lowerName.includes('hockenheim') || lowerName.includes('avus') || lowerName.includes('german') || lowerName.includes('germany')) return 'de';
  if (lowerName.includes('montreal') || lowerName.includes('villeneuve') || lowerName.includes('bowmanville') || lowerName.includes('canadian') || lowerName.includes('canada')) return 'ca';
  if (lowerName.includes('melbourne') || lowerName.includes('adelaide') || lowerName.includes('albert park') || lowerName.includes('australian') || lowerName.includes('australia')) return 'au';
  if (lowerName.includes('interlagos') || lowerName.includes('jacarepagua') || lowerName.includes('galvez') || lowerName.includes('brazilian') || lowerName.includes('brazil') || lowerName.includes('são paulo') || lowerName.includes('sao paulo')) return 'br';
  if (lowerName.includes('mexico') || lowerName.includes('rodriguez') || lowerName.includes('mexican')) return 'mx';
  if (lowerName.includes('shanghai') || lowerName.includes('chinese') || lowerName.includes('china')) return 'cn';
  if (lowerName.includes('suzuka') || lowerName.includes('fuji') || lowerName.includes('okayama') || lowerName.includes('japanese') || lowerName.includes('japan')) return 'jp';
  if (lowerName.includes('bahrain') || lowerName.includes('sakhir')) return 'bh';
  if (lowerName.includes('jeddah') || lowerName.includes('saudi') || lowerName.includes('ksa')) return 'sa';
  if (lowerName.includes('miami') || lowerName.includes('austin') || lowerName.includes('americas') || lowerName.includes('cota') || lowerName.includes('indianapolis') || lowerName.includes('sebring') || lowerName.includes('riverside') || lowerName.includes('watkins glen') || lowerName.includes('long beach') || lowerName.includes('phoenix') || lowerName.includes('detroit') || lowerName.includes('dallas') || lowerName.includes('caesars palace') || lowerName.includes('monterey') || lowerName.includes('laguna seca') || lowerName.includes('las vegas') || lowerName.includes('vegas') || lowerName.includes('united states') || lowerName.includes('usa') || lowerName.includes('us')) return 'us';
  if (lowerName.includes('catalunya') || lowerName.includes('barcelona') || lowerName.includes('valencia') || lowerName.includes('jarama') || lowerName.includes('montjuic') || lowerName.includes('pedralbes') || lowerName.includes('spanish')) return 'es';
  if (lowerName.includes('nurburgring') || lowerName.includes('nurburg') || lowerName.includes('hockenheimring') || lowerName.includes('hockenheim') || lowerName.includes('avus') || lowerName.includes('berlin') || lowerName.includes('german') || lowerName.includes('germany')) return 'de';
  if (lowerName.includes('madrid') || lowerName.includes('madring')) return 'es';
  if (lowerName.includes('red bull ring') || lowerName.includes('spielberg') || lowerName.includes('zeltweg') || lowerName.includes('österreichring') || lowerName.includes('austrian') || lowerName.includes('austria')) return 'at';
  if (lowerName.includes('hungaroring') || lowerName.includes('hungarian') || lowerName.includes('hungary')) return 'hu';
  if (lowerName.includes('zandvoort') || lowerName.includes('dutch') || lowerName.includes('netherlands') || lowerName.includes('holland')) return 'nl';
  if (lowerName.includes('baku') || lowerName.includes('azerbaijan')) return 'az';
  if (lowerName.includes('marina bay') || lowerName.includes('singapore')) return 'sg';
  if (lowerName.includes('losail') || lowerName.includes('lusail') || lowerName.includes('qatar')) return 'qa';
  if (lowerName.includes('le castellet') || lowerName.includes('paul ricard') || lowerName.includes('ricard') || lowerName.includes('rouen') || lowerName.includes('essarts') || lowerName.includes('reims') || lowerName.includes('charade') || lowerName.includes('dijon') || lowerName.includes('magny-cours') || lowerName.includes('lemans') || lowerName.includes('louvre') || lowerName.includes('french') || lowerName.includes('france')) return 'fr';
  if (lowerName.includes('bremgarten') || lowerName.includes('swiss') || lowerName.includes('switzerland')) return 'ch';
  if (lowerName.includes('boavista') || lowerName.includes('monsanto') || lowerName.includes('estoril') || lowerName.includes('portimao') || lowerName.includes('portuguese') || lowerName.includes('portugal')) return 'pt';
  if (lowerName.includes('ain-diab') || lowerName.includes('ain diab') || lowerName.includes('moroccan') || lowerName.includes('morocco')) return 'ma';  
  if (lowerName.includes('george') || lowerName.includes('kyalami') || lowerName.includes('south african') || lowerName.includes('south africa')) return 'za';
  if (lowerName.includes('sepang') || lowerName.includes('malaysian') || lowerName.includes('malaysia')) return 'my';
  if (lowerName.includes('buddh') || lowerName.includes('indian') || lowerName.includes('india')) return 'in';
  if (lowerName.includes('yeongam') || lowerName.includes('korean') || lowerName.includes('korea')) return 'kr';
  if (lowerName.includes('istanbul') || lowerName.includes('turkish') || lowerName.includes('turkey')) return 'tr';
  if (lowerName.includes('sochi') || lowerName.includes('russian') || lowerName.includes('russia')) return 'ru';  
  return '';
}; 

const getPositionBackground = (position) => {
  const pos = parseInt(position);
  switch(pos) {
    case 1: return 'bg-gradient-to-r from-yellow-500/30 to-transparent border-l-4 border-yellow-500';
    case 2: return 'bg-gradient-to-r from-gray-300/20 to-transparent border-l-4 border-gray-300';
    case 3: return 'bg-gradient-to-r from-amber-700/20 to-transparent border-l-4 border-amber-700';
    default: return 'border-l-4 border-zinc-800 hover:bg-white/5';
  }
};

const getPositionTextColor = (position) => {
  const pos = parseInt(position);
  if (pos === 1) return 'text-yellow-500';
  if (pos === 2) return 'text-gray-300';
  if (pos === 3) return 'text-amber-700';
  return 'text-zinc-500';
};

const calculateBoundingBox = (lat, lon, radiusKm = 2) => {
  const latPerKm = 1 / 111.32;
  const lonPerKm = 1 / (111.32 * Math.cos(lat * Math.PI / 180));
  return {
    minLon: lon - radiusKm * lonPerKm,
    minLat: lat - radiusKm * latPerKm,
    maxLon: lon + radiusKm * lonPerKm,
    maxLat: lat + radiusKm * latPerKm
  };
};

export default function RaceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [raceInfo, setRaceInfo] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [raceResults, setRaceResults] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [constructors, setConstructors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFullDrivers, setShowFullDrivers] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      try {
        const [racesRes, circuitsRes, resultsRes, coStRes, drRes, coRes] = await Promise.all([
          fetch('/data/f1db-races.json'),
          fetch('/data/f1db-circuits.json'),
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-races-constructor-standings.json'),
          fetch('/data/f1db-drivers.json'),
          fetch('/data/f1db-constructors.json')
        ]);

        const races = await racesRes.json();
        const circuits = await circuitsRes.json();
        const results = await resultsRes.json();
        const coStandings = await coStRes.json();
        const driversData = await drRes.json();
        const constructorsData = await coRes.json();

        const race = races.find(r => r.id === parseInt(id));
        if (race) {
          setRaceInfo(race);
          setCircuitInfo(circuits.find(c => c.id === race.circuitId));
          const dMap = {}; driversData.forEach(d => dMap[d.id] = d);
          const cMap = {}; constructorsData.forEach(c => cMap[c.id] = c);
          setDrivers(dMap); setConstructors(cMap);
          setRaceResults(results.filter(r => r.raceId === race.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
          setConstructorStandings(coStandings.filter(s => s.raceId === race.id).sort((a, b) => a.positionDisplayOrder - b.positionDisplayOrder));
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase">Loading...</div>;
  if (!raceInfo) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold uppercase tracking-widest">Race Not Found</div>;

  const visibleResults = showFullDrivers ? raceResults : raceResults.slice(0, 10);
  const flagCode = getFlagCodeFromCircuit(circuitInfo?.name);
  
  let mapUrl = '';
  if (circuitInfo?.latitude && circuitInfo?.longitude) {
    const bbox = calculateBoundingBox(parseFloat(circuitInfo.latitude), parseFloat(circuitInfo.longitude));
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon}%2C${bbox.minLat}%2C${bbox.maxLon}%2C${bbox.maxLat}&layer=mapnik&marker=${circuitInfo.latitude}%2C${circuitInfo.longitude}`;
  }

  const isFerrari = (constructorId) => constructors[constructorId]?.name?.toLowerCase().includes('ferrari') || false;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation activeSection="calendar" />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/standings" className="text-zinc-500 font-bold uppercase text-[10px] mb-8 inline-block hover:text-red-600 transition-colors tracking-widest">
          ← Back to Standings
        </Link>
        
        <header className="mb-12">
          <div className="text-red-600 font-black uppercase text-xs mb-2 tracking-[0.2em]">
            Round {raceInfo.round} • {raceInfo.year}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="md:col-span-2 bg-zinc-900/50 border-l-4 border-red-600 p-6 flex flex-col justify-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 tracking-widest">Circuit</p>
              <p className="text-3xl font-black uppercase italic leading-none mb-2">{circuitInfo?.name}</p>
              <p className="text-sm text-zinc-400 font-bold uppercase">{circuitInfo?.placeName}, {circuitInfo?.countryId}</p>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex items-center justify-center rounded-sm">
              {flagCode && <img src={`https://flagcdn.com/h80/${flagCode}.png`} className="h-14 w-auto shadow-2xl rounded-sm object-contain" alt="flag" />}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 aspect-square overflow-hidden rounded-sm relative group">
              {mapUrl ? (
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={mapUrl} className="grayscale invert opacity-50 group-hover:opacity-100 transition-opacity duration-500"></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest">Map N/A</div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <section className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Race Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-950 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">
                    <th className="p-4 w-12 text-center">Pos</th>
                    <th className="p-4">Driver</th>
                    <th className="p-4">Team</th>
                    <th className="p-4 text-right">Time/Retired</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleResults.map((s, i) => {
                    const constructor = constructors[s.constructorId];
                    const isFerrariItem = isFerrari(s.constructorId);
                    const driver = drivers[s.driverId];
                    return (
                      <tr key={i} className={`${getPositionBackground(s.positionText)} transition-all duration-300 border-b border-zinc-800/30 group`}>
                        <td className={`p-4 text-center font-black italic ${getPositionTextColor(s.positionText)}`}>{s.positionText}</td>
                        <td className="p-4">
                          <div className={`font-bold uppercase tracking-tight ${isFerrariItem ? 'text-[#ff2800]' : 'text-white'}`}>
                            <span className="opacity-40 font-medium mr-1 hidden sm:inline">{driver?.firstName}</span>
                            <span>{driver?.lastName}</span>
                          </div>
                        </td>
                        <td className={`p-4 text-xs font-bold uppercase ${isFerrariItem ? 'text-[#ff2800]' : 'text-zinc-400'}`}>
                          {constructor?.name}
                        </td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-300 whitespace-nowrap">
                          {s.positionText === "1" ? (s.time || "Winner") : (s.gap || s.reasonRetired || s.status || "Finished")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {raceResults.length > 10 && (
              <button onClick={() => setShowFullDrivers(!showFullDrivers)} className="w-full py-4 bg-zinc-800/30 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all text-zinc-500">
                {showFullDrivers ? "↑ Show Top 10" : `↓ Show All ${raceResults.length} Results`}
              </button>
            )}
          </section>

          <section className="bg-zinc-900/40 border border-zinc-800 rounded-sm h-fit shadow-xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
              <h2 className="font-black uppercase text-xs text-red-600 tracking-widest">Constructor Standings</h2>
            </div>
            <table className="w-full text-left text-sm border-collapse">
              <tbody>
                {constructorStandings.map((s, i) => {
                  const isFerrariConstructor = isFerrari(s.constructorId);
                  return (
                    <tr key={i} className={`${getPositionBackground(s.positionText)} hover:bg-white/5 transition-all duration-300 border-b border-zinc-800/20`}>
                      <td className={`p-4 w-12 text-center font-black italic ${getPositionTextColor(s.positionText)}`}>{s.positionText}</td>
                      <td className={`p-4 font-bold uppercase text-xs tracking-tight ${isFerrariConstructor ? 'text-[#ff2800]' : 'text-white'}`}>
                        {constructors[s.constructorId]?.name}
                      </td>
                      <td className="p-4 text-right font-black text-white px-6">{s.points}</td>
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
