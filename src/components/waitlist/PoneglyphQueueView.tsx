"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_EVENT } from "@/lib/constants";

interface PoneglyphQueueViewProps {
  userRegistration: any | null;
  queueList: any[];
}

function ShipIcon({ color = "#e9b949", size = 24 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="18" rx="9" ry="3" fill={color} opacity="0.3" />
      <path d="M 3 18 Q 12 14 21 18 Q 18 22 12 23 Q 6 22 3 18 Z" fill={color} opacity="0.7" />
      <path d="M 12 4 L 12 18" stroke={color} strokeWidth="1.5" />
      <path d="M 12 4 Q 18 8 18 14 Q 12 12 12 14 Q 12 8 12 4 Z" fill="rgba(240,230,200,0.8)" />
      <path d="M 8 7 Q 12 10 12 14 Q 8 12 8 14 Q 8 8 8 7 Z" fill="rgba(220,210,180,0.6)" />
      <circle cx="12" cy="3" r="1.5" fill={color} />
    </svg>
  );
}

function PositionBadge({ pos, isUser }: { pos: number; isUser: boolean }) {
  return (
    <div
      className="queue-position w-10 h-10 rounded-full flex items-center justify-center font-mono font-black text-sm shrink-0"
      style={{
        background: isUser
          ? "linear-gradient(135deg, #007c83, #83c5be)"
          : "rgba(8,18,38,0.9)",
        border: isUser
          ? "2px solid #83c5be"
          : "1px solid rgba(233,185,73,0.28)",
        boxShadow: isUser ? "0 0 20px rgba(0,124,131,0.55)" : "none",
        color: isUser ? "#071e2b" : "rgba(233,185,73,0.72)",
      }}
    >
      #{pos}
    </div>
  );
}

