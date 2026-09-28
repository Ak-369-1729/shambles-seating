"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scroll, Compass, Shield, Users, ArrowUpRight } from "lucide-react";

interface PoneglyphQueueViewProps {
  userRegistration?: {
    crew_name?: string;
    queue_position?: number | null;
    status?: string;
  } | null;
  queueList: Array<{
    id: string;
    crew_name: string;
    captain_name: string;
    queue_position: number;
    created_at: string;
  }>;
}

export function PoneglyphQueueView({
  userRegistration,
  queueList,
}: PoneglyphQueueViewProps) {
  const isWaitlisted = userRegistration?.status === "WAITLISTED";
  const userPosition = userRegistration?.queue_position || 3;
  const crewsAhead = Math.max(0, userPosition - 1);

  return (
    <section id="queue" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-b from-marine-900/90 to-marine-950/95 border-2 border-tesoro-gold/30 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-marine-950 border border-tesoro-gold/30 text-xs font-mono text-tesoro-gold uppercase tracking-widest mb-3">
            <Scroll className="w-3.5 h-3.5" />
            <span>Deterministic FIFO Allocation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-wide gold-shimmer">
            PONEGLYPH QUEUE
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-mono mt-2">
            The queue is cryptographically transparent and strictly deterministic. Positions recalculate transactionally upon any berth release.
          </p>
        </div>

        {/* User's Active Position Focus Card (If waitlisted) */}
        {isWaitlisted && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-marine-900 via-[#102447] to-marine-900 border-2 border-tesoro-gold shadow-gold-glow-lg text-center relative overflow-hidden"
          >
            <div className="text-xs font-mono tracking-widest text-tesoro-amber uppercase mb-1">
              YOUR CREW: {userRegistration?.crew_name}
            </div>
            <div className="text-sm font-mono text-gray-300">CURRENT STANDING</div>

            <div className="my-3 flex items-center justify-center gap-3">
              <span className="text-xs font-mono text-gray-400">YOUR POSITION:</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={userPosition}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl sm:text-6xl font-mono font-black text-tesoro-gold tracking-tight"
                >
                  #{String(userPosition).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-marine-950/80 border border-tesoro-gold/40 text-xs font-mono text-gray-200">
              <span className="text-tesoro-gold font-bold">{crewsAhead}</span>
              <span>CREWS AHEAD OF YOU IN LINE</span>
            </div>

            <div className="mt-4 text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              STATUS: WAITING FOR A BERTH
            </div>
          </motion.div>
        )}

        {/* Live Waitlist Queue Roster Table */}
        <div className="overflow-x-auto rounded-2xl border border-tesoro-gold/20 bg-marine-950/70">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-marine-900/90 text-tesoro-gold uppercase tracking-wider border-b border-tesoro-gold/20">
              <tr>
                <th className="py-4 px-6">Queue Rank</th>
                <th className="py-4 px-6">Crew / Vessel</th>
                <th className="py-4 px-6">Commanding Officer</th>
                <th className="py-4 px-6">Eligibility Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marine-800/60">
              {queueList.map((crew, idx) => {
                const isCurrent = crew.queue_position === userPosition && isWaitlisted;
                return (
                  <motion.tr
                    key={crew.id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`${
                      isCurrent
                        ? "bg-tesoro-gold/15 text-white font-bold"
                        : "hover:bg-marine-900/50 text-gray-300"
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                            crew.queue_position === 1
                              ? "bg-gradient-to-br from-tesoro-gold to-tesoro-amber text-marine-950 shadow-gold-glow"
                              : "bg-marine-800 text-gray-300"
                          }`}
                        >
                          #{crew.queue_position}
                        </span>
                        {crew.queue_position === 1 && (
                          <span className="text-[10px] text-tesoro-gold uppercase font-bold tracking-wider">
                            Next Eligible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-serif text-sm text-white">
                      {crew.crew_name}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {crew.captain_name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-marine-900 border border-tesoro-gold/30 text-[11px] text-tesoro-gold">
                        Waiting for Released Berth
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
