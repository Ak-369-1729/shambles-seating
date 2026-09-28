"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Gold coin ember
function GoldEmber({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        background: "radial-gradient(circle, #ffbf00, #d4af37)",
        boxShadow: "0 0 6px #ffbf00",
      }}
      animate={{ y: [0, -80], opacity: [1, 0], scale: [1, 0.2] }}
      transition={{ duration: 3 + delay, delay, repeat: Infinity, ease: "easeOut" }}
    />
  );
}

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  x: 5 + Math.random() * 90,
  y: 60 + Math.random() * 35,
  delay: Math.random() * 4,
}));

// Parchment compass needle component
function CompassCountdown({ pct, timeStr }: { pct: number; timeStr: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const isUrgent = pct < 0.25;

  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      {/* Outer ornamental ring */}
      <div className="absolute inset-0 rounded-full border border-dashed"
        style={{ borderColor: "rgba(212,175,55,0.2)" }} />
      {/* Tick marks */}
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="absolute w-px h-2.5 bg-tesoro-gold/40 origin-bottom"
          style={{
            left: "calc(50% - 0.5px)",
            bottom: "50%",
            transform: `rotate(${i * 30}deg) translateY(72px)`,
          }}
        />
      ))}
      {/* SVG arc */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="rgba(8,18,38,0.9)" strokeWidth="8" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke={isUrgent ? "#c41e3a" : "#d4af37"}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
            filter: isUrgent
              ? "drop-shadow(0 0 6px rgba(196,30,58,0.8))"
              : "drop-shadow(0 0 6px rgba(212,175,55,0.8))",
          }}
        />
      </svg>
      {/* Center */}
      <div className="relative z-10 text-center">
        <div className={`text-3xl font-mono font-black leading-none ${isUrgent ? "text-reverie-crimson" : "text-white"}`}
          style={{ textShadow: isUrgent ? "0 0 20px rgba(196,30,58,0.6)" : "0 0 20px rgba(212,175,55,0.4)" }}>
          {timeStr}
        </div>
        <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">REMAINING</div>
      </div>
    </div>
  );
}

