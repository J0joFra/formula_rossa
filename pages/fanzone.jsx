'use client';
/**
 * pages/fanzone.jsx
 * L'angolo leggero del sito: i mini-giochi e i punti che si guadagnano.
 *
 * Gli SF Token erano una valuta senza scopo: si accumulavano e basta. Il
 * codice per la classifica esisteva già (lib/tokens.getLeaderboard e la riga
 * qui sotto) ma non era mai stato messo in pagina, quindi ogni visita faceva
 * la lettura su Firestore e ne buttava via il risultato. Ora la classifica si
 * vede, e i token diventano un punteggio confrontabile invece di un numero fine
 * a se stesso.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import {
  Gamepad2, Coins, Zap, Timer, Flame, Award, Trophy, ListOrdered, ArrowRight,
} from 'lucide-react';
import PageShell, { PageHeader, Panel } from '../components/ui/PageShell';
import {
  getTokens, initUser, claimDailyBonus, hasDailyClaimed, getLeaderboard,
} from '../lib/tokens';

const DAILY_BONUS = 75;

/* I premi sono letti dalle formule dei giochi, non scritti a occhio: le
   etichette di prima ("+50", "+150", "+30") non corrispondevano a nulla —
   il Pit Stop arriva a 100, e la Trivia parte da 30 invece di fermarcisi. */
const GIOCHI = [
  {
    href: '/games/pitstop',
    title: 'Pit Stop',
    icon: Timer,
    reward: 'fino a 100 SFT',
    desc: 'Riflessi al semaforo: fermare il cronometro al momento giusto, come ai box. Uno stop perfetto vale il massimo.',
  },
  {
    href: '/games/circuit-rush',
    title: 'Circuit Rush',
    icon: Zap,
    reward: 'cresce con la distanza',
    desc: 'Sfreccia in pista e schiva i detriti. Non c’è un tetto: più resisti, più SFT porti a casa.',
  },
  {
    href: '/games/trivia',
    title: 'Trivia',
    icon: Award,
    reward: 'da 30 SFT in su',
    desc: 'Domande sulla storia della Scuderia. Qui contano gli anni passati a guardare le gare.',
  },
];

/** Tempo che manca alla mezzanotte, quando il bonus torna disponibile. */
function useCountdownMezzanotte() {
  const [t, setT] = useState('');
  useEffect(() => {
    const aggiorna = () => {
      const mezzanotte = new Date();
      mezzanotte.setHours(24, 0, 0, 0);
      const diff = mezzanotte - new Date();
      const due = (n) => String(n).padStart(2, '0');
      setT(`${due(Math.floor(diff / 3600000))}:${due(Math.floor((diff % 3600000) / 60000))}:${due(Math.floor((diff % 60000) / 1000))}`);
    };
    aggiorna();
    const id = setInterval(aggiorna, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function GameCard({ gioco, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .4, delay: index * .07 }}
    >
      <Link
        href={gioco.href}
        className="group flex flex-col h-full p-6 rounded-[var(--radius)] border border-[var(--fr-border)] bg-[var(--fr-surface)] hover:border-[var(--fr-red)]/40 hover:-translate-y-1 transition-all"
      >
        <span
          className="w-12 h-12 rounded-[14px] grid place-items-center mb-4 bg-[var(--fr-red-soft)] text-[var(--fr-red)]"
          aria-hidden="true"
        >
          <gioco.icon className="w-6 h-6" />
        </span>

        <h3 className="uppercase text-lg mb-2">{gioco.title}</h3>
        <p className="text-sm text-[var(--fr-text-muted)] mb-5">{gioco.desc}</p>

        <span className="mt-auto inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-[9px] bg-[var(--fr-surface-2)] text-xs font-bold">
          <Coins className="w-3.5 h-3.5 text-[var(--fr-gold)]" aria-hidden="true" />
          <span className="text-[var(--fr-gold)]">{gioco.reward}</span>
        </span>
      </Link>
    </motion.div>
  );
}

function ClassificaRiga({ player, posizione, isTu }) {
  const medaglia = ['🥇', '🥈', '🥉'][posizione - 1];
  return (
    <tr className={isTu ? 'bg-[var(--fr-red-soft)]' : undefined}>
      <td className="tabular font-bold w-14">
        {medaglia ? <span aria-label={`${posizione}° posto`}>{medaglia}</span> : posizione}
      </td>
      <td className={isTu ? 'text-[var(--fr-text)] font-semibold' : undefined}>
        {player.name || player.email?.split('@')[0] || 'Anonimo'}
        {isTu && (
          <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--fr-red)]">tu</span>
        )}
      </td>
      <td className="tabular text-right">{(player.tokens ?? 0).toLocaleString('it-IT')}</td>
    </tr>
  );
}

