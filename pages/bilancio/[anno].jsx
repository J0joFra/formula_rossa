/**
 * pages/bilancio/[anno].jsx
 * «La Ferrari nel <anno> in numeri»: il bilancio di una stagione.
 *
 * È il contenuto di punta della campagna di fine stagione (docs/MARKETING.md):
 * una pagina sola, citabile, con i numeri calcolati dai risultati gara per
 * gara (lib/f1/bilancio.js) e il commento scritto a mano
 * (content/editoriale.js → BILANCI).
 *
 * Si rigenera ogni ora, quindi durante la stagione si aggiorna da sola dopo
 * ogni gara, e dichiara di essere provvisoria finché manca qualche GP.
 * Finché il commento non è segnato come pubblicato la pagina è `noindex` e
 * non è linkata da nessuna parte.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, Legend,
} from 'recharts';
import {
  Trophy, Flag, Timer, Zap, Medal, Share2, Link2, Check, CalendarDays, ArrowRight,
} from 'lucide-react';
import PageShell, { PageHeader, Panel } from '../../components/ui/PageShell';
import Editoriale from '../../components/ui/Editoriale';
import { BILANCI } from '../../content/editoriale';
import { caricaBilancio } from '../../lib/f1/bilancio';
import { driverPhoto, inquadratura } from '../../lib/driverPhoto';

const BASE = 'https://formula-rossa.it';
const COLORI = ['var(--fr-red)', 'var(--fr-gold)', 'var(--fr-teal)', 'var(--fr-accent-blue)'];

export async function getStaticPaths() {
  return { paths: Object.keys(BILANCI).map((anno) => ({ params: { anno } })), fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const anno = Number(params.anno);
  if (!Number.isInteger(anno) || anno < 1950 || anno > new Date().getFullYear()) return { notFound: true };
  const bilancio = await caricaBilancio(anno);
  if (!bilancio) return { notFound: true, revalidate: 600 };
  return { props: { bilancio }, revalidate: 3600 };
}

/* `dec` è il massimo di decimali: 323,5 resta 323,5, ma 510 non diventa 510,0. */
const fmt = (n, dec = 0) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('it-IT', { maximumFractionDigits: dec }));
const ordinale = (n) => (n ? `${n}°` : '—');

/* ─── Pezzi ─────────────────────────────────────────────────────────────── */

function Numero({ value, label, accent }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-4 text-center">
      <p className={`tabular text-3xl md:text-4xl font-bold leading-none ${accent ? 'text-[var(--fr-red)]' : 'text-[var(--fr-text)]'}`}>{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fr-text-faint)] mt-2">{label}</p>
    </div>
  );
}

/** Barra divisa in due: chi ha battuto chi, e quante volte. */
function Confronto({ label, a, b, colori }) {
  const tot = a + b || 1;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="tabular font-bold" style={{ color: colori[0] }}>{a}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fr-text-faint)]">{label}</span>
        <span className="tabular font-bold" style={{ color: colori[1] }}>{b}</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--fr-surface-2)]" aria-hidden="true">
        <span style={{ width: `${(a / tot) * 100}%`, background: colori[0] }} />
        <span style={{ width: `${(b / tot) * 100}%`, background: colori[1] }} />
      </div>
    </div>
  );
}

