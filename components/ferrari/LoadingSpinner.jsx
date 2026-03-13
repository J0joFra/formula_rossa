export default function LoadingSpinner({ size = 'md', message = 'Caricamento...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-2 border-[var(--border-light)]`} />
        <div className={`${sizes[size]} rounded-full border-2 border-t-red-600 border-r-red-600/30 border-b-transparent border-l-transparent animate-spin absolute inset-0`} />
      </div>
      {message && (
        <p className="text-[10px] text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
          {message}
        </p>
      )}
    </div>
  );
}

// Usage example:
// import LoadingSpinner from '../components/ferrari/LoadingSpinner';

// Nei tuoi useEffect/loading state:
// if (loading) return <LoadingSpinner size="lg" message="Caricamento dati..." />;

// Inline in una sezione:
// {loading && <LoadingSpinner size="sm" message="Aggiornamento..." />}