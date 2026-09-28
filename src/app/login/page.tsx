"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Anchor, Compass } from "lucide-react";
import { login } from "@/app/auth/actions";
import { encodeSessionCookie } from "@/lib/auth/session-cookie";

// Animated star
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

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
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
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#030810" }}>
      {/* LEFT: Cinematic image panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/assets/landing-bg.png"
          alt="Gran Tesoro"
          fill
          priority
          className="object-cover object-center"
          style={{ filter: "brightness(0.6) saturate(1.2)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030810]/40 via-transparent to-[#030810]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030810]/80 to-transparent" />
        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((s) => <Star key={s.id} {...s} />)}
        </div>
        {/* Branding overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="text-[11px] font-mono tracking-[0.3em] text-tesoro-gold/70 uppercase mb-3">
            Gran Tesoro VIP Gala
          </div>
          <div className="text-4xl font-serif font-black gold-shimmer leading-tight">
            SHAMBLES<br />SEATING
          </div>
          <div className="mt-3 text-sm font-mono text-gray-400">
            Your berth. Your crew. Your voyage.
          </div>
          {/* Divider */}
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-tesoro-gold/60 to-transparent" />
        </div>
      </div>

      {/* RIGHT: Auth form panel */}
      <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center relative px-6 py-12">
        {/* Stars on mobile */}
        <div className="absolute inset-0 pointer-events-none lg:hidden">
          {STARS.slice(0, 30).map((s) => <Star key={s.id} {...s} />)}
        </div>
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gold-center pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-tesoro-gold/70 hover:text-tesoro-gold transition-colors mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Return to Voyage Overview
          </Link>

          {/* Card */}
          <div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(8,18,38,0.97) 0%, rgba(6,12,28,0.99) 100%)",
              border: "1px solid rgba(212,175,55,0.25)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.05)",
            }}
          >
            {/* Top gold bar */}
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #d4af37, #ffbf00, #d4af37, transparent)" }} />

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(8,18,38,0.9))", border: "1px solid rgba(212,175,55,0.35)", boxShadow: "0 0 20px rgba(212,175,55,0.2)" }}
              >
                <Compass className="w-7 h-7 text-tesoro-gold animate-spin-slower" />
              </div>
              <h1 className="text-2xl font-serif font-black gold-shimmer tracking-wider">FLEET ACCESS SIGN IN</h1>
              <p className="text-xs font-mono text-gray-500 mt-2">Authenticate to manage crew charter & boarding credentials.</p>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-tesoro-gold/70 uppercase tracking-[0.2em] mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="captain@grandline.edu"
                  className="w-full px-4 py-3 rounded-xl bg-marine-950/80 border border-tesoro-gold/20 text-[#f4e8c1] font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-tesoro-gold/50 focus:shadow-[0_0_16px_rgba(212,175,55,0.12)] transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-mono text-tesoro-gold/70 uppercase tracking-[0.2em]">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-mono text-tesoro-gold/60 hover:text-tesoro-gold transition-colors">
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-marine-950/80 border border-tesoro-gold/20 text-[#f4e8c1] font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-tesoro-gold/50 focus:shadow-[0_0_16px_rgba(212,175,55,0.12)] transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-4 rounded-xl font-serif font-bold text-sm tracking-[0.15em] uppercase transition-all disabled:opacity-50 mt-2"
                style={{
                  background: "linear-gradient(135deg, #996515, #d4af37, #ffbf00, #d4af37, #996515)",
                  boxShadow: loading ? "none" : "0 0 25px rgba(212,175,55,0.4), 0 6px 20px rgba(0,0,0,0.4)",
                  color: "#040a14",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Anchor className="w-4 h-4" />
                    Sign In to Voyage
                  </span>
                )}
              </motion.button>
            </form>

            {/* Footer link */}
            <div className="mt-6 pt-5 border-t border-tesoro-gold/10 text-center text-xs font-mono text-gray-500">
              Not yet enlisted?{" "}
              <Link href="/signup" className="text-tesoro-gold hover:text-tesoro-amber font-bold transition-colors">
                Register New Crew Account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
