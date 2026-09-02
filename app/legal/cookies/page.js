import { Cookie, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  const lastUpdate = "27 agosto 2026";

  const cookies = [
    {
      name: "NextAuth (sessione)",
      duration: "Sessione",
      purpose: "Mantiene l'accesso dell'utente registrato",
      type: "Tecnico"
    },
    {
      name: "theme (localStorage)",
      duration: "Persistente",
      purpose: "Ricorda la preferenza di tema chiaro/scuro",
      type: "Tecnico"
    },
    {
      name: "Google Analytics (_ga, _ga_*)",
      duration: "Fino a 24 mesi",
      purpose: "Statistiche di utilizzo aggregate",
      type: "Analitico"
    },
    {
      name: "Google AdSense",
      duration: "Variabile",
      purpose: "Pubblicità personalizzata",
      type: "Profilazione"
    }
  ];

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
          <Cookie className="w-8 h-8 text-[var(--fr-red)]" />
          <h1 className="text-3xl md:text-4xl font-black text-[var(--fr-text)]">
            COOKIE <span className="text-[var(--fr-red)]">POLICY</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--fr-text-faint)]">
          <Calendar className="w-4 h-4" />
          <span>Ultimo aggiornamento: {lastUpdate}</span>
        </div>
      </div>

      <div className="border border-[var(--fr-border)] bg-[var(--fr-surface)] rounded-xl p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">Cosa sono i cookie</h2>
          <p className="text-[var(--fr-text-muted)]">
            I cookie sono piccoli file di testo che i siti web visitati inviano al tuo browser 
            e che vengono memorizzati sul tuo dispositivo per migliorare l'esperienza di navigazione.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">Cookie utilizzati</h2>
          <p className="text-[var(--fr-text-muted)] mb-4">
            Formula Rossa utilizza cookie tecnici necessari al funzionamento del sito, cookie
            analitici (Google Analytics) per statistiche aggregate e cookie di profilazione
            pubblicitaria (Google AdSense) che contribuiscono a sostenere il progetto.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--fr-border)]">
                  <th className="text-left py-3 px-4 text-[var(--fr-text-muted)]">Nome cookie</th>
                  <th className="text-left py-3 px-4 text-[var(--fr-text-muted)]">Durata</th>
                  <th className="text-left py-3 px-4 text-[var(--fr-text-muted)]">Finalità</th>
                  <th className="text-left py-3 px-4 text-[var(--fr-text-muted)]">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((cookie, index) => (
                  <tr key={index} className="border-b border-[var(--fr-border)]">
                    <td className="py-3 px-4 text-[var(--fr-text-muted)]">{cookie.name}</td>
                    <td className="py-3 px-4 text-[var(--fr-text-muted)]">{cookie.duration}</td>
                    <td className="py-3 px-4 text-[var(--fr-text-muted)]">{cookie.purpose}</td>
                    <td className="py-3 px-4">
                      <span className="bg-[var(--fr-red-soft)] text-[var(--fr-red)] px-2 py-1 rounded-full text-xs">
                        {cookie.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--fr-text)] mb-4">Gestione cookie</h2>
          <p className="text-[var(--fr-text-muted)] mb-4">
            Al primo accesso ti chiediamo il consenso tramite un banner: i cookie analitici e
            pubblicitari vengono attivati solo se li accetti. Puoi modificare la tua scelta in
            qualsiasi momento dalla voce <strong className="text-[var(--fr-text)]">&laquo;Preferenze cookie&raquo;</strong> nel
            footer del sito.
          </p>
          <p className="text-[var(--fr-text-muted)]">
            Puoi inoltre gestire le tue preferenze sui cookie direttamente dal browser:
          </p>
          <ul className="list-disc pl-6 text-[var(--fr-text-muted)] space-y-2 mt-4">
            <li>
              <strong className="text-[var(--fr-text)]">Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie
            </li>
            <li>
              <strong className="text-[var(--fr-text)]">Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie
            </li>
            <li>
              <strong className="text-[var(--fr-text)]">Safari:</strong> Preferenze → Privacy → Cookie
            </li>
            <li>
              <strong className="text-[var(--fr-text)]">Edge:</strong> Impostazioni → Cookie e autorizzazioni
            </li>
          </ul>
          <p className="text-[var(--fr-text-muted)] mt-4">
            Per i cookie di Google puoi inoltre gestire le preferenze pubblicitarie dalle{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--fr-red)] hover:underline">
              Impostazioni annunci Google
            </a>{" "}e disattivare Google Analytics con il{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[var(--fr-red)] hover:underline">
              componente aggiuntivo di opt-out
            </a>. Consulta anche l&apos;{" "}
            <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-[var(--fr-red)] hover:underline">
              informativa sui cookie di Google
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}