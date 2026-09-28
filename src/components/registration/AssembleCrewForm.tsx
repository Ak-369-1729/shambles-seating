"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";

interface AssembleCrewFormProps {
  availableCapacity: number;
  onSuccess: (regData: any) => void;
}

export function AssembleCrewForm({ availableCapacity, onSuccess }: AssembleCrewFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [crewName, setCrewName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [collegeId, setCollegeId] = useState("");

  // Additional members (Member 2 and 3 required; Member 4 optional => total 3 or 4)
  const [members, setMembers] = useState([
    { name: "", email: "", collegeId: "", role: "First Mate" },
    { name: "", email: "", collegeId: "", role: "Specialist" },
  ]);

  const addOptionalMember = () => {
    if (members.length < 3) {
      setMembers([...members, { name: "", email: "", collegeId: "", role: "Navigator" }]);
    }
  };

  const removeOptionalMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registrations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crewName,
          captainName,
          captainEmail,
          captainPhone,
          collegeId,
          crewMembers: members,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register crew.");
      }

      if (data.data?.status === "CONFIRMED") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#d4af37", "#ffbf00", "#c41e3a"],
        });
      }

      onSuccess(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred during crew registration.");
    } finally {
      setLoading(false);
    }
  };

  const isPortClosed = availableCapacity <= 0;

  return (
    <section id="rsvp" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-b from-marine-900/90 to-marine-950/95 border-2 border-tesoro-gold/30 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        {/* Full Capacity Warning Banner: "THE PORT IS CLOSED" with Original Skull & Red Bandana */}
        {isPortClosed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-reverie-blood/40 via-marine-900 to-reverie-blood/40 border-2 border-reverie-crimson shadow-crimson-glow flex flex-col sm:flex-row items-center gap-6"
          >
            {/* Handcrafted Original Pirate Skull with Red Bandana SVG */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_#c41e3a]">
                {/* Skull Base */}
                <ellipse cx="50" cy="54" rx="28" ry="26" fill="#f4ebd9" />
                <rect x="36" y="68" width="28" height="14" rx="4" fill="#f4ebd9" />
                {/* Teeth lines */}
                <line x1="43" y1="70" x2="43" y2="80" stroke="#222" strokeWidth="2" />
                <line x1="50" y1="70" x2="50" y2="80" stroke="#222" strokeWidth="2" />
                <line x1="57" y1="70" x2="57" y2="80" stroke="#222" strokeWidth="2" />
                {/* Eye sockets */}
                <ellipse cx="40" cy="56" rx="6" ry="8" fill="#121212" />
                <ellipse cx="60" cy="56" rx="6" ry="8" fill="#121212" />
                {/* Nose hole */}
                <polygon points="50,62 47,68 53,68" fill="#121212" />
                {/* THE RED BANDANA */}
                <path
                  d="M20 40 Q50 20 80 40 Q84 46 80 48 Q50 30 20 48 Q16 44 20 40 Z"
                  fill="#c41e3a"
                  stroke="#ff6b81"
                  strokeWidth="1.5"
                />
                {/* Bandana Knot & Tails on the side */}
                <circle cx="82" cy="46" r="4.5" fill="#8b0000" />
                <path d="M82 48 Q94 56 90 68 Q84 62 82 52 Z" fill="#c41e3a" />
                <path d="M82 50 Q96 66 94 76 Q86 68 84 54 Z" fill="#8b0000" />
                {/* Bandana Polka dots */}
                <circle cx="36" cy="36" r="1.5" fill="#fff" />
                <circle cx="50" cy="32" r="1.5" fill="#fff" />
                <circle cx="64" cy="36" r="1.5" fill="#fff" />
              </svg>
            </div>

            <div className="text-center sm:text-left">
              <div className="text-sm font-mono tracking-widest text-reverie-crimson font-bold uppercase">
                THE PORT IS CLOSED
              </div>
              <h3 className="text-2xl font-serif font-black text-white mt-1">
                Every Berth Has Been Claimed.
              </h3>
              <p className="text-xs text-gray-300 font-mono mt-1">
                All 50 berths have been chartered for Frontend Roulette 1.0. However, the Poneglyph Queue is moving. Submit below to be placed in the deterministic queue for the next released berth.
              </p>
            </div>
          </motion.div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marine-950 border border-tesoro-gold/30 text-xs font-mono text-tesoro-gold uppercase tracking-widest mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Charter Registration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-wide gold-shimmer">
            ASSEMBLE YOUR CREW
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-mono mt-1">
            Standard delegation rule: exactly 3 to 4 crew members (including Captain).
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-reverie-crimson/20 border border-reverie-crimson text-sm font-mono text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-reverie-crimson shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Captain & Crew Name Section */}
          <div className="p-6 rounded-2xl bg-marine-950/70 border border-tesoro-gold/20 space-y-4">
            <div className="text-sm font-serif font-bold text-tesoro-gold tracking-wide uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-tesoro-gold" />
              <span>Commanding Officers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Crew / Vessel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Line Coders"
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-900 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Captain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Captain Full Name"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-900 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Captain Email *</label>
                <input
                  type="email"
                  required
                  placeholder="captain@college.edu"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-900 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Captain Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-900 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-gray-400 mb-1">College Registration ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COL-2026-089"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-900 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>
            </div>
          </div>

          {/* Additional Crew Members (Member 2, Member 3, optional Member 4) */}
          <div className="p-6 rounded-2xl bg-marine-950/70 border border-tesoro-gold/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-serif font-bold text-tesoro-gold tracking-wide uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-tesoro-gold" />
                <span>Crew Members (Total Roster: {1 + members.length} / 4)</span>
              </div>

              {members.length < 3 && (
                <button
                  type="button"
                  onClick={addOptionalMember}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-marine-800 border border-tesoro-gold/40 text-xs font-mono text-tesoro-gold hover:bg-tesoro-gold hover:text-marine-950 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member 4 (Optional)</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-marine-900/60 border border-marine-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-1 text-xs font-mono text-tesoro-gold font-bold">
                    #{idx + 2}
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      placeholder={`Member ${idx + 2} Name *`}
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-marine-950 border border-marine-700 text-white font-mono text-xs focus:outline-none focus:border-tesoro-gold"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={member.email}
                      onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-marine-950 border border-marine-700 text-white font-mono text-xs focus:outline-none focus:border-tesoro-gold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. Dev)"
                      value={member.role}
                      onChange={(e) => handleMemberChange(idx, "role", e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-marine-950 border border-marine-700 text-white font-mono text-xs focus:outline-none focus:border-tesoro-gold"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    {idx === 2 && (
                      <button
                        type="button"
                        onClick={() => removeOptionalMember(idx)}
                        className="text-gray-400 hover:text-reverie-crimson"
                        title="Remove optional member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-serif font-bold text-base tracking-widest uppercase transition-all shadow-xl ${
              isPortClosed
                ? "bg-gradient-to-r from-reverie-crimson via-reverie-cardinal to-reverie-blood text-white hover:shadow-crimson-glow"
                : "bg-gradient-to-r from-tesoro-gold via-tesoro-amber to-tesoro-bronze text-marine-950 hover:shadow-gold-glow"
            } disabled:opacity-50`}
          >
            {loading
              ? "COMMUNICATING WITH FLEET ADMIRALTY..."
              : isPortClosed
              ? "ENTER THE PONEGLYPH QUEUE"
              : "SUBMIT CHARTER & CONFIRM BERTH"}
          </button>
        </form>
      </div>
    </section>
  );
}
