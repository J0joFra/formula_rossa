'use client';
/**
 * pages/fanta.jsx
 * Il Fanta GP: si pronostica l'ordine d'arrivo prima del semaforo verde, e
 * la domenica sera il server dice quanto hai preso.
 *
 * Perché esiste: la Fan Zone dava punti per giochi di riflessi, che con la
 * Formula 1 c'entrano poco. Qui il punteggio nasce dal guardare le qualifiche
 * e farsi un'idea della gara — è la cosa che i tifosi fanno comunque, e
 * l'unica per cui vale la pena tornare sul sito ogni due settimane.
 *
 * Tutto quello che conta sta sul server (lib/fanta/server.js): qui si
 * disegnano le scelte e si mandano. Il punteggio non si calcola in questa
 * pagina nemmeno per mostrarlo in anteprima — un numero che arriva dal
 * browser non è un punteggio, è un suggerimento.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Trophy, ListOrdered, Timer, Users, ScrollText, Check } from 'lucide-react';
import PageShell, { PageHeader, Panel, PageLoading, PageError } from '../components/ui/PageShell';
import EditorPronostico from '../components/fanta/EditorPronostico';
import Classifica from '../components/fanta/Classifica';
import Leghe from '../components/fanta/Leghe';
import { REGOLE, punteggioMassimo, POSIZIONI_DA_PRONOSTICARE } from '../lib/fanta/punteggio';

/** Fetch che tratta l'errore del server come un errore, non come dati. */
async function chiedi(url, opzioni) {
  const r = await fetch(url, {
    ...opzioni,
    headers: opzioni?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo.errore || 'Richiesta non riuscita.');
  return corpo;
}

/** Quanto manca alla chiusura delle giocate. */
function useContoAllaRovescia(scadenzaISO) {
  const [testo, setTesto] = useState(null);
  useEffect(() => {
    if (!scadenzaISO) { setTesto(null); return undefined; }
    const fine = new Date(scadenzaISO).getTime();
    const aggiorna = () => {
      const diff = fine - Date.now();
      if (diff <= 0) { setTesto('chiuse'); return; }
      const g = Math.floor(diff / 86400000);
      const o = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const due = (n) => String(n).padStart(2, '0');
      setTesto(g > 0 ? `${g}g ${due(o)}:${due(m)}:${due(s)}` : `${due(o)}:${due(m)}:${due(s)}`);
    };
    aggiorna();
    const id = setInterval(aggiorna, 1000);
    return () => clearInterval(id);
  }, [scadenzaISO]);
  return testo;
}

/* Le regole si scrivono da sole a partire da REGOLE: se un giorno i punti
   cambiano, la pagina che li spiega cambia con loro invece di mentire. */
const VOCI_REGOLE = [
  ['Posizione esatta', `+${REGOLE.posizioni.esatta}`, 'Il pilota è proprio dove l’avevi messo.'],
  ['Sbagliata di una', `+${REGOLE.posizioni.scartoUno}`, 'Una posizione sopra o sotto.'],
  ['Sbagliata di due', `+${REGOLE.posizioni.scartoDue}`, 'Due posizioni sopra o sotto.'],
  ['Comunque a punti', `+${REGOLE.posizioni.inTopDieci}`, 'È nei primi dieci, ma lontano da dove l’avevi messo.'],
  ['Podio perfetto', `+${REGOLE.podio.esatto}`, 'I tre giusti, nell’ordine giusto.'],
  ['Podio giusto, ordine no', `+${REGOLE.podio.ordineErrato}`, 'I tre piloti sono quelli, ma non in quell’ordine.'],
  ['Due su tre sul podio', `+${REGOLE.podio.dueSuTre}`, 'Due dei tre nomi ci sono.'],
  ['Vincitore', `+${REGOLE.vincitore}`, 'Hai indovinato chi vince.'],
  ['Dieci su dieci', `+${REGOLE.insieme.dieciSuDieci}`, 'Tutti e dieci quelli che vanno a punti, ordine a parte.'],
  ['Otto o nove su dieci', `+${REGOLE.insieme.ottoONove}`, 'Quasi tutti.'],
  ['Scommessa vinta', `+${REGOLE.scommessa}`, `Un pilota messo almeno quattro posizioni davanti a dove parte, e ci arriva. Massimo ${REGOLE.scommesseMax}.`],
  ['Pilota del giorno', `+${REGOLE.pilotaDelGiorno}`, 'Il voto del pubblico ti dà ragione.'],
  ['Ritiri esatti', `+${REGOLE.ritiri.esatti}`, 'Il numero preciso di chi non arriva in fondo.'],
  ['Ritiri per uno', `+${REGOLE.ritiri.scartoUno}`, 'Sbagliato di uno.'],
  ['Podio fuori dai punti', `${REGOLE.malus.podioFuoriDaiPunti}`, 'Un pilota che avevi sul podio finisce fuori dai dieci.'],
  ['Vincitore fuori dai cinque', `${REGOLE.malus.vincitoreFuoriDaiCinque}`, 'Il tuo vincitore non arriva nemmeno quinto.'],
];

export default function FantaPage() {
  const { data: session, status } = useSession();
  const mioId = session?.user?.id || null;

  const [dati, setDati] = useState(null);
  const [errore, setErrore] = useState(null);
  const [round, setRound] = useState(null);

  const [top10, setTop10] = useState([]);
  const [pilotaDelGiorno, setPilotaDelGiorno] = useState(null);
  const [ritiri, setRitiri] = useState(3);
  const [salvataggio, setSalvataggio] = useState(null); // 'invio' | 'fatto' | messaggio

  const [stagione, setStagione] = useState([]);
  const [leghe, setLeghe] = useState([]);
  const [legaAperta, setLegaAperta] = useState(null);
  const [classificaLega, setClassificaLega] = useState([]);

  const conto = useContoAllaRovescia(dati?.scadenza);

  /* Il Gran Premio: senza round scelto decide il server qual è quello in
     corso, così il link `/fanta` funziona tutto l'anno. */
  useEffect(() => {
    if (status === 'loading') return undefined;
    let vivo = true;
    setErrore(null);
    chiedi(`/api/fanta/gp${round ? `?round=${round}` : ''}`)
      .then(d => {
        if (!vivo) return;
        setDati(d);
        setRound(d.gara.round);
        setTop10(d.miaPrevisione?.top10 || []);
        setPilotaDelGiorno(d.miaPrevisione?.pilotaDelGiorno || null);
        setRitiri(d.miaPrevisione?.ritiri ?? 3);
        setSalvataggio(d.miaPrevisione ? 'fatto' : null);
      })
      .catch(e => vivo && setErrore(e.message));
    return () => { vivo = false; };
  }, [round, status]);

  useEffect(() => {
    let vivo = true;
    chiedi('/api/fanta/classifica')
      .then(d => vivo && setStagione(d.righe))
      .catch(() => {});
    return () => { vivo = false; };
  }, []);

  useEffect(() => {
    if (!mioId) { setLeghe([]); return undefined; }
    let vivo = true;
    chiedi('/api/fanta/leghe')
      .then(d => vivo && setLeghe(d.leghe))
      .catch(() => {});
    return () => { vivo = false; };
  }, [mioId]);

  useEffect(() => {
    if (!legaAperta) { setClassificaLega([]); return undefined; }
    let vivo = true;
    chiedi(`/api/fanta/classifica?lega=${encodeURIComponent(legaAperta)}`)
      .then(d => vivo && setClassificaLega(d.righe))
      .catch(() => vivo && setClassificaLega([]));
    return () => { vivo = false; };
  }, [legaAperta]);

  const salva = async () => {
    setSalvataggio('invio');
    try {
      await chiedi('/api/fanta/previsione', {
        method: 'POST',
        body: JSON.stringify({
          year: dati.gara.year, round: dati.gara.round,
          top10, pilotaDelGiorno, ritiri,
        }),
      });
      setSalvataggio('fatto');
    } catch (e) {
      setSalvataggio(e.message);
    }
  };

  const creaLega = useCallback(async (nome) => {
    const { lega } = await chiedi('/api/fanta/leghe', {
      method: 'POST', body: JSON.stringify({ azione: 'crea', nome }),
    });
    setLeghe(l => [...l, { ...lega, codice: lega.code, nome: lega.name, proprietario: true }]);
    setLegaAperta(lega.id);
  }, []);

  const entraInLega = useCallback(async (codice) => {
    const { lega } = await chiedi('/api/fanta/leghe', {
      method: 'POST', body: JSON.stringify({ azione: 'entra', codice }),
    });
    const { leghe: aggiornate } = await chiedi('/api/fanta/leghe');
    setLeghe(aggiornate);
    setLegaAperta(lega.id);
  }, []);

  const seo = {
    title: 'Fanta GP — pronostica il Gran Premio',
    description: 'Metti in fila i primi dieci del prossimo Gran Premio, scegli il pilota del giorno e quanti ritiri ci saranno. Punti alla domenica sera, classifica di stagione e leghe private con gli amici.',
    path: '/fanta',
  };

  const pronto = top10.length === POSIZIONI_DA_PRONOSTICARE
    && Number.isInteger(ritiri) && ritiri >= 0;

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Community"
        title="Fanta"
        accent="GP"
        subtitle="Le qualifiche sono corse, la griglia è nota: adesso tocca a te dire come finisce. Dieci posizioni, il pilota del giorno, quanti ritiri. Il punteggio arriva a gara conclusa."
        breadcrumb={[{ label: 'Fanta GP' }]}
        actions={!session && status !== 'loading' ? (
          <button type="button" onClick={() => signIn('google')} className="btn btn-primary">
            Accedi per giocare
          </button>
        ) : null}
      />

      {errore && !dati && (
        <PageError
          title="Fanta non disponibile"
          message={errore}
          onRetry={() => setRound(r => (r === null ? null : r))}
        />
      )}

      {!errore && !dati && <PageLoading label="Carico il Gran Premio…" />}

      {dati && (
        <div className="grid gap-6">

          {/* Il Gran Premio in gioco, con la scadenza */}
          <Panel
            title={dati.gara.nome}
            icon={Timer}
            actions={
              <label className="flex items-center gap-2 text-xs">
                <span className="sr-only">Scegli il Gran Premio</span>
                <select
                  value={dati.gara.round}
                  onChange={e => setRound(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-[9px] border border-[var(--fr-border)] bg-[var(--fr-surface-2)] text-[var(--fr-text)]"
                >
                  {(dati.calendario || []).map(g => (
                    <option key={g.round} value={g.round}>
                      {g.round}. {g.nome}
                    </option>
                  ))}
                </select>
              </label>
            }
          >
            <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--fr-border)]">
              <p className="text-sm text-[var(--fr-text-muted)]">
                {dati.aperto
                  ? <>Le giocate chiudono allo start. Puoi modificare la schedina fino a quel momento.</>
                  : <>Le giocate sono chiuse: il punteggio compare in classifica appena il risultato è in archivio.</>}
              </p>
              {conto && (
                <p className="text-right">
                  <span className="tabular block text-xl font-bold text-[var(--fr-text)]">{conto}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)]">
                    {dati.aperto ? 'alla chiusura' : 'giocate chiuse'}
                  </span>
                </p>
              )}
            </div>

            {!session ? (
              <div className="empty-state">
                <ListOrdered className="empty-state-icon" aria-hidden="true" />
                <p className="empty-state-title">Serve l’accesso</p>
                <p className="empty-state-description">
                  La schedina va salvata da qualche parte per poterla confrontare
                  con il risultato. Bastano dieci secondi.
                </p>
                <button type="button" onClick={() => signIn('google')} className="btn btn-primary mt-4">
                  Accedi con Google
                </button>
              </div>
            ) : dati.griglia.length === 0 ? (
              <div className="empty-state">
                <ListOrdered className="empty-state-icon" aria-hidden="true" />
                <p className="empty-state-title">Griglia non ancora disponibile</p>
                <p className="empty-state-description">
                  Torna dopo le qualifiche: senza griglia non c’è niente su cui
                  scommettere.
                </p>
              </div>
            ) : (
              <>
                <EditorPronostico
                  griglia={dati.griglia}
                  top10={top10}
                  pilotaDelGiorno={pilotaDelGiorno}
                  ritiri={ritiri}
                  aperto={dati.aperto}
                  onCambiaTop10={setTop10}
                  onCambiaPilotaDelGiorno={setPilotaDelGiorno}
                  onCambiaRitiri={setRitiri}
                />

                {dati.aperto && (
                  <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--fr-border)]">
                    <p className="text-sm text-[var(--fr-text-muted)]" role="status">
                      {salvataggio === 'invio' && 'Salvo…'}
                      {salvataggio === 'fatto' && (
                        <span className="inline-flex items-center gap-1.5 text-[var(--fr-text)]">
                          <Check className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
                          Schedina salvata. Puoi cambiarla fino allo start.
                        </span>
                      )}
                      {salvataggio && !['invio', 'fatto'].includes(salvataggio) && (
                        <span className="text-[var(--fr-red)]">{salvataggio}</span>
                      )}
                      {!salvataggio && `Completa tutte e ${POSIZIONI_DA_PRONOSTICARE} le posizioni per salvare.`}
                    </p>
                    <button
                      type="button" onClick={salva}
                      disabled={!pronto || salvataggio === 'invio'}
                      className="btn btn-primary"
                    >
                      Salva la schedina
                    </button>
                  </div>
                )}
              </>
            )}
          </Panel>

          {/* Classifica di stagione */}
          <Panel
            title="Classifica di stagione"
            icon={Trophy}
            actions={
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)]">
                max {punteggioMassimo()} punti a gara
              </span>
            }
          >
            <Classifica righe={stagione} mioId={mioId} />
          </Panel>

          {/* Leghe private */}
          <Panel title="Leghe private" icon={Users}>
            {session ? (
              <Leghe
                leghe={leghe}
                legaAperta={legaAperta}
                classificaLega={classificaLega}
                mioId={mioId}
                onCrea={creaLega}
                onEntra={entraInLega}
                onApri={setLegaAperta}
              />
            ) : (
              <div className="empty-state">
                <Users className="empty-state-icon" aria-hidden="true" />
                <p className="empty-state-title">Le leghe sono per chi ha un account</p>
                <p className="empty-state-description">
                  Una lega è una classifica ristretta: crei un codice, lo mandi a
                  chi vuoi, e vi confrontate solo fra voi.
                </p>
              </div>
            )}
          </Panel>

          {/* Le regole, in chiaro */}
          <Panel title="Come si fanno i punti" icon={ScrollText}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Condizione</th>
                    <th scope="col" className="text-right">Punti</th>
                    <th scope="col">Quando scatta</th>
                  </tr>
                </thead>
                <tbody>
                  {VOCI_REGOLE.map(([nome, punti, quando]) => (
                    <tr key={nome}>
                      <td className="font-semibold text-[var(--fr-text)]">{nome}</td>
                      <td className={`tabular text-right font-bold ${punti.startsWith('-') ? 'text-[var(--fr-red)]' : ''}`}>
                        {punti}
                      </td>
                      <td className="text-sm text-[var(--fr-text-muted)]">{quando}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-5 py-4 border-t border-[var(--fr-border)] text-sm text-[var(--fr-text-muted)]">
              Le voci sulle posizioni valgono una volta per pilota, dalla migliore
              alla peggiore. Il massimo teorico è {punteggioMassimo()} punti: una
              bella giocata ne fa fra 60 e 100.
            </p>
          </Panel>
        </div>
      )}
    </PageShell>
  );
}
