/**
 * lib/f1/circuitFlags.js
 * Mappa nome-del-circuito → nazione, colore e bandiera.
 *
 * Erano 355 righe dentro pages/statistics.jsx, di cui 264 di sole catene
 * `if (nome.includes(...))`: dati travestiti da logica, che rendevano la
 * pagina difficile da leggere. Il comportamento è invariato.
 *
 * Nota: diverso da lib/flags.js, che mappa gli ID di nazione. Qui si parte
 * dal nome del circuito, che non è normalizzato in modo affidabile.
 *
 * ATTENZIONE — utilizzo attuale: la pagina Statistiche usa solo `countryConfig`.
 * `getCircuitFlagCode`, `getCountryColor` e `getCountryName` non erano chiamate
 * da nessuna parte già prima di questa estrazione (getCountryColor e
 * getCountryName non venivano mai invocate, e getFlagCode solo da loro).
 * Sono conservate qui perché la mappatura circuito → nazione è dati utili,
 * ma se non servono si possono eliminare insieme a circuitToCountry.
 */

const RED = '#DC0000';

export const countryConfig = {
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

export const circuitToCountry = {
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

export const getCircuitFlagCode = (circuitName) => {
  if (!circuitName) return '';
  
  const n = circuitName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const country = circuitToCountry[n];
  if (country) return countryConfig[country]?.code || '';
  
  const l = circuitName.toLowerCase();
  
  if (l.includes('monza') || l.includes('imola') || l.includes('mugello') || l.includes('italian') || l.includes('pescara') || l.includes('bologna') ||
      l.includes('enna') || l.includes('pergusa') || l.includes('vallelunga') || l.includes('Italy') ||
      l.includes('misano') || l.includes('santamonica')) return 'it';
  if (l.includes('silverstone') || l.includes('brands') || l.includes('british') || l.includes('britain') ||
      l.includes('donington') || l.includes('aintree') || l.includes('goodwood') || l.includes('united kingdom') ||
      l.includes('crystal palace') || l.includes('mallory park') || l.includes('snetterton') ||
      l.includes('oulton park') || l.includes('thurston') || l.includes('liverpool') ||
      l.includes('northamptonshire') || l.includes('kent')) return 'gb';
  if (l.includes('spa') || l.includes('belgian') || l.includes('francorchamps') ||
      l.includes('zolder') || l.includes('nivelles') || l.includes('stavelot') ||
      l.includes('brussels') || l.includes('heusden')) return 'be';
  if (l.includes('barcelona') || l.includes('catalun') || l.includes('spanish') ||
      l.includes('jerez') || l.includes('valencia') || l.includes('pedralbes') ||
      l.includes('montjuic') || l.includes('madrid') || l.includes('jarama') ||
      l.includes('madring') || l.includes('guadalope') || l.includes('lasarte') ||
      l.includes('sitges')) return 'es';
  if (l.includes('paul ricard') || l.includes('magny') || l.includes('french') ||
      l.includes('france') || l.includes('le castellet') || l.includes('ricard') ||
      l.includes('reims') || l.includes('dijon') || l.includes('prenois') ||
      l.includes('rouen') || l.includes('les essarts') || l.includes('charade') ||
      l.includes('clermont ferrand') || l.includes('lemans') || l.includes('bugatti') ||
      l.includes('albi') || l.includes('lens') || l.includes('strasbourg') ||
      l.includes('montlhery') || l.includes('pau') || l.includes('bois')) return 'fr';
  if (l.includes('nurburg') || l.includes('hockenheim') || l.includes('german') ||
      l.includes('avus') || l.includes('berlin') || l.includes('norisring') ||
      l.includes('grenzlandring') || l.includes('sachsenring') || l.includes('solitude')) return 'de';
  if (l.includes('estoril') || l.includes('portimao') || l.includes('portuguese') ||
      l.includes('algarve') || l.includes('boavista') || l.includes('oporto') ||
      l.includes('monsanto') || l.includes('lisbon')) return 'pt';
  if (l.includes('bremgarten') || l.includes('bern') || l.includes('swiss') || l.includes('dijon')) return 'ch';
  if (l.includes('anderstorp') || l.includes('scandinavian') || l.includes('swedish') || l.includes('karlskoga')) return 'se';
  if (l.includes('monaco') || l.includes('monte carlo') || l.includes('circuit de monaco')) return 'mc';
  if (l.includes('baku') || l.includes('azerbaijan') || l.includes('bakú')) return 'az';
  if (l.includes('americas') || l.includes('cota') || l.includes('austin') || 
      l.includes('miami') || l.includes('vegas') || l.includes('las vegas') ||
      l.includes('united states') || l.includes('indianapolis') || l.includes('watkins glen') ||
      l.includes('long beach') || l.includes('phoenix') || l.includes('detroit') ||
      l.includes('dallas') || l.includes('sebring') || l.includes('riverside') ||
      l.includes('caesars palace') || l.includes('fair park') || l.includes('tampa') ||
      l.includes('laguna seca') || l.includes('sonoma') || l.includes('road america')) return 'us';
  if (l.includes('villeneuve') || l.includes('montreal') || l.includes('canadian') ||
      l.includes('mosport') || l.includes('bowmanville') || l.includes('tremblant') ||
      l.includes('st jovite')) return 'ca';
  if (l.includes('interlagos') || l.includes('brazilian') || l.includes('sao paulo') ||
      l.includes('jose carlos pace') || l.includes('jacarepagua') || l.includes('rio de janeiro') ||
      l.includes('galeão') || l.includes('carlos pace')) return 'br';
  if (l.includes('rodriguez') || l.includes('hermanos') || l.includes('mexico') ||
      l.includes('mexican') || l.includes('mexico city') || l.includes('avandaro')) return 'mx';
  if (l.includes('galvez') || l.includes('buenos aires') || l.includes('argentine') ||
      l.includes('oscar galvez') || l.includes('juan y oscar') || l.includes('cobos')) return 'ar';
  if (l.includes('suzuka') || l.includes('japanese') || l.includes('fuji') ||
      l.includes('okayama') || l.includes('ti circuit') || l.includes('aida') ||
      l.includes('mine')) return 'jp';
  if (l.includes('shanghai') || l.includes('chinese') || l.includes('china') ||
      l.includes('zhuhai') || l.includes('beijing')) return 'cn';
  if (l.includes('marina bay') || l.includes('singapore')) return 'sg';
  if (l.includes('sepang') || l.includes('malaysian') || l.includes('kuala lumpur') ||
      l.includes('johor')) return 'my';
  if (l.includes('yeongam') || l.includes('korea') || l.includes('korean')) return 'kr';
  if (l.includes('buddh') || l.includes('greater noida') || l.includes('indian')) return 'in';
  if (l.includes('sochi') || l.includes('russian') || l.includes('moscow')) return 'ru';
  if (l.includes('bahrain') || l.includes('sakhir') || l.includes('manama')) return 'bh';
  if (l.includes('lusail') || l.includes('qatar') || l.includes('losail')) return 'qa';
  if (l.includes('jeddah') || l.includes('saudi') || l.includes('arabia')) return 'sa';
  if (l.includes('yas') || l.includes('abu dhabi') || l.includes('marina')) return 'ae';
  if (l.includes('istanbul') || l.includes('turkish') || l.includes('turkey')) return 'tr';
  if (l.includes('kyalami') || l.includes('south african') || l.includes('prince george') ||
      l.includes('midrand') || l.includes('east london')) return 'za';
  if (l.includes('ain diab') || l.includes('ain-diab') || l.includes('moroccan') ||
      l.includes('casablanca') || l.includes('ain-diab')) return 'ma';
  if (l.includes('red bull ring') || l.includes('austrian') || l.includes('spielberg') ||
      l.includes('zeltweg') || l.includes('oesterreichring') || l.includes('styria')) return 'at';
  if (l.includes('hungaroring') || l.includes('hungarian') || l.includes('budapest') ||
      l.includes('mogyorod')) return 'hu';
  if (l.includes('zandvoort') || l.includes('dutch') || l.includes('netherlands')) return 'nl';
  if (l.includes('albert park') || l.includes('melbourne') || l.includes('australian') || l.includes('adelaide')) return 'au';
  if (l.includes('finnish') || l.includes('helsinki') || l.includes('elaintarha')) return 'fi';
  if (l.includes('ardmore') || l.includes('new zealand') || l.includes('pukekohe')) return 'nz';
  if (l.includes('indonesian') || l.includes('jakarta') || l.includes('mandalika')) return 'id';
  if (l.includes('monza') || l.includes('imola') || l.includes('mugello') || 
    l.includes('italian') || l.includes('italy') || l.includes('italia') || 
    l.includes('pescara') || l.includes('bologna') || l.includes('enna') || 
    l.includes('pergusa') || l.includes('vallelunga') || l.includes('misano') || 
    l.includes('santamonica') || l.includes('san marino') || l.includes('toscana') ||
    l.includes('tuscan')) return 'it';

if (l.includes('silverstone') || l.includes('brands') || l.includes('british') || 
    l.includes('britain') || l.includes('great britain') || l.includes('united kingdom') || 
    l.includes('england') || l.includes('english') || l.includes('uk') || 
    l.includes('donington') || l.includes('aintree') || l.includes('goodwood') || 
    l.includes('crystal palace') || l.includes('mallory park') || l.includes('snetterton') ||
    l.includes('oulton park') || l.includes('thurston') || l.includes('liverpool') ||
    l.includes('northamptonshire') || l.includes('kent') || l.includes('londra') ||
    l.includes('london')) return 'gb';

if (l.includes('spa') || l.includes('belgian') || l.includes('belgium') || 
    l.includes('belgique') || l.includes('belgie') || l.includes('francorchamps') ||
    l.includes('zolder') || l.includes('nivelles') || l.includes('stavelot') ||
    l.includes('brussels') || l.includes('bruxelles') || l.includes('heusden')) return 'be';

if (l.includes('barcelona') || l.includes('catalun') || l.includes('catalonia') || 
    l.includes('spanish') || l.includes('spain') || l.includes('españa') || 
    l.includes('espanha') || l.includes('jerez') || l.includes('valencia') || 
    l.includes('pedralbes') || l.includes('montjuic') || l.includes('madrid') || 
    l.includes('jarama') || l.includes('madring') || l.includes('guadalope') || 
    l.includes('lasarte') || l.includes('sitges')) return 'es';

if (l.includes('paul ricard') || l.includes('magny') || l.includes('french') ||
    l.includes('france') || l.includes('francia') || l.includes('le castellet') || 
    l.includes('ricard') || l.includes('reims') || l.includes('dijon') || 
    l.includes('prenois') || l.includes('rouen') || l.includes('les essarts') || 
    l.includes('charade') || l.includes('clermont ferrand') || l.includes('lemans') || 
    l.includes('bugatti') || l.includes('albi') || l.includes('lens') || 
    l.includes('strasbourg') || l.includes('montlhery') || l.includes('pau') || 
    l.includes('bois') || l.includes('paris') || l.includes('francese')) return 'fr';

if (l.includes('nurburg') || l.includes('nürburg') || l.includes('hockenheim') || 
    l.includes('german') || l.includes('germany') || l.includes('deutschland') || 
    l.includes('deutsche') || l.includes('avus') || l.includes('berlin') || 
    l.includes('norisring') || l.includes('grenzlandring') || l.includes('sachsenring') || 
    l.includes('solitude') || l.includes('tedesca')) return 'de';

if (l.includes('estoril') || l.includes('portimao') || l.includes('portuguese') ||
    l.includes('portugal') || l.includes('portogallo') || l.includes('algarve') || 
    l.includes('boavista') || l.includes('oporto') || l.includes('porto') ||
    l.includes('monsanto') || l.includes('lisbon') || l.includes('lisbona')) return 'pt';

if (l.includes('bremgarten') || l.includes('bern') || l.includes('berne') || 
    l.includes('swiss') || l.includes('switzerland') || l.includes('suisse') || 
    l.includes('schweiz') || l.includes('svizzera') || l.includes('elvetica')) return 'ch';

if (l.includes('anderstorp') || l.includes('scandinavian') || l.includes('swedish') || 
    l.includes('sweden') || l.includes('svezia') || l.includes('karlskoga') ||
    l.includes('svedese')) return 'se';

if (l.includes('monaco') || l.includes('monte carlo') || l.includes('circuit de monaco') ||
    l.includes('monegasco')) return 'mc';

if (l.includes('baku') || l.includes('azerbaijan') || l.includes('bakú') || 
    l.includes('azeri') || l.includes('azero')) return 'az';

if (l.includes('americas') || l.includes('cota') || l.includes('austin') || l.includes('united-states-of-america') ||
     l.includes('united-states') || l.includes('u.s.a.') || l.includes('united states of america') || 
    l.includes('miami') || l.includes('vegas') || l.includes('las vegas') ||
    l.includes('united states') || l.includes('usa') || l.includes('u.s.a.') ||
    l.includes('america') || l.includes('american') || l.includes('indianapolis') || 
    l.includes('watkins glen') || l.includes('long beach') || l.includes('phoenix') || 
    l.includes('detroit') || l.includes('dallas') || l.includes('sebring') || 
    l.includes('riverside') || l.includes('caesars palace') || l.includes('fair park') || 
    l.includes('tampa') || l.includes('laguna seca') || l.includes('sonoma') || 
    l.includes('road america') || l.includes('california') || l.includes('texas')) return 'us';

if (l.includes('villeneuve') || l.includes('montreal') || l.includes('canadian') ||
    l.includes('canada') || l.includes('quebec') || l.includes('mosport') || 
    l.includes('bowmanville') || l.includes('tremblant') || l.includes('st jovite') ||
    l.includes('canadese')) return 'ca';

if (l.includes('interlagos') || l.includes('brazilian') || l.includes('brazil') || 
    l.includes('brasile') || l.includes('brasil') || l.includes('sao paulo') ||
    l.includes('são paulo') || l.includes('jose carlos pace') || l.includes('jacarepagua') || 
    l.includes('rio de janeiro') || l.includes('galeão') || l.includes('carlos pace') ||
    l.includes('brasiliana')) return 'br';

if (l.includes('rodriguez') || l.includes('hermanos') || l.includes('mexico') ||
    l.includes('mexican') || l.includes('messico') || l.includes('mexico city') || 
    l.includes('città del messico') || l.includes('avandaro')) return 'mx';

if (l.includes('galvez') || l.includes('buenos aires') || l.includes('argentine') ||
    l.includes('argentina') || l.includes('oscar galvez') || l.includes('juan y oscar') || 
    l.includes('cobos') || l.includes('argentino')) return 'ar';

if (l.includes('suzuka') || l.includes('japanese') || l.includes('japan') || 
    l.includes('giappone') || l.includes('nippon') || l.includes('fuji') ||
    l.includes('okayama') || l.includes('ti circuit') || l.includes('aida') ||
    l.includes('mine') || l.includes('giapponese')) return 'jp';

if (l.includes('shanghai') || l.includes('chinese') || l.includes('china') ||
    l.includes('cina') || l.includes('zhuhai') || l.includes('beijing') ||
    l.includes('pechino') || l.includes('cinese')) return 'cn';

if (l.includes('marina bay') || l.includes('singapore') || l.includes('singapor') ||
    l.includes('singapor')) return 'sg';

if (l.includes('sepang') || l.includes('malaysian') || l.includes('malaysia') || 
    l.includes('malesia') || l.includes('kuala lumpur') || l.includes('johor') ||
    l.includes('malese')) return 'my';

if (l.includes('yeongam') || l.includes('korea') || l.includes('korean') || 
    l.includes('corea') || l.includes('sud corea') || l.includes('coreano')) return 'kr';

if (l.includes('buddh') || l.includes('greater noida') || l.includes('indian') ||
    l.includes('india') || l.includes('indiano')) return 'in';

if (l.includes('sochi') || l.includes('russian') || l.includes('russia') || 
    l.includes('moscow') || l.includes('mosca') || l.includes('russo')) return 'ru';

if (l.includes('bahrain') || l.includes('sakhir') || l.includes('manama') || 
    l.includes('bahrein') || l.includes('bahraini')) return 'bh';

if (l.includes('lusail') || l.includes('qatar') || l.includes('losail') || 
    l.includes('catari') || l.includes('qatari')) return 'qa';

if (l.includes('jeddah') || l.includes('saudi') || l.includes('arabia') || 
    l.includes('arabia saudita') || l.includes('saudita')) return 'sa';

if (l.includes('yas') || l.includes('abu dhabi') || l.includes('marina') ||
    l.includes('emirates') || l.includes('emirati') || l.includes('dubai') ||
    l.includes('uae') || l.includes('emiratina')) return 'ae';

if (l.includes('istanbul') || l.includes('turkish') || l.includes('turkey') || 
    l.includes('turchia') || l.includes('turco')) return 'tr';

if (l.includes('kyalami') || l.includes('south african') || l.includes('south africa') || 
    l.includes('sudafrica') || l.includes('prince george') || l.includes('midrand') || 
    l.includes('east london') || l.includes('sudafricano')) return 'za';

if (l.includes('ain diab') || l.includes('ain-diab') || l.includes('moroccan') ||
    l.includes('morocco') || l.includes('marocco') || l.includes('casablanca') || 
    l.includes('marocchino')) return 'ma';

if (l.includes('red bull ring') || l.includes('austrian') || l.includes('austria') || 
    l.includes('spielberg') || l.includes('zeltweg') || l.includes('oesterreichring') || 
    l.includes('österreichring') || l.includes('styria') || l.includes('stiria') ||
    l.includes('austriaco')) return 'at';

if (l.includes('hungaroring') || l.includes('hungarian') || l.includes('hungary') || 
    l.includes('ungheria') || l.includes('budapest') || l.includes('mogyorod') ||
    l.includes('ungherese')) return 'hu';

if (l.includes('zandvoort') || l.includes('dutch') || l.includes('netherlands') || 
    l.includes('olanda') || l.includes('paesi bassi') || l.includes('nederland') ||
    l.includes('olandese')) return 'nl';

if (l.includes('albert park') || l.includes('melbourne') || l.includes('australian') || 
    l.includes('australia') || l.includes('adelaide') || l.includes('aussie') ||
    l.includes('australiano')) return 'au';

if (l.includes('finnish') || l.includes('finland') || l.includes('finlandia') || 
    l.includes('helsinki') || l.includes('elaintarha') || l.includes('finlandese')) return 'fi';

if (l.includes('ardmore') || l.includes('new zealand') || l.includes('nuova zelanda') || 
    l.includes('pukekohe') || l.includes('neozelandese')) return 'nz';

if (l.includes('indonesian') || l.includes('indonesia') || l.includes('jakarta') || 
    l.includes('mandalika') || l.includes('indonesiano')) return 'id';
  
  return '';
};

export const getCountryColor = (circuitName) => {
  const code = getCircuitFlagCode(circuitName);
  if (!code) return RED;
  return Object.values(countryConfig).find(v => v.code === code)?.color || RED;
};

export const getCountryName = (code) => {
  if (!code) return '';
  return Object.values(countryConfig).find(v => v.code === code)?.name || code.toUpperCase();
};
