"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface BoardingPermitModalProps {
  offer: {
    id: string;
    expires_at: string;
    registration_id: string;
    crew_name?: string;
  };
  onClaimed: () => void;
  onExpired: () => void;
}

export function BoardingPermitModal({
  offer,
  onClaimed,
  onExpired,
}: BoardingPermitModalProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({
    minutes: 10,
    seconds: 0,
  });
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(offer.expires_at).getTime();
      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        onExpired();
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [offer.expires_at, onExpired]);

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to claim berth.");
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#d4af37", "#ffffff", "#c41e3a"],
      });

      onClaimed();
    } catch (err: any) {
      setError(err.message || "Failed to secure berth.");
    } finally {
      setClaiming(false);
    }
  };

  const formattedTime = `${String(timeLeft.minutes).padStart(2, "0")}:${String(
    timeLeft.seconds
  ).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marine-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-marine-900 via-[#102347] to-marine-950 border-2 border-tesoro-gold p-8 shadow-gold-glow-lg text-center overflow-hidden"
      >
        {/* Ornaments */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-tesoro-gold/15 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-marine-950 border border-tesoro-gold/40 text-xs font-mono text-tesoro-gold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Priority Allocation Extended</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
          A BERTH HAS OPENED
        </h3>
        <p className="text-xs font-mono text-tesoro-amber uppercase tracking-widest mt-1">
          THE GRAND LINE HAS CHOSEN YOU.
        </p>

        {/* Boarding Permit Badge */}
        <div className="my-6 p-6 rounded-2xl bg-marine-950/90 border border-tesoro-gold/30 shadow-inner">
          <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">
            Official Gala Charter
          </div>
          <div className="text-2xl font-serif font-bold text-tesoro-gold mt-1">
            BOARDING PERMIT
          </div>

          {/* Countdown Clock */}
          <div className="mt-4 flex flex-col items-center">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-reverie-crimson animate-pulse" />
              <span>CLAIM WINDOW REMAINING</span>
            </div>
            <div className="text-5xl sm:text-6xl font-mono font-black text-white tracking-tight mt-1 crimson-shimmer">
              {formattedTime}
            </div>
            <p className="text-[10px] text-gray-400 font-mono mt-1">
              Synchronized to fleet server clock. Page refresh will not reset this window.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-reverie-crimson/20 border border-reverie-crimson text-xs font-mono text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-reverie-crimson shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-tesoro-gold via-tesoro-amber to-tesoro-bronze text-marine-950 font-serif font-bold text-lg tracking-widest uppercase shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {claiming ? "SECURING BERTH..." : "CLAIM MY BERTH"}
        </button>
      </motion.div>
    </div>
  );
}
