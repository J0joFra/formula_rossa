export default function ErrorMessage({
  error,
  context = '',
  onRetry = null,
}) {
  const message = error?.message || error || 'Errore sconosciuto';

  return (
    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-sm mt-0.5">⚠</span>
        <div className="flex-1">
          <p className="text-xs text-[var(--ferrari-red)] font-mono leading-relaxed">
            {context && (
              <span className="font-black uppercase tracking-widest mr-2">
                {context}:
              </span>
            )}
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-[10px] text-red-500/60 hover:text-[var(--ferrari-red)] uppercase tracking-widest font-mono transition-colors"
            >
              → Riprova
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


/*
import ErrorMessage from '../components/ferrari/ErrorMessage';

// Semplice:
{error && <ErrorMessage error={error} />}

// Con contesto e retry:
{error && (
  <ErrorMessage
    error={error}
    context="Standings"
    onRetry={() => loadStandings()}
  />
)}
  */