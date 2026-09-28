"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import QRCode from "qrcode";
import { Anchor, ShieldCheck, Calendar, MapPin, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DEMO_EVENT } from "@/lib/constants";

interface GrandLineAccessPassProps {
  registration: {
    id: string;
    crew_name: string;
    captain_name: string;
    captain_email: string;
    college_id: string;
    crew_size: number;
    status: string;
    confirmed_at?: string;
  };
  onAbandonSuccess: () => void;
}

export function GrandLineAccessPass({
  registration,
  onAbandonSuccess,
}: GrandLineAccessPassProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [abandonError, setAbandonError] = useState<string | null>(null);

  const voyageId = `VOYAGE-${registration.id.slice(0, 8).toUpperCase()}`;

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({
        event: DEMO_EVENT.NAME,
        voyageId,
        crew: registration.crew_name,
        captain: registration.captain_name,
        status: registration.status,
      }),
      {
        color: {
          dark: "#040914",
          light: "#d4af37",
        },
        margin: 1,
      }
    )
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("QR error:", err));
  }, [registration, voyageId]);

  const handleAbandon = async () => {
    setAbandoning(true);
    setAbandonError(null);

    try {
      const res = await fetch("/api/registrations/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: registration.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to abandon voyage.");
      }

      onAbandonSuccess();
    } catch (err: any) {
      setAbandonError(err.message || "Failed to release berth.");
    } finally {
      setAbandoning(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* 1. Success Artwork Hero: Cinematic Landscape Treatment of success-image.jpeg */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-tesoro-gold shadow-gold-glow-lg mb-10 group"
      >
        {/* Controlled Landscape Cropping/Object-Fit */}
        <Image
          src="/assets/success-image.jpeg"
          alt="Berth Secured - The Grand Line Awaits"
          fill
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover object-center filter brightness-[0.88] contrast-[1.08] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Cinematic Letterbox Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-marine-950 via-marine-950/20 to-marine-950/60" />
        <div className="absolute inset-0 border-8 border-marine-950/80 pointer-events-none rounded-3xl" />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marine-950/90 border border-tesoro-gold/40 text-xs font-mono text-tesoro-gold uppercase tracking-widest w-fit mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Charter Verified</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-wide drop-shadow-lg">
            BERTH SECURED
          </h2>
          <p className="text-base sm:text-lg font-mono text-tesoro-amber uppercase tracking-[0.25em] font-semibold mt-1">
            THE GRAND LINE AWAITS.
          </p>
        </div>
      </motion.div>

      {/* 2. Official Digital Pass: GRAND LINE ACCESS PASS */}
      <div className="relative rounded-3xl bg-gradient-to-b from-marine-900 to-marine-950 border-2 border-tesoro-gold/50 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-tesoro-gold/20 gap-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-tesoro-gold uppercase">
              Official Delegation Credential
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wider mt-0.5">
              GRAND LINE ACCESS PASS
            </h3>
            <div className="text-xs font-mono text-gray-300 mt-1">
              Event: <span className="text-tesoro-amber font-semibold">{DEMO_EVENT.NAME}</span>
            </div>
          </div>

          {/* Voyage ID Badge */}
          <div className="px-4 py-2 rounded-xl bg-marine-950 border border-tesoro-gold/40 text-right">
            <div className="text-[10px] font-mono text-gray-400 uppercase">Charter ID</div>
            <div className="text-sm font-mono font-bold text-tesoro-gold">{voyageId}</div>
          </div>
        </div>

        {/* Pass Details & QR Code Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-marine-950/80 border border-marine-800">
                <div className="text-xs font-mono text-gray-400 uppercase">Vessel / Crew</div>
                <div className="text-lg font-serif font-bold text-white mt-0.5">
                  {registration.crew_name}
                </div>
                <div className="text-xs font-mono text-tesoro-gold mt-1">
                  Crew Size: {registration.crew_size} Delegates
                </div>
              </div>

              <div className="p-4 rounded-xl bg-marine-950/80 border border-marine-800">
                <div className="text-xs font-mono text-gray-400 uppercase">Commanding Officer</div>
                <div className="text-lg font-serif font-bold text-white mt-0.5">
                  {registration.captain_name}
                </div>
                <div className="text-xs font-mono text-gray-400 mt-1">
                  ID: {registration.college_id}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-marine-950/80 border border-marine-800">
                <div className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-tesoro-gold" />
                  <span>Voyage Date & Time</span>
                </div>
                <div className="text-sm font-mono font-semibold text-white mt-1">
                  {DEMO_EVENT.DATE}
                </div>
                <div className="text-xs font-mono text-gray-400 mt-0.5">{DEMO_EVENT.TIME}</div>
              </div>

              <div className="p-4 rounded-xl bg-marine-950/80 border border-marine-800">
                <div className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-tesoro-gold" />
                  <span>Assembly Harbor</span>
                </div>
                <div className="text-sm font-mono font-semibold text-white mt-1">
                  {DEMO_EVENT.VENUE}
                </div>
                <div className="text-xs font-mono text-gray-400 mt-0.5">Seminar Hall Access</div>
              </div>
            </div>
          </div>

          {/* Digital QR Authentication Code */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-marine-950 border border-tesoro-gold/30 shadow-inner text-center">
            {qrCodeUrl ? (
              <div className="p-2 bg-marine-900 rounded-xl border border-tesoro-gold/40 shadow-gold-glow">
                <Image
                  src={qrCodeUrl}
                  alt="Boarding Pass QR Code"
                  width={140}
                  height={140}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl bg-marine-900 animate-pulse flex items-center justify-center text-xs font-mono text-gray-400">
                Generating QR...
              </div>
            )}
            <div className="text-[10px] font-mono text-tesoro-gold/70 mt-3 uppercase tracking-wider">
              Scan at Port Gate
            </div>
          </div>
        </div>

        {/* Cancellation Section: Abandon Voyage */}
        <div className="pt-6 border-t border-marine-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-gray-400">
            Cannot attend? Releasing your berth will immediately offer it to the next eligible crew in the Poneglyph Queue.
          </div>

          <button
            onClick={() => setShowAbandonConfirm(true)}
            className="px-5 py-2.5 rounded-lg border border-reverie-crimson/50 text-reverie-crimson hover:bg-reverie-crimson hover:text-white font-mono text-xs tracking-wider uppercase transition-colors shrink-0"
          >
            Abandon Voyage
          </button>
        </div>
      </div>

      {/* Abandon Confirmation Modal */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marine-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl bg-marine-900 border-2 border-reverie-crimson p-6 text-center shadow-crimson-glow"
          >
            <AlertTriangle className="w-10 h-10 text-reverie-crimson mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-white">
              CONFIRM VOYAGE ABANDONMENT
            </h3>
            <p className="text-xs text-gray-300 font-mono mt-2 leading-relaxed">
              Your berth will be released and offered to the next eligible crew in the Poneglyph Queue. This action is atomic and irreversible.
            </p>

            {abandonError && (
              <div className="mt-3 p-2 rounded bg-reverie-blood text-white text-xs font-mono">
                {abandonError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowAbandonConfirm(false)}
                className="py-2.5 rounded bg-marine-800 text-gray-300 font-mono text-xs uppercase"
              >
                Keep Voyage
              </button>
              <button
                onClick={handleAbandon}
                disabled={abandoning}
                className="py-2.5 rounded bg-reverie-crimson text-white font-mono text-xs uppercase font-bold hover:bg-reverie-blood disabled:opacity-50"
              >
                {abandoning ? "Releasing..." : "Confirm Release"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
