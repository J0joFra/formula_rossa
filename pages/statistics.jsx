import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import {
  Trophy, Activity, ChevronLeft, ChevronDown,
  Globe2, Landmark, User
} from 'lucide-react';
import Navigation from '../components/ferrari/Navigation';
import Footer from '../components/ferrari/Footer';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const RED  = '#DC0000';
const GOLD = '#EAB308';

const MEDAL = [
  { color: RED,      label: '1ST' },
  { color: '#EBEBEB', label: '2ND' },
  { color: '#D58936', label: '3RD' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const normalizeDriverName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

const countryConfig = {
  'germany':                  { code: 'de', color: '#FFCE00', name: 'GERMANY' },
  'italy':                    { code: 'it', color: '#008C45', name: 'ITALY' },
  'united-kingdom':           { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'great-britain':            { code: 'gb', color: '#00247D', name: 'GREAT BRITAIN' },
  'france':                   { code: 'fr', color: '#0055A4', name: 'FRANCE' },
  'brazil':                   { code: 'br', color: '#26D701', name: 'BRAZIL' },
  'spain':                    { code: 'es', color: '#AA151B', name: 'SPAIN' },
  'united-states-of-america': { code: 'us', color: '#B22234', name: 'USA' },
  'united-states':            { code: 'us', color: '#B22234', name: 'USA' },
  'finland':                  { code: 'fi', color: '#003580', name: 'FINLAND' },
  'austria':                  { code: 'at', color: '#ED2939', name: 'AUSTRIA' },
  'monaco':                   { code: 'mc', color: '#E20919', name: 'MONACO' },
  'argentina':                { code: 'ar', color: '#75AADB', name: 'ARGENTINA' },
  'switzerland':              { code: 'ch', color: '#D52B1E', name: 'SWITZERLAND' },
  'belgium':                  { code: 'be', color: '#F1BF00', name: 'BELGIUM' },
  'south-africa':             { code: 'za', color: '#007A4D', name: 'SOUTH AFRICA' },
  'mexico':                   { code: 'mx', color: '#006847', name: 'MEXICO' },
  'netherlands':              { code: 'nl', color: '#21468B', name: 'NETHERLANDS' },
  'hungary':                  { code: 'hu', color: '#436F4D', name: 'HUNGARY' },
  'portugal':                 { code: 'pt', color: '#006600', name: 'PORTUGAL' },
  'turkey':                   { code: 'tr', color: '#E30A17', name: 'TURKEY' },
  'japan':                    { code: 'jp', color: '#BC002D', name: 'JAPAN' },
  'australia':                { code: 'au', color: '#00008B', name: 'AUSTRALIA' },
  'canada':                   { code: 'ca', color: '#D80621', name: 'CANADA' },
  'china':                    { code: 'cn', color: '#DE2910', name: 'CHINA' },
  'bahrain':                  { code: 'bh', color: '#C8102E', name: 'BAHRAIN' },
  'saudi-arabia':             { code: 'sa', color: '#006C35', name: 'SAUDI ARABIA' },
  'azerbaijan':               { code: 'az', color: '#00B5E2', name: 'AZERBAIJAN' },
  'singapore':                { code: 'sg', color: '#ED2939', name: 'SINGAPORE' },
  'qatar':                    { code: 'qa', color: '#8D1B3D', name: 'QATAR' },
  'abu-dhabi':                { code: 'ae', color: '#00732F', name: 'UAE' },
  'united-arab-emirates':     { code: 'ae', color: '#00732F', name: 'UAE' },
  'malaysia':                 { code: 'my', color: '#006233', name: 'MALAYSIA' },
  'korea':                    { code: 'kr', color: '#CD2E3A', name: 'KOREA' },
  'india':                    { code: 'in', color: '#FF9933', name: 'INDIA' },
  'russia':                   { code: 'ru', color: '#D52B1E', name: 'RUSSIA' },
  'morocco':                  { code: 'ma', color: '#C1272D', name: 'MOROCCO' },
  'unknown':                  { code: 'un', color: '#333333', name: 'UNKNOWN' },
};

const circuitToCountry = {
  'monza': 'it', 'autodromo_nazionale_di_monza': 'it', 'milan': 'it', 'imola': 'it', 'enzo_e_dino_ferrari': 'it',
  'mugello': 'it', 'bologna': 'it', 'pescara': 'it', 'silverstone': 'gb', 'silverstone_circuit': 'gb',
  'northamptonshire': 'gb', 'brands_hatch': 'gb', 'kent': 'gb', 'donington': 'gb', 'aintree': 'gb',
  'liverpool': 'gb', 'spa': 'be', 'spa_francorchamps': 'be', 'stavelot': 'be', 'zolder': 'be',
  'heusden_zolder': 'be', 'nivelles': 'be', 'brussels': 'be', 'zandvoort': 'nl', 'circuit_zandvoort': 'nl',
  'catalunya': 'es', 'barcelona': 'es', 'montmelo': 'es', 'jerez': 'es', 'valencia': 'es',
  'valencia_street_circuit': 'es', 'pedralbes': 'es', 'montjuic': 'es', 'madrid': 'es', 'madring': 'es', 'jarama': 'es',
  'hungaroring': 'hu', 'budapest': 'hu', 'mogyorod': 'hu', 'red_bull_ring': 'at', 'spielberg': 'at',
  'zeltweg': 'at', 'oesterreichring': 'at', 'styria': 'at', 'magny_cours': 'fr', 'nevers': 'fr',
  'paul_ricard': 'fr', 'le_castellet': 'fr', 'ricard': 'fr', 'reims': 'fr', 'dijon': 'fr',
  'dijon_prenois': 'fr', 'rouen': 'fr', 'essarts': 'fr', 'charade': 'fr', 'clermont_ferrand': 'fr',
  'lemans': 'fr', 'nurburgring': 'de', 'nurburg': 'de', 'hockenheimring': 'de', 'hockenheim': 'de',
  'avus': 'de', 'berlin': 'de', 'estoril': 'pt', 'cascais': 'pt', 'portimao': 'pt',
  'algarve': 'pt', 'boavista': 'pt', 'oporto': 'pt', 'monsanto': 'pt', 'lisbon': 'pt',
  'bremgarten': 'ch', 'bern': 'ch', 'anderstorp': 'se', 'scandinavian_raceway': 'se', 'monaco': 'mc',
  'monte_carlo': 'mc', 'circuit_de_monaco': 'mc', 'bakú': 'az', 'baku': 'az', 'azerbaijan': 'az',
  'americas': 'us', 'cota': 'us', 'austin': 'us', 'circuit_of_the_americas': 'us', 'miami': 'us',
  'miami_international_autodrome': 'us', 'vegas': 'us', 'las_vegas': 'us', 'las_vegas_strip': 'us', 'caesars_palace': 'us',
  'indianapolis': 'us', 'indianapolis_motor_speedway': 'us', 'watkins_glen': 'us', 'long_beach': 'us', 'phoenix': 'us',
  'detroit': 'us', 'dallas': 'us', 'sebring': 'us', 'riverside': 'us', 'villeneuve': 'ca',
  'montreal': 'ca', 'circuit_gilles_villeneuve': 'ca', 'mosport': 'ca', 'bowmanville': 'ca', 'tremblant': 'ca',
  'st_jovite': 'ca', 'interlagos': 'br', 'sao_paulo': 'br', 'são_paulo': 'br', 'jose_carlos_pace': 'br',
  'jacarepagua': 'br', 'rio_de_janeiro': 'br', 'rodriguez': 'mx', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'galvez': 'ar', 'buenos_aires': 'ar', 'oscar_galvez': 'ar',
  'juan_y_oscar_galvez': 'ar', 'juan_y_ignacio_cobos': 'ar', 'carlos_pace': 'br', 'juan_y_ignacio_cobos': 'ar',
  'suzuka': 'jp', 'suzuka_circuit': 'jp', 'mie': 'jp', 'fuji': 'jp', 'fuji_speedway': 'jp',
  'oyama': 'jp', 'okayama': 'jp', 'ti_circuit': 'jp', 'shanghai': 'cn', 'shanghai_international_circuit': 'cn',
  'marina_bay': 'sg', 'singapore': 'sg', 'sepang': 'my', 'kuala_lumpur': 'my', 'yeongam': 'kr',
  'korea_international_circuit': 'kr', 'buddh': 'in', 'greater_noida': 'in', 'bahrain': 'bh', 'sakhir': 'bh',
  'manama': 'bh', 'bahrain_international_circuit': 'bh', 'losail': 'qa', 'lusail': 'qa', 'lusail_international_circuit': 'qa',
  'jeddah': 'sa', 'jeddah_corniche_circuit': 'sa', 'yas_marina': 'ae', 'abu_dhabi': 'ae', 'yas_marina_circuit': 'ae',
  'istanbul': 'tr', 'istanbul_park': 'tr', 'sochi': 'ru', 'sochi_autodrom': 'ru', 'kyalami': 'za',
  'midrand': 'za', 'george': 'za', 'prince_george': 'za', 'adelaide': 'au', 'albert_park': 'au',
  'melbourne': 'au', 'ain_diab': 'ma', 'casablanca': 'ma',
  'albert_park': 'au', 'marina_bay': 'sg', 'yas_marina': 'ae', 'paul_ricard': 'fr', 'watkins_glen': 'us',
  'long_beach': 'us', 'las_vegas': 'us', 'jose_carlos_pace': 'br', 'hermanos_rodriguez': 'mx', 'mexico_city': 'mx',
  'red_bull_ring': 'at', 'silverstone_circuit': 'gb', 'spa_francorchamps': 'be', 'circuit_de_monaco': 'mc', 'fuji_speedway': 'jp'
};

const getFlagCode = (circuitName) => {
  if (!circuitName) return '';
  const n = circuitName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
  const country = circuitToCountry[n];
  if (country) return countryConfig[country]?.code || '';
  const l = circuitName.toLowerCase();
  if (l.includes('monza')||l.includes('imola')||l.includes('mugello')||l.includes('italian')) return 'it';
  if (l.includes('silverstone')||l.includes('brands')||l.includes('british')) return 'gb';
  if (l.includes('spa')||l.includes('belgian')) return 'be';
  if (l.includes('barcelona')||l.includes('catalun')||l.includes('spanish')) return 'es';
  if (l.includes('monaco')||l.includes('monte carlo')) return 'mc';
  if (l.includes('nurburgring')||l.includes('hockenheim')||l.includes('german')) return 'de';
  if (l.includes('interlagos')||l.includes('brazilian')||l.includes('sao paulo')) return 'br';
  if (l.includes('suzuka')||l.includes('japanese')) return 'jp';
  if (l.includes('montreal')||l.includes('canadian')) return 'ca';
  if (l.includes('melbourne')||l.includes('australian')||l.includes('albert')) return 'au';
  if (l.includes('miami')||l.includes('austin')||l.includes('americas')||l.includes('las vegas')||l.includes('united states')) return 'us';
  if (l.includes('hungaroring')||l.includes('hungarian')) return 'hu';
  if (l.includes('red bull ring')||l.includes('austrian')||l.includes('spielberg')) return 'at';
  if (l.includes('zandvoort')||l.includes('dutch')) return 'nl';
  if (l.includes('baku')||l.includes('azerbaijan')) return 'az';
  if (l.includes('marina bay')||l.includes('singapore')) return 'sg';
  if (l.includes('bahrain')||l.includes('sakhir')) return 'bh';
  if (l.includes('jeddah')||l.includes('saudi')) return 'sa';
  if (l.includes('yas')||l.includes('abu dhabi')) return 'ae';
  if (l.includes('lusail')||l.includes('qatar')) return 'qa';
  if (l.includes('shanghai')||l.includes('chinese')) return 'cn';
  if (l.includes('paul ricard')||l.includes('magny')||l.includes('french')||l.includes('france')) return 'fr';
  if (l.includes('estoril')||l.includes('portimao')||l.includes('portuguese')) return 'pt';
  if (l.includes('kyalami')||l.includes('south african')) return 'za';
  if (l.includes('ain-diab')||l.includes('moroccan')) return 'ma';
  if (l.includes('istanbul')||l.includes('turkish')) return 'tr';
  if (l.includes('sochi')||l.includes('russian')) return 'ru';
  return '';
};

const getCountryColor = (circuitName) => {
  const code = getFlagCode(circuitName);
  if (!code) return RED;
  return Object.values(countryConfig).find(v => v.code === code)?.color || RED;
};

const getCountryName = (code) => {
  if (!code) return '';
  return Object.values(countryConfig).find(v => v.code === code)?.name || code.toUpperCase();
};

/* ─────────────────────────────────────────────────────────────────────────────
   DARK TOOLTIP
───────────────────────────────────────────────────────────────────────────── */
function DarkTooltip({ active, payload, label, accentColor, extra }) {
  if (!active || !payload?.length) return null;
  const color = accentColor || payload[0]?.color || RED;
  return (
    <div className="rounded-xl px-4 py-3 min-w-[160px]"
      style={{ background: '#0d0d0d', border: `1px solid ${color}40`, boxShadow: `0 16px 48px rgba(0,0,0,0.9), 0 0 20px ${color}15` }}>
      {label && <p className="text-[10px] uppercase tracking-widest text-white-600 font-black mb-2">{label}</p>}
      {extra && <div className="mb-2">{extra}</div>}
      {payload.map((p, i) => (
        <p key={i} className="font-black text-xl" style={{ color }}>
          {typeof p.value === 'number' ? p.value.toLocaleString('it-IT') : p.value}
          {p.name && <span className="text-white-600 text-[10px] ml-2 font-black uppercase">{p.name}</span>}
        </p>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ACCORDION SECTION
───────────────────────────────────────────────────────────────────────────── */
function AccordionSection({ id, title, subtitle, icon: Icon, children, isOpen, onToggle, accent = 'red' }) {
  const color = accent === 'gold' ? GOLD : RED;
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(6,6,6,0.95)',
        border: `1px solid ${isOpen ? color + '35' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isOpen ? `0 0 60px ${color}08` : 'none',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 md:px-8 py-5 md:py-6 text-left group"
        aria-expanded={isOpen}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
            style={{ background: color + '15', border: `1px solid ${color}30` }}>
            <Icon className="w-4.5 h-4.5" style={{ color }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-tight leading-none mb-0.5 transition-colors"
              style={{ color: isOpen ? 'white' : 'rgba(255,255,255,0.7)' }}>
              {title}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] transition-colors"
              style={{ color: isOpen ? color : 'rgba(255,255,255,0.2)' }}>
              {subtitle}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5" style={{ color: isOpen ? color : 'rgba(255,255,255,0.2)' }} aria-hidden="true" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`section-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-4 md:px-8 pb-8 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TROPHY SVG
───────────────────────────────────────────────────────────────────────────── */
function TrophySVG({ size = 16, color = GOLD, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ opacity }} aria-hidden="true">
      <path d="M3 1h10v3a5 5 0 0 1-4 4.9V11h2v2H5v-2h2V8.9A5 5 0 0 1 3 4V1zm1 1v2a4 4 0 0 0 8 0V2H4zM1 2h2v2.5A5.02 5.02 0 0 1 1 3V2zm12 0h2v1a5.02 5.02 0 0 1-2 1.5V2z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   WINNER ROW
───────────────────────────────────────────────────────────────────────────── */
function WinnerRow({ driver, index, max }) {
  const pct    = max > 0 ? (driver.count / max) * 100 : 0;
  const isTop3 = index < 3;
  const accent = isTop3 ? MEDAL[index].color : 'rgba(255,255,255,0.18)';
  const label  = isTop3 ? MEDAL[index].label : null;

  // Trofei: mostra max 10 icone, poi "×N" per i multipli di 10
  const trophyBlocks = Math.min(driver.count, 10);
  const multiplier   = Math.floor(driver.count / 10);
  const remainder    = driver.count % 10;
  const trophyColor  = isTop3 ? accent : GOLD;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045 }}
      className="group relative flex items-start gap-4 md:gap-5 py-5 px-1 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
    >
      {/* Left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: accent }} aria-hidden="true" />

      {/* Rank */}
      <div className="shrink-0 w-9 text-right select-none pt-1">
        {label
          ? <span className="text-[10px] font-black tracking-widest" style={{ color: accent }}>{label}</span>
          : <span className="text-xl font-black tabular-nums" style={{ color: 'rgba(255,255,255,0.08)' }}>{index + 1}</span>
        }
      </div>

      {/* Photo */}
      <div className="relative shrink-0 w-11 h-11 md:w-13 md:h-13 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 mt-0.5"
        style={{ border: `1.5px solid ${isTop3 ? accent : 'rgba(255,255,255,0.07)'}` }}>
        <img
          src={`/data/ferrari-drivers/${normalizeDriverName(driver.name)}.jpg`}
          alt={`Foto di ${driver.name}`}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />
        <div className="absolute inset-0 bg-white-900 items-center justify-center" style={{ display: 'none' }} aria-hidden="true">
          <User className="w-4 h-4 text-white-700" />
        </div>
      </div>

      {/* Name + trophies + bar */}
      <div className="flex-1 min-w-0">
        {/* Name + year range */}
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-sm font-black uppercase tracking-tight truncate transition-colors group-hover:text-red-400"
            style={{ color: isTop3 ? accent : 'white' }}>
            {driver.name}
          </span>
          <span className="text-[10px] font-mono text-white-700 shrink-0">
            {Math.min(...driver.yearsArray)}–{Math.max(...driver.yearsArray)}
          </span>
        </div>

        {/* ── Trophies ── */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap" aria-label={`${driver.count} vittorie`}>
          {multiplier >= 1 ? (
            /* Compressed view for large counts: show 10 trophies + "×N" badge */
            <>
              <div className="flex items-center gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.045 + i * 0.03 + 0.15 }}
                  >
                    <TrophySVG size={15} color={trophyColor} />
                  </motion.div>
                ))}
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.045 + 0.45 }}
                className="text-xs font-black italic"
                style={{ color: trophyColor }}
              >
                ×{multiplier}
              </motion.span>
              {remainder > 0 && (
                <div className="flex items-center gap-0.5 opacity-50">
                  {[...Array(remainder)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      transition={{ delay: index * 0.045 + i * 0.03 + 0.5 }}
                    >
                      <TrophySVG size={12} color={trophyColor} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Direct view for counts ≤ 9 */
            <div className="flex items-center gap-0.5">
              {[...Array(driver.count)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.045 + i * 0.04 + 0.15 }}
                >
                  <TrophySVG size={15} color={trophyColor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-px w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: index * 0.045 + 0.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${accent}, ${accent}60)` }}
          />
        </div>

        {/* Year pills — desktop only, max 10 */}
        <div className="hidden lg:flex flex-wrap gap-1 mt-1.5">
          {driver.yearsArray.slice(0, 10).map((y) => (
            <span key={y} className="text-[9px] px-1.5 py-0.5 rounded font-black"
              style={{ background: isTop3 ? accent + '15' : 'rgba(255,255,255,0.04)', color: isTop3 ? accent : 'rgba(255,255,255,0.25)' }}>
              {y}
            </span>
          ))}
          {driver.yearsArray.length > 10 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-black text-white-800">
              +{driver.yearsArray.length - 10}
            </span>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="shrink-0 text-right min-w-[3rem] pt-0.5">
        <span className="text-2xl md:text-3xl font-black tabular-nums transition-colors"
          style={{ color: isTop3 ? accent : 'rgba(255,255,255,0.55)' }}>
          {driver.count}
        </span>
        <p className="text-[9px] text-white-700 uppercase tracking-widest">vitt.</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function StatisticsPage() {
  const [loading,       setLoading]       = useState(true);
  const [pilotWins,     setPilotWins]     = useState([]);
  const [history,       setHistory]       = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [circuits,      setCircuits]      = useState([]);
  const [openSection,   setOpenSection]   = useState('winners');

  useEffect(() => {
    async function loadData() {
      try {
        const [resultsRes, driversRes, historicalRes, racesRes] = await Promise.all([
          fetch('/data/f1db-races-race-results.json'),
          fetch('/data/f1db-drivers.json'),
          fetch('/data/ferrari_historical.json'),
          fetch('/data/f1db-races.json'),
        ]);
        const results     = await resultsRes.json();
        const driversData = await driversRes.json();
        const historical  = await historicalRes.json();
        const racesData   = await racesRes.json();

        const driverMap = {};
        driversData.forEach(d => { driverMap[d.id] = d; });

        const ferrariWins = results.filter(r => r.constructorId === 'ferrari' && r.positionNumber === 1);

        // Winners
        const wAgg = ferrariWins.reduce((acc, curr) => {
          const d = driverMap[curr.driverId];
          const name = d ? `${d.firstName} ${d.lastName}` : curr.driverId;
          if (!acc[name]) acc[name] = { name, id: curr.driverId, count: 0, years: new Set() };
          acc[name].count++;
          acc[name].years.add(curr.year);
          return acc;
        }, {});
        setPilotWins(
          Object.values(wAgg)
            .map(x => ({ ...x, yearsArray: Array.from(x.years).sort((a,b) => b-a) }))
            .sort((a,b) => b.count - a.count)
            .slice(0, 10)
        );

        // Nationalities
        const ferrariIds = [...new Set(results.filter(r => r.constructorId === 'ferrari').map(r => r.driverId))];
        const nAgg = ferrariIds.reduce((acc, dId) => {
          const nat = (driverMap[dId]?.nationalityCountryId || 'unknown').toLowerCase().trim();
          acc[nat] = (acc[nat] || 0) + 1;
          return acc;
        }, {});
        setNationalities(
          Object.entries(nAgg)
            .map(([id, value]) => {
              const cfg = countryConfig[id] || countryConfig['unknown'];
              return { id, name: cfg.name, value, color: cfg.color, flag: cfg.code };
            })
            .sort((a,b) => b.value - a.value)
            .slice(0, 10)
        );

        // Circuits
        const raceMap = {};
        racesData.forEach(r => { raceMap[r.id] = { grandPrixId: r.grandPrixId, circuitName: r.circuitName || r.grandPrixName }; });
        const cAgg = ferrariWins.reduce((acc, curr) => {
          const rd = raceMap[curr.raceId];
          if (!rd) return acc;
          const cId   = rd.grandPrixId || 'Unknown';
          const cName = rd.circuitName || cId;
          const flag  = getFlagCode(cName);
          if (!acc[cId]) acc[cId] = { name: getCountryName(flag) || cId.replace(/-/g,' ').toUpperCase(), originalName: cName, wins: 0, flag, color: getCountryColor(cName) };
          acc[cId].wins++;
          return acc;
        }, {});
        setCircuits(Object.values(cAgg).sort((a,b) => b.wins - a.wins).slice(0, 10));

        setHistory(historical.filter(h => h.points !== null));
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggle = (id) => setOpenSection(openSection === id ? null : id);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="flex gap-1.5" aria-label="Caricamento dati">
        {[0,1,2,3,4].map(i => (
          <motion.div key={i} className="w-1 rounded-full"
            style={{ background: RED }}
            animate={{ height: ['12px','32px','12px'] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
      <p className="text-white-600 text-[11px] tracking-[0.4em] uppercase font-black">Accessing Ferrari Mainframe</p>
    </div>
  );

  const maxWins = pilotWins[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(to right,#DC0000 1px,transparent 1px),linear-gradient(to bottom,#DC0000 1px,transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full blur-[120px] opacity-[0.06]"
          style={{ background: RED }}
        />
      </div>

      <Navigation />

      <main className="relative z-10 max-w-5xl mx-auto pt-28 md:pt-36 px-4 pb-24">

        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em] text-white-600 hover:text-white transition-colors group">
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            Back to HQ
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-14 pl-6 relative"
        >
          <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${RED}, transparent)` }} aria-hidden="true" />

          <p className="text-[10px] tracking-[0.45em] uppercase font-black mb-3" style={{ color: RED }}>
            Scuderia Ferrari · Intelligence & Performance
          </p>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            Data <span style={{ color: RED }}>Vault</span>
          </h1>
          <p className="text-white-500 text-sm max-w-md leading-relaxed">
            75 anni di telemetria, vittorie e record storici. Ogni numero racconta una leggenda della Rossa.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-white/[0.06]">
            {[
              { label: 'Vittorie totali',  value: pilotWins.reduce((a,d) => a+d.count, 0).toLocaleString('it-IT') },
              { label: 'Piloti vincitori', value: pilotWins.length },
              { label: 'Stagioni',         value: '75+' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] uppercase tracking-widest text-white-600 mb-0.5">{s.label}</p>
                <p className="text-2xl font-black tabular-nums" style={{ color: RED }}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.header>

        {/* Accordion sections */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-3"
        >

          {/* ── 1. WINNERS CIRCLE ── */}
          <AccordionSection id="winners" title="Winners Circle" subtitle="Classifica vittorie per pilota" icon={Trophy} isOpen={openSection==='winners'} onToggle={()=>toggle('winners')} accent="gold">
            {/* Table header */}
            <div className="flex items-center gap-4 md:gap-5 px-1 pt-4 pb-2">
              <div className="w-9 shrink-0" />
              <div className="w-10 md:w-12 shrink-0" />
              <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-white-700">Pilota</div>
              <div className="hidden lg:block flex-1 text-[10px] font-black uppercase tracking-widest text-white-700 text-center">Anni attivi</div>
              <div className="w-14 text-[10px] font-black uppercase tracking-widest text-white-700 text-right shrink-0">Totale</div>
            </div>
            <div>
              {pilotWins.map((driver, i) => (
                <WinnerRow key={driver.id} driver={driver} index={i} max={maxWins} />
              ))}
            </div>
          </AccordionSection>

          {/* ── 2. PERFORMANCE TIMELINE ── */}
          <AccordionSection id="timeline" title="Performance Timeline" subtitle="Evoluzione punti costruttori annuali" icon={Activity} isOpen={openSection==='timeline'} onToggle={()=>toggle('timeline')} accent="red">
            <div className="h-[420px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ferGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={RED} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,0.08)" tick={{ fill: '#555', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} tickMargin={12} />
                  <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fill: '#555', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <DarkTooltip active={active} payload={payload} label={label} accentColor={RED} />
                    )}
                  />
                  <Area type="monotone" dataKey="points" name="Punti" stroke={RED} strokeWidth={2.5} fillOpacity={1} fill="url(#ferGrad)" dot={false} activeDot={{ r: 5, fill: RED, stroke: '#000', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AccordionSection>

          {/* ── 3. GLOBAL DNA ── */}
          <AccordionSection id="dna" title="Global DNA" subtitle="Distribuzione geografica dei piloti" icon={Globe2} isOpen={openSection==='dna'} onToggle={()=>toggle('dna')} accent="red">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6 items-center">

              {/* Donut chart */}
              <div className="relative h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={nationalities} innerRadius={88} outerRadius={130} paddingAngle={2} dataKey="value" stroke="none">
                      {nationalities.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload;
                        return (
                          <DarkTooltip
                            active={active}
                            payload={payload}
                            accentColor={p.color}
                            extra={
                              p.flag
                                ? <div className="flex items-center gap-2">
                                    <img src={`https://flagcdn.com/w40/${p.flag}.png`} className="w-5 h-3.5 object-cover rounded-sm" alt={p.name} />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white-400">{p.name}</span>
                                  </div>
                                : null
                            }
                          />
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black">{nationalities.reduce((a,n) => a+n.value, 0)}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: RED }}>piloti totali</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nationalities.map((n, i) => (
                  <motion.div key={n.id}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-white/[0.04] transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-7 h-4.5 rounded-sm overflow-hidden shrink-0 border border-white/10">
                      <img src={`https://flagcdn.com/w80/${n.flag}.png`} alt={n.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight text-white-500 group-hover:text-white transition-colors truncate">{n.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(n.value / nationalities[0].value) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: n.color }}
                          />
                        </div>
                        <span className="text-xs font-black tabular-nums" style={{ color: 'rgba(255,255,255,0.7)' }}>{n.value}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* ── 4. FORTRESS MARANELLO ── */}
          <AccordionSection id="circuits" title="Fortress Maranello" subtitle="Circuiti con più vittorie Ferrari" icon={Landmark} isOpen={openSection==='circuits'} onToggle={()=>toggle('circuits')} accent="gold">
            <div className="mt-6 space-y-6">

              {/* Circuit chips */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {circuits.map(c => (
                  <div key={c.name} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {c.flag && <img src={`https://flagcdn.com/w40/${c.flag}.png`} className="w-5 h-3.5 object-cover rounded-sm shrink-0" alt={c.name} onError={e => { e.currentTarget.style.display = 'none'; }} />}
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase text-white truncate">{c.name}</p>
                      <p className="text-[9px] text-white-600">{c.wins} vitt.</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="h-[460px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={circuits} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
                    <XAxis type="number" stroke="rgba(255,255,255,0.08)" tick={{ fill: '#555', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={148} stroke="rgba(255,255,255,0.08)" tick={{ fill: '#ccc', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const c = payload[0].payload;
                        return (
                          <DarkTooltip
                            active={active}
                            payload={[{ value: c.wins, name: 'vittorie', color: c.color }]}
                            accentColor={c.color}
                            extra={
                              <div className="flex items-center gap-2 mb-1">
                                {c.flag && <img src={`https://flagcdn.com/w40/${c.flag}.png`} className="w-5 h-3.5 object-cover rounded-sm" alt={c.name} />}
                                <span className="text-[10px] font-black uppercase tracking-wider text-white-400">{c.name}</span>
                              </div>
                            }
                          />
                        );
                      }}
                    />
                    <Bar dataKey="wins" radius={[0, 8, 8, 0]} barSize={20}>
                      {circuits.map((c, i) => (
                        <Cell key={i} fill={c.color} style={{ filter: `drop-shadow(0 0 5px ${c.color}44)` }} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AccordionSection>

        </motion.div>

        <p className="text-center text-white-800 text-[11px] mt-8 tracking-wider">
          Scuderia Ferrari F1 · 1950–{new Date().getFullYear()} · Dati aggiornati
        </p>
      </main>

      <Footer />
    </div>
  );
}