function SchedaPilota({ p, colore }) {
  const foto = driverPhoto(p.id, p.nome);
  const [rotta, setRotta] = useState(false);
  const righe = [
    ['Classifica piloti', ordinale(p.posizione)],
    ['Punti', fmt(p.puntiClassifica ?? p.punti)],
    ['Vittorie', p.vittorie],
    ['Podi', p.podi],
    ['Pole', p.pole],
    ['Giri veloci', p.giriVeloci],
    ['Miglior arrivo', ordinale(p.migliore)],
    ['Qualifica media', fmt(p.mediaQuali, 1)],
    ['Ritiri', p.ritiri],
  ];
  return (
    <div className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] overflow-hidden">
      <div className="flex items-center gap-4 p-5 border-b border-[var(--fr-border)]" style={{ boxShadow: `inset 4px 0 0 ${colore}` }}>
        <span className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-[var(--fr-surface-2)]">
          {foto && !rotta && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={`Ritratto di ${p.nome}`} loading="lazy" onError={() => setRotta(true)} style={inquadratura(foto)} />
          )}
        </span>
        <span className="min-w-0">
          <Link href={`/piloti/${p.id}`} className="block font-head text-2xl font-black uppercase leading-none text-[var(--fr-text)] hover:text-[var(--fr-red)] transition-colors">
            {p.nome}
          </Link>
          <span className="block text-xs text-[var(--fr-text-faint)] mt-1">{p.gare} Gran Premi</span>
        </span>
      </div>
      <dl className="divide-y divide-[var(--fr-border)]">
        {righe.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-5 py-2.5">
            <dt className="text-sm text-[var(--fr-text-muted)]">{k}</dt>
            <dd className="tabular font-bold text-[var(--fr-text)]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Il risultato di un pilota in una gara: posizione d'arrivo, con la qualifica sotto. */
function Esito({ p }) {
  if (!p || p.arrivo === null) return <span className="text-[var(--fr-text-dim)]">—</span>;
  const podio = p.arrivoNum && p.arrivoNum <= 3;
  return (
    <span className="inline-flex flex-col items-center leading-tight">
      <span className={`tabular font-bold ${p.arrivoNum === 1 ? 'text-[var(--fr-gold)]' : podio ? 'text-[var(--fr-text)]' : p.arrivoNum ? 'text-[var(--fr-text-muted)]' : 'text-[var(--fr-danger)]'}`}>
        {p.arrivoNum ? `P${p.arrivoNum}` : p.arrivo}
        {p.pole && <span title="Pole position" className="ml-1 text-[10px] text-[var(--fr-teal)]">POLE</span>}
      </span>
      {p.quali && <span className="tabular text-[10px] text-[var(--fr-text-faint)]">Q{p.quali}{p.sprint ? ` · S${p.sprint}` : ''}</span>}
    </span>
  );
}

function Condividi({ titolo, url }) {
  const [copiato, setCopiato] = useState(false);
  const testo = encodeURIComponent(titolo);
  const link = encodeURIComponent(url);
  const copia = async () => {
    try { await navigator.clipboard.writeText(url); setCopiato(true); setTimeout(() => setCopiato(false), 2000); } catch { /* niente appunti */ }
  };
  const cls = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--fr-border)] bg-[var(--fr-surface)] text-xs font-bold text-[var(--fr-text-muted)] hover:text-[var(--fr-text)] hover:border-[var(--fr-border-strong)] transition-colors';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--fr-text-faint)] mr-1">
        <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Condividi
      </span>
      <a className={cls} href={`https://wa.me/?text=${testo}%20${link}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a className={cls} href={`https://x.com/intent/post?text=${testo}&url=${link}`} target="_blank" rel="noopener noreferrer">X</a>
      <a className={cls} href={`https://t.me/share/url?url=${link}&text=${testo}`} target="_blank" rel="noopener noreferrer">Telegram</a>
      <button type="button" className={cls} onClick={copia}>
        {copiato ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Link2 className="w-3.5 h-3.5" aria-hidden="true" />}
        {copiato ? 'Copiato' : 'Copia link'}
      </button>
    </div>
  );
}

/** "In qualifica Leclerc davanti 11 volte su 20", o il pareggio. */
function fraseDuello(prefisso, [a, b], pa, pb) {
  if (a === b) return `${prefisso} pari, ${a} a ${b}`;
  const primo = a > b ? pa : pb;
  return `${prefisso} ${primo.cognome} davanti ${Math.max(a, b)} volte su ${a + b}`;
}

const tooltipStyle = {
  background: 'var(--fr-surface)', border: '1px solid var(--fr-border-strong)', borderRadius: 12, fontSize: 12, color: 'var(--fr-text)',
};

/* ─── Pagina ────────────────────────────────────────────────────────────── */

