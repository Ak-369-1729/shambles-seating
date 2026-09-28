"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { signup } from "@/app/auth/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await signup(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-marine-950 text-[#F4E8C1] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.06)_0%,_transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-marine-900/90 border-2 border-tesoro-gold/40 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-tesoro-gold hover:underline mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Voyage Overview
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-marine-950 border border-tesoro-gold/50 shadow-gold-glow flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6 text-tesoro-gold" />
          </div>
          <h1 className="text-2xl font-serif font-black gold-shimmer tracking-wider">
            ENLIST NEW VOYAGER
          </h1>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Create your account to submit crew charters and track waitlist standing.
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-marine-950/80 border border-emerald-500/50 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-white">
              ACCOUNT REGISTERED
            </h3>
            <p className="text-xs font-mono text-gray-300">
              Your account has been created. Check your email inbox to confirm or proceed to sign in.
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 rounded bg-tesoro-gold text-marine-950 font-mono text-xs uppercase font-bold mt-2"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-reverie-crimson/20 border border-reverie-crimson text-xs font-mono text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-reverie-crimson shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Captain Edward"
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-950 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  College Registration ID
                </label>
                <input
                  type="text"
                  name="collegeId"
                  required
                  placeholder="e.g. COL-2026-104"
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-950 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="captain@grandline.edu"
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-950 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-950 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Enlistment Role
                </label>
                <select
                  name="role"
                  defaultValue="participant"
                  className="w-full px-4 py-2.5 rounded-lg bg-marine-950 border border-tesoro-gold/30 text-white font-mono text-sm focus:outline-none focus:border-tesoro-gold cursor-pointer"
                >
                  <option value="participant">Voyager / Crew Representative</option>
                  <option value="admin">Fleet Command / Admiralty Officer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-tesoro-gold via-tesoro-amber to-tesoro-bronze text-marine-950 font-serif font-bold text-sm tracking-widest uppercase shadow-gold-glow hover:scale-[1.01] transition-transform disabled:opacity-50 mt-2"
              >
                {loading ? "ENLISTING VOYAGER..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className="mt-6 text-center text-xs font-mono text-gray-400">
              Already enlisted?{" "}
              <Link href="/login" className="text-tesoro-gold hover:underline font-bold">
                Sign In to Existing Charter
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
