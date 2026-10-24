/**
 * components/ui/TikTokIcon.jsx
 * Il logo di TikTok, che lucide-react non ha. Stessa interfaccia delle icone
 * lucide (className, aria-hidden), così si usa negli stessi elenchi.
 */

export default function TikTokIcon({ className = '', ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.04-2.82h-3.1v12.4a2.6 2.6 0 0 1-2.6 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.38-2.48V9.66a5.7 5.7 0 0 0-.78-.05A5.7 5.7 0 0 0 4.16 15.3 5.7 5.7 0 0 0 9.86 21a5.7 5.7 0 0 0 5.7-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.26-1.48Z" />
    </svg>
  );
}
