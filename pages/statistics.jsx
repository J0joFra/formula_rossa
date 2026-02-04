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

// --- CONFIGURAZIONE COLORI E BANDIERE ---
const countryConfig = {
  'germany': { code: 'de', color: '#FFCE00' },
  'italy': { code: 'it', color: '#008C45' },
  'united-kingdom': { code: 'gb', color: '#00247D' },
  'france': { code: 'fr', color: '#0055A4' },
  'brazil': { code: 'br', color: '#26D701' },
  'spain': { code: 'es', color: '#AA151B' },
  'united-states-of-america': { code: 'us', color: '#B22234' },
  'finland': { code: 'fi', color: '#003580' },
  'austria': { code: 'at', color: '#ED2939' },
  'monaco': { code: 'mc', color: '#E20919' },
  'argentina': { code: 'ar', color: '#75AADB' },
  'switzerland': { code: 'ch', color: '#D52B1E' },
  'belgium': { code: 'be', color: '#222222' },
  'south-africa': { code: 'za', color: '#007A4D' },
  'mexico': { code: 'mx', color: '#006847' },
  'canada': { code: 'ca', color: '#FF0000' },
  'japan': { code: 'jp', color: '#BC002D' },
  'netherlands': { code: 'nl', color: '#21468B' },
  'unknown': { code: 'un', color: '#333' }
};

const FERRARI_COLORS = ['#DC0000', '#FF2800', '#8a0000', '#4a0000', '#333333'];
const GOLD = "#FFD700";

