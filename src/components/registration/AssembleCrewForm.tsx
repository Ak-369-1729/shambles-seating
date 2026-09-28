"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_EVENT } from "@/lib/constants";

interface AssembleCrewFormProps {
  availableCapacity: number;
  currentUser: any | null;
  onSuccess: (reg: any) => void;
}

const CREW_SIZES = [3, 4];

export function AssembleCrewForm({ availableCapacity, currentUser, onSuccess }: AssembleCrewFormProps) {
  const [crewName, setCrewName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState(currentUser?.email || "");
  const [collegeId, setCollegeId] = useState("");
  const [crewSize, setCrewSize] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isFull = availableCapacity <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/registrations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewName, captainName, captainEmail, collegeId, crewSize }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Registration failed.");
      setSuccess(true);
      setTimeout(() => onSuccess(data.registration), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section id="rsvp" className="relative py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
            <div className="text-6xl mb-4">⚓</div>
            <div className="text-2xl font-serif font-black gold-shimmer tracking-wider">CREW ENLISTED</div>
            <div className="text-xs font-mono text-gray-400 mt-2">Preparing your manifest…</div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="rsvp"
      className="relative w-full py-16 sm:py-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #010509 0%, #020b14 40%, #010509 100%)" }}
    >
      {/* Nautical grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(212,175,55,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.025) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      {/* Gran Tesoro gold corner glow */}
      <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 100% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)"
      }} />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="text-center mb-10">
          <div className="flex items-center gap-3 justify-center mb-3">
            <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-tesoro-gold/30" />
            <span className="text-[10px] font-mono tracking-[0.35em] text-tesoro-gold/60 uppercase">
              Crew Manifest
            </span>
            <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-tesoro-gold/30" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-wide">
            {isFull ? "THE PORT IS CLOSED" : "ASSEMBLE YOUR CREW"}
          </h2>
          <p className="text-xs font-mono text-gray-500 mt-2 uppercase tracking-wider">
            {isFull
              ? "Every berth has been claimed. You may still join the Poneglyph Queue."
              : `${availableCapacity} berth${availableCapacity === 1 ? "" : "s"} remain on the Grand Line`}
          </p>
        </div>

        {/* Full capacity skull state */}
        <AnimatePresence>
          {isFull && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden mb-8"
              style={{
                background: "linear-gradient(160deg, rgba(40,2,2,0.98) 0%, rgba(10,1,1,0.99) 100%)",
                border: "2px solid rgba(196,30,58,0.4)",
                boxShadow: "0 0 60px rgba(196,30,58,0.15)",
              }}
            >
              <div className="h-1 w-full" style={{
                background: "linear-gradient(90deg, transparent, #c41e3a, #ff4a6a, #c41e3a, transparent)"
              }} />
              <div className="p-10 text-center">
                {/* Skull SVG */}
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                    {/* Skull head */}
                    <ellipse cx="50" cy="42" rx="30" ry="28" fill="rgba(240,240,240,0.15)" stroke="rgba(196,30,58,0.6)" strokeWidth="1.5" />
                    {/* Eye sockets */}
                    <ellipse cx="38" cy="40" rx="7" ry="8" fill="rgba(1,5,9,0.9)" />
                    <ellipse cx="62" cy="40" rx="7" ry="8" fill="rgba(1,5,9,0.9)" />
                    {/* Nose */}
                    <path d="M 47 52 L 50 58 L 53 52 Z" fill="rgba(1,5,9,0.7)" />
                    {/* Jaw */}
                    <rect x="32" y="65" width="36" height="10" rx="3" fill="rgba(200,200,200,0.1)" stroke="rgba(196,30,58,0.4)" strokeWidth="1" />
                    {/* Teeth */}
                    {[36, 42, 48, 54, 60].map(x => (
                      <rect key={x} x={x} y="65" width="4" height="8" rx="1" fill="rgba(240,240,240,0.15)" />
                    ))}
                    {/* Red bandana */}
                    <path d="M 20 38 Q 50 28 80 38 Q 80 46 50 44 Q 20 46 20 38 Z" fill="rgba(196,30,58,0.7)" />
                    <path d="M 20 38 L 16 30 Q 18 36 20 38 Z" fill="rgba(139,0,0,0.8)" />
                    <path d="M 80 38 L 84 30 Q 82 36 80 38 Z" fill="rgba(139,0,0,0.8)" />
                    <circle cx="50" cy="36" r="3" fill="rgba(255,191,0,0.6)" />
                  </svg>
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ background: "radial-gradient(circle, rgba(196,30,58,0.4) 0%, transparent 70%)" }}
                  />
                </div>
                <div className="text-2xl font-serif font-black crimson-shimmer tracking-widest mb-2">
                  EVERY BERTH HAS BEEN CLAIMED
                </div>
                <div className="text-xs font-mono text-gray-400 leading-relaxed max-w-sm mx-auto">
                  But the queue is still moving. Join the Poneglyph Queue below — when a crew releases their berth, the next in line is offered a 10-minute claim window.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration form */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, rgba(18,12,2,0.98) 0%, rgba(8,6,1,0.99) 100%)",
            border: "1px solid rgba(212,175,55,0.25)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(212,175,55,0.06)",
          }}
        >
          {/* Gold top rule */}
          <div className="h-px w-full" style={{
            background: "linear-gradient(90deg, transparent, #d4af37, #ffbf00, #d4af37, transparent)"
          }} />

          <form onSubmit={handleSubmit} className="p-7 sm:p-9 space-y-5">
            {/* Stamp header */}
            <div className="text-center pb-4 border-b" style={{ borderColor: "rgba(212,175,55,0.12)" }}>
              <div className="text-[10px] font-mono tracking-[0.4em] text-tesoro-gold/50 uppercase">
                Gran Tesoro Registry · Official Manifest
              </div>
            </div>

            {/* Crew name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono tracking-[0.25em] text-tesoro-gold/70 uppercase">
                Crew / Vessel Name *
              </label>
              <input
                value={crewName}
                onChange={e => setCrewName(e.target.value)}
                required
                placeholder="e.g. Straw Hat Pirates"
                className="field-ocean"
              />
            </div>

            {/* Captain name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono tracking-[0.25em] text-tesoro-gold/70 uppercase">
                Commanding Officer (Captain) *
              </label>
              <input
                value={captainName}
                onChange={e => setCaptainName(e.target.value)}
                required
                placeholder="Captain's full name"
                className="field-ocean"
              />
            </div>

            {/* Two column: email + ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-[0.25em] text-tesoro-gold/70 uppercase">
                  Captain's Email *
                </label>
                <input
                  type="email"
                  value={captainEmail}
                  onChange={e => setCaptainEmail(e.target.value)}
                  required
                  placeholder="captain@ship.com"
                  className="field-ocean"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-[0.25em] text-tesoro-gold/70 uppercase">
                  College / Roll ID *
                </label>
                <input
                  value={collegeId}
                  onChange={e => setCollegeId(e.target.value)}
                  required
                  placeholder="Student ID or Roll No."
                  className="field-ocean"
                />
              </div>
            </div>

            {/* Crew size */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono tracking-[0.25em] text-tesoro-gold/70 uppercase">
                Crew Size ({DEMO_EVENT.MIN_CREW_SIZE}–{DEMO_EVENT.MAX_CREW_SIZE} members) *
              </label>
              <div className="flex gap-3">
                {CREW_SIZES.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCrewSize(n)}
                    className="flex-1 py-3 rounded-xl font-mono font-bold text-sm transition-all"
                    style={{
                      background: crewSize === n
                        ? "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(10,8,2,0.9) 100%)"
                        : "rgba(4,10,22,0.7)",
                      border: `1px solid ${crewSize === n ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.15)"}`,
                      color: crewSize === n ? "#d4af37" : "rgba(212,175,55,0.35)",
                      boxShadow: crewSize === n ? "0 0 15px rgba(212,175,55,0.15)" : "none",
                    }}
                  >
                    {n} Members
                  </button>
                ))}
              </div>
            </div>

            {/* Waitlist notice */}
            {isFull && (
              <div className="p-3.5 rounded-xl text-xs font-mono leading-relaxed"
                style={{
                  background: "rgba(196,30,58,0.08)",
                  border: "1px solid rgba(196,30,58,0.25)",
                  color: "rgba(196,30,58,0.8)",
                }}>
                ⚠ The fleet is at capacity. Registering will place you in the Poneglyph Queue. You will be automatically promoted when a berth opens.
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl text-xs font-mono"
                style={{
                  background: "rgba(196,30,58,0.1)",
                  border: "1px solid rgba(196,30,58,0.3)",
                  color: "#ff6b81",
                }}>
                ⚠ {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="w-full py-5 rounded-2xl font-serif font-black text-base tracking-[0.2em] uppercase disabled:opacity-60"
              style={{
                background: isFull
                  ? "linear-gradient(135deg, #6b0000, #c41e3a, #8b0000)"
                  : "linear-gradient(135deg, #996515, #d4af37, #ffbf00, #d4af37, #996515)",
                color: isFull ? "white" : "#010509",
                boxShadow: isFull
                  ? "0 0 30px rgba(196,30,58,0.4)"
                  : "0 0 30px rgba(212,175,55,0.4), 0 8px 30px rgba(0,0,0,0.5)",
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  REGISTERING CREW...
                </span>
              ) : isFull ? "⚓ JOIN THE PONEGLYPH QUEUE" : "⚓ SECURE YOUR BERTH"}
            </motion.button>

            {!currentUser && (
              <p className="text-center text-[10px] font-mono text-gray-600">
                <a href="/login" className="text-tesoro-gold/60 hover:text-tesoro-gold transition-colors">Sign in</a>
                {" "}to link this registration to your account.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
