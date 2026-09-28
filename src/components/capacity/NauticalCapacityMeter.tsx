"use client";

import { motion } from "framer-motion";
import { Compass, AlertCircle, Anchor } from "lucide-react";

interface NauticalCapacityMeterProps {
  confirmedCount: number;
  capacity: number;
  availableCapacity: number;
  activeOfferInFlight: boolean;
}

export function NauticalCapacityMeter({
  confirmedCount,
  capacity,
  availableCapacity,
  activeOfferInFlight,
}: NauticalCapacityMeterProps) {
  const percentage = Math.min(100, Math.round((confirmedCount / capacity) * 100));
  const circumference = 2 * Math.PI * 66;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  const isCritical = availableCapacity <= 5 && availableCapacity > 0;
  const isFull = availableCapacity <= 0;

  return (
    <section id="capacity" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Nautical chart background grid */}
      <div className="absolute inset-0 nautical-grid opacity-60 pointer-events-none" />
      {/* Radial gold glow from center */}
      <div className="absolute inset-0 bg-radial-gold-center pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-tesoro-gold/30 bg-marine-950/80 text-[11px] font-mono text-tesoro-gold uppercase tracking-[0.3em] mb-4">
            <Compass className="w-3.5 h-3.5 animate-spin-slower" />
            <span>Grand Line Fleet Capacity Ledger</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black gold-shimmer tracking-wide">
            LIVE BERTH CAPACITY
          </h2>
          <p className="mt-3 text-sm text-gray-400 font-mono max-w-xl mx-auto">
            Every crew secures a single voyage berth. Access is governed by event capacity, not individual seats.
          </p>
        </motion.div>

        {/* Main Telemetry Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* LEFT PANEL: Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Confirmed count */}
            <div
              className="relative rounded-2xl p-6 overflow-hidden corner-ornament"
              style={{
                background: "linear-gradient(135deg, rgba(8,18,38,0.95), rgba(6,12,28,0.98))",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-2">
                Confirmed Berths
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-mono font-black text-tesoro-gold">{confirmedCount}</span>
                <span className="text-sm text-gray-500 font-mono">/ {capacity}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-gray-400">Verified Gala Delegations</span>
              </div>
              {/* Mini bar */}
              <div className="mt-4 h-1 bg-marine-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #d4af37, #ffbf00)", boxShadow: "0 0 8px rgba(212,175,55,0.5)" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Available berths */}
            <div
              className="relative rounded-2xl p-6 overflow-hidden"
              style={{
                background: isFull
                  ? "linear-gradient(135deg, rgba(139,0,0,0.2), rgba(8,18,38,0.95))"
                  : "linear-gradient(135deg, rgba(8,18,38,0.95), rgba(6,12,28,0.98))",
                border: isFull
                  ? "1px solid rgba(196,30,58,0.35)"
                  : "1px solid rgba(212,175,55,0.2)",
                boxShadow: isFull ? "0 0 30px rgba(196,30,58,0.2)" : "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-2">
                Available Berths
              </div>
              <div className={`text-5xl font-mono font-black ${isFull ? "text-reverie-crimson" : isCritical ? "text-yellow-500" : "text-emerald-400"}`}>
                {availableCapacity}
              </div>
              <div className="mt-3">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isFull ? "text-reverie-crimson" : isCritical ? "text-yellow-500" : "text-emerald-400"}`}>
                  {isFull ? "Port Closed — Queue Active" : isCritical ? "Critical — Last Berths" : "Immediate Confirmation Open"}
                </span>
              </div>
            </div>

            {/* Active offer alert */}
            {activeOfferInFlight && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: "linear-gradient(135deg, rgba(196,30,58,0.15), rgba(8,18,38,0.95))",
                  border: "1px solid rgba(196,30,58,0.5)",
                  boxShadow: "0 0 20px rgba(196,30,58,0.25)",
                }}
              >
                <AlertCircle className="w-5 h-5 text-reverie-crimson shrink-0 animate-pulse" />
                <div>
                  <div className="text-[11px] font-mono font-bold text-reverie-crimson uppercase tracking-wider">
                    Boarding Permit In Flight
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                    A released berth is being claimed under the 10-min window.
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* CENTER: Compass Gauge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative">
              {/* Outer decorative ring */}
              <div
                className="absolute inset-[-12px] rounded-full border border-tesoro-gold/10"
                style={{
                  background: "radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)",
                  boxShadow: "0 0 60px rgba(212,175,55,0.1)",
                }}
              />
              <div className="absolute inset-[-6px] rounded-full border border-dashed border-tesoro-gold/15" />

              {/* Tick marks */}
              {Array.from({ length: 36 }, (_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: i % 9 === 0 ? 3 : 1.5,
                    height: i % 9 === 0 ? 10 : 6,
                    background: i % 9 === 0 ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.25)",
                    top: "50%",
                    left: "50%",
                    transformOrigin: "50% 158px",
                    transform: `translateX(-50%) rotate(${i * 10}deg) translateY(-158px)`,
                    borderRadius: 1,
                  }}
                />
              ))}

              {/* Main SVG gauge */}
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 160 160">
                  {/* Track */}
                  <circle cx="80" cy="80" r="66" stroke="rgba(8,18,38,0.9)" strokeWidth="12" fill="transparent" />
                  <circle cx="80" cy="80" r="66" stroke="rgba(212,175,55,0.08)" strokeWidth="12" fill="transparent" strokeDasharray="4 6" />
                  {/* Liquid arc */}
                  <motion.circle
                    cx="80" cy="80" r="66"
                    stroke={isFull ? "url(#crimsonGrad)" : "url(#capacityGold)"}
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    whileInView={{ strokeDashoffset }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="capacityGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d4af37" />
                      <stop offset="50%" stopColor="#ffbf00" />
                      <stop offset="100%" stopColor="#996515" />
                    </linearGradient>
                    <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b0000" />
                      <stop offset="50%" stopColor="#c41e3a" />
                      <stop offset="100%" stopColor="#8b0000" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center content */}
                <div className="relative z-10 flex flex-col items-center text-center px-4">
                  <Compass className={`w-7 h-7 mb-2 animate-spin-slow ${isFull ? "text-reverie-crimson" : "text-tesoro-gold"}`} />
                  <div className="text-6xl font-mono font-black text-white leading-none">{percentage}%</div>
                  <div className="text-[11px] font-mono text-tesoro-amber/80 uppercase tracking-[0.25em] mt-1.5">
                    Vessel Occupancy
                  </div>
                  {isFull && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="mt-2 text-[10px] font-mono text-reverie-crimson uppercase tracking-wider font-bold"
                    >
                      ⚠ FULL CAPACITY
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT PANEL: Fleet Status */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-4"
          >
            {/* Fleet condition card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(8,18,38,0.95), rgba(6,12,28,0.98))",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-3">
                Fleet Condition
              </div>
              <div className={`text-2xl font-serif font-black ${isFull ? "text-reverie-crimson" : "text-tesoro-gold"}`}>
                {isFull ? "FULL CAPACITY" : "VOYAGE CHARTER OPEN"}
              </div>
              <p className="text-[12px] text-gray-400 font-mono mt-3 leading-relaxed">
                {isFull
                  ? "All 50 berths have been chartered for Frontend Roulette 1.0. Any cancellation immediately triggers a 10-minute Boarding Permit for the #1 queued crew."
                  : `${availableCapacity} berths remain open for immediate crew entry. Claim yours before the port closes.`}
              </p>
            </div>

            {/* System Architecture note */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(135deg, rgba(8,18,38,0.95), rgba(6,12,28,0.98))",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.25em] mb-4">
                Berth System Rules
              </div>
              <div className="space-y-2.5">
                {[
                  { dot: "emerald", text: "One berth per crew (3–4 members)" },
                  { dot: "tesoro-gold", text: "Strict FIFO queue — no priority jumps" },
                  { dot: "tesoro-gold", text: "10-min server-authoritative claim window" },
                  { dot: "reverie-crimson", text: "Expiry auto-promotes next in queue" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Anchor className="w-3 h-3 text-tesoro-gold/60 shrink-0" />
                    <span className="text-[11px] font-mono text-gray-400">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinates */}
            <div className="rounded-xl px-4 py-3 flex items-center justify-between border border-tesoro-gold/10">
              <span className="text-[10px] font-mono text-tesoro-gold/30">⚓ N 44°12′ W 28°09′</span>
              <span className="text-[10px] font-mono text-tesoro-gold/30">GRAND LINE</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
