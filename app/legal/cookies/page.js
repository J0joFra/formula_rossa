import { Cookie, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CookiesPage() {
  const lastUpdate = "18 febbraio 2026";
  
  const cookies = [
    {
      name: "cookie_consent",
      duration: "1 anno",
      purpose: "Memorizza le tue preferenze sui cookie",
      type: "Tecnico"
    },
    {
      name: "session_id",
      duration: "Sessione",
      purpose: "Mantiene la sessione di navigazione",
      type: "Tecnico"
    }
  ];

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
          <Cookie className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl md:text-4xl font-black text-white">
            COOKIE <span className="text-red-600">POLICY</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Ultimo aggiornamento: {lastUpdate}</span>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Cosa sono i cookie</h2>
          <p className="text-gray-400">
            I cookie sono piccoli file di testo che i siti web visitati inviano al tuo browser 
            e che vengono memorizzati sul tuo dispositivo per migliorare l'esperienza di navigazione.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Cookie utilizzati</h2>
          <p className="text-gray-400 mb-4">
            Formula Rossa utilizza solo cookie tecnici necessari al funzionamento del sito. 
            Non utilizziamo cookie di profilazione o marketing.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300">Nome cookie</th>
                  <th className="text-left py-3 px-4 text-gray-300">Durata</th>
                  <th className="text-left py-3 px-4 text-gray-300">Finalità</th>
                  <th className="text-left py-3 px-4 text-gray-300">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((cookie, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 px-4 text-gray-400">{cookie.name}</td>
                    <td className="py-3 px-4 text-gray-400">{cookie.duration}</td>
                    <td className="py-3 px-4 text-gray-400">{cookie.purpose}</td>
                    <td className="py-3 px-4">
                      <span className="bg-red-600/20 text-red-600 px-2 py-1 rounded-full text-xs">
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
          <h2 className="text-xl font-bold text-white mb-4">Gestione cookie</h2>
          <p className="text-gray-400">
            Puoi gestire le tue preferenze sui cookie direttamente dal browser:
          </p>
          <ul className="list-disc pl-6 text-gray-400 space-y-2 mt-4">
            <li>
              <strong className="text-white">Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie
            </li>
            <li>
              <strong className="text-white">Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie
            </li>
            <li>
              <strong className="text-white">Safari:</strong> Preferenze → Privacy → Cookie
            </li>
            <li>
              <strong className="text-white">Edge:</strong> Impostazioni → Cookie e autorizzazioni
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}