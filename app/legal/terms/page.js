import { Scale, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdate = "18 Febbbraio 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Torna alla home</span>
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl md:text-4xl font-black text-white">
            TERMINI E <span className="text-red-600">CONDIZIONI</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Ultimo aggiornamento: {lastUpdate}</span>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4">1. Accettazione dei termini</h2>
          <p className="text-gray-400">
            Utilizzando il sito Formula Rossa, accetti i presenti termini e condizioni. 
            Se non accetti, ti preghiamo di non utilizzare il sito.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">2. Proprietà intellettuale</h2>
          <p className="text-gray-400">
            Tutti i contenuti del sito (testi, grafiche, logo, dati statistici) sono di proprietà 
            di Formula Rossa o utilizzati con licenza. È vietata la riproduzione senza autorizzazione.
          </p>
          <p className="text-gray-400 mt-4">
            <strong className="text-white">Nota bene:</strong> I marchi Ferrari, Scuderia Ferrari 
            e relativi loghi sono di proprietà di Ferrari S.p.A. e vengono utilizzati solo a scopo 
            informativo e di cronaca.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">3. Utilizzo dei dati</h2>
          <p className="text-gray-400">
            I dati statistici presenti sul sito sono raccolti da fonti pubbliche e ufficiali. 
            Pur impegnandoci a garantire l'accuratezza, non possiamo garantire la completezza 
            o l'assenza di errori.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">4. Limitazione di responsabilità</h2>
          <p className="text-gray-400">
            Formula Rossa non sarà responsabile per:
          </p>
          <ul className="list-disc pl-6 text-gray-400 space-y-2 mt-4">
            <li>Eventuali errori o imprecisioni nei dati</li>
            <li>Danni derivanti dall'uso delle informazioni presenti sul sito</li>
            <li>Contenuti di siti terzi collegati</li>
            <li>Interruzioni temporanee del servizio</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">5. Modifiche</h2>
          <p className="text-gray-400">
            Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
            Le modifiche saranno efficaci dalla data di pubblicazione.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">6. Contatti</h2>
          <p className="text-gray-400">
            Per qualsiasi domanda sui termini e condizioni, contattaci a:{" "}
            <a href="mailto:contatti@formula-rossa.it" className="text-red-600 hover:underline">
              contatti@formula-rossa.it
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}