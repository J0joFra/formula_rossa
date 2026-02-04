import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Trophy, Activity, ChevronLeft, Star, ChevronDown, 
  Globe2, Landmark, Timer, Award 
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

// --- HELPERS ---
const normalizeDriverName = (name) => {
  if (!name) return "";
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

const FERRARI_COLORS = ['#DC0000', '#FF2800', '#8a0000', '#4a0000', '#333333'];
const GOLD = "#FFD700";

function TrophySVG({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M3 2h10v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2zm3 10h4v1H6v-1zm1-4v4m2-4v4M2 3h1v2H2V3zm12 0h-1v2h1V3z" />
    </svg>
  );
}

// Mappa dei colori per le bandiere 
const countryConfig = {
  'germany': { code: 'de', color: '#FFCE00', name: 'GERMANY' },
  'italy': { code: 'it', color: '#008C45', name: 'ITALY' },
  'united-kingdom': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'france': { code: 'fr', color: '#0055A4', name: 'FRANCE' },
  'brazil': { code: 'br', color: '#26D701', name: 'BRAZIL' },
  'spain': { code: 'es', color: '#AA151B', name: 'SPAIN' },
  'spagna': { code: 'es', color: '#AA151B', name: 'SPAIN' }, 
  'united-kingdom': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'united kingdom': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'great-britain': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'great britain': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'england': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'britain': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'uk': { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'united-states-of-america': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'united-states': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'united states of america': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'united states': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'usa': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'america': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'us': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'usa': { code: 'us', color: '#B22234', name: 'UNITED STATES' },
  'finland': { code: 'fi', color: '#003580', name: 'FINLAND' },
  'austria': { code: 'at', color: '#ED2939', name: 'AUSTRIA' },
  'monaco': { code: 'mc', color: '#E20919', name: 'MONACO' },
  'argentina': { code: 'ar', color: '#75AADB', name: 'ARGENTINA' },
  'switzerland': { code: 'ch', color: '#D52B1E', name: 'SWITZERLAND' },
  'belgium': { code: 'be', color: '#F1BF00', name: 'BELGIUM' },
  'south-africa': { code: 'za', color: '#007A4D', name: 'SOUTH AFRICA' },
  'mexico': { code: 'mx', color: '#006847', name: 'MEXICO' },
  'netherlands': { code: 'nl', color: '#21468B', name: 'NETHERLANDS' },
  'hungary': { code: 'hu', color: '#436F4D', name: 'HUNGARY' },
  'portugal': { code: 'pt', color: '#006600', name: 'PORTUGAL' },
  'turkey': { code: 'tr', color: '#E30A17', name: 'TURKEY' },
  'japan': { code: 'jp', color: '#BC002D', name: 'JAPAN' },
  'australia': { code: 'au', color: '#00008B', name: 'AUSTRALIA' },
  'canada': { code: 'ca', color: '#D80621', name: 'CANADA' },
  'china': { code: 'cn', color: '#DE2910', name: 'CHINA' },
  'bahrain': { code: 'bh', color: '#C8102E', name: 'BAHRAIN' },
  'saudi-arabia': { code: 'sa', color: '#006C35', name: 'SAUDI ARABIA' },
  'azerbaijan': { code: 'az', color: '#00B5E2', name: 'AZERBAIJAN' },
  'singapore': { code: 'sg', color: '#ED2939', name: 'SINGAPORE' },
  'qatar': { code: 'qa', color: '#8D1B3D', name: 'QATAR' },
  'abu-dhabi': { code: 'ae', color: '#00732F', name: 'UNITED ARAB EMIRATES' },
  'united-arab-emirates': { code: 'ae', color: '#00732F', name: 'UNITED ARAB EMIRATES' },
  'malaysia': { code: 'my', color: '#006233', name: 'MALAYSIA' },
  'korea': { code: 'kr', color: '#CD2E3A', name: 'KOREA' },
  'india': { code: 'in', color: '#FF9933', name: 'INDIA' },
  'russia': { code: 'ru', color: '#D52B1E', name: 'RUSSIA' },
  'morocco': { code: 'ma', color: '#C1272D', name: 'MOROCCO' },
  'unknown': { code: 'un', color: '#333333', name: 'UNKNOWN' }
};

// Mappatura circuiti - AGGIORNATA
const circuitToCountry = {
  // Italia
  'monza': 'italy', 
  'autodromo-nazionale-di-monza': 'italy', 
  'milan': 'italy', 
  'imola': 'italy', 
  'enzo-e-dino-ferrari': 'italy',
  'mugello': 'italy', 
  'bologna': 'italy', 
  'pescara': 'italy',
  
  // Gran Bretagna/UK
  'silverstone': 'united-kingdom', 
  'silverstone-circuit': 'united-kingdom',
  'northamptonshire': 'united-kingdom', 
  'brands-hatch': 'united-kingdom', 
  'kent': 'united-kingdom', 
  'donington': 'united-kingdom', 
  'aintree': 'united-kingdom',
  'liverpool': 'united-kingdom',
  'british-grand-prix': 'united-kingdom',
  
  // Belgio
  'spa': 'belgium', 
  'spa-francorchamps': 'belgium', 
  'stavelot': 'belgium', 
  'zolder': 'belgium',
  'heusden-zolder': 'belgium', 
  'nivelles': 'belgium', 
  'brussels': 'belgium',
  
  // Spagna - AGGIORNATO
  'catalunya': 'spain', 
  'barcelona': 'spain', 
  'montmelo': 'spain', 
  'jerez': 'spain', 
  'valencia': 'spain',
  'valencia-street-circuit': 'spain', 
  'pedralbes': 'spain', 
  'montjuic': 'spain', 
  'madrid': 'spain', 
  'jarama': 'spain',
  'circuit-de-barcelona-catalunya': 'spain',
  'spanish-grand-prix': 'spain',
  
  // Ungheria
  'hungaroring': 'hungary', 
  'budapest': 'hungary', 
  'mogyorod': 'hungary',
  
  // Austria
  'red-bull-ring': 'austria', 
  'spielberg': 'austria',
  'zeltweg': 'austria', 
  'oesterreichring': 'austria', 
  'styria': 'austria',
  
  // Francia
  'magny-cours': 'france', 
  'nevers': 'france',
  'paul-ricard': 'france', 
  'le-castellet': 'france', 
  'ricard': 'france', 
  'reims': 'france', 
  'dijon': 'france',
  'dijon-prenois': 'france', 
  'rouen': 'france', 
  'essarts': 'france', 
  'charade': 'france', 
  'clermont-ferrand': 'france',
  'lemans': 'france',
  
  // Germania
  'nurburgring': 'germany', 
  'nurburg': 'germany', 
  'hockenheimring': 'germany', 
  'hockenheim': 'germany',
  'avus': 'germany', 
  'berlin': 'germany',
  
  // Portogallo
  'estoril': 'portugal', 
  'cascais': 'portugal', 
  'portimao': 'portugal',
  'algarve': 'portugal', 
  'boavista': 'portugal', 
  'oporto': 'portugal', 
  'monsanto': 'portugal', 
  'lisbon': 'portugal',
  
  // Svizzera
  'bremgarten': 'switzerland', 
  'bern': 'switzerland',
  
  // Svezia
  'anderstorp': 'sweden', 
  'scandinavian-raceway': 'sweden',
  
  // Monaco
  'monaco': 'monaco',
  'monte-carlo': 'monaco', 
  'circuit-de-monaco': 'monaco',
  
  // Azerbaijan
  'baku': 'azerbaijan', 
  'azerbaijan': 'azerbaijan',
  
  // USA
  'americas': 'united-states', 
  'cota': 'united-states', 
  'austin': 'united-states', 
  'circuit-of-the-americas': 'united-states', 
  'miami': 'united-states',
  'miami-international-autodrome': 'united-states', 
  'vegas': 'united-states', 
  'las-vegas': 'united-states', 
  'las-vegas-strip': 'united-states', 
  'caesars-palace': 'united-states',
  'indianapolis': 'united-states', 
  'indianapolis-motor-speedway': 'united-states', 
  'watkins-glen': 'united-states', 
  'long-beach': 'united-states', 
  'phoenix': 'united-states',
  'detroit': 'united-states', 
  'dallas': 'united-states', 
  'sebring': 'united-states', 
  'riverside': 'united-states',
  
  // Canada
  'villeneuve': 'canada',
  'montreal': 'canada', 
  'circuit-gilles-villeneuve': 'canada', 
  'mosport': 'canada', 
  'bowmanville': 'canada', 
  'tremblant': 'canada',
  'st-jovite': 'canada',
  
  // Brasile
  'interlagos': 'brazil', 
  'sao-paulo': 'brazil', 
  'são-paulo': 'brazil', 
  'jose-carlos-pace': 'brazil',
  'jacarepagua': 'brazil', 
  'rio-de-janeiro': 'brazil',
  
  // Messico
  'rodriguez': 'mexico', 
  'hermanos-rodriguez': 'mexico', 
  'mexico-city': 'mexico',
  
  // Argentina
  'galvez': 'argentina', 
  'buenos-aires': 'argentina', 
  'oscar-galvez': 'argentina',
  'juan-y-oscar-galvez': 'argentina', 
  'juan-y-ignacio-cobos': 'argentina',
  
  // Giappone
  'suzuka': 'japan', 
  'suzuka-circuit': 'japan', 
  'mie': 'japan', 
  'fuji': 'japan', 
  'fuji-speedway': 'japan',
  'oyama': 'japan', 
  'okayama': 'japan', 
  'ti-circuit': 'japan',
  
  // Cina
  'shanghai': 'china', 
  'shanghai-international-circuit': 'china',
  
  // Singapore
  'marina-bay': 'singapore', 
  'singapore': 'singapore',
  
  // Malesia
  'sepang': 'malaysia', 
  'kuala-lumpur': 'malaysia',
  
  // Corea
  'yeongam': 'korea', 
  'korea-international-circuit': 'korea',
  
  // India
  'buddh': 'india', 
  'greater-noida': 'india',
  
  // Bahrain
  'bahrain': 'bahrain', 
  'sakhir': 'bahrain',
  'manama': 'bahrain', 
  'bahrain-international-circuit': 'bahrain',
  
  // Qatar
  'losail': 'qatar', 
  'lusail': 'qatar', 
  'lusail-international-circuit': 'qatar',
  
  // Arabia Saudita
  'jeddah': 'saudi-arabia', 
  'jeddah-corniche-circuit': 'saudi-arabia',
  
  // Emirati Arabi
  'yas-marina': 'united-arab-emirates', 
  'abu-dhabi': 'united-arab-emirates', 
  'yas-marina-circuit': 'united-arab-emirates',
  
  // Turchia
  'istanbul': 'turkey', 
  'istanbul-park': 'turkey',
  
  // Russia
  'sochi': 'russia', 
  'sochi-autodrom': 'russia',
  
  // Sudafrica
  'kyalami': 'south-africa',
  'midrand': 'south-africa', 
  'george': 'south-africa', 
  'prince-george': 'south-africa',
  
  // Australia
  'adelaide': 'australia', 
  'albert-park': 'australia',
  'melbourne': 'australia',
  
  // Marocco
  'ain-diab': 'morocco', 
  'casablanca': 'morocco',
  
  // Paesi Bassi
  'zandvoort': 'netherlands', 
  'circuit-zandvoort': 'netherlands',
};

// Funzione per ottenere il codice bandiera da un circuito
const getFlagCodeFromCircuit = (circuitName) => {
  if (!circuitName) return '';
  const normalized = circuitName.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Cerca nella mappatura diretta
  if (circuitToCountry[normalized]) {
    const country = circuitToCountry[normalized];
    return countryConfig[country]?.code || '';
  }

  const lowerName = circuitName.toLowerCase();
  
  // Logica di fallback migliorata
  if (lowerName.includes('barcelona') || lowerName.includes('catalunya') || lowerName.includes('montmelo') || lowerName.includes('jerez') || lowerName.includes('valencia') || lowerName.includes('jarama') || lowerName.includes('spanish') || lowerName.includes('spain') || lowerName.includes('españa')) return 'es';
  if (lowerName.includes('abu dhabi') || lowerName.includes('yas marina') || lowerName.includes('dubai') || lowerName.includes('emirates')) return 'ae';
  if (lowerName.includes('silverstone') || lowerName.includes('brands') || lowerName.includes('donington') || lowerName.includes('aintree') || lowerName.includes('british') || lowerName.includes('england') || lowerName.includes('uk') || lowerName.includes('great britain') || lowerName.includes('great-britain')) return 'gb';
  if (lowerName.includes('monza') || lowerName.includes('imola') || lowerName.includes('mugello') || lowerName.includes('pescara') || lowerName.includes('italian') || lowerName.includes('italy') || lowerName.includes('italia')) return 'it';
  if (lowerName.includes('monaco') || lowerName.includes('monte carlo')) return 'mc';
  if (lowerName.includes('spa') || lowerName.includes('francorchamps') || lowerName.includes('zolder') || lowerName.includes('nivelles') || lowerName.includes('belgian') || lowerName.includes('belgium')) return 'be';
  if (lowerName.includes('nürburgring') || lowerName.includes('nurburgring') || lowerName.includes('hockenheim') || lowerName.includes('avus') || lowerName.includes('german') || lowerName.includes('germany') || lowerName.includes('deutschland')) return 'de';
  if (lowerName.includes('montreal') || lowerName.includes('villeneuve') || lowerName.includes('bowmanville') || lowerName.includes('canadian') || lowerName.includes('canada')) return 'ca';
  if (lowerName.includes('melbourne') || lowerName.includes('adelaide') || lowerName.includes('albert park') || lowerName.includes('australian') || lowerName.includes('australia')) return 'au';
  if (lowerName.includes('interlagos') || lowerName.includes('jacarepagua') || lowerName.includes('galvez') || lowerName.includes('brazilian') || lowerName.includes('brazil') || lowerName.includes('são paulo') || lowerName.includes('sao paulo') || lowerName.includes('brasil')) return 'br';
  if (lowerName.includes('mexico') || lowerName.includes('rodriguez') || lowerName.includes('mexican') || lowerName.includes('méxico')) return 'mx';
  if (lowerName.includes('shanghai') || lowerName.includes('chinese') || lowerName.includes('china')) return 'cn';
  if (lowerName.includes('suzuka') || lowerName.includes('fuji') || lowerName.includes('okayama') || lowerName.includes('japanese') || lowerName.includes('japan') || lowerName.includes('nippon')) return 'jp';
  if (lowerName.includes('bahrain') || lowerName.includes('sakhir')) return 'bh';
  if (lowerName.includes('jeddah') || lowerName.includes('saudi') || lowerName.includes('ksa')) return 'sa';
  if (lowerName.includes('miami') || lowerName.includes('austin') || lowerName.includes('americas') || lowerName.includes('cota') || lowerName.includes('indianapolis') || lowerName.includes('sebring') || lowerName.includes('riverside') || lowerName.includes('watkins glen') || lowerName.includes('long beach') || lowerName.includes('phoenix') || lowerName.includes('detroit') || lowerName.includes('dallas') || lowerName.includes('caesars palace') || lowerName.includes('monterey') || lowerName.includes('laguna seca') || lowerName.includes('las vegas') || lowerName.includes('vegas') || lowerName.includes('united states') || lowerName.includes('usa') || lowerName.includes('us') 
    || lowerName.includes('u.s.') || lowerName.includes('united states of america') || lowerName.includes('united-states')) return 'us';
  if (lowerName.includes('red bull ring') || lowerName.includes('spielberg') || lowerName.includes('zeltweg') || lowerName.includes('österreichring') || lowerName.includes('austrian') || lowerName.includes('austria') || lowerName.includes('österreich')) return 'at';
  if (lowerName.includes('hungaroring') || lowerName.includes('hungarian') || lowerName.includes('hungary') || lowerName.includes('magyarország')) return 'hu';
  if (lowerName.includes('zandvoort') || lowerName.includes('dutch') || lowerName.includes('netherlands') || lowerName.includes('holland') || lowerName.includes('nederland')) return 'nl';
  if (lowerName.includes('baku') || lowerName.includes('azerbaijan')) return 'az';
  if (lowerName.includes('marina bay') || lowerName.includes('singapore')) return 'sg';
  if (lowerName.includes('losail') || lowerName.includes('lusail') || lowerName.includes('qatar')) return 'qa';
  if (lowerName.includes('le castellet') || lowerName.includes('paul ricard') || lowerName.includes('ricard') || lowerName.includes('rouen') || lowerName.includes('essarts') || lowerName.includes('reims') || lowerName.includes('charade') || lowerName.includes('dijon') || lowerName.includes('magny-cours') || lowerName.includes('lemans') || lowerName.includes('louvre') || lowerName.includes('french') || lowerName.includes('france') || lowerName.includes('france')) return 'fr';
  if (lowerName.includes('bremgarten') || lowerName.includes('swiss') || lowerName.includes('switzerland') || lowerName.includes('suisse') || lowerName.includes('schweiz')) return 'ch';
  if (lowerName.includes('boavista') || lowerName.includes('monsanto') || lowerName.includes('estoril') || lowerName.includes('portimao') || lowerName.includes('portuguese') || lowerName.includes('portugal') || lowerName.includes('portugal')) return 'pt';
  if (lowerName.includes('ain-diab') || lowerName.includes('ain diab') || lowerName.includes('moroccan') || lowerName.includes('morocco') || lowerName.includes('maroc')) return 'ma';  
  if (lowerName.includes('george') || lowerName.includes('kyalami') || lowerName.includes('south african') || lowerName.includes('south africa') || lowerName.includes('zuid-afrika')) return 'za';
  if (lowerName.includes('sepang') || lowerName.includes('malaysian') || lowerName.includes('malaysia')) return 'my';
  if (lowerName.includes('buddh') || lowerName.includes('indian') || lowerName.includes('india') || lowerName.includes('bharat')) return 'in';
  if (lowerName.includes('yeongam') || lowerName.includes('korean') || lowerName.includes('korea') || lowerName.includes('south korea')) return 'kr';
  if (lowerName.includes('istanbul') || lowerName.includes('turkish') || lowerName.includes('turkey') || lowerName.includes('türkiye')) return 'tr';
  if (lowerName.includes('sochi') || lowerName.includes('russian') || lowerName.includes('russia') || lowerName.includes('россия')) return 'ru'; 
  
  return '';
};

// Funzione per ottenere il colore dalla bandiera
const getCountryColor = (circuitName) => {
  if (!circuitName) return '#DC0000';
  
  const flagCode = getFlagCodeFromCircuit(circuitName);
  if (!flagCode) return '#DC0000';
  
  // Trova il colore dalla configurazione
  const countryEntry = Object.entries(countryConfig).find(([key, value]) => value.code === flagCode);
  if (countryEntry) {
    return countryEntry[1].color;
  }
  
  return '#DC0000';
};

// Funzione per ottenere il nome del paese dal codice bandiera
const getCountryNameFromFlagCode = (flagCode) => {
  if (!flagCode) return '';
  const countryEntry = Object.entries(countryConfig).find(([key, value]) => value.code === flagCode);
  return countryEntry ? countryEntry[1].name : flagCode.toUpperCase();
};

// --- MAIN PAGE ---
export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [pilotWins, setPilotWins] = useState([]);
  const [history, setHistory] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [openSection, setOpenSection] = useState('winners');

  useEffect(() => {
    async function loadData() {
      try {
        const [resultsRes, driversRes, historicalRes, racesRes] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json'),
          fetch('/data/ferrari_historical.json'),
          fetch('/data/f1db-races.json')
        ]);
        
        const results = await resultsRes.json();
        const driversData = await driversRes.json();
        const historical = await historicalRes.json();
        const racesData = await racesRes.json();

        const driverMap = {};
        driversData.forEach(d => driverMap[d.id] = d);

        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);

        // 1. Process Winners
        const winnersAgg = ferrariWins.reduce((acc, curr) => {
          const d = driverMap[curr.driverId];
          const name = d ? `${d.firstName} ${d.lastName}` : curr.driverId;
          if (!acc[name]) acc[name] = { name, id: curr.driverId, count: 0, years: new Set() };
          acc[name].count += 1;
          acc[name].years.add(curr.year);
          return acc;
        }, {});

        setPilotWins(Object.values(winnersAgg)
          .map(item => ({
            ...item,
            yearsArray: Array.from(item.years).sort((a,b) => b-a)
          }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 10)
        );

        // 2. Process Nationalities - CORRETTO
        const ferrariDriverIds = [...new Set(results.filter(r => r.constructorId === 'ferrari').map(r => r.driverId))];

        const natAgg = ferrariDriverIds.reduce((acc, dId) => {
          const driver = driverMap[dId];
          const natId = driver?.nationalityCountryId || 'unknown';
          // Normalizza il nome della nazione
          const normalizedNatId = natId.toLowerCase().trim();
          acc[normalizedNatId] = (acc[normalizedNatId] || 0) + 1;
          return acc;
        }, {});

        const nationalityData = Object.entries(natAgg)
          .map(([id, value]) => {
            const normalizedId = id.toLowerCase();
            const config = countryConfig[normalizedId] || countryConfig['unknown'];
            return {
              id: normalizedId,
              name: config.name || normalizedId.replace(/-/g, ' ').toUpperCase(),
              value,
              color: config.color,
              flag: config.code
            };
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        setNationalities(nationalityData);

        // 3. Process Circuits con bandiere
        const raceMap = {};
        racesData.forEach(r => {
          raceMap[r.id] = {
            grandPrixId: r.grandPrixId,
            circuitName: r.circuitName || r.grandPrixName
          };
        });

        const circAgg = ferrariWins.reduce((acc, curr) => {
          const circuitData = raceMap[curr.raceId];
          if (!circuitData) return acc;
          
          const cId = circuitData.grandPrixId || "Unknown";
          const circuitName = circuitData.circuitName || cId;
          const flagCode = getFlagCodeFromCircuit(circuitName);
          const countryName = getCountryNameFromFlagCode(flagCode);
          
          if (!acc[cId]) {
            acc[cId] = {
              name: countryName || cId.replace(/-/g, ' ').toUpperCase(),
              originalName: circuitName,
              wins: 0,
              flag: flagCode,
              countryName: countryName
            };
          }
          acc[cId].wins += 1;
          return acc;
        }, {});

        const sortedCircuits = Object.values(circAgg).sort((a, b) => b.wins - a.wins).slice(0, 10);
        setCircuits(sortedCircuits);

        setHistory(historical.filter(h => h.points !== null));

      } catch (err) { 
        console.error('Error loading data:', err); 
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase italic animate-pulse">Accessing Ferrari Mainframe...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <Link href="/" className="group inline-flex items-center gap-2 text-zinc-600 hover:text-red-500 transition-all mb-12">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic font-mono">Back to HQ</span>
        </Link>

        <header className="mb-24 relative px-6">
          <div className="absolute left-0 top-0 w-2 h-full bg-red-600 shadow-[0_0_25px_rgba(220,0,0,0.6)]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4">Intelligence & Performance</h1>
            <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85]">
              Scuderia <br /><span className="text-zinc-800">Data Vault</span>
            </h2>
          </motion.div>
        </header>

        <div className="flex flex-col gap-8">
          
          {/* --- SEZIONE 1: WINNERS CIRCLE --- */}
          <AccordionSection 
            id="winners" 
            title="Winners Circle" 
            subtitle="Classifica vittorie e cronologia per pilota"
            icon={Trophy}
            isOpen={openSection === 'winners'}
            onToggle={() => toggleSection('winners')}
            color="yellow"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  <div className="col-span-1 text-center italic">Pos</div>
                  <div className="col-span-2 text-center">Driver</div>
                  <div className="col-span-5 pl-4">Trophies</div>
                  <div className="col-span-4 pl-4">Years</div>
                </div>
                <div className="divide-y divide-white/5">
                  {pilotWins.map((driver, index) => (
                    <div key={driver.id} className="grid grid-cols-12 gap-4 p-8 hover:bg-white/5 transition-all items-center">
                      <div className="col-span-1 text-center text-3xl font-black italic text-zinc-800">{index + 1}</div>
                      <div className="col-span-2 flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl bg-zinc-800">
                          <img 
                            src={`/data/ferrari-drivers/${normalizeDriverName(driver.name)}.jpg`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.src = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }}
                            alt={driver.name}
                          />
                        </div>
                        <span className="font-black uppercase italic text-[10px] text-white">{driver.name.split(' ').pop()}</span>
                      </div>
                      <div className="col-span-5 flex flex-col gap-3 pl-4">
                        <div className="flex items-center flex-wrap gap-1.5">
                          {[...Array(driver.count >= 10 ? 10 : driver.count)].map((_, i) => (
                            <TrophySVG key={i} size={20} color={GOLD} />
                          ))}
                          {driver.count >= 10 && <span className="text-xl font-black italic text-yellow-500 ml-2">x{Math.floor(driver.count / 10)}</span>}
                        </div>
                        {driver.count > 10 && driver.count % 10 > 0 && (
                          <div className="flex items-center flex-wrap gap-1.5 opacity-60">
                            {[...Array(driver.count % 10)].map((_, i) => <TrophySVG key={i} size={16} color={GOLD} />)}
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 flex flex-wrap gap-1.5 pl-4">
                        {driver.yearsArray?.map(y => (
                          <span key={y} className="px-2 py-1 bg-red-600 rounded text-[9px] font-black text-white shadow-md border border-red-500/20">{y}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* --- SEZIONE 2: PERFORMANCE TIMELINE --- */}
          <AccordionSection 
            id="timeline" 
            title="Performance Timeline" 
            subtitle="Evoluzione punti costruttori annuali"
            icon={Activity}
            isOpen={openSection === 'timeline'}
            onToggle={() => toggleSection('timeline')}
            color="red"
          >
            <div className="h-[450px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="ferrariGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC0000" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#DC0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="year" stroke="#444" fontSize={11} tickMargin={15} axisLine={false} />
                  <YAxis stroke="#444" fontSize={11} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#e0e0e0', // GRIGIO CHIARO
                      border: '1px solid #999', 
                      borderRadius: '12px',
                      color: '#000',
                      fontWeight: 'bold'
                    }} 
                    labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    itemStyle={{ color: '#000' }}
                  />
                  <Area type="monotone" dataKey="points" stroke="#DC0000" strokeWidth={3} fillOpacity={1} fill="url(#ferrariGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AccordionSection>

          {/* --- SEZIONE 3: GLOBAL DNA (NAZIONALITA') --- */}
          <AccordionSection 
            id="dna" 
            title="Global DNA" 
            subtitle="Distribuzione geografica dei piloti della Scuderia"
            icon={Globe2}
            isOpen={openSection === 'dna'}
            onToggle={() => toggleSection('dna')}
            color="red"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 p-4">
              {/* Grafico a Torta */}
              <div className="h-[400px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={nationalities} 
                      innerRadius={90} 
                      outerRadius={140} 
                      paddingAngle={3} 
                      dataKey="value" 
                      nameKey="name"
                      stroke="none"
                    >
                      {nationalities.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-100 border border-gray-300 p-4 rounded-xl shadow-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                {payload[0].payload.flag && (
                                  <img 
                                    src={`https://flagcdn.com/w40/${payload[0].payload.flag}.png`} 
                                    className="w-6 h-4 object-cover rounded-sm"
                                    alt="Flag"
                                  />
                                )}
                                <p className="text-[10px] font-black text-gray-800 uppercase">{payload[0].payload.name}</p>
                              </div>
                              <p className="text-2xl font-black text-black italic">{payload[0].value} <span className="text-xs uppercase text-gray-600">Drivers</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Contatore Centrale */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black italic tracking-tighter text-white">
                    {nationalities.reduce((a, b) => a + b.value, 0)}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Total Drivers</span>
                </div>
              </div>
              
              {/* Legenda con Bandierine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nationalities.slice(0, 12).map((n) => (
                  <div key={n.id} className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl group hover:border-red-600/30 transition-all">
                    <div className="relative w-8 h-6 overflow-hidden rounded-sm shadow-sm">
                      <img 
                        src={`https://flagcdn.com/w80/${n.flag}.png`} 
                        alt={n.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black uppercase text-[10px] tracking-tight text-zinc-400 group-hover:text-white transition-colors">
                        {n.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-12 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-current" style={{ width: `${(n.value / nationalities[0].value) * 100}%`, color: n.color }} />
                        </div>
                        <span className="font-mono text-xs text-white font-bold">{n.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* --- SEZIONE 4: Fortress Maranello --- */}
          <AccordionSection 
            id="circuits" 
            title="Fortress Maranello" 
            subtitle="I circuiti con il maggior numero di vittorie"
            icon={Landmark}
            isOpen={openSection === 'circuits'}
            onToggle={() => toggleSection('circuits')}
            color="yellow"
          >
            <div className="space-y-8">
              {/* Legenda con bandiere sopra il grafico */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {circuits.map((circuit) => {
                  const flagCode = circuit.flag || getFlagCodeFromCircuit(circuit.originalName);
                  return (
                    <div key={circuit.name} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-lg hover:bg-zinc-900/60 transition-colors">
                      {flagCode && (
                        <img 
                          src={`https://flagcdn.com/w40/${flagCode}.png`} 
                          className="w-6 h-4 object-cover rounded-sm" 
                          alt="Flag"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black uppercase text-white truncate">{circuit.name}</div>
                        <div className="text-[10px] text-zinc-500">{circuit.wins} vittorie</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grafico a barre */}
              <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={circuits} 
                    layout="vertical" 
                    margin={{ left: 20, right: 60, top: 20, bottom: 20 }} 
                  >
                    <XAxis 
                      type="number" 
                      stroke="#666" 
                      fontSize={11}
                      axisLine={false}
                      tick={{fill: '#ccc', fontWeight: '900'}}
                      tickFormatter={(value) => `${value} vittorie`}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#666"
                      fontSize={11}
                      width={180}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#fff', fontWeight: '900' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.12)' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const circuit = payload[0].payload;
                          const circuitName = circuit.originalName || circuit.name;
                          const flagCode = circuit.flag || getFlagCodeFromCircuit(circuitName);
                          const barColor = getCountryColor(circuitName);
                          const countryName = circuit.countryName || getCountryNameFromFlagCode(flagCode);
                          
                          return (
                            <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-2xl min-w-[220px]">
                              <div className="flex items-center gap-3 mb-3">
                                {flagCode && (
                                  <img 
                                    src={`https://flagcdn.com/w80/${flagCode}.png`} 
                                    className="w-8 h-5 object-cover rounded-sm" 
                                    alt="Flag"
                                  />
                                )}
                                <div>
                                  <p className="text-lg font-black text-black italic">{countryName}</p>
                                  <p className="text-xs text-gray-600">{circuitName}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-end border-t border-gray-300 pt-3">
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Vittorie</span>
                                <span className="text-2xl font-black italic" style={{ color: barColor }}>{circuit.wins}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    <Bar dataKey="wins" radius={[0, 10, 10, 0]} barSize={25}>
                      {circuits.map((entry, index) => {
                        const circuitName = entry.originalName || entry.name;
                        const barColor = getCountryColor(circuitName);
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={barColor} 
                            style={{ filter: `drop-shadow(0 0 8px ${barColor}44)` }} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AccordionSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --- HELPER COMPONENT: ACCORDION SECTION ---
function AccordionSection({ id, title, subtitle, icon: Icon, children, isOpen, onToggle, color }) {
  const iconColor = color === 'yellow' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white';
  const borderColor = isOpen ? 'border-red-600/50 shadow-[0_0_40px_rgba(220,0,0,0.1)]' : 'border-white/5';

  return (
    <div className={`transition-all duration-700 border ${borderColor} rounded-[32px] overflow-hidden bg-zinc-900/30 backdrop-blur-xl shadow-2xl`}>
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-6 md:p-8 text-left transition-all duration-500 ${isOpen ? 'bg-white/5' : 'hover:bg-white/5'}`}
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 ${isOpen ? 'scale-110' : ''} ${iconColor}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic leading-none mb-1 tracking-tight">{title}</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown className={`w-6 h-6 ${isOpen ? 'text-red-500' : 'text-zinc-700'}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.04, 0.62, 0.23, 0.98] }}
            id={`section-${id}`}
          >
            <div className="p-4 md:p-10 border-t border-white/5 bg-black/20">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}