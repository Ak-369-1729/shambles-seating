"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Anchor } from "lucide-react";
import { signup } from "@/app/auth/actions";
import { encodeSessionCookie } from "@/lib/auth/session-cookie";

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ opacity: [0.1, 0.8, 0.1] }}
      transition={{ duration: 3 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2 + 0.5, delay: Math.random() * 4,
}));

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await signup(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        if (res?.user) {
          try {
            const cookieVal = encodeSessionCookie(res.user);
            document.cookie = `shambles_user_session=${cookieVal}; path=/; max-age=604800; SameSite=Lax`;
            localStorage.setItem("shambles_user_session", JSON.stringify(res.user));
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user: res.user }),
            });
          } catch {}
        }
        window.location.href = res?.redirectUrl || "/";
      }
    } catch {
      setError("An unexpected squall disrupted enlistment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#030810" }}>
      {/* LEFT: Auth form panel */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center relative px-6 py-12 order-1 lg:order-none">
        <div className="absolute inset-0 pointer-events-none">
          {STARS.slice(0, 30).map((s) => <Star key={s.id} {...s} />)}
        </div>
        <div className="absolute inset-0 bg-radial-crimson-center pointer-events-none opacity-50" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-md"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-tesoro-gold/70 hover:text-tesoro-gold transition-colors mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Return to Voyage Overview
          </Link>

          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(8,18,38,0.97) 0%, rgba(6,12,28,0.99) 100%)",
              border: "1px solid rgba(212,175,55,0.25)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
            }}
          >
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #d4af37, #ffbf00, #d4af37, transparent)" }} />

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(8,18,38,0.9))", border: "1px solid rgba(212,175,55,0.35)", boxShadow: "0 0 20px rgba(212,175,55,0.2)" }}
              >
                <span className="text-2xl">⚓</span>
              </div>
              <h1 className="text-2xl font-serif font-black gold-shimmer tracking-wider">ENLIST NEW VOYAGER</h1>
              <p className="text-xs font-mono text-gray-500 mt-2">Create your account to establish instant crew charter credentials.</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 rounded-xl flex items-center gap-2 text-xs font-mono text-white"
                style={{ background: "rgba(196,30,58,0.15)", border: "1px solid rgba(196,30,58,0.4)" }}
              >
                <AlertCircle className="w-4 h-4 text-reverie-crimson shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Full Name", name: "fullName", type: "text", placeholder: "e.g. Captain Edward" },
                { label: "College Registration ID", name: "collegeId", type: "text", placeholder: "e.g. COL-2026-104" },
                { label: "Email Address", name: "email", type: "email", placeholder: "captain@grandline.edu" },
                { label: "Password (Voyage Cipher)", name: "password", type: "password", placeholder: "Minimum 6 characters" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-[10px] font-mono text-tesoro-gold/70 uppercase tracking-[0.2em] mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    required
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-marine-950/80 border border-tesoro-gold/20 text-[#f4e8c1] font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-tesoro-gold/50 focus:shadow-[0_0_16px_rgba(212,175,55,0.12)] transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="block text-[10px] font-mono text-tesoro-gold/70 uppercase tracking-[0.2em] mb-1.5">Enlistment Role</label>
                <select
                  name="role"
                  defaultValue="participant"
                  className="w-full px-4 py-3 rounded-xl bg-marine-950/80 border border-tesoro-gold/20 text-[#f4e8c1] font-mono text-sm focus:outline-none focus:border-tesoro-gold/50 transition-all cursor-pointer"
                >
                  <option value="participant">Voyager / Crew Representative</option>
                  <option value="admin">Fleet Command / Admiralty Officer</option>
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-4 rounded-xl font-serif font-bold text-sm tracking-[0.15em] uppercase transition-all disabled:opacity-50 mt-1"
                style={{
                  background: "linear-gradient(135deg, #996515, #d4af37, #ffbf00, #d4af37, #996515)",
                  boxShadow: loading ? "none" : "0 0 25px rgba(212,175,55,0.4), 0 6px 20px rgba(0,0,0,0.4)",
                  color: "#040a14",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Establishing Charter...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Anchor className="w-4 h-4" />
                    Enlist & Board Ship
                  </span>
                )}
              </motion.button>
            </form>

            <div className="mt-6 pt-5 border-t border-tesoro-gold/10 text-center text-xs font-mono text-gray-500">
              Already enlisted?{" "}
              <Link href="/login" className="text-tesoro-gold hover:text-tesoro-amber font-bold transition-colors">
                Sign In to Existing Charter
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Cinematic image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-2">
        <Image
          src="/assets/landing-bg.png"
          alt="Gran Tesoro"
          fill
          priority
          className="object-cover object-center"
          style={{ filter: "brightness(0.55) saturate(1.3)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#030810]/40 via-transparent to-[#030810]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030810]/80 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((s) => <Star key={s.id} {...s} />)}
        </div>

        <div className="absolute bottom-0 right-0 left-0 p-12 text-right">
          <div className="text-[11px] font-mono tracking-[0.3em] text-tesoro-gold/70 uppercase mb-3">
            Frontend Roulette 1.0
          </div>
          <div className="text-4xl font-serif font-black gold-shimmer leading-tight">
            YOUR VOYAGE<br />AWAITS
          </div>
          <div className="mt-3 text-sm font-mono text-gray-400">
            50 berths. Strictly FIFO. No priority queue.
          </div>
          <div className="mt-6 flex justify-end">
            <div className="h-px w-24 bg-gradient-to-l from-tesoro-gold/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
