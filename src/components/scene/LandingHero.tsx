"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { DEMO_EVENT } from "@/lib/constants";

interface LandingHeroProps {
  confirmedCount: number;
  capacity: number;
  availableCapacity: number;
  waitlistCount: number;
}

// Floating particle system
function Particle({ x, y, size, dur, delay, type }: {
  x: number; y: number; size: number; dur: number; delay: number; type: "star" | "ember" | "coin";
}) {
  const colors = { star: "#ffffff", ember: "#d4af37", coin: "#ffbf00" };
  const shapes = { star: "✦", ember: "◆", coin: "○" };
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: `${size}px`, color: colors[type], opacity: 0.7 }}
      animate={{ y: [0, -60], opacity: [0.7, 0], rotate: [0, type === "coin" ? 360 : 20] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeOut" }}
    >
      {shapes[type]}
    </motion.div>
  );
}

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: 40 + Math.random() * 55,
  size: 6 + Math.random() * 10,
  dur: 4 + Math.random() * 5,
  delay: Math.random() * 6,
  type: (["star", "ember", "coin"] as const)[Math.floor(Math.random() * 3)],
}));

// Gran Tesoro lantern
function Lantern({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ rotate: [-5, 5, -5] }}
      transition={{ duration: 3 + delay * 0.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative">
        {/* Rope */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-amber-900/60 mx-auto" />
        {/* Lantern body */}
        <div
          className="w-6 h-8 rounded-sm relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(50,30,0,0.9) 0%, rgba(120,80,0,0.8) 50%, rgba(50,30,0,0.9) 100%)",
            border: "1px solid rgba(212,175,55,0.5)",
          }}
        >
          {/* Flame */}
          <motion.div
            className="absolute inset-0 rounded-sm"
            style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,160,0,0.6) 0%, transparent 70%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, delay, repeat: Infinity }}
          />
        </div>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,160,0,0.3) 0%, transparent 70%)",
            width: "48px",
            height: "48px",
            left: "-12px",
            top: "0px",
          }}
        >
          <motion.div
            className="w-full h-full rounded-full"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, delay, repeat: Infinity }}
            style={{ background: "radial-gradient(circle, rgba(255,160,0,0.25) 0%, transparent 70%)" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

const LANTERNS = [
  { x: 8, y: 30, delay: 0 },
  { x: 14, y: 22, delay: 0.7 },
  { x: 82, y: 28, delay: 0.4 },
  { x: 88, y: 20, delay: 1.1 },
  { x: 76, y: 35, delay: 0.2 },
  { x: 22, y: 38, delay: 0.9 },
];

export function LandingHero({ confirmedCount, capacity, availableCapacity, waitlistCount }: LandingHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const isFull = availableCapacity <= 0;

  const handleMouse = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }, []);

  const handleScroll = useCallback(() => setScrollY(window.scrollY), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleMouse, handleScroll]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* ── LAYER 1: Background — cinematic image ── */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          willChange: "transform",
        }}
      >
        <Image
          src="/assets/landing-bg.png"
          alt="Grand Line"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: "brightness(0.35) saturate(1.4) contrast(1.1)" }}
        />
      </div>

      {/* ── LAYER 2: Ocean depth gradient ── */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, rgba(1,5,9,0.3) 0%, rgba(2,11,20,0.1) 30%, rgba(1,5,9,0.6) 70%, rgba(1,5,9,0.95) 100%)"
      }} />

      {/* ── LAYER 3: Parallax atmospheric elements ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mouse.x * 8}px, ${mouse.y * 4}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {/* Star field */}
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              width: `${1 + Math.random() * 2.5}px`,
              height: `${1 + Math.random() * 2.5}px`,
              background: "white",
              animationDuration: `${2 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ── LAYER 4: Gran Tesoro lanterns ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        transform: `translate(${mouse.x * 4}px, ${mouse.y * 2}px)`,
        transition: "transform 0.4s ease-out",
      }}>
        {LANTERNS.map((l, i) => <Lantern key={i} {...l} />)}
      </div>

      {/* ── LAYER 5: Gold particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* ── LAYER 6: Foreground — main content ── */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── World context banners ── */}
        <div className="flex-none pt-24 pb-4">
          <div className="flex items-center justify-center gap-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex items-center"
            >
              <div
                className="px-6 py-2 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(10,20,40,0.9) 100%)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRight: "none",
                  borderRadius: "0.75rem 0 0 0.75rem",
                }}
              >
                <div className="text-[8px] font-mono tracking-[0.3em] text-tesoro-gold/60 uppercase">Theme Event</div>
                <div className="text-xs font-serif font-bold text-tesoro-gold uppercase tracking-wider">Gran Tesoro</div>
                <div className="text-[8px] font-mono text-tesoro-gold/50 uppercase tracking-widest">VIP GALA</div>
              </div>
            </motion.div>
            <div className="px-3 py-2 text-tesoro-gold/40 text-sm font-serif" style={{
              background: "rgba(10,20,40,0.9)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}>×</div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <div
                className="px-6 py-2 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(10,20,40,0.9) 0%, rgba(139,0,0,0.12) 100%)",
                  border: "1px solid rgba(196,30,58,0.25)",
                  borderLeft: "none",
                  borderRadius: "0 0.75rem 0.75rem 0",
                }}
              >
                <div className="text-[8px] font-mono tracking-[0.3em] text-reverie-crimson/60 uppercase">World Summit</div>
                <div className="text-xs font-serif font-bold text-reverie-crimson uppercase tracking-wider">World Government</div>
                <div className="text-[8px] font-mono text-reverie-crimson/50 uppercase tracking-widest">REVERIE SUMMIT</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Main title area ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center py-8">
          {/* System label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-mono tracking-[0.3em] uppercase"
              style={{
                background: "rgba(4,12,28,0.9)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#d4af37",
                backdropFilter: "blur(12px)",
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Shambles Seating • Live Fleet Registry</span>
            </div>
          </motion.div>

          {/* Event name — the big title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1
              className="font-serif font-black uppercase leading-none tracking-[0.05em]"
              style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
            >
              <span className="gold-shimmer">FRONTEND</span>
              <br />
              <span className="text-white">ROULETTE</span>
              <span className="gold-shimmer-fast" style={{ fontSize: "70%" }}> 1.0</span>
            </h1>
          </motion.div>

          {/* Event charter card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 max-w-sm w-full relative"
          >
            <div
              className="rounded-2xl p-5 text-left relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(25,16,4,0.96) 0%, rgba(10,8,2,0.98) 100%)",
                border: "1px solid rgba(212,175,55,0.35)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Corner decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-tesoro-gold/50 rounded-tl" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-tesoro-gold/50 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-tesoro-gold/50 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-tesoro-gold/50 rounded-br" />

              <div className="text-[9px] font-mono tracking-[0.3em] text-tesoro-gold/60 uppercase mb-3 text-center">
                ⚓ Official Event Charter ⚓
              </div>
              <div className="space-y-2">
                {[
                  { icon: "📅", label: "Date", value: DEMO_EVENT.DATE },
                  { icon: "⏰", label: "Time", value: DEMO_EVENT.TIME },
                  { icon: "🗺", label: "Venue", value: DEMO_EVENT.VENUE },
                  { icon: "👥", label: "Crew", value: `${DEMO_EVENT.MIN_CREW_SIZE}–${DEMO_EVENT.MAX_CREW_SIZE} Members` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-base w-5 shrink-0 text-center">{icon}</span>
                    <span className="text-[10px] font-mono text-gray-500 w-12 shrink-0">{label}</span>
                    <span className="text-xs font-mono text-parchment/90">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            {isFull ? (
              <div className="px-8 py-4 rounded-xl font-serif font-bold text-sm tracking-[0.2em] uppercase text-white"
                style={{ background: "rgba(139,0,0,0.8)", border: "2px solid rgba(196,30,58,0.6)" }}>
                ☠ PORT CLOSED — QUEUE ONLY
              </div>
            ) : (
              <a
                href="#rsvp"
                className="px-8 py-4 rounded-xl font-serif font-bold text-sm tracking-[0.2em] uppercase btn-gold transition-all"
              >
                ⚓ SECURE YOUR BERTH
              </a>
            )}
            <a
              href="#queue"
              className="text-xs font-mono text-tesoro-gold/60 hover:text-tesoro-gold uppercase tracking-widest transition-colors"
            >
              View Poneglyph Queue →
            </a>
          </motion.div>
        </div>

        {/* ── Bottom capacity strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex-none pb-8 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                background: "rgba(4,12,28,0.88)",
                border: "1px solid rgba(212,175,55,0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Capacity numbers */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-mono font-black text-white">{confirmedCount}</div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Confirmed</div>
                </div>
                <div className="text-gray-700 font-mono">/</div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-black text-gray-400">{capacity}</div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Capacity</div>
                </div>
                <div className="w-px h-8 bg-tesoro-gold/20" />
                <div className="text-center">
                  <div className={`text-3xl font-mono font-black ${availableCapacity > 0 ? "text-emerald-400" : "text-reverie-crimson"}`}>
                    {availableCapacity}
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Open</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-black text-reverie-crimson">{waitlistCount}</div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Queued</div>
                </div>
              </div>

              {/* Bar + scroll hint */}
              <div className="flex-1 max-w-xs w-full space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
                  <span>Fleet Fill</span>
                  <span>{Math.round((confirmedCount / capacity) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: isFull
                        ? "linear-gradient(90deg, #8b0000, #c41e3a)"
                        : "linear-gradient(90deg, #996515, #d4af37, #ffbf00)",
                      boxShadow: isFull
                        ? "0 0 8px rgba(196,30,58,0.7)"
                        : "0 0 8px rgba(212,175,55,0.7)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(confirmedCount / capacity) * 100}%` }}
                    transition={{ duration: 2.5, ease: "easeOut", delay: 1 }}
                  />
                </div>
                <div className="text-center text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                  Scroll to Grand Line ↓
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Gran Tesoro corner ornaments ── */}
      <div className="absolute top-20 left-4 sm:left-10 pointer-events-none">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M 0 60 L 0 0 L 60 0" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="0" r="5" fill="rgba(212,175,55,0.2)" />
          <path d="M 10 0 L 0 10" stroke="rgba(212,175,55,0.2)" strokeWidth="0.7" />
          <path d="M 20 0 L 0 20" stroke="rgba(212,175,55,0.1)" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute top-20 right-4 sm:right-10 pointer-events-none" style={{ transform: "scaleX(-1)" }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M 0 60 L 0 0 L 60 0" stroke="rgba(212,175,55,0.3)" strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="0" r="5" fill="rgba(212,175,55,0.2)" />
        </svg>
      </div>

      {/* ── Decorative rope lines (left/right edges) ── */}
      <div className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none hidden lg:block">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute left-2"
            style={{
              top: `${8 + i * 8}%`,
              width: "2px",
              height: "4%",
              background: "rgba(212,175,55,0.12)",
              borderRadius: "1px",
            }}
          />
        ))}
      </div>
    </section>
  );
}
