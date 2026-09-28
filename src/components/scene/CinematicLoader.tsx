"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FastForward } from "lucide-react";

interface CinematicLoaderProps {
  onComplete: () => void;
}

// Star field for loader background
const LOADER_STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.3,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 6,
}));

// Ember particles for blast
const BLAST_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  distance: 80 + Math.random() * 120,
  size: Math.random() * 8 + 3,
  color: i % 3 === 0 ? "#fff3cd" : i % 3 === 1 ? "#ffbf00" : "#d4af37",
  duration: 1.2 + Math.random() * 0.8,
}));

const STEP_NARRATION: Record<number, string> = {
  1: "A sealed Gran Tesoro barrel arrives on deck...",
  2: "The ancient iron seals begin to shift...",
  3: "💥 The barrel BURSTS — golden gala embers ignite!",
  4: "Smoke envelopes the promenade deck...",
  5: "Captain Barnaby emerges from the golden haze!",
  6: "He marches toward the ceremonial flagship mast...",
  7: "Ascending the rigging lines, hand over hand...",
  8: "Raising the charter colors to the mast head...",
  9: "The Shambles banner unfurls in the Grand Line wind!",
  10: "High ocean winds catch the ceremonial insignia!",
  11: "Cloth ripples across the entire Grand Line horizon...",
  12: "Colors secured at full mast — Gala is declared!",
  13: "Welcome aboard. SHAMBLES SEATING awaits.",
};

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [step, setStep] = useState(1);
  const [skipped, setSkipped] = useState(false);
  const [showBlast, setShowBlast] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    const stepDurations = [
      1400, // 1. barrel rolls in
      1000, // 2. wobbles
      900,  // 3. barrel burst
      900,  // 4. smoke expands
      1100, // 5. pirate appears
      1000, // 6. approaches mast
      1200, // 7. climbs mast
      1000, // 8. raises flag
      1000, // 9. flag unfurls
      1000, // 10. wind catches
      1100, // 11. cloth physics
      1000, // 12. full height
      800,  // 13. transition out
    ];

    if (step === 3) setShowBlast(true);
    if (step === 5) setShowBlast(false);

    if (step <= 13) {
      const timer = setTimeout(() => {
        if (step === 13) {
          onComplete();
        } else {
          setStep((prev) => prev + 1);
        }
      }, stepDurations[step - 1] || 1000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  const handleSkip = () => {
    setSkipped(true);
    onComplete();
  };

  if (skipped) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020609 0%, #040a14 40%, #060e1e 100%)" }}
    >
      {/* Animated Star Field */}
      <div className="absolute inset-0 pointer-events-none">
        {LOADER_STARS.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Ocean horizon glow */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(8,30,70,0.8) 0%, transparent 70%)" }}
      />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-[110] flex items-center gap-1.5 px-4 py-2 rounded-full border border-tesoro-gold/50 text-xs font-mono text-tesoro-gold hover:bg-tesoro-gold hover:text-marine-950 transition-all cursor-pointer"
        style={{ background: "rgba(8,18,38,0.9)", backdropFilter: "blur(12px)" }}
      >
        <span>Skip Intro</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* ── Main Stage ── */}
      <div className="relative w-full max-w-lg h-[420px] flex items-center justify-center">

        {/* ── BARREL (Steps 1–2) ── */}
        <AnimatePresence>
          {step <= 2 && (
            <motion.div
              key="barrel"
              initial={{ x: -500, rotate: -720, opacity: 0 }}
              animate={
                step === 1
                  ? { x: 0, rotate: 0, opacity: 1 }
                  : { x: [0, -8, 8, -6, 6, 0], rotate: [0, -5, 5, -3, 3, 0], opacity: 1 }
              }
              exit={{ scale: [1, 1.4, 0], opacity: [1, 1, 0] }}
              transition={{
                duration: step === 1 ? 1.3 : 0.9,
                ease: step === 1 ? [0.22, 1, 0.36, 1] : "easeInOut",
              }}
              className="absolute flex items-center justify-center"
            >
              {/* Detailed wooden barrel SVG */}
              <div className="relative w-32 h-44">
                <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  {/* Wood grain */}
                  <defs>
                    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3d2208" />
                      <stop offset="25%" stopColor="#6b3c14" />
                      <stop offset="50%" stopColor="#8c5223" />
                      <stop offset="75%" stopColor="#6b3c14" />
                      <stop offset="100%" stopColor="#3d2208" />
                    </linearGradient>
                    <linearGradient id="ironBand" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1a1a1a" />
                      <stop offset="30%" stopColor="#555" />
                      <stop offset="60%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                  </defs>
                  {/* Barrel body */}
                  <ellipse cx="50" cy="70" rx="38" ry="62" fill="url(#woodGrad)" />
                  {/* Wood staves */}
                  <line x1="32" y1="8" x2="32" y2="132" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                  <line x1="41" y1="8" x2="41" y2="132" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                  <line x1="50" y1="8" x2="50" y2="132" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                  <line x1="59" y1="8" x2="59" y2="132" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                  <line x1="68" y1="8" x2="68" y2="132" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                  {/* Iron bands */}
                  <ellipse cx="50" cy="22" rx="36" ry="5" fill="url(#ironBand)" opacity="0.9" />
                  <ellipse cx="50" cy="50" rx="40" ry="6" fill="url(#ironBand)" opacity="0.9" />
                  <ellipse cx="50" cy="70" rx="42" ry="6" fill="url(#ironBand)" opacity="0.9" />
                  <ellipse cx="50" cy="90" rx="40" ry="6" fill="url(#ironBand)" opacity="0.9" />
                  <ellipse cx="50" cy="118" rx="36" ry="5" fill="url(#ironBand)" opacity="0.9" />
                  {/* Top cap */}
                  <ellipse cx="50" cy="10" rx="35" ry="10" fill="#2d1a08" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.6" />
                  {/* Shambles crest */}
                  <text x="50" y="74" textAnchor="middle" fontSize="18" fill="#d4af37" fontFamily="serif" fontWeight="bold" opacity="0.9">⚓</text>
                  <text x="50" y="88" textAnchor="middle" fontSize="8" fill="#d4af37" fontFamily="monospace" letterSpacing="2" opacity="0.7">SHAMBLES</text>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BLAST EXPLOSION (Step 3–4) ── */}
        <AnimatePresence>
          {showBlast && (
            <motion.div
              key="blast"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {/* Central flash */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 3, 5], opacity: [1, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute w-32 h-32 rounded-full"
                style={{ background: "radial-gradient(circle, #fff9e0 0%, #ffbf00 30%, #d4af37 60%, transparent 100%)" }}
              />
              {/* Smoke rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  initial={{ scale: 0.2, opacity: 0.6 }}
                  animate={{ scale: ring * 2.5, opacity: 0 }}
                  transition={{ duration: 1.8, delay: ring * 0.2, ease: "easeOut" }}
                  className="absolute rounded-full border-2 border-gray-400/40"
                  style={{ width: 80, height: 80 }}
                />
              ))}
              {/* Gold particle sparks */}
              {BLAST_PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{ width: p.size, height: p.size, background: p.color, top: "50%", left: "50%" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                    y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: p.duration, ease: [0.22, 0.61, 0.36, 1] }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAST (Steps 5–13) ── */}
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              key="mast"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute right-16 bottom-0 flex flex-col items-center pointer-events-none"
              style={{ height: 320 }}
            >
              {/* Crow's nest */}
              <div
                className="w-14 h-6 rounded-lg border border-tesoro-gold/50 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #3d2208, #6b3c14)", boxShadow: "0 0 8px rgba(212,175,55,0.2)" }}
              >
                <span className="text-[8px] font-mono text-tesoro-gold/70">TOP</span>
              </div>

              {/* Mast pole */}
              <div
                className="w-3.5 flex-1"
                style={{
                  background: "linear-gradient(90deg, #2d1a08, #6b3c14, #4a2810, #2d1a08)",
                  borderRadius: "2px",
                  boxShadow: "2px 0 8px rgba(0,0,0,0.6)",
                }}
              >
                {/* Rigging cross-beams */}
                {[60, 120, 180, 240].map((pos) => (
                  <div
                    key={pos}
                    className="absolute h-px"
                    style={{
                      top: pos,
                      left: -14,
                      right: -14,
                      background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
                    }}
                  />
                ))}
              </div>

              {/* Base anchor */}
              <div
                className="w-8 h-4 rounded-sm"
                style={{ background: "linear-gradient(90deg, #1a1a1a, #555, #1a1a1a)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CAPTAIN BARNABY (Steps 5–12) ── */}
        <AnimatePresence>
          {step >= 5 && step <= 12 && (
            <motion.div
              key="captain"
              initial={{ opacity: 0, scale: 0.4, y: 40 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: step >= 6 ? 85 : 0,
                y: step >= 7 ? (step >= 8 ? -180 : -100) : 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-10"
            >
              <svg viewBox="0 0 60 100" className="w-16 h-28 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                {/* Tricorn hat */}
                <path d="M15 35 Q30 20 45 35 L50 38 Q30 22 10 38 Z" fill="#0f0f1a" stroke="#d4af37" strokeWidth="1.5" />
                <circle cx="46" cy="36" r="4" fill="#8b0000" stroke="#d4af37" strokeWidth="1" />
                {/* Gold feather */}
                <path d="M48 33 Q56 24 54 18 Q50 24 48 33 Z" fill="#d4af37" opacity="0.9" />
                {/* Head */}
                <circle cx="30" cy="44" r="12" fill="#fcd5b4" stroke="#8a6c1b" strokeWidth="1" />
                {/* Eye patch */}
                <circle cx="24" cy="43" r="5" fill="#0f0f1a" />
                <line x1="20" y1="41" x2="28" y2="41" stroke="#0f0f1a" strokeWidth="2" />
                {/* Good eye */}
                <circle cx="36" cy="43" r="3" fill="#1a3d1a" />
                <circle cx="37" cy="42" r="1" fill="white" />
                {/* Grin */}
                <path d="M24 52 Q30 56 36 52" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                {/* Scar */}
                <line x1="33" y1="46" x2="37" y2="53" stroke="rgba(139,0,0,0.6)" strokeWidth="1" />
                {/* Captain coat body */}
                <rect x="18" y="56" width="24" height="30" rx="3" fill="#8b0000" />
                {/* Gold lapels */}
                <path d="M30 56 L22 65 L30 68 Z" fill="#d4af37" />
                <path d="M30 56 L38 65 L30 68 Z" fill="#d4af37" />
                {/* Gold buttons */}
                <circle cx="30" cy="70" r="2" fill="#d4af37" />
                <circle cx="30" cy="78" r="2" fill="#d4af37" />
                {/* Arms */}
                <rect x="7" y="58" width="10" height="20" rx="3" fill="#8b0000" />
                <rect x="43" y="58" width="10" height="20" rx="3" fill="#8b0000" />
                {/* Telescope */}
                <rect x="44" y="63" width="14" height="4" rx="2" fill="#d4af37" transform="rotate(-20, 44, 65)" />
                {/* Legs */}
                <rect x="20" y="86" width="9" height="12" rx="2" fill="#0f1a2e" />
                <rect x="31" y="86" width="9" height="12" rx="2" fill="#0f1a2e" />
                {/* Boots */}
                <rect x="19" y="95" width="11" height="5" rx="1" fill="#1a1a1a" />
                <rect x="30" y="95" width="11" height="5" rx="1" fill="#1a1a1a" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CEREMONIAL FLAG (Steps 8–13) ── */}
        <AnimatePresence>
          {step >= 8 && (
            <motion.div
              key="flag"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: 1,
                scaleY: step === 8 ? 0.3 : step === 9 ? 0.7 : 1,
              }}
              transition={{ duration: 0.7 }}
              className="absolute z-20 origin-top"
              style={{ right: "4.5rem", top: "1.5rem" }}
            >
              {/* Flag with cloth wave animation */}
              <motion.div
                animate={{ skewY: [0, 3, -2, 4, -1, 0], scaleX: [1, 0.97, 1.03, 0.96, 1.02, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative origin-left"
              >
                <div
                  className="w-52 h-32 rounded-r-xl overflow-hidden relative"
                  style={{
                    background: "linear-gradient(135deg, #040a1a 0%, #0c1f3d 40%, #081226 100%)",
                    border: "2px solid rgba(212,175,55,0.5)",
                    borderLeft: "none",
                    boxShadow: "0 0 30px rgba(212,175,55,0.35), inset 0 0 30px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Diagonal gold stripe */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: "linear-gradient(45deg, transparent 40%, rgba(212,175,55,0.5) 50%, transparent 60%)" }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-tesoro-amber uppercase">
                      Frontend Roulette
                    </div>
                    <div
                      className="text-2xl font-serif font-black tracking-wider mt-1 gold-shimmer-fast"
                    >
                      SHAMBLES
                    </div>
                    <div className="text-[8px] text-gray-400 font-mono tracking-wider uppercase mt-1">
                      50 Berths • Grand Line
                    </div>
                    {/* Skull emblem */}
                    <div className="text-sm mt-1.5 opacity-60">☠</div>
                  </div>

                  {/* Gold fringe right edge */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2.5"
                    style={{ background: "linear-gradient(180deg, #d4af37, #996515, #d4af37, #ffbf00, #d4af37)" }}
                  />

                  {/* Wind shimmer overlay */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Narration + Progress ── */}
      <div className="mt-6 text-center w-full max-w-sm px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-mono tracking-wider"
            style={{ color: step === 3 ? "#ffbf00" : "rgba(212,175,55,0.9)" }}
          >
            {STEP_NARRATION[step]}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div
          className="mt-5 mx-auto overflow-hidden rounded-full"
          style={{
            width: 240,
            height: 3,
            background: "rgba(8,18,38,0.9)",
            border: "1px solid rgba(212,175,55,0.25)",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #996515, #d4af37, #ffbf00)",
              boxShadow: "0 0 8px rgba(212,175,55,0.6)",
            }}
            animate={{ width: `${(step / 13) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Step counter */}
        <div className="mt-2 text-[10px] font-mono text-tesoro-gold/40 tracking-widest">
          {step} / 13
        </div>
      </div>

      {/* Bottom logo reveal for final step */}
      <AnimatePresence>
        {step === 13 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)" }}
          >
            <div className="text-center">
              <div
                className="text-5xl font-serif font-black gold-shimmer tracking-[0.2em]"
                style={{ textShadow: "0 0 60px rgba(212,175,55,0.5)" }}
              >
                SHAMBLES SEATING
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
