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

// --- COMPONENTI GRAFICI ---

const CustomYAxisTick = ({ x, y, payload }) => {
  const driverSlug = normalizeDriverName(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <defs>
        <clipPath id={`clip-${driverSlug}`}>
          <rect x="-110" y="-30" width="50" height="50" rx="12" />
        </clipPath>
      </defs>
      <image
        x="-110" y="-30" width="50" height="50"
        href={`/data/ferrari-drivers/${driverSlug}.jpg`}
        clipPath={`url(#clip-${driverSlug})`}
        preserveAspectRatio="xMidYMid slice"
        onError={(e) => { e.target.href = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }}
      />
      <text x="-85" y="40" textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="900" className="uppercase italic">
        {payload.value.split(' ').pop()}
      </text>
    </g>
  );
};

function TrophySVG({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M3 2h10v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2zm3 10h4v1H6v-1zm1-4v4m2-4v4M2 3h1v2H2V3zm12 0h-1v2h1V3z" />
    </svg>
  );
}

// --- MAIN PAGE ---
export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [pilotWins, setPilotWins] = useState([]);
  const [history, setHistory] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [circuits, setCircuits] = useState([]);
  
  // Stato per le tendine
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

        // 1. Process Winners Table
        const winnersAgg = ferrariWins.reduce((acc, curr) => {
          const d = driverMap[curr.driverId];
          const name = d ? `${d.firstName} ${d.lastName}` : curr.driverId;
          if (!acc[name]) acc[name] = { name, id: curr.driverId, count: 0, years: new Set() };
          acc[name].count += 1;
          acc[name].years.add(curr.year);
          return acc;
        }, {});

        setPilotWins(Object.values(winnersAgg).sort((a,b) => b.count - a.count).slice(0, 10));

        // 2. Process Nationalities
        const natAgg = ferrariWins.reduce((acc, curr) => {
          const nat = driverMap[curr.driverId]?.nationality || 'Altro';
          acc[nat] = (acc[nat] || 0) + 1;
          return acc;
        }, {});
        setNationalities(Object.entries(natAgg).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value));

        // 3. Process Circuits
        const raceMap = {}; racesData.forEach(r => raceMap[r.id] = r.grandPrixId);
        const circAgg = ferrariWins.reduce((acc, curr) => {
          const cId = raceMap[curr.raceId] || "Unknown";
          acc[cId] = (acc[cId] || 0) + 1;
          return acc;
        }, {});
        setCircuits(Object.entries(circAgg).map(([name, wins]) => ({ name, wins })).sort((a,b) => b.wins - a.wins).slice(0, 8));

        setHistory(historical.filter(h => h.points !== null));

      } catch (err) { console.error(err); }
      setLoading(false);
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
          <span className="text-[10px] font-black uppercase tracking-widest italic">Maranello HQ</span>
        </Link>

        <header className="mb-24 relative px-6">
          <div className="absolute left-0 top-0 w-2 h-full bg-red-600 shadow-[0_0_25px_rgba(220,0,0,0.6)]" />
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4">Intelligence & Performance</h1>
            <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85]">
              Scuderia <br /><span className="text-zinc-800 font-outline-2">Data Vault</span>
            </h2>
          </motion.div>
        </header>

        <div className="flex flex-col gap-6">
          
          {/* --- TENDINA 1: WINNERS CIRCLE --- */}
          <AccordionSection 
            id="winners" 
            title="Winners Circle" 
            subtitle="Analisi vittorie e cronologia per pilota"
            icon={Trophy}
            isOpen={openSection === 'winners'}
            onToggle={() => toggleSection('winners')}
            color="yellow"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  <div className="col-span-1 text-center">Pos</div>
                  <div className="col-span-2 text-center">Driver</div>
                  <div className="col-span-5 pl-4">Trophies</div>
                  <div className="col-span-4 pl-4">Years</div>
                </div>
                <div className="divide-y divide-white/5">
                  {pilotWins.map((driver, index) => (
                    <div key={driver.id} className="grid grid-cols-12 gap-4 p-8 hover:bg-white/5 transition-all items-center">
                      <div className="col-span-1 text-center text-3xl font-black italic text-zinc-800">{index + 1}</div>
                      <div className="col-span-2 flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl">
                          <img src={`/data/ferrari-drivers/${normalizeDriverName(driver.name)}.jpg`} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-black uppercase italic text-[10px] text-zinc-400">{driver.name.split(' ').pop()}</span>
                      </div>
                      <div className="col-span-5 flex flex-col gap-3 pl-4">
                        <div className="flex items-center flex-wrap gap-1.5">
                          {[...Array(driver.wins >= 10 ? 10 : driver.wins)].map((_, i) => <TrophySVG key={i} size={20} color={GOLD} />)}
                          {driver.wins >= 10 && <span className="text-xl font-black italic text-yellow-500 ml-2">x{Math.floor(driver.wins / 10)}</span>}
                        </div>
                        {driver.wins > 10 && driver.wins % 10 > 0 && (
                          <div className="flex items-center flex-wrap gap-1.5 opacity-60">
                            {[...Array(driver.wins % 10)].map((_, i) => <TrophySVG key={i} size={16} color={GOLD} />)}
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 flex flex-wrap gap-1.5 pl-4">
                        {Array.from(driver.yearsList).map(y => (
                          <span key={y} className="px-2 py-1 bg-red-600 rounded text-[9px] font-black text-white shadow-md">{y}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* --- TENDINA 2: PERFORMANCE TIMELINE --- */}
          <AccordionSection 
            id="timeline" 
            title="Performance Timeline" 
            subtitle="Evoluzione punti costruttori"
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
                  <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="points" stroke="#DC0000" strokeWidth={3} fillOpacity={1} fill="url(#ferrariGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AccordionSection>

          {/* --- TENDINA 3: GLOBAL DNA (NAZIONALITA') --- */}
          <AccordionSection 
            id="dna" 
            title="Global DNA" 
            subtitle="Origine dei piloti vincitori"
            icon={Globe2}
            isOpen={openSection === 'dna'}
            onToggle={() => toggleSection('dna')}
            color="red"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 p-8">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={nationalities} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                      {nationalities.map((entry, index) => (
                        <Cell key={index} fill={FERRARI_COLORS[index % FERRARI_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '10px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {nationalities.slice(0, 6).map((n, i) => (
                  <div key={n.name} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: FERRARI_COLORS[i % FERRARI_COLORS.length]}} />
                    <span className="font-black uppercase text-xs italic">{n.name}</span>
                    <span className="ml-auto font-mono text-red-500 font-bold">{n.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* --- TENDINA 4: FORTRESS MARANELLO (CIRCUITI) --- */}
          <AccordionSection 
            id="circuits" 
            title="Fortress Maranello" 
            subtitle="I circuiti con più successi"
            icon={Landmark}
            isOpen={openSection === 'circuits'}
            onToggle={() => toggleSection('circuits')}
            color="yellow"
          >
             <div className="h-[400px] w-full p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={circuits} layout="vertical" margin={{ left: 60 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#888" fontSize={11} width={100} tick={{fontWeight: '900'}} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                    <Bar dataKey="wins" fill={GOLD} radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
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
  const borderColor = isOpen ? 'border-red-600/50' : 'border-white/5';

  return (
    <div className={`transition-all duration-500 border ${borderColor} rounded-[32px] overflow-hidden bg-zinc-900/20 backdrop-blur-xl shadow-2xl`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${iconColor}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic leading-none mb-1">{title}</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className={`w-6 h-6 ${isOpen ? 'text-red-500' : 'text-zinc-700'}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            <div className="p-2 md:p-8 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}