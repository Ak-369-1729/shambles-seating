"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  user: { email?: string; role?: string } | null;
  confirmedCount: number;
  capacity: number;
  waitlistCount: number;
}

export function Navbar({ user, confirmedCount, capacity, waitlistCount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pct = Math.round((confirmedCount / capacity) * 100);
  const isFull = confirmedCount >= capacity;

  const navLinks = [
    { href: "#gala", label: "THE GALA" },
    { href: "#reverie", label: "REVERIE" },
    { href: "#capacity", label: "VOYAGE" },
    { href: "#queue", label: "QUEUE" },
    { href: "#rsvp", label: "MY PASS" },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "COMMAND DECK" }] : []),
  ];

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50"
        style={{
          background: "linear-gradient(180deg, rgba(7,30,43,0.68) 0%, rgba(16,26,53,0.42) 100%)",
          borderBottom: "1px solid rgba(131,197,190,0.22)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Sea-glass horizon line */}
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, transparent, rgba(0,124,131,0.45), rgba(131,197,190,0.8), rgba(233,185,73,0.5), transparent)"
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, rgba(0,124,131,0.3) 0%, rgba(16,26,53,0.72) 100%)",
                border: "1px solid rgba(131,197,190,0.42)",
              }}
            >
              <span className="text-sm">⚓</span>
            </div>
            <div className="block">
              <div className="text-xs font-serif font-bold tracking-[0.25em] text-tesoro-gold leading-none">
                SHAMBLES SEATING
              </div>
              <div className="text-[8px] font-mono tracking-[0.2em] text-tesoro-gold/40 uppercase leading-none mt-0.5">
                YOUR BERTH • YOUR CREW • YOUR VOYAGE
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 text-[9px] font-mono font-bold tracking-[0.16em] uppercase transition-all"
                style={{ color: "rgba(246,231,193,0.72)" }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.color = "#83c5be";
                  (e.target as HTMLElement).style.background = "rgba(0,124,131,0.12)";
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.color = "rgba(246,231,193,0.72)";
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Live capacity gauge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5"
              style={{
                background: "rgba(7,30,43,0.55)",
                border: "1px solid rgba(131,197,190,0.22)",
              }}>
              {/* Mini bar */}
              <div className="relative w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: isFull ? "#e45756" : "#83c5be",
                    boxShadow: isFull ? "0 0 6px rgba(228,87,86,0.8)" : "0 0 6px rgba(0,124,131,0.7)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-tesoro-gold/70">
                {confirmedCount}/{capacity}
              </span>
              {waitlistCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono"
                  style={{ background: "rgba(228,87,86,0.15)", color: "#e45756" }}>
                  +{waitlistCount}
                </span>
              )}
            </div>
          </div>

          {/* Auth controls */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{
                    background: "rgba(7,30,43,0.55)",
                    border: "1px solid rgba(131,197,190,0.26)",
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-mono text-tesoro-gold/70 max-w-[140px] truncate">
                    {user.email || "Admiral"}
                  </span>
                </div>
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl text-[10px] font-mono text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    DEPART
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-[10px] font-mono text-tesoro-gold/70 hover:text-tesoro-gold uppercase tracking-wider transition-colors"
                  style={{ border: "1px solid rgba(212,175,55,0.2)" }}
                >
                  BOARD SHIP
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all btn-gold"
                >
                  ENLIST CREW
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            style={{ border: "1px solid rgba(212,175,55,0.2)" }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="block w-4 h-px bg-tesoro-gold/70 transition-all"
                style={{
                  transform: menuOpen
                    ? i === 0 ? "rotate(45deg) translate(3px, 3px)"
                    : i === 2 ? "rotate(-45deg) translate(3px, -3px)"
                    : "scale(0)"
                    : "none",
                }}
              />
            ))}
          </button>
        </div>

        {/* Fill bar */}
        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            className="h-full"
            style={{
              background: isFull
                ? "linear-gradient(90deg, transparent, rgba(228,87,86,0.55), transparent)"
                : "linear-gradient(90deg, transparent, rgba(131,197,190,0.42), transparent)",
            }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 2 }}
          />
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 inset-x-0 z-40"
            style={{
              background: "rgba(7,30,43,0.96)",
              borderBottom: "1px solid rgba(131,197,190,0.24)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-mono text-tesoro-gold/70 uppercase tracking-wider"
                  style={{ border: "1px solid rgba(212,175,55,0.1)" }}
                >
                  {link.label}
                </a>
              ))}
              {/* Mobile auth */}
              {user ? (
                <form action="/auth/signout" method="POST" className="pt-2">
                  <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-mono text-gray-400 uppercase"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    Depart (Sign Out)
                  </button>
                </form>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1 py-2.5 rounded-xl text-sm font-mono text-tesoro-gold/70 text-center uppercase"
                    style={{ border: "1px solid rgba(212,175,55,0.2)" }}>
                    Board Ship
                  </Link>
                  <Link href="/signup" className="flex-1 py-2.5 rounded-xl text-sm font-mono font-bold text-center uppercase btn-gold">
                    Enlist Crew
                  </Link>
                </div>
              )}
              {/* Mobile fill bar */}
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>Fleet Fill</span>
                  <span>{confirmedCount}/{capacity} • +{waitlistCount} queued</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: isFull ? "#e45756" : "linear-gradient(90deg, #007c83, #83c5be)",
                  }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