export default function FanZonePage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [classifica, setClassifica] = useState([]);
  const [classificaLoading, setClassificaLoading] = useState(true);
  const countdown = useCountdownMezzanotte();

  useEffect(() => {
    if (!session) return;
    let alive = true;
    (async () => {
      try {
        await initUser(session);
        const [t, claimed] = await Promise.all([
          getTokens(session),
          hasDailyClaimed(session),
        ]);
        if (!alive) return;
        setTokens(t);
        setDailyClaimed(claimed);
      } catch (e) {
        console.error('Fan Zone — profilo:', e);
      }
    })();
    return () => { alive = false; };
  }, [session]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getLeaderboard(10);
        if (alive) setClassifica(data);
      } catch (e) {
        console.error('Fan Zone — classifica:', e);
      } finally {
        if (alive) setClassificaLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const riscattaBonus = async () => {
    if (dailyClaimed || !session) return;
    if (await claimDailyBonus(session, DAILY_BONUS)) {
      setTokens(t => t + DAILY_BONUS);
      setDailyClaimed(true);
    }
  };

  const mieiPunti = session?.user?.email
    ? classifica.findIndex(p => p.email === session.user.email) + 1
    : 0;

  const seo = {
    title: 'Fan Zone — mini-giochi Ferrari',
    description: 'Tre mini-giochi a tema Ferrari: riflessi al pit stop, corsa in pista e domande sulla storia della Scuderia. Guadagna SF Token e scala la classifica.',
    path: '/fanzone',
  };

  return (
    <PageShell seo={seo}>
      <PageHeader
        eyebrow="Gioca"
        title="Fan"
        accent="Zone"
        subtitle="Tre mini-giochi a tema Ferrari per riempire l'attesa fra un Gran Premio e l'altro. Ogni partita vale SF Token, e i token decidono la classifica."
        breadcrumb={[{ label: 'Gioca' }]}
        actions={session ? (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--fr-border)] bg-[var(--fr-surface)]">
            <Coins className="w-4 h-4 text-[var(--fr-gold)]" aria-hidden="true" />
            <span className="tabular font-bold">{tokens.toLocaleString('it-IT')}</span>
            <span className="text-xs font-semibold text-[var(--fr-text-faint)]">SFT</span>
          </span>
        ) : (
          <button type="button" onClick={() => signIn('google')} className="btn btn-outline">
            Accedi per salvare i punti
          </button>
        )}
      />

      <div className="grid gap-6">

        {/* Bonus giornaliero */}
        <Panel title="Bonus giornaliero" icon={Flame}>
          <div className="p-6 flex flex-wrap items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="font-head text-xl font-black uppercase text-[var(--fr-text)]">
                +{DAILY_BONUS} SFT, una volta al giorno
              </p>
              <p className="text-sm text-[var(--fr-text-muted)] mt-1 max-w-[52ch]">
                {session
                  ? 'Si ricarica a mezzanotte. Nessuna partita richiesta: basta passare di qui.'
                  : 'Serve l’accesso: i token vanno salvati da qualche parte per poter essere confrontati.'}
              </p>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <div className="text-center">
                <p className="tabular text-2xl font-bold text-[var(--fr-text)]">{countdown}</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fr-text-faint)] mt-1">
                  {dailyClaimed ? 'Torna fra' : 'Si azzera fra'}
                </p>
              </div>
              <button
                type="button"
                onClick={session ? riscattaBonus : () => signIn('google')}
                disabled={!!session && dailyClaimed}
                className={session && dailyClaimed ? 'btn btn-outline' : 'btn btn-primary'}
              >
                {!session ? 'Accedi' : dailyClaimed ? 'Già riscattato' : `Riscatta +${DAILY_BONUS}`}
              </button>
            </div>
          </div>
        </Panel>

        {/* Il Fanta GP: è il motivo per cui si torna, non un mini-gioco.
            Sta sopra i giochi di riflessi perché è l'unica cosa qui dentro
            che ha a che fare con la gara della domenica. */}
        <Link
          href="/fanta"
          className="group flex flex-wrap items-center gap-5 p-6 rounded-[var(--radius)] border border-[var(--fr-red)]/40 bg-[var(--fr-surface)] hover:border-[var(--fr-red)] transition-colors"
        >
          <span className="w-12 h-12 rounded-[14px] grid place-items-center bg-[var(--fr-red-soft)] text-[var(--fr-red)]" aria-hidden="true">
            <ListOrdered className="w-6 h-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-head text-xl font-black uppercase text-[var(--fr-text)]">
              Fanta GP
            </span>
            <span className="block text-sm text-[var(--fr-text-muted)] mt-1 max-w-[62ch]">
              Metti in fila i primi dieci del prossimo Gran Premio, scegli il
              pilota del giorno e quanti ritiri ci saranno. Punteggio a gara
              conclusa, classifica di stagione e leghe private con gli amici.
            </span>
          </span>
          <span className="btn btn-primary shrink-0">
            Gioca <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </Link>

        {/* I giochi */}
        <section>
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide mb-4">
            <Gamepad2 className="w-4 h-4 text-[var(--fr-red)]" aria-hidden="true" />
            I giochi
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {GIOCHI.map((g, i) => <GameCard key={g.href} gioco={g} index={i} />)}
          </div>
        </section>

        {/* Classifica — è ciò che rende i token qualcosa di più di un numero */}
        <Panel title="Classifica" icon={Trophy}>
          {classificaLoading && (
            <div className="p-6 grid gap-2" aria-label="Caricamento classifica" role="status">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="skeleton block h-9 rounded-lg" />
              ))}
            </div>
          )}

          {!classificaLoading && classifica.length === 0 && (
            <div className="empty-state">
              <Trophy className="empty-state-icon" aria-hidden="true" />
              <p className="empty-state-title">Nessuno in classifica</p>
              <p className="empty-state-description">
                Non ha ancora giocato nessuno. La prima partita vale il primo posto.
              </p>
            </div>
          )}

          {!classificaLoading && classifica.length > 0 && (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Pos</th>
                      <th scope="col">Giocatore</th>
                      <th scope="col" className="text-right">SFT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classifica.map((p, i) => (
                      <ClassificaRiga
                        key={p.email ?? i}
                        player={p}
                        posizione={i + 1}
                        isTu={!!session && p.email === session.user.email}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {session && (
                <p className="px-5 py-4 border-t border-[var(--fr-border)] text-sm text-[var(--fr-text-muted)]">
                  {mieiPunti > 0
                    ? <>Sei <strong className="text-[var(--fr-text)]">{mieiPunti}°</strong> con {tokens.toLocaleString('it-IT')} SFT.</>
                    : <>Non sei ancora fra i primi dieci: hai {tokens.toLocaleString('it-IT')} SFT.</>}
                </p>
              )}
            </>
          )}
        </Panel>

        {/* Onestà su cosa sono i token, invece di lasciarlo intuire */}
        <Panel title="Cosa sono gli SF Token">
          <div className="p-6 text-sm text-[var(--fr-text-muted)] space-y-3">
            <p>
              Sono un punteggio, non una valuta: si guadagnano giocando e servono a
              stabilire la classifica qui sopra. Non si comprano, non si scambiano e
              non danno accesso a nulla — l&apos;unica cosa che fanno è dire chi ha
              giocato di più e meglio.
            </p>
            <p>
              Per salvarli serve l&apos;accesso con Google: senza, si può giocare
              lo stesso, ma il punteggio resta solo sullo schermo.
            </p>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
