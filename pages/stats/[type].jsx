import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Navigation from '../../components/ferrari/Navigation';
import Footer from '../../components/ferrari/Footer';
import { motion } from 'framer-motion';
import { User } from 'lucide-react'; 

export default function StatDetail() {
  const router = useRouter();
  const { type } = router.query;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    'wins': { 
      title: 'Vittorie GP', 
      description: 'Il numero di volte in cui un pilota ha tagliato il traguardo in prima posizione guidando una monoposto della Scuderia Ferrari.',
      filter: (r) => r.positionNumber === 1, 
      color: 'bg-red-600' 
    },
    'podiums': { 
      title: 'Podi Totali', 
      description: 'Piazzamenti tra i primi tre classificati. È il simbolo della costanza e della presenza fissa al vertice della competizione.',
      filter: (r) => r.positionNumber >= 1 && r.positionNumber <= 3, 
      color: 'bg-yellow-500' 
    },
    'poles': { 
      title: 'Pole Positions', 
      description: 'Partenze dalla prima piazzola della griglia, ottenute facendo registrare il miglior tempo assoluto durante le sessioni di qualifica.',
      filter: (r) => r.gridPositionNumber === 1, 
      color: 'bg-red-700' 
    },
    'fastest-laps': { 
      title: 'Giri Veloci', 
      description: 'Il giro più rapido fatto registrare durante la gara. Dimostra la velocità pura della vettura e il talento del pilota in assetto da corsa.',
      filter: (r) => r.fastestLap === true, 
      color: 'bg-yellow-600' 
    },
    'points': { 
      title: 'Punti Storici', 
      description: 'La somma totale dei punti conquistati dai piloti Ferrari, calcolata sommando i diversi sistemi di punteggio utilizzati dalla F1 dal 1950 a oggi.',
      filter: (r) => r.points > 0, 
      isSum: true, 
      color: 'bg-red-500' 
    },
    'grand-slams': { 
      title: 'Grand Slams', 
      description: 'L\'impresa suprema in un weekend: Pole Position, Vittoria, Giro Veloce e in testa dal primo all\'ultimo giro della gara.',
      filter: (r) => r.grandSlam === true, 
      color: 'bg-yellow-400' 
    },
  };

  useEffect(() => {
    if (!type || !config[type]) return;

    async function processStats() {
      setLoading(true);
      try {
        const [resResults, resDrivers] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json')
        ]);
        
        const results = await resResults.json();
        const drivers = await resDrivers.json();
        
        const driverMap = {};
        drivers.forEach(d => {
          driverMap[d.id] = {
            fullName: `${d.firstName} ${d.lastName}`,
            id: d.id
          };
        });

        const filtered = results.filter(r => r.constructorId === 'ferrari' && config[type].filter(r));

        const aggregation = filtered.reduce((acc, curr) => {
          const driverInfo = driverMap[curr.driverId] || { fullName: curr.driverId, id: curr.driverId };
          const name = driverInfo.fullName;
          
          if (!acc[name]) {
            acc[name] = { 
              name, 
              id: driverInfo.id, 
              count: 0, 
              years: [] 
            };
          }
          
          if (config[type].isSum) {
            acc[name].count += curr.points;
          } else {
            acc[name].count += 1;
          }
          
          if (!acc[name].years.includes(curr.year)) {
            acc[name].years.push(curr.year);
          }
          return acc;
        }, {});

        const finalData = Object.values(aggregation)
          .sort((a, b) => b.count - a.count);

        setData(finalData);
      } catch (error) {
        console.error("Errore:", error);
      }
      setLoading(false);
    }

    processStats();
  }, [type]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black tracking-widest uppercase">Analisi Dati Maranello...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navigation />
      <main className="max-w-6xl mx-auto pt-32 px-4 pb-20">
        
        <header className="mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mb-2">Scuderia Ferrari Hall of Fame</h1>
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
                    {config[type]?.title}
                </h2>
                {/* BREVE DESCRIZIONE AGGIUNTA */}
                <p className="text-zinc-400 text-lg max-w-2xl border-l-2 border-red-600 pl-4 italic">
                  {config[type]?.description}
                </p>
            </motion.div>
        </header>

        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black tracking-widest text-zinc-500">
                <th className="p-8">Pilota</th>
                <th className="p-8">Cronologia Anni</th>
                <th className="p-8 text-right">Totale</th>
              </tr>
            </thead>
            <tbody>
              {data.map((driver, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center">
                        <span className="text-zinc-700 font-mono text-lg mr-6 w-6">{index + 1}</span>
                        
                        {/* IMMAGINE PILOTA */}
                        <div className="relative w-14 h-14 mr-6 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-red-600 transition-colors">
                          <img 
                            src={`/images/drivers/${driver.id}.jpg`} 
                            alt={driver.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Se l'immagine non esiste, nascondi l'immagine e mostra il fallback
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden absolute inset-0 items-center justify-center bg-zinc-800" style={{display: 'none'}}>
                            <User className="text-zinc-600 w-6 h-6" />
                          </div>
                        </div>

                        <div className="font-black uppercase text-xl tracking-tight group-hover:text-red-600 transition-colors">
                            {driver.name}
                        </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-wrap gap-2 max-w-md">
                      {driver.years.sort((a,b) => b-a).map((year, yi) => (
                        <span 
                          key={yi} 
                          className={`px-3 py-1 rounded-md text-[10px] font-black text-black shadow-sm ${config[type].color}`}
                        >
                          {year}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform origin-right">
                        {config[type].isSum ? Math.floor(driver.count).toLocaleString() : driver.count}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}