// --- HELPERS ---
const normalizeDriverName = (name) => {
  if (!name) return "";
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

// Componente per le bandiere nel grafico dei circuiti
const CircuitTick = ({ x, y, payload }) => {
  const data = payload.value; 
  if (!data || !data.flag) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <image
        x="-140" y="-12" width="24" height="16"
        href={`https://flagcdn.com/w40/${data.flag}.png`}
      />
      <text x="-110" y="2" fill="#999" fontSize={10} fontWeight="900" textAnchor="start" className="uppercase italic">
        {data.name}
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
  const [openSection, setOpenSection] = useState('winners');

  useEffect(() => {
    async function loadData() {
      try {
        const [resultsRes, driversRes, historicalRes, racesRes, circuitsRes] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json'),
          fetch('/data/ferrari_historical.json'),
          fetch('/data/f1db-races.json'),
          fetch('/data/f1db-circuits.json')
        ]);
        
        const results = await resultsRes.json();
        const driversData = await driversRes.json();
        const historical = await historicalRes.json();
        const racesData = await racesRes.json();
        const circuitsDataRaw = await circuitsRes.json();

        const driverMap = {};
        driversData.forEach(d => driverMap[d.id] = d);

        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);

        // 1. Winners logic
        const winnersAgg = ferrariWins.reduce((acc, curr) => {
          const d = driverMap[curr.driverId];
          const name = d ? `${d.firstName} ${d.lastName}` : curr.driverId;
          if (!acc[name]) acc[name] = { name, id: curr.driverId, count: 0, years: new Set() };
          acc[name].count += 1;
          acc[name].years.add(curr.year);
          return acc;
        }, {});
        setPilotWins(Object.values(winnersAgg).map(item => ({...item, yearsArray: Array.from(item.years).sort((a,b) => b-a)}))
          .sort((a,b) => b.count - a.count).slice(0, 10));

        // 2. Nationalities logic
        const ferrariDriverIds = [...new Set(results.filter(r => r.constructorId === 'ferrari').map(r => r.driverId))];
        const natAgg = ferrariDriverIds.reduce((acc, dId) => {
          const natId = driverMap[dId]?.nationalityCountryId || 'unknown';
          acc[natId] = (acc[natId] || 0) + 1;
          return acc;
        }, {});
        setNationalities(Object.entries(natAgg).map(([id, value]) => ({ 
            id, name: id.replace(/-/g, ' ').toUpperCase(), value,
            color: countryConfig[id]?.color || '#555', flag: countryConfig[id]?.code || 'un'
        })).sort((a, b) => b.value - a.value));

        // 3. Circuits logic
        const circDetailsMap = {};
        circuitsDataRaw.forEach(c => circDetailsMap[c.id] = c);
        const raceToCircuit = {};
        racesData.forEach(r => raceToCircuit[r.id] = r.circuitId);

        const circAgg = ferrariWins.reduce((acc, curr) => {
          const cId = raceToCircuit[curr.raceId];
          if (cId) acc[cId] = (acc[cId] || 0) + 1;
          return acc;
        }, {});

        setCircuits(Object.entries(circAgg).map(([id, wins]) => {
            const countryId = circDetailsMap[id]?.countryId || 'unknown';
            return {
                id,
                wins,
                color: countryConfig[countryId]?.color || '#DC0000',
                fullInfo: { name: circDetailsMap[id]?.name || id, flag: countryConfig[countryId]?.code || 'un' }
            };
        }).sort((a,b) => b.wins - a.wins).slice(0, 10));

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
        
        <header className="mb-24 relative px-6 text-center">
            <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.6em] mb-4 italic">Historical Intelligence</h1>
            <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85]">
              Scuderia <br /><span className="text-zinc-800">Data Vault</span>
            </h2>
        </header>

        <div className="flex flex-col gap-8">
          
          {/* WINNERS CIRCLE */}
          <AccordionSection id="winners" title="Winners Circle" subtitle="Classifica vittorie e cronologia per pilota" icon={Trophy} isOpen={openSection === 'winners'} onToggle={() => toggleSection('winners')} color="yellow">
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
                    <div key={driver.id} className="grid grid-cols-12 gap-4 p-8 hover:bg-white/5 transition-all items-center group">
                      <div className="col-span-1 text-center text-3xl font-black italic text-zinc-800">{index + 1}</div>
                      <div className="col-span-2 flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl bg-zinc-800">
                          <img src={`/data/ferrari-drivers/${normalizeDriverName(driver.name)}.jpg`} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://www.formula1.com/etc/designs/f1om/images/driver-listing-face-placeholder.png"; }} />
                        </div>
                        <span className="font-black uppercase italic text-[10px] text-white">{driver.name.split(' ').pop()}</span>
                      </div>
                      <div className="col-span-5 flex flex-col gap-3 pl-4">
                        <div className="flex items-center flex-wrap gap-1.5">
                          {[...Array(driver.count >= 10 ? 10 : driver.count)].map((_, i) => <TrophySVG key={i} size={20} color={GOLD} />)}
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

          {/* GLOBAL DNA */}
          <AccordionSection id="dna" title="Global DNA" subtitle="Provenienza dei piloti Ferrari" icon={Globe2} isOpen={openSection === 'dna'} onToggle={() => toggleSection('dna')} color="red">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 p-4">
                <div className="h-[400px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={nationalities} innerRadius={90} outerRadius={140} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                                {nationalities.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '10px', border: 'none'}} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-4xl font-black italic text-white">{nationalities.reduce((a, b) => a + b.value, 0)}</span>
                        <span className="text-[8px] font-black uppercase text-red-600 tracking-widest">Drivers</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nationalities.slice(0, 12).map((n) => (
                        <div key={n.id} className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl group hover:border-red-600/30 transition-all">
                            <img src={`https://flagcdn.com/w80/${n.flag}.png`} className="w-8 h-5 object-cover rounded-sm shadow-sm border border-white/10" alt={n.name} />
                            <div className="flex flex-col">
                                <span className="font-black uppercase text-[10px] text-zinc-400 group-hover:text-white">{n.name}</span>
                                <span className="font-mono text-xs text-white font-bold">{n.value} Piloti</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </AccordionSection>

          {/* FORTRESS MARANELLO */}
          <AccordionSection id="circuits" title="Fortress Maranello" subtitle="I tracciati con più vittorie" icon={Landmark} isOpen={openSection === 'circuits'} onToggle={() => toggleSection('circuits')} color="yellow">
             <div className="h-[500px] w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={circuits} layout="vertical" margin={{ left: 140, right: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="fullInfo" 
                        type="category" 
                        tick={<CircuitTick />} 
                        width={1}
                        axisLine={false} 
                        interval={0}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                        formatter={(value) => [`${value} Vittorie`, 'Wins']}
                    />
                    <Bar dataKey="wins" radius={[0, 10, 10, 0]} barSize={25}>
                        {circuits.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
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

// --- ACCORDION COMPONENT ---
function AccordionSection({ title, subtitle, icon: Icon, children, isOpen, onToggle, color }) {
  const iconColor = color === 'yellow' ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white';
  return (
    <div className={`transition-all duration-700 border ${isOpen ? 'border-red-600/50' : 'border-white/5'} rounded-[32px] overflow-hidden bg-zinc-900/30 backdrop-blur-xl shadow-2xl`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${iconColor}`}><Icon className="w-7 h-7" /></div>
          <div>
            <h3 className="text-2xl font-black uppercase italic leading-none mb-1 tracking-tight">{title}</h3>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown className="w-6 h-6 text-zinc-700" /></motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: "circOut" }}>
            <div className="p-4 md:p-10 border-t border-white/5 bg-black/20">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}