export function BoardingPermitModal({ offer, onClaimed, onExpired }: BoardingPermitModalProps) {
  const [timeLeft, setTimeLeft] = useState({ minutes: 10, seconds: 0, totalSeconds: 600 });
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"intro" | "permit" | "claimed">("intro");
  const initialTotalRef = useRef<number | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const expiry = new Date(offer.expires_at).getTime();
      const distance = Math.max(0, expiry - now);
      const totalSeconds = Math.floor(distance / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (initialTotalRef.current === null) {
        initialTotalRef.current = totalSeconds || 600;
      }

      setTimeLeft({ minutes, seconds, totalSeconds });

      if (distance <= 0) {
        onExpired();
      }
    };
    updateCountdown();
    const iv = setInterval(updateCountdown, 1000);
    return () => clearInterval(iv);
  }, [offer.expires_at, onExpired]);

  // Intro → permit transition
  useEffect(() => {
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("permit"), 2200);
      return () => clearTimeout(t);
    }
  }, [phase]);

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
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to claim berth.");

      setPhase("claimed");
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#d4af37", "#ffbf00", "#ffffff", "#c41e3a"],
      });
      setTimeout(() => onClaimed(), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to secure berth.");
    } finally {
      setClaiming(false);
    }
  };

  const pct = initialTotalRef.current
    ? timeLeft.totalSeconds / initialTotalRef.current
    : 1;
  const timeStr = `${String(timeLeft.minutes).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(1,5,9,0.92)", backdropFilter: "blur(16px)" }}
    >
      {/* Gold embers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {EMBERS.map((e, i) => <GoldEmber key={i} {...e} />)}
      </div>

      {/* ── INTRO PHASE: SHAMBLES dramatic reveal ── */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="text-center pointer-events-none"
          >
            {/* Rift ring */}
            <motion.div
              className="w-40 h-40 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-tesoro-gold"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              style={{
                background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(4,12,28,0.9) 70%)",
                boxShadow: "0 0 60px rgba(212,175,55,0.6), inset 0 0 40px rgba(212,175,55,0.2)",
              }}
            >
              <span className="text-5xl">⚓</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-[11px] font-mono tracking-[0.4em] text-tesoro-gold/70 uppercase mb-2">
                Priority Allocation Activated
              </div>
              <div className="text-4xl sm:text-6xl font-serif font-black gold-shimmer tracking-wider">
                A BERTH HAS OPENED
              </div>
              <div className="mt-3 text-sm font-mono text-tesoro-amber/90 tracking-[0.3em] uppercase">
                THE GRAND LINE HAS CHOSEN YOU.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PERMIT PHASE: Boarding Permit parchment ── */}
      <AnimatePresence>
        {phase === "permit" && (
          <motion.div
            key="permit"
            className="relative w-full max-w-lg"
            initial={{ opacity: 0, y: -40, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 18, stiffness: 120 }}
            style={{ perspective: "1000px" }}
          >
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-3xl opacity-40 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(212,175,55,0.3) 0%, transparent 70%)",
              }}
            />

            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(30,20,4,0.98) 0%, rgba(10,8,2,0.99) 100%)",
                border: "2px solid rgba(212,175,55,0.5)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.25)",
              }}
            >
              {/* Gold top bar */}
              <div className="h-1.5 w-full" style={{
                background: "linear-gradient(90deg, transparent, #d4af37, #ffbf00, #d4af37, transparent)"
              }} />

              <div className="p-8 text-center">
                {/* Header badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-[10px] font-mono tracking-[0.3em] uppercase"
                  style={{
                    background: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.35)",
                    color: "#d4af37",
                  }}>
                  <span>⚓</span>
                  <span>Official Gala Charter</span>
                  <span>⚓</span>
                </div>

                {/* Title */}
                <div className="text-3xl font-serif font-black gold-shimmer tracking-[0.15em] mb-1">
                  BOARDING PERMIT
                </div>
                {offer.crew_name && (
                  <div className="text-xs font-mono text-tesoro-amber/80 uppercase tracking-widest mb-6">
                    {offer.crew_name}
                  </div>
                )}

                {/* Compass countdown */}
                <CompassCountdown pct={pct} timeStr={timeStr} />

                {/* Parchment divider */}
                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4))" }} />
                  <span className="text-tesoro-gold/40 text-xs">✦</span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.4), transparent)" }} />
                </div>

                {/* Sub-text */}
                <p className="text-[11px] font-mono text-gray-400 leading-relaxed mb-6">
                  Server-authoritative window. Page refresh will not reset this countdown.
                  Synchronized to fleet clock across all devices.
                </p>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl text-xs font-mono text-white flex items-center gap-2"
                    style={{ background: "rgba(196,30,58,0.15)", border: "1px solid rgba(196,30,58,0.4)" }}>
                    <span className="text-reverie-crimson">⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Claim button */}
                <motion.button
                  onClick={handleClaim}
                  disabled={claiming}
                  whileHover={{ scale: claiming ? 1 : 1.03 }}
                  whileTap={{ scale: claiming ? 1 : 0.97 }}
                  className="w-full py-5 rounded-2xl font-serif font-black text-lg tracking-[0.2em] uppercase disabled:opacity-50 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #996515, #d4af37, #ffbf00, #d4af37, #996515)",
                    color: "#010509",
                    boxShadow: claiming ? "none" : "0 0 40px rgba(212,175,55,0.5), 0 8px 30px rgba(0,0,0,0.5)",
                  }}
                >
                  {claiming ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      SECURING BERTH...
                    </span>
                  ) : "⚓ CLAIM MY BERTH"}
                </motion.button>
              </div>

              {/* Bottom gold bar */}
              <div className="h-px w-full" style={{
                background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)"
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CLAIMED PHASE ── */}
      <AnimatePresence>
        {phase === "claimed" && (
          <motion.div
            key="claimed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="text-center"
          >
            <motion.div
              className="text-8xl mb-6"
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.8 }}
            >
              ⚓
            </motion.div>
            <div className="text-4xl sm:text-6xl font-serif font-black gold-shimmer tracking-wider">
              BERTH SECURED
            </div>
            <div className="mt-3 text-sm font-mono text-tesoro-amber/90 tracking-[0.3em] uppercase">
              THE GRAND LINE AWAITS.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
