/**
 * pages/circuiti/[slug].jsx
 * Scheda di un circuito.
 *
 * Era l'ultima pagina rimasta fuori dal design system: montava a mano
 * Navigation/main/Footer dentro un `bg-zinc-950 text-white` e scriveva i
 * colori come opacità del bianco (`text-white/30`, `text-white/35`). Sul tema
 * chiaro quelle scritte arrivavano a 1,03:1 di contrasto — cioè invisibili.
 * Ora usa PageShell come le altre pagine e prende i colori dai token.
 */

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import PageShell, { PageHeader, PageLoading, PageError, Panel, StatTile } from '../../components/ui/PageShell';
import { getFlagCode } from '../../lib/flags';

export default function CircuitDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [circuit, setCircuit] = useState(null);
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('info');

  useEffect(() => {
    if (!slug) return;
    async function fetchCircuit() {
      setLoading(true);
      setError(null);

      // Tabella: "circuit" (singolare) — colonne reali del DB
      const { data, error } = await supabase
        .from('circuit')                 // ← era 'circuits'
        .select('id, name, full_name, previous_names, place_name, country_id, length, turns, direction, type, latitude, longitude, total_races_held')
        .eq('id', slug)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setCircuit(data);

      // Carica i layout del circuito dalla tabella "circuit_layout"
      const { data: layoutData } = await supabase
        .from('circuit_layout')          // tabella layout reale
        .select('*')
        .eq('circuit_id', slug)
        .order('year', { ascending: false });

      setLayouts(layoutData || []);
      setLoading(false);
    }
    fetchCircuit();
  }, [slug]);

  const flag = circuit ? getFlagCode(circuit.country_id || '') : null;

  const TABS = [
    { id: 'info',    label: 'Dati Tecnici' },
    { id: 'history', label: 'Gare' },
  ];

  const seo = circuit ? {
    title: `${circuit.name} — circuito di Formula 1`,
    description: `${circuit.name}: lunghezza ${circuit.length ?? '?'} km, ${circuit.turns ?? '?'} curve, ${circuit.total_races_held ?? '?'} gare disputate.`,
    path: `/circuiti/${circuit.id}`,
  } : null;

  if (loading) return <PageShell><PageLoading label="Caricamento circuito…" /></PageShell>;

  if (error || !circuit) return (
    <PageShell>
      <PageHeader
        eyebrow="Dati"
        title="Circuito"
        breadcrumb={[{ label: 'Dati' }, { label: 'Circuiti', href: '/circuiti' }]}
      />
      <PageError
        title="Circuito non trovato"
        message={error || 'Questo circuito non è presente in archivio.'}
      />
      <p className="text-center">
        <Link href="/circuiti" className="btn btn-outline">Tutti i circuiti</Link>
      </p>
    </PageShell>
  );

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow={[circuit.country_id?.replace(/-/g, ' '), circuit.place_name].filter(Boolean).join(' · ')}
        title={circuit.name}
        subtitle={circuit.full_name && circuit.full_name !== circuit.name ? circuit.full_name : null}
        breadcrumb={[
          { label: 'Dati' },
          { label: 'Circuiti', href: '/circuiti' },
          { label: circuit.name },
        ]}
        actions={flag ? (
          <img
            src={`https://flagcdn.com/w80/${flag}.png`}
            alt=""
            width={48}
            height={36}
            className="w-12 rounded-sm"
          />
        ) : null}
      />

      {circuit.previous_names && (
        <p className="text-xs text-[var(--fr-text-faint)] -mt-4 mb-6">
          Precedentemente: {circuit.previous_names}
        </p>
      )}

      <div className="grid gap-6">

        {/* I quattro numeri della pista */}
        <Panel title="La pista">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--fr-border)]">
            <StatTile value={circuit.length ? `${circuit.length} km` : '—'} label="Lunghezza" accent />
            <StatTile value={circuit.turns ?? '—'} label="Curve" />
            <StatTile value={circuit.total_races_held ?? '—'} label="Gare disputate" />
            <StatTile
              value={circuit.direction ? circuit.direction.toLowerCase().replace('clockwise', 'orario').replace('anti-orario', 'antiorario') : '—'}
              label="Senso di marcia"
            />
          </div>
        </Panel>

        {/* Le due schede erano bottoni con `border-red-600 text-white` sopra un
            fondo nero: qui riusano lo stile dei selettori di sessione della
            scheda GP, così i due posti si somigliano. */}
        <div role="tablist" aria-label="Sezioni del circuito" className="flex gap-1">
          {TABS.map(t => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2 rounded-[9px] text-xs font-bold uppercase tracking-wider transition-colors ${
                  on
                    ? 'bg-[var(--fr-red)] text-white'
                    : 'bg-[var(--fr-surface-2)] text-[var(--fr-text-muted)] hover:text-[var(--fr-text)]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'info' && (
          <>
            <Panel title="Caratteristiche tecniche">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 px-5 py-2">
                {[
                  { label: 'Lunghezza giro',  value: circuit.length ? `${circuit.length} km` : '—' },
                  { label: 'Numero di curve', value: circuit.turns ?? '—' },
                  { label: 'Tipo circuito',   value: circuit.type ?? '—' },
                  { label: 'Senso di marcia', value: circuit.direction ?? '—' },
                  { label: 'Gare disputate',  value: circuit.total_races_held ?? '—' },
                  { label: 'Città',           value: circuit.place_name ?? '—' },
                  { label: 'Nazione',         value: circuit.country_id?.replace(/-/g, ' ') ?? '—' },
                  { label: 'Latitudine',      value: circuit.latitude ?? '—' },
                  { label: 'Longitudine',     value: circuit.longitude ?? '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 py-3 border-b border-[var(--fr-border)] last:border-0"
                  >
                    <dt className="text-sm text-[var(--fr-text-muted)]">{label}</dt>
                    <dd className="text-sm font-semibold text-[var(--fr-text)] capitalize text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            {layouts.length > 0 && (
              <Panel title={`Varianti del tracciato · ${layouts.length}`}>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Variante</th>
                        <th scope="col">Anno</th>
                        <th scope="col">Lunghezza</th>
                        <th scope="col">Curve</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layouts.map(l => (
                        <tr key={`${l.id ?? l.circuit_id}-${l.year}`}>
                          <td>{l.id ?? l.circuit_id}</td>
                          <td className="tabular">{l.year ?? '—'}</td>
                          <td className="tabular">{l.length ? `${l.length} km` : '—'}</td>
                          <td className="tabular">{l.turns ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            <CircuitNotes circuitId={circuit.id} />
          </>
        )}

        {tab === 'history' && (
          <div className="empty-state">
            <p className="empty-state-title">Storico gare non ancora disponibile</p>
            <p className="empty-state-description">
              Le gare disputate su questo circuito si trovano intanto nelle{' '}
              <Link href="/gp" className="text-[var(--fr-red)] hover:underline">analisi GP</Link>.
            </p>
          </div>
        )}

        <p>
          <Link href="/circuiti" className="btn btn-outline">← Tutti i circuiti</Link>
        </p>
      </div>
    </PageShell>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

const CIRCUIT_NOTES = {
  'monza':             { title: 'Il Tempio della Velocità',        body: `Monza è il circuito più veloce del calendario F1. I suoi lunghi rettilinei — tra cui il Rettifilo Tribune lungo oltre un chilometro — spingono le monoposto oltre i 350 km/h. Le scuderie montano setup ad altissima efficienza aerodinamica con pochissimo carico, sacrificando la tenuta in curva per la velocità massima. Le storiche paraboliche e la Prima Variante sono tra i punti di frenata più impegnativi dell'intera stagione. Ospita il Gran Premio d'Italia dal 1950, primo anno del Mondiale.` },
  'monaco':            { title: 'La Corsa più Prestigiosa',        body: `Monaco è l'opposto di Monza: il circuito più lento, più stretto e più iconico del mondo. Le barriere sono a pochi centimetri dalle ruote, non esiste margine di errore. La pole position è determinante perché sorpassare è quasi impossibile — spesso il vincitore è chi parte davanti. Il tunnel, il Casino, il Portier e la chicane della piscina sono luoghi leggendari. Vincere a Monaco vale doppio nell'immaginario della Formula 1.` },
  'silverstone':       { title: 'La Casa del Motorsport',          body: `Silverstone ha ospitato il primo Gran Premio del Mondiale di Formula 1 nel 1950. Le sue curve rapide — Copse, Maggots, Becketts — sono tra le più spettacolari del calendario e richiedono altissimo carico aerodinamico e una grande fiducia nella macchina. Abbey, in piena velocità, è uno dei passaggi più emozionanti del Mondiale.` },
  'spa-francorchamps': { title: 'Il Circuito più Amato dai Piloti', body: `Spa-Francorchamps è spesso citato come il circuito preferito dai piloti. L'Eau Rouge-Raidillon — la combinazione di curve in salita a tutta velocità — è il punto più iconico dell'intero calendario F1. Il meteo è imprevedibile: è normale avere sole da un lato e pioggia battente dall'altro. Il Kemmel Straight è uno dei principali punti di sorpasso del campionato.` },
  'suzuka':            { title: 'Il Circuito dei Tecnici',         body: `Suzuka è il circuito più tecnico del calendario, con una sequenza di curve in S nella prima parte del tracciato che mette alla prova l'equilibrio aerodinamico della vettura in modo unico. Il disegno a otto incrociato è unico nel motorsport. Spoon Curve, Degner e 130R sono punti dove i piloti dimostrano il massimo coraggio.` },
};

function CircuitNotes({ circuitId }) {
  const note = CIRCUIT_NOTES[circuitId] || null;
  if (!note) return null;   // Meglio niente che un riquadro che dice "non c'è niente".
  return (
    <Panel title="Note editoriali">
      <div className="p-5">
        <h3 className="text-lg font-black text-[var(--fr-text)] mb-2">{note.title}</h3>
        <p className="text-sm leading-relaxed text-[var(--fr-text-muted)]">{note.body}</p>
      </div>
    </Panel>
  );
}
