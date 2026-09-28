"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FastForward } from "lucide-react";

interface CinematicLoaderProps {
  onComplete: () => void;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  // 13-step sequence state
  const [step, setStep] = useState(1);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    // Sequence timings (in ms)
    const stepDurations = [
      1200, // 1. barrel rolls into scene
      900,  // 2. barrel wobbles
      800,  // 3. barrel bursts open
      900,  // 4. smoke expands
      1000, // 5. original pirate mascot appears
      1000, // 6. pirate approaches mast
      1200, // 7. pirate climbs
      900,  // 8. pirate raises flag
      1000, // 9. flag unfurls
      1000, // 10. wind catches flag
      1100, // 11. flag behaves like cloth
      1000, // 12. flag reaches full height
      800,  // 13. transition into landing page
    ];

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
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-marine-950 text-[#F4E8C1] overflow-hidden"
    >
      {/* Background ambient stars & ocean mist */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-marine-900/80 border border-tesoro-gold/30 text-xs font-mono text-tesoro-gold hover:bg-tesoro-gold hover:text-marine-950 transition-all shadow-gold-glow"
      >
        <span>Skip Sequence</span>
        <FastForward className="w-3.5 h-3.5" />
      </button>

      {/* Main Cinematic Stage */}
      <div className="relative w-full max-w-2xl h-96 flex items-center justify-center">
        {/* Step 1 & 2: Barrel Rolling & Wobbling */}
        {step <= 3 && (
          <motion.div
            initial={{ x: -400, rotate: -720 }}
            animate={
              step === 1
                ? { x: 0, rotate: 0 }
                : step === 2
                ? { x: [0, -6, 6, -4, 4, 0], rotate: [0, -4, 4, -2, 2, 0] }
                : { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
            }
            transition={{
              duration: step === 1 ? 1.2 : step === 2 ? 0.9 : 0.6,
              ease: step === 1 ? "easeOut" : "easeInOut",
            }}
            className="relative flex items-center justify-center"
          >
            {/* Handcrafted Weathered Wooden Barrel */}
            <div className="relative w-28 h-36 bg-gradient-to-r from-[#593b1d] via-[#8c5d2e] to-[#452d16] rounded-[24px] border-2 border-[#d4af37]/60 shadow-[0_0_35px_rgba(212,175,55,0.4)] overflow-hidden flex flex-col justify-between py-2">
              {/* Iron Bands */}
              <div className="w-full h-3 bg-gradient-to-r from-[#2a2a2a] via-[#888] to-[#1a1a1a] border-y border-[#d4af37]/40" />
              <div className="w-full h-3 bg-gradient-to-r from-[#2a2a2a] via-[#d4af37] to-[#1a1a1a] border-y border-[#d4af37]/40" />
              <div className="w-full h-3 bg-gradient-to-r from-[#2a2a2a] via-[#888] to-[#1a1a1a] border-y border-[#d4af37]/40" />

              {/* Shambles Crest On Barrel */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-serif font-black text-tesoro-gold tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  ⚓ S
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 & 4: Smoke & Golden Blast Particles */}
        {step >= 3 && step <= 6 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.8, 2.4], opacity: [1, 0.8, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-64 h-64 rounded-full bg-gradient-to-r from-tesoro-gold/40 via-tesoro-amber/20 to-transparent blur-2xl animate-pulse" />
            <div className="absolute w-48 h-48 rounded-full bg-white/30 blur-xl" />
          </motion.div>
        )}

        {/* Mast structure (Appears in steps 5-13) */}
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute right-36 bottom-6 flex flex-col items-center pointer-events-none"
          >
            {/* Flagpole / Mast */}
            <div className="w-3.5 h-72 bg-gradient-to-r from-[#6b4724] via-[#9e6935] to-[#54371b] rounded-t-sm border border-[#d4af37]/40 shadow-lg relative">
              {/* Rigging / Climbing ladder rungs */}
              <div className="absolute inset-x-[-12px] top-12 h-[2px] bg-tesoro-gold/40" />
              <div className="absolute inset-x-[-12px] top-24 h-[2px] bg-tesoro-gold/40" />
              <div className="absolute inset-x-[-12px] top-36 h-[2px] bg-tesoro-gold/40" />
              <div className="absolute inset-x-[-12px] top-48 h-[2px] bg-tesoro-gold/40" />
            </div>
          </motion.div>
        )}

        {/* Steps 5-8: Original Pirate Mascot */}
        {step >= 5 && step <= 12 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 0, y: 40 }}
            animate={
              step === 5
                ? { opacity: 1, scale: 1, x: 0, y: 0 }
                : step === 6
                ? { x: 70, y: 0 } // Approaches mast
                : step === 7
                ? { x: 75, y: -90 } // Climbs mast
                : { x: 75, y: -120 } // At masthead raising flag
            }
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Mascot Visual: Captain Barnaby (Original Pirate Mascot) */}
            <div className="relative flex flex-col items-center">
              {/* Tricorn Hat with Gold Feather */}
              <div className="relative w-16 h-7 bg-[#1c1d24] border-t-2 border-x-2 border-tesoro-gold rounded-t-xl flex items-center justify-center shadow-md">
                {/* Gold feather */}
                <div className="absolute -top-3 -right-1 w-2.5 h-6 bg-gradient-to-t from-tesoro-gold to-white rotate-45 rounded-full" />
                <span className="text-[10px] text-tesoro-gold font-bold">★</span>
              </div>

