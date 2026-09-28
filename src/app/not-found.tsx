import Link from "next/link";
import { Compass, Anchor } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-marine-950 text-[#F4E8C1] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-marine-900 border border-tesoro-gold/40 flex items-center justify-center mb-4 shadow-gold-glow">
        <Anchor className="w-8 h-8 text-tesoro-gold" />
      </div>
      <h1 className="text-6xl font-mono font-black text-tesoro-gold">404</h1>
      <h2 className="text-2xl font-serif font-bold text-white mt-2">
        UNCHARTED WATERS
      </h2>
      <p className="text-xs font-mono text-gray-400 max-w-md mt-2">
        The port coordinates you navigated to do not exist within the Grand Line Fleet logs.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-2.5 rounded-lg bg-tesoro-gold text-marine-950 font-serif font-bold text-xs uppercase tracking-wider hover:bg-tesoro-amber transition-colors shadow-gold-glow"
      >
        Return to Safe Harbor
      </Link>
    </div>
  );
}
