import { Shield, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
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
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-black text-white">
              PRIVACY <span className="text-red-600">POLICY</span>
            </h1>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 text-gray-300 space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Chi siamo</h2>
            <p className="text-gray-400">
              Formula Rossa è un progetto indipendente creato da appassionati, dedicato all'analisi statistica 
              e alla storia della Scuderia Ferrari in Formula 1. Non siamo affiliati a Ferrari S.p.A.
            </p>
            <p className="text-gray-400 mt-2">
              Indirizzo del sito: <a href="https://formula-rossa.it" className="text-red-600">https://formula-rossa.it</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Quali dati personali raccogliamo</h2>
            
            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Cookie</h3>
            <p className="text-gray-400">
              Utilizziamo solo cookie tecnici necessari al funzionamento del sito. Non usiamo cookie di profilazione 
              o marketing. Per maggiori dettagli, consulta la nostra{" "}
              <Link href="/legal/cookies" className="text-red-600 hover:underline">
                Cookie Policy
              </Link>.
            </p>

            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Dati di navigazione</h3>
            <p className="text-gray-400">
              Come tutti i siti web, raccogliamo automaticamente alcuni dati tecnici come:
            </p>
            <ul className="list-disc pl-6 text-gray-400 mt-2 space-y-1">
              <li>Indirizzo IP (in forma anonima)</li>
              <li>Tipo di browser e dispositivo</li>
              <li>Pagine visitate</li>
              <li>Data e ora della visita</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-4 mb-2">Dati forniti volontariamente</h3>
            <p className="text-gray-400">
              Se ci contatti via email all'indirizzo contact@formula-rossa.it, conserveremo la tua email 
              e i dati personali che ci fornisci esclusivamente per rispondere alla tua richiesta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Base giuridica del trattamento</h2>
            <p className="text-gray-400">
              Trattiamo i tuoi dati solo per:
            </p>
            <ul className="list-disc pl-6 text-gray-400 mt-2">
              <li>Fornire e migliorare i nostri servizi (legittimo interesse)</li>
              <li>Garantire la sicurezza del sito (legittimo interesse)</li>
              <li>Adempiere a obblighi di legge</li>
              <li>Rispondere alle tue richieste di contatto (consenso)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">I tuoi diritti</h2>
            <p className="text-gray-400">
              Hai il diritto di:
            </p>
            <ul className="list-disc pl-6 text-gray-400 mt-2">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiederne la rettifica o cancellazione</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
            <p className="text-gray-400 mt-4">
              Per esercitare i tuoi diritti, scrivici a:{" "}
              <a href="mailto:privacy@formula-rossa.it" className="text-red-600 hover:underline">
                privacy@formula-rossa.it
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Dove inviamo i tuoi dati</h2>
            <p className="text-gray-400">
              I dati vengono elaborati all'interno dell'Unione Europea. Il sito è hostato su server situati in Europa.
              Non vendiamo né condividiamo i tuoi dati con terze parti per scopi di marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Modifiche a questa policy</h2>
            <p className="text-gray-400">
              Ci riserviamo il diritto di aggiornare questa privacy policy. Le modifiche saranno pubblicate su 
              questa pagina con la data di aggiornamento. Ti consigliamo di consultare periodicamente questa pagina.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contatti</h2>
            <p className="text-gray-400">
              Per qualsiasi domanda sulla privacy policy, puoi contattarci a:
            </p>
            <ul className="list-none text-gray-400 mt-2">
              <li>Email: <a href="mailto:privacy@formula-rossa.it" className="text-red-600">privacy@formula-rossa.it</a></li>
              <li>GitHub: <a href="https://github.com/J0joFra" className="text-red-600">@J0joFra</a></li>
            </ul>
          </section>

          <div className="border-t border-white/5 pt-4 mt-8">
            <p className="text-xs text-gray-500 text-center">
              Ultimo aggiornamento: 18 Febbraio 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