              {/* Head with Eye Patch & Grin */}
              <div className="w-10 h-10 bg-[#fcd5b4] rounded-full border border-[#8a6c1b] relative overflow-hidden flex items-center justify-center">
                {/* Eye patch */}
                <div className="absolute top-2.5 left-2 w-3.5 h-3.5 bg-black rounded-full" />
                <div className="absolute top-1 left-0 right-0 h-[2px] bg-black -rotate-12" />
                {/* Friendly eye */}
                <div className="absolute top-3 right-2.5 w-2 h-2 bg-[#2d4a22] rounded-full" />
                {/* Determined pirate smirk */}
                <div className="absolute bottom-2 w-4 h-1 border-b-2 border-black rounded-full" />
              </div>

              {/* Gala Captain Coat */}
              <div className="relative w-14 h-16 bg-gradient-to-b from-reverie-crimson to-marine-950 border border-tesoro-gold/70 rounded-b-xl flex flex-col items-center justify-between py-1.5 shadow-lg">
                <div className="w-10 h-2 bg-tesoro-gold/80 rounded-full" />
                {/* Brass Telescope in Hand */}
                <div className="absolute -right-3 top-4 w-6 h-2.5 bg-gradient-to-r from-tesoro-gold to-tesoro-bronze rounded rotate-12 shadow" />
                <div className="w-6 h-1.5 bg-tesoro-gold/60 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Steps 8-12: Flag Hoisting & Cloth Wave Physics */}
        {step >= 8 && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0, y: 40 }}
            animate={
              step === 8
                ? { opacity: 1, scaleY: 0.3, y: 0 }
                : step === 9
                ? { opacity: 1, scaleY: 0.8, x: 20 }
                : { opacity: 1, scaleY: 1, x: 25 }
            }
            transition={{ duration: 0.8 }}
            className="absolute right-12 top-10 z-20 origin-top-left"
          >
            {/* The Ceremonial Shambles Gala Flag */}
            <motion.div
              animate={{
                skewY: [0, 4, -4, 0],
                scaleX: [1, 0.98, 1.02, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-48 h-32 bg-gradient-to-r from-marine-950 via-[#0e1f3d] to-marine-900 border-2 border-tesoro-gold rounded-r-lg shadow-[0_0_25px_rgba(212,175,55,0.4)] flex flex-col items-center justify-center p-3 text-center"
            >
              {/* Gold Fringe Edge */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-tesoro-gold via-white to-tesoro-gold rounded-r" />

              <div className="text-xs font-mono font-bold tracking-widest text-tesoro-amber uppercase">
                Frontend Roulette
              </div>
              <div className="text-xl font-serif font-black gold-shimmer tracking-wider">
                SHAMBLES
              </div>
              <div className="text-[9px] text-gray-300 font-mono tracking-widest uppercase mt-0.5">
                50 Berths • Grand Line
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Story Stage Narration Subtitle */}
      <div className="mt-8 text-center max-w-md px-4">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm font-mono tracking-wider text-tesoro-gold/90"
        >
          {step === 1 && "A sealed Gran Tesoro barrel arrives on deck..."}
          {step === 2 && "The ancient seals begin to shift..."}
          {step === 3 && "The barrel bursts with golden gala embers!"}
          {step === 4 && "Mist envelopes the promenade deck..."}
          {step === 5 && "Captain Barnaby emerges with the Voyage Charter!"}
          {step === 6 && "Approaching the gala flagship mast..."}
          {step === 7 && "Ascending the rigging lines..."}
          {step === 8 && "Hoisting the ceremonial colors..."}
          {step === 9 && "The banner unfurls in the open ocean wind..."}
          {step === 10 && "High winds catch the Shambles insignia!"}
          {step === 11 && "Cloth ripples across the Grand Line horizon..."}
          {step === 12 && "Colors secured at full mast!"}
          {step === 13 && "Welcome to Shambles Seating."}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-56 h-1.5 bg-marine-900 border border-tesoro-gold/30 rounded-full mx-auto mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-tesoro-bronze via-tesoro-gold to-tesoro-amber"
            animate={{ width: `${(step / 13) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
