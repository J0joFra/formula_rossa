import { Database } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Database,
  title = 'Nessun dato',
  description = 'I dati non sono ancora disponibili',
  action = null, // { label: 'Riprova', onClick: fn }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-[var(--border-light)] rounded-2xl bg-[var(--bg-tertiary)]/20">
      <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-tertiary)] text-center max-w-xs leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 border border-[var(--ferrari-red)]/30 rounded-lg hover:bg-[var(--ferrari-red)]/10 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Usage example:
// import EmptyState from '../components/ferrari/EmptyState';
// import { Trophy, Calendar } from 'lucide-react';

// Semplice:
// {results.length === 0 && <EmptyState />}

// Con icona e testo custom:
// {calendar.length === 0 && (
//   <EmptyState
//     icon={Calendar}
//     title="Nessuna gara trovata"
//     description="Il calendario per questa stagione non è ancora disponibile"
//   />
// )}

// Con bottone di retry:
// {error && (
//   <EmptyState
//     icon={Trophy}
//     title="Errore caricamento"
//     description="Impossibile caricare i dati"
//     action={{ label: 'Riprova', onClick: () => loadStandings() }}
//  />
//)}