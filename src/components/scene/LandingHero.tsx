"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Compass, Sparkles, Anchor, ChevronDown, ShieldCheck } from "lucide-react";
import { DEMO_EVENT } from "@/lib/constants";

const ThreeWaterScene = dynamic(
  () => import("@/components/scene/ThreeWaterScene"),
  { ssr: false }
);

interface LandingHeroProps {
  confirmedCount: number;
  capacity: number;
  availableCapacity: number;
  waitlistCount: number;
}

export function LandingHero({
  confirmedCount,
  capacity,
  availableCapacity,
  waitlistCount,
}: LandingHeroProps) {
  const { scrollY } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax layers based on scroll & mouse motion
  const bgY = useTransform(scrollY, [0, 600], [0, 150]);
  const shipY = useTransform(scrollY, [0, 600], [0, 80]);
  const textY = useTransform(scrollY, [0, 600], [0, 180]);
  const opacity = useTransform(scrollY, [0, 450], [1, 0.1]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 20,
        y: (e.clientY / innerHeight - 0.5) * 15,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative w-full min-h-[100vh] flex flex-col justify-between overflow-hidden pt-20">
      {/* 1. Base Depth: landing-bg.png with Parallax & Mouse Response */}
      <motion.div
        style={{
          y: bgY,
          x: mousePos.x * 0.4,
        }}
        className="absolute inset-0 z-0 scale-105 pointer-events-none transition-transform duration-300 ease-out"
      >
        <Image
          src="/assets/landing-bg.png"
          alt="Gran Tesoro VIP Gala"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.78] contrast-[1.12]"
        />
        {/* Cinematic Vignette & Atmospheric Mist Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-marine-950 via-marine-950/40 to-marine-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-marine-950/80 via-transparent to-marine-950/80" />
      </motion.div>

      {/* 2. Three.js / React Three Fiber Dynamic 3D Scene */}
      <ThreeWaterScene />

      {/* 3. Interactive Ocean Swell & Water Movement Overlay */}
      <div className="absolute bottom-0 inset-x-0 h-48 z-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-marine-950 via-marine-950/90 to-transparent" />
        {/* Animated wave sheen */}
        <div className="absolute bottom-6 inset-x-0 h-16 bg-gradient-to-r from-transparent via-tesoro-gold/10 to-transparent animate-water-swell blur-md" />
      </div>

      {/* 3. Sailing Galleon Silhouette with Bobbing & Cloth/Flag motion */}
      <motion.div
        style={{
          y: shipY,
          x: -mousePos.x * 0.6,
        }}
        className="absolute bottom-28 left-[8%] md:left-[14%] z-10 pointer-events-none"
      >
        <div className="relative animate-ship-bob">
          {/* Subtle Galleon Vessel Outline */}
          <div className="w-36 h-28 md:w-56 md:h-40 relative opacity-75">
            {/* Hull */}
            <div className="absolute bottom-2 left-0 right-0 h-9 bg-gradient-to-r from-[#121929] via-[#213054] to-[#0c1322] rounded-b-3xl border-t border-tesoro-gold/30 shadow-lg" />
            {/* Main Mast */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-2 h-24 bg-[#3d2712] rounded-t-sm" />
            {/* Main Sails (with wind swell) */}
            <motion.div
              animate={{ scaleX: [1, 1.04, 0.98, 1], skewX: [0, 2, -2, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-14 left-1/2 -translate-x-1/2 w-24 h-16 bg-gradient-to-b from-[#f0e4ca]/90 to-[#bba57e]/80 rounded-t-lg rounded-b-sm border border-tesoro-gold/40 shadow-inner"
            />
            {/* Flying Pirate Gala Flag */}
            <motion.div
              animate={{ rotate: [-2, 4, -3, 2, -2], skewY: [0, 4, -3, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-1/2 w-8 h-4 bg-reverie-crimson border border-tesoro-gold/60 origin-left shadow-sm"
            />
            {/* Lantern on Stern */}
            <div className="absolute bottom-7 right-2 w-3 h-3 rounded-full bg-tesoro-amber shadow-[0_0_15px_#ffbf00] animate-ping" />
            <div className="absolute bottom-7 right-2 w-3 h-3 rounded-full bg-tesoro-gold shadow-[0_0_10px_#d4af37]" />
          </div>
        </div>
      </motion.div>

      {/* 4. Atmospheric Gold Dust & Shimmer Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-tesoro-gold shadow-[0_0_8px_#d4af37] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-tesoro-amber shadow-[0_0_12px_#ffbf00] animate-bounce" />
        <div className="absolute top-2/3 left-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff] animate-pulse" />
        <div className="absolute top-1/2 right-1/6 w-1 h-1 rounded-full bg-tesoro-gold animate-ping" />
      </div>

      {/* 5. Progressive Story Reveal Typography */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center my-auto py-12"
      >
        {/* Step A: Gran Tesoro VIP Gala */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-marine-900/90 border border-tesoro-gold/40 shadow-gold-glow mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-tesoro-gold" />
          <span className="text-xs uppercase tracking-[0.25em] text-tesoro-light font-mono font-semibold">
            {DEMO_EVENT.THEME_TITLE}
          </span>
          <span className="text-tesoro-gold/60">•</span>
          <span className="text-xs uppercase tracking-[0.2em] text-gray-300 font-mono">
            {DEMO_EVENT.THEME_SUBTITLE}
          </span>
        </motion.div>

        {/* Step B: Shambles Seating Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight drop-shadow-2xl"
        >
          <span className="gold-shimmer">SHAMBLES</span>{" "}
          <span className="text-white drop-shadow-[0_4px_16px_rgba(212,175,55,0.4)]">
            SEATING
          </span>
        </motion.h1>

        {/* Step C: Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-4 text-base sm:text-xl font-mono tracking-[0.3em] text-tesoro-amber uppercase font-semibold"
        >
          {DEMO_EVENT.TAGLINE}
        </motion.p>

        {/* Step D: The Real Demo Event Banner: FRONTEND ROULETTE 1.0 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 max-w-2xl mx-auto p-5 rounded-2xl bg-gradient-to-r from-marine-900/90 via-[#0e1d38]/95 to-marine-900/90 border-2 border-tesoro-gold/50 shadow-2xl backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="text-[11px] font-mono tracking-widest text-tesoro-gold uppercase flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-tesoro-gold" />
                <span>Featured Gala Event</span>
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {DEMO_EVENT.NAME}
              </div>
              <div className="text-xs text-gray-300 font-mono mt-1">
                {DEMO_EVENT.DATE} • {DEMO_EVENT.TIME} • {DEMO_EVENT.VENUE}
              </div>
            </div>

            {/* Live Berth Capacity Pill */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="text-2xl font-mono font-black text-tesoro-gold">
                {availableCapacity} <span className="text-sm font-normal text-gray-300">Berths Left</span>
              </div>
              <div className="text-[10px] font-mono text-gray-400">
                {confirmedCount} / {capacity} Claimed
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {availableCapacity > 0 ? (
            <a
              href="#rsvp"
              className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-tesoro-gold via-tesoro-amber to-tesoro-bronze text-marine-950 font-serif font-bold text-base tracking-wider uppercase shadow-gold-glow hover:scale-105 active:scale-95 transition-transform"
            >
              Assemble Your Crew (3–4)
            </a>
          ) : (
            <a
              href="#rsvp"
              className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-reverie-crimson to-reverie-blood text-white font-serif font-bold text-base tracking-wider uppercase shadow-crimson-glow hover:scale-105 active:scale-95 transition-transform"
            >
              Enter Poneglyph Queue
            </a>
          )}

          <a
            href="#queue"
            className="px-7 py-3.5 rounded-lg bg-marine-900/80 border border-tesoro-gold/40 text-tesoro-gold hover:bg-marine-800 font-mono text-sm tracking-wider uppercase transition-colors"
          >
            Inspect Queue #{waitlistCount}
          </a>
        </motion.div>
      </motion.div>

      {/* Down Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative z-20 pb-6 text-center"
      >
        <a
          href="#capacity"
          className="inline-flex flex-col items-center gap-1 text-[11px] font-mono tracking-widest text-tesoro-gold/60 hover:text-tesoro-gold transition-colors"
        >
          <span>EXPLORE FLEET TELEMETRY</span>
          <ChevronDown className="w-4 h-4 text-tesoro-gold" />
        </a>
      </motion.div>
    </section>
  );
}