export default function Bilancio({ bilancio: b }) {
  const commento = BILANCI[b.anno];
  const pubblicato = !!commento?.pubblicato;
  const colori = b.piloti.map((_, i) => COLORI[i % COLORI.length]);
  const [pa, pb] = b.piloti;
  const path = `/bilancio/${b.anno}`;
  const titolo = `La Ferrari nel ${b.anno} in numeri`;

  const disputate = b.gare.filter((g) => g.stato === 'disputata');
  const datiPunti = disputate.map((g) => ({
    gara: g.round,
    nome: g.nome,
    ...Object.fromEntries(b.piloti.map((p) => [p.cognome, g.cumulati[p.id]])),
  }));

  const seo = {
    title: `${titolo}: bilancio della stagione`,
    description: `Il bilancio della stagione ${b.anno} della Scuderia Ferrari: ${b.totali.punti} punti, ${b.totali.vittorie} vittorie e ${b.totali.podi} podi, il confronto fra ${b.piloti.map((p) => p.cognome).join(' e ')} e il paragone con le stagioni passate.`,
    path,
    noIndex: !pubblicato,
    jsonLd: pubblicato ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: titolo,
      inLanguage: 'it',
      about: { '@type': 'SportsTeam', name: 'Scuderia Ferrari' },
      author: { '@type': 'Person', name: 'Joaquim Francalanci' },
      publisher: { '@type': 'Organization', name: 'Formula Rossa', url: BASE },
      mainEntityOfPage: `${BASE}${path}`,
    } : null,
  };

  return (
    <PageShell seo={seo} wide>
      <PageHeader
        eyebrow={`Bilancio · Stagione ${b.anno}`}
        title={`La Ferrari nel ${b.anno}`}
        accent="in numeri"
        subtitle={`Ogni gara, ogni qualifica, ogni punto della stagione ${b.anno} della Scuderia Ferrari, messi in fila e confrontati con gli anni precedenti.`}
        breadcrumb={[{ label: 'Stagione' }, { label: `Bilancio ${b.anno}` }]}
      />

      {/* Stato della stagione: il bilancio si aggiorna da solo dopo ogni gara */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--fr-border)] bg-[var(--fr-surface)] text-xs font-semibold text-[var(--fr-text-muted)]">
          <CalendarDays className="w-3.5 h-3.5 text-[var(--fr-red)]" aria-hidden="true" />
          {b.conclusa
            ? `Stagione conclusa · ${b.totali.gare} Gran Premi`
            : `Bilancio provvisorio · aggiornato dopo il ${b.ultima?.nome ?? 'primo GP'} · ${b.rimanenti === 1 ? 'manca 1 gara' : `mancano ${b.rimanenti} gare`}`}
        </p>
        {pubblicato && <Condividi titolo={titolo} url={`${BASE}${path}`} />}
      </div>

      {/* I numeri della squadra */}
      <section aria-label="I numeri della stagione" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        <Numero accent value={ordinale(b.totali.posizione)} label="Mondiale costruttori" />
        <Numero value={fmt(b.totali.punti)} label="Punti" />
        <Numero value={b.totali.vittorie} label="Vittorie" />
        <Numero value={b.totali.podi} label="Podi in gara" />
        <Numero value={b.totali.pole} label="Pole position" />
        <Numero value={b.totali.giriVeloci} label="Giri veloci" />
      </section>

      {commento?.paragrafi?.length > 0 && (
        <Editoriale testo={{ titolo: commento.titolo, paragrafi: commento.paragrafi }} className="mb-10" />
      )}

      <div className="grid gap-8">

        {/* Le frasi che un giornalista può citare così come sono */}
        <Panel title="La stagione in cinque frasi" icon={Flag}>
          <ul className="p-5 md:p-6 grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-[var(--fr-text-muted)] list-disc pl-10">
            <li>
              Ferrari {ordinale(b.totali.posizione)} nel Mondiale costruttori con {fmt(b.totali.punti)} punti
              {b.distaccoDalPrimo !== null ? `, a ${fmt(b.distaccoDalPrimo)} dal primo posto.` : '.'}
            </li>
            <li>
              {b.totali.vittorie === 0 ? 'Nessuna vittoria' : `${b.totali.vittorie} ${b.totali.vittorie === 1 ? 'vittoria' : 'vittorie'}`}
              {b.momenti.vittorie.length > 0 && `: ${b.momenti.vittorie.map((v) => `${v.pilota} nel ${v.gp}`).join(', ')}`}.
            </li>
            <li>
              {b.totali.podi} podi in {b.totali.gare} gare
              {b.totali.doppiPodi === 0 ? ', mai con entrambe le macchine fra i primi tre.'
                : b.totali.doppiPodi === 1 ? ', una sola volta con entrambe le macchine fra i primi tre.'
                : `, ${b.totali.doppiPodi} volte con entrambe le macchine fra i primi tre.`}
            </li>
            <li>A punti in {b.totali.gareAPunti} Gran Premi su {b.totali.gare}{b.totali.podiSprint ? `, più ${b.totali.podiSprint} podi nelle gare sprint` : ''}.</li>
            {b.duello && pa && pb && (
              <li>
                {fraseDuello('In qualifica', b.duello.quali, pa, pb)}; {fraseDuello('in gara', b.duello.gara, pa, pb)}.
              </li>
            )}
          </ul>
        </Panel>

        {/* Il duello in squadra */}
        {pa && pb && b.duello && (
          <section aria-labelledby="duello">
            <h2 id="duello" className="text-xl font-black uppercase tracking-wide mb-4">{pa.cognome} contro {pb.cognome}</h2>
            <div className="grid lg:grid-cols-[1fr_minmax(0,320px)_1fr] gap-5 items-start">
              <SchedaPilota p={pa} colore={colori[0]} />
              <div className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-6 grid gap-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fr-text-faint)] text-center">Testa a testa</p>
                <Confronto label="Qualifiche" a={b.duello.quali[0]} b={b.duello.quali[1]} colori={colori} />
                <Confronto label="Gare" a={b.duello.gara[0]} b={b.duello.gara[1]} colori={colori} />
                <Confronto label="Punti" a={pa.punti} b={pb.punti} colori={colori} />
                <Confronto label="Podi" a={pa.podi} b={pb.podi} colori={colori} />
                <p className="text-[11px] text-[var(--fr-text-faint)] text-center">
                  In gara vince chi arriva davanti; un ritiro conta come arrivare dietro.
                </p>
              </div>
              <SchedaPilota p={pb} colore={colori[1]} />
            </div>
          </section>
        )}

        {/* La corsa ai punti */}
        <Panel title="Punti gara dopo gara" icon={Zap}>
          <div className="p-4 md:p-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datiPunti} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                <CartesianGrid stroke="var(--fr-border)" strokeDasharray="3 3" />
                <XAxis dataKey="gara" tick={{ fill: 'var(--fr-text-faint)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--fr-text-faint)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(r) => datiPunti.find((d) => d.gara === r)?.nome ?? `Gara ${r}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {b.piloti.slice(0, 4).map((p, i) => (
                  <Line key={p.id} type="monotone" dataKey={p.cognome} stroke={colori[i]} strokeWidth={2.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Gara per gara */}
        <Panel title="Gara per gara" icon={Flag}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Gran Premio</th>
                  {b.piloti.slice(0, 2).map((p) => <th key={p.id} scope="col" className="text-center">{p.cognome}</th>)}
                  <th scope="col" className="text-right">Punti</th>
                  <th scope="col">Vincitore</th>
                </tr>
              </thead>
              <tbody>
                {b.gare.map((g) => (
                  <tr key={g.round} className={g.vincitore?.ferrari ? 'bg-[var(--fr-red-soft)]' : undefined}>
                    <td className="tabular text-[var(--fr-text-faint)]">{g.round}</td>
                    <td>
                      {g.stato === 'disputata'
                        ? <Link href={`/gp/${b.anno}/${g.round}`} className="font-semibold hover:text-[var(--fr-red)]">{g.nome}</Link>
                        : <span className="text-[var(--fr-text-faint)]">{g.nome}</span>}
                    </td>
                    {g.stato === 'disputata' ? (
                      <>
                        {b.piloti.slice(0, 2).map((p) => <td key={p.id} className="text-center"><Esito p={g.piloti.find((x) => x.id === p.id)} /></td>)}
                        <td className="tabular text-right font-bold">{fmt(g.puntiFerrari)}</td>
                        <td className="text-sm text-[var(--fr-text-muted)]">{g.vincitore ? `${g.vincitore.nome} · ${g.vincitore.squadra}` : '—'}</td>
                      </>
                    ) : (
                      <td colSpan={4} className="text-sm text-[var(--fr-text-faint)] italic">
                        {g.stato === 'annullata' ? 'Non disputato' : `In programma il ${new Date(g.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}`}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 border-t border-[var(--fr-border)] text-[11px] text-[var(--fr-text-faint)]">
            P = posizione d’arrivo, Q = qualifica, S = gara sprint. I punti comprendono le sprint.
          </p>
        </Panel>

        {/* Rispetto agli anni passati */}
        <Panel title={`Il ${b.anno} rispetto alle ultime stagioni`} icon={Trophy}>
          <div className="p-4 md:p-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={b.storico} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                <CartesianGrid stroke="var(--fr-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="anno" tick={{ fill: 'var(--fr-text-faint)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--fr-text-faint)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--fr-overlay)' }} formatter={(v) => [fmt(v, 1), 'Punti']} />
                <Bar dataKey="punti" radius={[6, 6, 0, 0]}>
                  {b.storico.map((s) => <Cell key={s.anno} fill={s.attuale ? 'var(--fr-red)' : 'var(--fr-border-strong)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrapper border-t border-[var(--fr-border)]">
            <table>
              <thead>
                <tr>
                  <th scope="col">Stagione</th>
                  <th scope="col" className="text-right">Punti</th>
                  <th scope="col" className="text-right">Vittorie</th>
                  <th scope="col" className="text-right">Podi</th>
                  <th scope="col" className="text-right">Pole</th>
                  <th scope="col" className="text-right">Costruttori</th>
                </tr>
              </thead>
              <tbody>
                {[...b.storico].reverse().map((s) => (
                  <tr key={s.anno} className={s.attuale ? 'bg-[var(--fr-red-soft)]' : undefined}>
                    <td className="tabular font-semibold">{s.anno}{s.attuale && !b.conclusa ? '*' : ''}</td>
                    <td className="tabular text-right">{fmt(s.punti, 1)}</td>
                    <td className="tabular text-right">{s.vittorie}</td>
                    <td className="tabular text-right">{s.podi}</td>
                    <td className="tabular text-right">{s.pole}</td>
                    <td className="tabular text-right">{ordinale(s.posizione)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 border-t border-[var(--fr-border)] text-[11px] text-[var(--fr-text-faint)]">
            Punti con il sistema di ogni stagione: dal 2021 contano anche le gare sprint.{!b.conclusa && ' * Stagione in corso.'}
          </p>
        </Panel>

        {/* Momenti */}
        <div className="grid md:grid-cols-2 gap-5">
          <Panel title="Le vittorie" icon={Medal}>
            <ul className="divide-y divide-[var(--fr-border)]">
              {b.momenti.vittorie.length === 0 && <li className="px-5 py-4 text-sm text-[var(--fr-text-muted)]">Nessuna vittoria in stagione.</li>}
              {b.momenti.vittorie.map((v) => (
                <li key={`${v.round}-${v.pilota}`}>
                  <Link href={`/gp/${b.anno}/${v.round}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--fr-surface-2)] transition-colors">
                    <span className="font-semibold text-[var(--fr-text)]">{v.gp}</span>
                    <span className="text-sm text-[var(--fr-text-muted)]">{v.pilota}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Le pole position" icon={Timer}>
            <ul className="divide-y divide-[var(--fr-border)]">
              {b.momenti.pole.length === 0 && <li className="px-5 py-4 text-sm text-[var(--fr-text-muted)]">Nessuna pole in stagione.</li>}
              {b.momenti.pole.map((v) => (
                <li key={`${v.round}-${v.pilota}`}>
                  <Link href={`/gp/${b.anno}/${v.round}`} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--fr-surface-2)] transition-colors">
                    <span className="font-semibold text-[var(--fr-text)]">{v.gp}</span>
                    <span className="text-sm text-[var(--fr-text-muted)]">{v.pilota}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Da dove vengono i numeri, e dove andare dopo */}
        <div className="rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] p-6 flex flex-wrap items-center justify-between gap-5">
          <p className="text-sm text-[var(--fr-text-muted)] max-w-[70ch]">
            I numeri sono calcolati dai risultati ufficiali di ogni gara, qualifica e sprint dell’archivio storico F1DB, lo stesso
            delle altre pagine di Formula Rossa. Puoi citarli liberamente indicando la fonte con un link a questa pagina.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/statistics" className="btn btn-outline">Archivio Ferrari <ArrowRight className="w-4 h-4" aria-hidden="true" /></Link>
            <Link href="/standings" className="btn btn-outline">Classifiche</Link>
          </div>
        </div>

        {pubblicato && <Condividi titolo={titolo} url={`${BASE}${path}`} />}
      </div>
    </PageShell>
  );
}
