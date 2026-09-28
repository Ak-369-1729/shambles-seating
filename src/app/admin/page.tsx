"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import {
  Compass,
  Users,
  Clock,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { DEMO_EVENT } from "@/lib/constants";

export default function FleetCommandDeck() {
  const [eventData, setEventData] = useState<any>(null);
  const [queueData, setQueueData] = useState<any>({ queue: [], confirmed: [], offered: [] });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Fetch all fleet telemetry
  const fetchData = async () => {
    try {
      const [eventRes, queueRes, logsRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/admin/queue"),
        fetch("/api/admin/audit-logs"),
      ]);

      const [eventJson, queueJson, logsJson] = await Promise.all([
        eventRes.json(),
        queueRes.json(),
        logsRes.json(),
      ]);

      setEventData(eventJson);
      setQueueData(queueJson);
      setAuditLogs(logsJson.logs || []);
    } catch (err: any) {
      console.error("Telemetry fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Admin Action: Release Berth
  const handleReleaseBerth = async () => {
    setProcessing(true);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/release", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to release berth.");
      }
      setActionMessage(data.message || "Berth released. Next waitlisted crew offered.");
      await fetchData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Admin Action: Expire Active Offer
  const handleExpireOffer = async () => {
    setProcessing(true);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/expire", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to expire offer.");
      }
      setActionMessage(data.message || "Active offer expired. Cascade promotion executed.");
      await fetchData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Admin Action: Reset Demo
  const handleResetDemo = async () => {
    setProcessing(true);
    setActionMessage(null);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset demo.");
      }
      setActionMessage(data.message || "Demo event reseeded.");
      await fetchData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const confirmedCount = eventData?.confirmed_count ?? 47;
  const capacity = eventData?.capacity ?? 50;
  const waitlistCount = eventData?.waitlist_count ?? queueData.queue.length;
  const hasActiveOffer = Boolean(eventData?.active_offer || queueData.offered?.length > 0);

  return (
    <main className="min-h-screen bg-marine-950 text-[#F4E8C1] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <Navbar
        user={{ email: "admiral@grandline.gov", role: "admin" }}
        confirmedCount={confirmedCount}
        capacity={capacity}
        waitlistCount={waitlistCount}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Back link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-tesoro-gold/20">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-tesoro-gold hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Voyage Overview
            </Link>
            <h1 className="text-3xl sm:text-4xl font-serif font-black gold-shimmer tracking-wide">
              FLEET COMMAND DECK
            </h1>
            <p className="text-xs font-mono text-gray-400 mt-0.5">
              Event Access & Allocation Control Center • {DEMO_EVENT.NAME}
            </p>
          </div>

          {/* Action Trigger Status Toast */}
          {(actionMessage || actionError) && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 max-w-md ${
                actionError
                  ? "bg-reverie-crimson/20 border-reverie-crimson text-white"
                  : "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              }`}
            >
              {actionError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-reverie-crimson" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{actionError || actionMessage}</span>
            </div>
          )}
        </div>

        {/* 1. Operational Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-marine-900/80 border border-tesoro-gold/30 shadow-inner">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Berths Claimed</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-4xl font-mono font-bold text-tesoro-gold mt-2">
              {confirmedCount} <span className="text-lg text-gray-400">/ {capacity}</span>
            </div>
            <div className="text-xs font-mono text-gray-400 mt-2">
              Remaining: {Math.max(0, capacity - confirmedCount)} Available Slots
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-marine-900/80 border border-tesoro-gold/30 shadow-inner">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Waitlisted Crews</span>
              <Users className="w-4 h-4 text-reverie-crimson" />
            </div>
            <div className="text-4xl font-mono font-bold text-white mt-2">
              {waitlistCount}
            </div>
            <div className="text-xs font-mono text-gray-400 mt-2">
              Poneglyph Queue Active
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-marine-900/80 border border-tesoro-gold/30 shadow-inner">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Active Offers</span>
              <Clock className="w-4 h-4 text-tesoro-amber" />
            </div>
            <div className="text-4xl font-mono font-bold text-tesoro-amber mt-2">
              {hasActiveOffer ? 1 : 0}
            </div>
            <div className="text-xs font-mono text-gray-400 mt-2">
              {hasActiveOffer ? "10-Minute Claim Clock Active" : "No Offers In Flight"}
            </div>
          </div>
        </div>

        {/* 2. Admin Operational Controls Bar */}
        <div className="p-6 rounded-2xl bg-marine-900/90 border-2 border-tesoro-gold/40 shadow-xl space-y-4">
          <div className="text-sm font-serif font-bold text-tesoro-gold tracking-wide uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-tesoro-gold" />
            <span>Admiralty Simulation & Access Overrides</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleReleaseBerth}
              disabled={processing}
              className="px-5 py-2.5 rounded-lg bg-reverie-crimson hover:bg-reverie-blood text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors shadow-crimson-glow disabled:opacity-50"
            >
              RELEASE BERTH
            </button>

            <button
              onClick={handleExpireOffer}
              disabled={processing || !hasActiveOffer}
              className="px-5 py-2.5 rounded-lg bg-marine-800 hover:bg-marine-700 border border-tesoro-gold/40 text-tesoro-gold font-mono text-xs uppercase font-bold tracking-wider transition-colors disabled:opacity-40"
            >
              EXPIRE CURRENT OFFER
            </button>

            <button
              onClick={handleResetDemo}
              disabled={processing}
              className="px-5 py-2.5 rounded-lg bg-marine-950 hover:bg-marine-900 border border-gray-600 text-gray-300 font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 disabled:opacity-50 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET DEMO</span>
            </button>
          </div>
        </div>

        {/* 3. Live Queue & Fleet Activity Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Waitlist Queue */}
          <div className="rounded-2xl bg-marine-900/70 border border-tesoro-gold/20 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-marine-800">
              <div className="text-base font-serif font-bold text-white tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-tesoro-gold" />
                <span>LIVE QUEUE</span>
              </div>
              <span className="text-xs font-mono text-tesoro-gold">
                {queueData.queue.length} Queued Crews
              </span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {queueData.queue.length === 0 ? (
                <div className="text-xs font-mono text-gray-500 py-8 text-center">
                  Waitlist is currently empty.
                </div>
              ) : (
                queueData.queue.map((reg: any) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-xl bg-marine-950/80 border border-marine-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded bg-marine-900 border border-tesoro-gold/30 text-tesoro-gold font-mono font-bold text-xs flex items-center justify-center">
                        #{reg.queue_position}
                      </span>
                      <div>
                        <div className="text-sm font-serif font-bold text-white">
                          {reg.crew_name}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          Capt: {reg.captain_name} • {reg.captain_email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-tesoro-gold uppercase px-2 py-0.5 rounded bg-marine-900 border border-tesoro-gold/20">
                      WAITLISTED
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fleet Activity Audit Log Stream */}
          <div className="rounded-2xl bg-marine-900/70 border border-tesoro-gold/20 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-marine-800">
              <div className="text-base font-serif font-bold text-white tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>FLEET ACTIVITY</span>
              </div>
              <span className="text-xs font-mono text-gray-400">Realtime Audit Ledger</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-xs font-mono text-gray-500 py-8 text-center">
                  No activity recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-marine-950/80 border border-marine-800/80 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="text-tesoro-gold font-bold">{log.type}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-200">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
