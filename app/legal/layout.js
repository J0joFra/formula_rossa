export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      {children}
    </div>
  );
}