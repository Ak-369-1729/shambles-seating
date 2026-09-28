"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Anchor, Wind } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: "linear-gradient(180deg, #030810 0%, #060c1c 100%)" }}
    >
      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: 3 + Math.random() * 3, delay: Math.random() * 4, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Ocean mist bottom */}
      <div
        className="absolute bottom-0 inset-x-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(8,18,38,0.6), transparent)" }}
      />

      <div className="relative z-10 text-center max-w-xl mx-auto">
        {/* Lost at sea icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 flex justify-center"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(8,18,38,0.9))",
              border: "1px solid rgba(212,175,55,0.3)",
              boxShadow: "0 0 40px rgba(212,175,55,0.2)",
            }}
          >
            <span className="text-4xl">🧭</span>
          </div>
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[8rem] sm:text-[10rem] font-serif font-black leading-none gold-shimmer"
          style={{ textShadow: "0 0 80px rgba(212,175,55,0.2)" }}
        >
          404
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white mt-2 mb-3">
            Lost at Sea
          </h1>
          <p className="text-sm font-mono text-gray-400 leading-relaxed mb-8">
            These waters are uncharted. The page you seek has sailed beyond the Grand Line or was never recorded in the fleet logs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-7 py-3.5 rounded-xl font-serif font-bold text-sm tracking-wider uppercase text-marine-950 transition-all hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #d4af37, #ffbf00, #d4af37)",
                boxShadow: "0 0 25px rgba(212,175,55,0.4)",
              }}
            >
              <Anchor className="inline-block w-4 h-4 mr-2 mb-0.5" />
              Return to Port
            </Link>
            <Link
              href="/#rsvp"
              className="px-6 py-3.5 rounded-xl font-mono text-sm text-tesoro-gold border border-tesoro-gold/30 hover:border-tesoro-gold/60 hover:bg-marine-900/50 transition-all"
            >
              Assemble Crew
            </Link>
          </div>
        </motion.div>

        {/* Coordinates decoration */}
        <div className="mt-12 flex items-center justify-center gap-3 text-[10px] font-mono text-tesoro-gold/25">
          <span>⚓ N 0°00′ W 0°00′</span>
          <span>•</span>
          <span>UNCHARTED WATERS</span>
          <span>•</span>
          <span>GRAND LINE</span>
        </div>
      </div>
    </div>
  );
}
