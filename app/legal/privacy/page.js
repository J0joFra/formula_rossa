import { Shield, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
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
            <Shield className="w-8 h-8 text-[var(--fr-red)]" />
            <h1 className="text-3xl md:text-4xl font-black text-[var(--fr-text)]">
              PRIVACY <span className="text-[var(--fr-red)]">POLICY</span>
            </h1>
          </div>
        </div>

        <div className="border border-[var(--fr-border)] bg-[var(--fr-surface)] rounded-xl p-8 text-[var(--fr-text-muted)] space-y-6">
          
          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Chi siamo</h2>
            <p className="text-[var(--fr-text-muted)]">
              Formula Rossa è un progetto indipendente creato da appassionati, dedicato all'analisi statistica 
              e alla storia della Scuderia Ferrari in Formula 1. Non siamo affiliati a Ferrari S.p.A.
            </p>
            <p className="text-[var(--fr-text-muted)] mt-2">
              Indirizzo del sito: <a href="https://formula-rossa.it" className="text-[var(--fr-red)]">https://formula-rossa.it</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Quali dati personali raccogliamo</h2>
            
            <h3 className="text-xl font-semibold text-[var(--fr-text)] mt-4 mb-2">Cookie</h3>
            <p className="text-[var(--fr-text-muted)]">
              Utilizziamo cookie tecnici necessari al funzionamento del sito, cookie analitici
              (Google Analytics) e cookie di profilazione pubblicitaria (Google AdSense). Per
              maggiori dettagli ed istruzioni su come gestirli o disabilitarli, consulta la nostra{" "}
              <Link href="/legal/cookies" className="text-[var(--fr-red)] hover:underline">
                Cookie Policy
              </Link>.
            </p>

            <h3 className="text-xl font-semibold text-[var(--fr-text)] mt-4 mb-2">Accesso con Google</h3>
            <p className="text-[var(--fr-text-muted)]">
              Se scegli di autenticarti tramite il tuo account Google, riceviamo dal profilo il
              tuo nome, il tuo indirizzo email e l&apos;immagine del profilo, al solo fine di
              gestire la sessione e le funzionalità riservate agli utenti registrati.
            </p>

            <h3 className="text-xl font-semibold text-[var(--fr-text)] mt-4 mb-2">Dati di navigazione</h3>
            <p className="text-[var(--fr-text-muted)]">
              Come tutti i siti web, raccogliamo automaticamente alcuni dati tecnici come:
            </p>
            <ul className="list-disc pl-6 text-[var(--fr-text-muted)] mt-2 space-y-1">
              <li>Indirizzo IP (in forma anonima)</li>
              <li>Tipo di browser e dispositivo</li>
              <li>Pagine visitate</li>
              <li>Data e ora della visita</li>
            </ul>

            <h3 className="text-xl font-semibold text-[var(--fr-text)] mt-4 mb-2">Dati forniti volontariamente</h3>
            <p className="text-[var(--fr-text-muted)]">
              Se ci contatti via email all'indirizzo info@formula-rossa.it, conserveremo la tua email
              e i dati personali che ci fornisci esclusivamente per rispondere alla tua richiesta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Servizi di terze parti</h2>
            <p className="text-[var(--fr-text-muted)]">
              Per erogare il servizio ci affidiamo a fornitori che possono trattare dati per nostro
              conto o come titolari autonomi:
            </p>
            <ul className="list-disc pl-6 text-[var(--fr-text-muted)] mt-2 space-y-1">
              <li><strong className="text-[var(--fr-text)]">Google</strong> — accesso con account Google, Google Analytics, Google AdSense e Google Fonts</li>
              <li><strong className="text-[var(--fr-text)]">Supabase</strong> — database delle statistiche F1 (dati sportivi, non personali)</li>
              <li><strong className="text-[var(--fr-text)]">Google Firebase</strong> — servizi di supporto all'infrastruttura</li>
              <li><strong className="text-[var(--fr-text)]">Vercel</strong> — hosting e distribuzione del sito</li>
            </ul>
            <p className="text-[var(--fr-text-muted)] mt-2">
              Ciascun fornitore tratta i dati secondo la propria informativa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Base giuridica del trattamento</h2>
            <p className="text-[var(--fr-text-muted)]">
              Trattiamo i tuoi dati solo per:
            </p>
            <ul className="list-disc pl-6 text-[var(--fr-text-muted)] mt-2">
              <li>Fornire e migliorare i nostri servizi (legittimo interesse)</li>
              <li>Gestire l'autenticazione e l'account utente (esecuzione di un servizio richiesto)</li>
              <li>Garantire la sicurezza del sito (legittimo interesse)</li>
              <li>Statistiche di utilizzo tramite cookie analitici (consenso)</li>
              <li>Pubblicità tramite cookie di terze parti (consenso)</li>
              <li>Adempiere a obblighi di legge</li>
              <li>Rispondere alle tue richieste di contatto (consenso)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">I tuoi diritti</h2>
            <p className="text-[var(--fr-text-muted)]">
              Hai il diritto di:
            </p>
            <ul className="list-disc pl-6 text-[var(--fr-text-muted)] mt-2">
              <li>Accedere ai tuoi dati personali</li>
              <li>Richiederne la rettifica o cancellazione</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
            <p className="text-[var(--fr-text-muted)] mt-4">
              Per esercitare i tuoi diritti, scrivici a:{" "}
              <a href="mailto:info@formula-rossa.it" className="text-[var(--fr-red)] hover:underline">
                info@formula-rossa.it
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Dove inviamo i tuoi dati</h2>
            <p className="text-[var(--fr-text-muted)]">
              Alcuni fornitori (ad es. Google, Vercel, Supabase) possono trattare i dati anche al di
              fuori dell'Unione Europea. In tali casi il trasferimento avviene sulla base di garanzie
              adeguate previste dal GDPR, come le Clausole Contrattuali Standard approvate dalla
              Commissione Europea. Non vendiamo i tuoi dati personali.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Modifiche a questa policy</h2>
            <p className="text-[var(--fr-text-muted)]">
              Ci riserviamo il diritto di aggiornare questa privacy policy. Le modifiche saranno pubblicate su 
              questa pagina con la data di aggiornamento. Ti consigliamo di consultare periodicamente questa pagina.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--fr-text)] mb-4">Contatti</h2>
            <p className="text-[var(--fr-text-muted)]">
              Per qualsiasi domanda sulla privacy policy, puoi contattarci a:
            </p>
            <ul className="list-none text-[var(--fr-text-muted)] mt-2">
              <li>Email: <a href="mailto:info@formula-rossa.it" className="text-[var(--fr-red)]">info@formula-rossa.it</a></li>
              <li>GitHub: <a href="https://github.com/J0joFra" className="text-[var(--fr-red)]">@J0joFra</a></li>
            </ul>
          </section>

          <div className="border-t border-[var(--fr-border)] pt-4 mt-8">
            <p className="text-xs text-[var(--fr-text-faint)] text-center">
              Ultimo aggiornamento: 27 agosto 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
