"use client";

import { motion } from "framer-motion";
import { Compass, Anchor, Shield, AlertCircle, Sparkles } from "lucide-react";

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
  const strokeDashoffset = 440 - (440 * percentage) / 100;

  return (
    <div id="capacity" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-b from-marine-900/90 to-marine-950/95 border-2 border-tesoro-gold/30 p-8 md:p-12 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Ambient Corner Ornaments */}
        <div className="absolute top-4 left-4 text-xs font-mono text-tesoro-gold/40">⚓ N 44° 12′</div>
        <div className="absolute top-4 right-4 text-xs font-mono text-tesoro-gold/40">W 28° 09′ ⚓</div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-tesoro-gold/5 blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-marine-950 border border-tesoro-gold/40 text-xs font-mono text-tesoro-gold uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Grand Line Fleet Capacity Ledger</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-wide gold-shimmer">
            LIVE BERTH CAPACITY
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-mono mt-2">
            Every crew secures a single voyage berth. Physical seats are not individually booked; access is governed by event capacity.
          </p>
        </div>

        {/* Main Gauge & Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Telemetry Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-marine-950/80 border border-tesoro-gold/20 shadow-inner">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Confirmed Berths
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-tesoro-gold mt-1 flex items-baseline gap-2">
                {confirmedCount}{" "}
                <span className="text-sm font-normal text-gray-400">/ {capacity} Berths</span>
              </div>
              <div className="text-xs text-gray-400 font-mono mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Gala Delegations
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-marine-950/80 border border-tesoro-gold/20 shadow-inner">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Available Berth Allocation
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white mt-1">
                {availableCapacity}
              </div>
              <div className="text-xs text-gray-400 font-mono mt-2">
                {availableCapacity > 0 ? (
                  <span className="text-emerald-400 font-semibold">Immediate confirmation open</span>
                ) : (
                  <span className="text-reverie-crimson font-semibold">Port Closed • Queue active</span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Glowing Brass Compass Dial with Liquid Ring */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              {/* Outer Nautical Brass Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-tesoro-gold/40 shadow-gold-glow-lg flex items-center justify-center bg-marine-950/90">
                {/* Degree ticks */}
                <div className="absolute inset-2 rounded-full border border-dashed border-tesoro-gold/20" />
              </div>

              {/* Animated Circular SVG Meter */}
              <svg className="w-56 h-56 -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#122347"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Liquid Gold Progress Arc */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="url(#goldGradient)"
                  strokeWidth="12"
                  strokeDasharray="440"
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="50%" stopColor="#ffbf00" />
                    <stop offset="100%" stopColor="#996515" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Gauge Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <Compass className="w-6 h-6 text-tesoro-gold mb-1 animate-spin-slow opacity-80" />
                <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight">
                  {percentage}%
                </span>
                <span className="text-[11px] font-mono tracking-widest text-tesoro-amber uppercase mt-1">
                  VESSEL OCCUPANCY
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-marine-950/80 border border-tesoro-gold/20 shadow-inner">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                Fleet Condition
              </div>
              <div className="text-2xl font-serif font-bold text-tesoro-gold mt-1">
                {availableCapacity > 0 ? "VOYAGE CHARTER OPEN" : "FULL CAPACITY REACHED"}
              </div>
              <p className="text-xs text-gray-300 font-mono mt-2 leading-relaxed">
                {availableCapacity > 0
                  ? `${availableCapacity} berths remain open for immediate crew entry.`
                  : "All 50 berths have been chartered. Any cancellation immediately offers a 10-minute boarding permit to the #1 waitlisted crew."}
              </p>
            </div>

            {activeOfferInFlight && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-reverie-crimson/20 to-marine-950 border border-reverie-crimson/50 shadow-crimson-glow flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-reverie-crimson shrink-0 animate-pulse" />
                <div className="text-xs font-mono">
                  <div className="text-reverie-crimson font-bold uppercase tracking-wider">
                    Active Boarding Permit In Flight
                  </div>
                  <div className="text-gray-300">
                    A released berth is currently being claimed under the 10-minute window.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