export function PoneglyphQueueView({ userRegistration, queueList }: PoneglyphQueueViewProps) {
  const [expanded, setExpanded] = useState(false);

  const userPos = userRegistration?.queue_position;
  const isWaitlisted = userRegistration?.status === "WAITLISTED";
  const isOffered = userRegistration?.status === "OFFERED";
  const displayQueue = expanded ? queueList : queueList.slice(0, 5);

  return (
    <section
      id="queue"
      className="relative w-full overflow-hidden py-16 sm:py-20"
      style={{ background: "linear-gradient(180deg, #010509 0%, #020b14 50%, #010509 100%)" }}
    >
      {/* Nautical grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(131,197,190,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(131,197,190,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Crimson vertical accent */}
      <div className="absolute inset-y-0 left-0 w-1" style={{
        background: "linear-gradient(180deg, transparent, rgba(228,87,86,0.68), rgba(112,31,45,0.32), transparent)"
      }} />

      {/* ── Section Header ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(228,87,86,0.55))" }} />
          <div className="text-[10px] font-mono tracking-[0.4em] text-reverie-crimson/80 uppercase">Grand Line Queue</div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(228,87,86,0.55), transparent)" }} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-wide text-center">
          THE WAITING FLEET
        </h2>
        <p className="text-center text-xs font-mono text-gray-500 mt-2 uppercase tracking-wider">
          FIFO · Deterministic · Server-Authoritative
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 space-y-4">

        {/* ── User status banner ── */}
        <AnimatePresence>
          {isOffered && (
            <motion.div
              key="offered"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(30,18,2,0.98) 0%, rgba(10,8,1,0.99) 100%)",
                border: "2px solid rgba(233,185,73,0.72)",
                boxShadow: "0 0 50px rgba(233,185,73,0.24)",
              }}
            >
              <div className="h-1 absolute top-0 inset-x-0" style={{
                background: "linear-gradient(90deg, transparent, #007c83, #e9b949, #007c83, transparent)"
              }} />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,124,131,0.22) 0%, rgba(16,26,53,0.92) 100%)",
                    border: "1px solid rgba(131,197,190,0.48)",
                  }}>
                  <ShipIcon color="#e9b949" size={32} />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-[0.3em] text-tesoro-gold/70 uppercase mb-0.5">Active Boarding Permit</div>
                  <div className="text-xl font-serif font-black gold-shimmer">YOUR BERTH AWAITS</div>
                  <div className="text-xs font-mono text-gray-400 mt-0.5">Check the boarding permit overlay. 10-minute claim window is active.</div>
                </div>
              </div>
            </motion.div>
          )}

          {isWaitlisted && userPos && (
            <motion.div
              key="waitlisted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(8,18,38,0.98) 0%, rgba(4,10,22,0.99) 100%)",
                border: "1px solid rgba(228,87,86,0.4)",
                boxShadow: "0 0 30px rgba(228,87,86,0.12)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 animate-breathe"
                  style={{
                    background: "linear-gradient(135deg, rgba(228,87,86,0.15) 0%, rgba(16,26,53,0.95) 100%)",
                    border: "1px solid rgba(228,87,86,0.5)",
                  }}>
                  <ShipIcon color="#e45756" size={28} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-mono tracking-[0.3em] text-reverie-crimson/70 uppercase mb-0.5">Your Position</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-mono font-black text-white">#{userPos}</span>
                    <span className="text-xs font-mono text-gray-400">in queue</span>
                  </div>
                  <div className="text-xs font-mono text-gray-500 mt-1">
                    {userRegistration.crew_name} — Awaiting promotion to Grand Line
                  </div>
                </div>
                <div className="text-[10px] font-mono text-reverie-crimson/70 uppercase tracking-widest text-right shrink-0">
                  <div className="w-2 h-2 rounded-full bg-reverie-crimson animate-pulse mx-auto mb-1" />
                  WAITLISTED
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Ship approach visual ── */}
        <div
          className="queue-route relative overflow-hidden"
          style={{
            background: "linear-gradient(110deg, rgba(4,10,22,0.72), rgba(6,14,25,0.46))",
            borderTop: "1px solid rgba(131,197,190,0.28)",
            borderBottom: "1px solid rgba(131,197,190,0.18)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "rgba(131,197,190,0.15)" }}>
            <div className="flex items-center gap-2">
              <ShipIcon size={16} />
              <span className="text-xs font-mono text-tesoro-gold/80 uppercase tracking-wider">
                {queueList.length === 0 ? "No Crews Waiting" : `${queueList.length} Crews on Route`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-reverie-crimson animate-pulse" />
              <span className="text-[9px] font-mono text-reverie-crimson/70 uppercase">Live</span>
            </div>
          </div>

          {queueList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3 opacity-20">⚓</div>
              <div className="text-xs font-mono text-gray-600 uppercase tracking-widest">No crews in queue</div>
            </div>
          ) : (
            <>
              {/* Ship approach animation bar */}
              <div className="px-4 py-3 flex items-end gap-1 overflow-hidden"
                style={{ background: "rgba(2,8,18,0.5)" }}>
                {/* Ocean line */}
                <div className="w-full relative h-12 flex items-end gap-1">
                  {displayQueue.map((crew: any, i: number) => {
                    const isUser = crew.queue_position === userPos;
                    const pct = 1 - (i / Math.max(queueList.length, 1));
                    return (
                      <motion.div
                        key={crew.id}
                        layout="position"
                        className="flex flex-col items-center gap-0.5 shrink-0"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        style={{ width: `${Math.min(64, 100 / Math.min(displayQueue.length, 8))}px` }}
                      >
                        <div style={{ opacity: 0.4 + pct * 0.6 }}>
                          <ShipIcon
                            color={isUser ? "#83c5be" : i === 0 ? "#e9b949" : `rgba(233,185,73,${0.3 + pct * 0.4})`}
                            size={isUser ? 24 : 16 + pct * 10}
                          />
                        </div>
                        {isUser && (
                          <div className="text-[7px] font-mono text-tesoro-gold uppercase tracking-wide whitespace-nowrap">YOU</div>
                        )}
                      </motion.div>
                    );
                  })}
                  {/* Grand Line destination glow */}
                  <div className="ml-auto flex flex-col items-center justify-end shrink-0">
                    <div className="w-px h-8 rounded-full animate-pulse" style={{ background: "linear-gradient(to top, #83c5be, transparent)" }} />
                    <div className="text-[7px] font-mono text-tesoro-gold/60 uppercase mt-0.5">Grand Line</div>
                  </div>
                </div>
              </div>
              {/* Wave */}
              <div className="h-px w-full" style={{
                background: "linear-gradient(90deg, transparent, rgba(100,160,255,0.15), rgba(100,160,255,0.3), rgba(100,160,255,0.15), transparent)"
              }} />

              {/* Queue rows */}
              <div className="queue-route-rows divide-y" style={{ borderColor: "rgba(131,197,190,0.09)" }}>
                {displayQueue.map((crew: any, i: number) => {
                  const isUser = crew.queue_position === userPos;
                  const isFirst = i === 0;
                  return (
                    <motion.div
                      key={crew.id}
                      layout="position"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="queue-voyage-row flex items-center gap-4 px-5 py-3.5 relative"
                      style={{
                        background: isUser
                          ? "linear-gradient(90deg, rgba(0,124,131,0.12) 0%, transparent 100%)"
                          : isFirst
                          ? "linear-gradient(90deg, rgba(100,200,100,0.04) 0%, transparent 100%)"
                          : undefined,
                      }}
                    >
                      {isUser && (
                        <div className="absolute inset-y-0 left-0 w-0.5" style={{ background: "#83c5be" }} />
                      )}
                      <PositionBadge pos={crew.queue_position} isUser={isUser} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-serif font-bold text-sm leading-tight truncate ${isUser ? "text-tesoro-gold" : "text-white/90"}`}>
                          {crew.crew_name}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 truncate mt-0.5">
                          {crew.captain_name || "–"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isFirst && (
                          <div className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
                            style={{ background: "rgba(100,200,100,0.1)", border: "1px solid rgba(100,200,100,0.3)", color: "rgba(100,200,100,0.9)" }}>
                            Next Up
                          </div>
                        )}
                        {isUser && (
                          <div className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider"
                            style={{ background: "rgba(0,124,131,0.15)", border: "1px solid rgba(131,197,190,0.42)", color: "#83c5be" }}>
                            YOU
                          </div>
                        )}
                        <ShipIcon color={isUser ? "#83c5be" : "rgba(233,185,73,0.42)"} size={14} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {queueList.length > 5 && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="w-full py-3 text-[11px] font-mono text-tesoro-gold/50 hover:text-tesoro-gold uppercase tracking-wider transition-colors"
                  style={{ borderTop: "1px solid rgba(131,197,190,0.12)" }}
                >
                  {expanded ? "▲ Show Less" : `▼ Show All ${queueList.length} Crews`}
                </button>
              )}
            </>
          )}
        </div>

        {/* World Government footnote */}
        <div className="text-center pt-4">
          <div className="text-[10px] font-mono text-gray-700 uppercase tracking-[0.3em]">
            Queue governed by World Government Reverie Protocol · FIFO · Deterministic
          </div>
          <div className="text-[9px] font-mono text-gray-800 mt-1">
            N 44°12′ W 28°09′ — GRAND LINE FLEET REGISTRY
          </div>
        </div>
      </div>
    </section>
  );
}
