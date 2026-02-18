import { Shield, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdate = "18 febbraio 2026";
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Torna alla home</span>
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl md:text-4xl font-black text-white">
            PRIVACY <span className="text-red-600">POLICY</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Ultimo aggiornamento: {lastUpdate}</span>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-invert prose-red max-w-none">
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Chi siamo</h2>
            <p className="text-gray-400">
              Formula Rossa è un progetto indipendente di data intelligence dedicato alla Scuderia Ferrari. 
              Il sito è gestito da appassionati e non è affiliato a Ferrari S.p.A.
            </p>
            <p className="text-gray-400 mt-2">
              Per contattarci: <a href="mailto:privacy@formularossa.it" className="text-red-600 hover:underline">privacy@formularossa.it</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Dati che raccogliamo</h2>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">2.1 Dati di navigazione</h3>
            <p className="text-gray-400">
              Come tutti i siti web, raccogliamo automaticamente alcuni dati tecnici:
            </p>
            <ul className="list-disc pl-6 text-gray-400 space-y-2 mt-2">
              <li>Indirizzo IP (anonimizzato)</li>
              <li>Tipo di browser e dispositivo</li>
              <li>Pagine visitate e tempo di navigazione</li>
              <li>URL di provenienza</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-300 mb-2 mt-6">2.2 Cookie</h3>
            <p className="text-gray-400">
              Utilizziamo solo cookie tecnici necessari al funzionamento del sito. 
              Per maggiori dettagli, consulta la nostra{" "}
              <Link href="/legal/cookies" className="text-red-600 hover:underline">
                Cookie Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Base giuridica del trattamento</h2>
            <p className="text-gray-400">
              Trattiamo i tuoi dati solo per:
            </p>
            <ul className="list-disc pl-6 text-gray-400 space-y-2 mt-2">
              <li>Fornire e migliorare i nostri servizi (legittimo interesse)</li>
              <li>Garantire la sicurezza del sito (legittimo interesse)</li>
              <li>Adempiere a obblighi di legge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. I tuoi diritti</h2>
            <p className="text-gray-400">
              Hai il diritto di:
            </p>
            <ul className="list-disc pl-6 text-gray-400 space-y-2 mt-2">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiederne la rettifica o cancellazione</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
            <p className="text-gray-400 mt-4">
              Per esercitare i tuoi diritti, scrivici a: <a href="mailto:privacy@formularossa.it" className="text-red-600 hover:underline">privacy@formularossa.it</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Modifiche alla privacy policy</h2>
            <p className="text-gray-400">
              Ci riserviamo il diritto di aggiornare questa privacy policy. 
              Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}