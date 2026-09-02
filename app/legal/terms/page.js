import { Scale, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdate = "27 agosto 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[var(--fr-text-muted)] hover:text-[var(--fr-red)] transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Torna alla home</span>
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-[var(--fr-red)]" />
          <h1 className="text-3xl md:text-4xl font-black text-[var(--fr-text)]">
            TERMINI E <span className="text-[var(--fr-red)]">CONDIZIONI</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--fr-text-faint)]">
          <Calendar className="w-4 h-4" />
          <span>Ultimo aggiornamento: {lastUpdate}</span>
        </div>
      </div>

      <div className="border border-[var(--fr-border)] bg-[var(--fr-surface)] rounded-xl p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">1. Accettazione dei termini</h2>
          <p className="text-[var(--fr-text-muted)]">
            Utilizzando il sito Formula Rossa, accetti i presenti termini e condizioni. 
            Se non accetti, ti preghiamo di non utilizzare il sito.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">2. Proprietà intellettuale</h2>
          <p className="text-[var(--fr-text-muted)]">
            Tutti i contenuti del sito (testi, grafiche, logo, dati statistici) sono di proprietà 
            di Formula Rossa o utilizzati con licenza. È vietata la riproduzione senza autorizzazione.
          </p>
          <p className="text-[var(--fr-text-muted)] mt-4">
            <strong className="text-[var(--fr-text)]">Nota bene:</strong> I marchi Ferrari, Scuderia Ferrari 
            e relativi loghi sono di proprietà di Ferrari S.p.A. e vengono utilizzati solo a scopo 
            informativo e di cronaca.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">3. Utilizzo dei dati</h2>
          <p className="text-[var(--fr-text-muted)]">
            I dati statistici presenti sul sito sono raccolti da fonti pubbliche e ufficiali. 
            Pur impegnandoci a garantire l'accuratezza, non possiamo garantire la completezza 
            o l'assenza di errori.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">4. Limitazione di responsabilità</h2>
          <p className="text-[var(--fr-text-muted)]">
            Formula Rossa non sarà responsabile per:
          </p>
          <ul className="list-disc pl-6 text-[var(--fr-text-muted)] space-y-2 mt-4">
            <li>Eventuali errori o imprecisioni nei dati</li>
            <li>Danni derivanti dall'uso delle informazioni presenti sul sito</li>
            <li>Contenuti di siti terzi collegati</li>
            <li>Interruzioni temporanee del servizio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">5. Modifiche</h2>
          <p className="text-[var(--fr-text-muted)]">
            Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
            Le modifiche saranno efficaci dalla data di pubblicazione.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">6. Contatti</h2>
          <p className="text-[var(--fr-text-muted)]">
            Per qualsiasi domanda sui termini e condizioni, contattaci a:{" "}
            <a href="mailto:info@formula-rossa.it" className="text-[var(--fr-red)] hover:underline">
              info@formula-rossa.it
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}