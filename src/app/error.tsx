"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-marine-950 text-[#F4E8C1] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-marine-900 border border-reverie-crimson flex items-center justify-center mb-4 shadow-crimson-glow">
        <AlertTriangle className="w-8 h-8 text-reverie-crimson" />
      </div>
      <h1 className="text-3xl font-serif font-black text-white">
        FLEET ENGINE DISRUPTION
      </h1>
      <p className="text-xs font-mono text-gray-400 max-w-md mt-2">
        An unexpected turbulence interrupted communication with the Admiralty servers.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-tesoro-gold text-marine-950 font-serif font-bold text-xs uppercase tracking-wider hover:bg-tesoro-amber transition-colors shadow-gold-glow"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Recalibrate Coordinates</span>
      </button>
    </div>
  );
}
