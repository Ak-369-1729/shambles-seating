"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { CinematicLoader } from "@/components/scene/CinematicLoader";
import { LandingHero } from "@/components/scene/LandingHero";
import { GrandLineMap } from "@/components/scene/GrandLineMap";
import { AssembleCrewForm } from "@/components/registration/AssembleCrewForm";
import { PoneglyphQueueView } from "@/components/waitlist/PoneglyphQueueView";
import { BoardingPermitModal } from "@/components/offer/BoardingPermitModal";
import { GrandLineAccessPass } from "@/components/pass/GrandLineAccessPass";
import { INITIAL_WAITLIST_CREWS, DEMO_EVENT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [queueList, setQueueList] = useState<any[]>([]);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shamblesActive, setShamblesActive] = useState(false);

  const defaultQueue = useMemo(
    () =>
      INITIAL_WAITLIST_CREWS.map((name, index) => ({
        id: `waitlist-${index + 1}`,
        crew_name: name,
        captain_name: `Captain ${name.split(" ")[0]}`,
        queue_position: index + 1,
        created_at: new Date(Date.now() - (10 - index) * 60000).toISOString(),
      })),
    []
  );

  const fetchFleetState = useCallback(async () => {
    try {
      const [eventRes, queueRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/admin/queue"),
      ]);
      const eventJson = await eventRes.json();
      const queueJson = await queueRes.json();
      setEventData(eventJson);
      if (queueJson.queue && queueJson.queue.length > 0) {
        setQueueList(queueJson.queue);
      } else {
        setQueueList(defaultQueue);
      }
      if (eventJson.active_offer) {
        setActiveOffer(eventJson.active_offer);
      }
    } catch {
      setEventData({
        confirmed_count: DEMO_EVENT.DEMO_CONFIRMED,
        capacity: DEMO_EVENT.TOTAL_CAPACITY,
        available_capacity: DEMO_EVENT.DEMO_REMAINING,
        waitlist_count: DEMO_EVENT.DEMO_WAITLIST,
      });
      setQueueList(defaultQueue);
    }
  }, [defaultQueue]);

  useEffect(() => {
    fetchFleetState();

    const fetchAuthUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated && json.user) {
            setCurrentUser(json.user);
            return;
          }
        }
        const stored = localStorage.getItem("shambles_user_session");
        if (stored) {
          try { setCurrentUser(JSON.parse(stored)); return; } catch {}
        }
        setCurrentUser(null);
      } catch {}
    };
    fetchAuthUser();

    const seen = sessionStorage.getItem("shambles_loader_seen");
    if (seen === "true") setShowLoader(false);

    try {
      const supabase = createClient();
      const channel = supabase
        .channel("fleet_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => {
          fetchFleetState();
          // Trigger SHAMBLES animation when a berth is released/offered
          setShamblesActive(true);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "berth_offers" }, () => fetchFleetState())
        .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchFleetState())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch {}
  }, [fetchFleetState]);

  const handleLoaderComplete = () => {
    sessionStorage.setItem("shambles_loader_seen", "true");
    setShowLoader(false);
  };

  const handleRegistrationSuccess = (regData: any) => {
    setUserRegistration(regData);
    fetchFleetState();
  };

  const handleClaimSuccess = () => {
    if (userRegistration) setUserRegistration({ ...userRegistration, status: "CONFIRMED" });
    setActiveOffer(null);
    fetchFleetState();
  };

  const handleAbandonSuccess = () => {
    setUserRegistration(null);
    fetchFleetState();
  };

  const confirmedCount = eventData?.confirmed_count ?? DEMO_EVENT.DEMO_CONFIRMED;
  const capacity = eventData?.capacity ?? DEMO_EVENT.TOTAL_CAPACITY;
  const availableCapacity = eventData?.available_capacity ?? DEMO_EVENT.DEMO_REMAINING;
  const waitlistCount = eventData?.waitlist_count ?? queueList.length;

  return (
    <>
      {showLoader && <CinematicLoader onComplete={handleLoaderComplete} />}

      <Navbar
        user={currentUser}
        confirmedCount={confirmedCount}
        capacity={capacity}
        waitlistCount={waitlistCount}
      />

      {/* 1. Cinematic Hero */}
      <LandingHero
        confirmedCount={confirmedCount}
        capacity={capacity}
        availableCapacity={availableCapacity}
        waitlistCount={waitlistCount}
      />

      {/* 2. Grand Line Interactive Capacity Map */}
      <GrandLineMap
        confirmedCount={confirmedCount}
        capacity={capacity}
        availableCapacity={availableCapacity}
        waitlistCount={waitlistCount}
        shamblesActive={shamblesActive}
        onShamblesComplete={() => setShamblesActive(false)}
      />

      {/* 3. Gran Tesoro → Reverie section divider */}
      <div
        className="relative w-full py-10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #020b14 0%, #08040a 50%, #020b14 100%)",
          borderTop: "1px solid rgba(212,175,55,0.08)",
          borderBottom: "1px solid rgba(196,30,58,0.08)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(196,30,58,0.04) 0%, transparent 70%)"
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div>
              <div className="text-[8px] font-mono tracking-[0.4em] text-tesoro-gold/40 uppercase">Theme</div>
              <div className="text-sm font-serif font-bold text-tesoro-gold/80 tracking-widest uppercase">GRAN TESORO VIP GALA</div>
            </div>
            <div className="text-xl text-tesoro-gold/20 font-serif">×</div>
            <div>
              <div className="text-[8px] font-mono tracking-[0.4em] text-reverie-crimson/40 uppercase">Co-Hosted By</div>
              <div className="text-sm font-serif font-bold text-reverie-crimson/70 tracking-widest uppercase">WORLD GOVERNMENT REVERIE</div>
            </div>
            <div className="text-xl text-tesoro-gold/20 font-serif">→</div>
            <div>
              <div className="text-[8px] font-mono tracking-[0.4em] text-white/30 uppercase">Event</div>
              <div className="text-sm font-serif font-bold text-white/60 tracking-widest uppercase">FRONTEND ROULETTE 1.0</div>
            </div>
          </div>
          <div className="mt-4 text-[9px] font-mono text-gray-700 tracking-widest uppercase">
            {DEMO_EVENT.DATE} • {DEMO_EVENT.VENUE} • {DEMO_EVENT.TIME}
          </div>
        </div>
      </div>

      {/* 4. Registration / Pass / Queue */}
      {userRegistration?.status === "CONFIRMED" ? (
        <GrandLineAccessPass
          registration={userRegistration}
          onAbandonSuccess={handleAbandonSuccess}
        />
      ) : (
        <>
          <AssembleCrewForm
            availableCapacity={availableCapacity}
            onSuccess={handleRegistrationSuccess}
            currentUser={currentUser}
          />
          <PoneglyphQueueView
            userRegistration={userRegistration}
            queueList={queueList}
          />
        </>
      )}

      {/* 5. Active Boarding Permit */}
      {activeOffer && (
        <BoardingPermitModal
          offer={activeOffer}
          onClaimed={handleClaimSuccess}
          onExpired={() => { setActiveOffer(null); fetchFleetState(); }}
        />
      )}

      {/* 6. Footer */}
      <footer
        className="relative overflow-hidden text-center"
        style={{
          background: "linear-gradient(180deg, #010509 0%, #000304 100%)",
          borderTop: "1px solid rgba(212,175,55,0.08)",
        }}
      >
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), rgba(255,191,0,0.5), rgba(212,175,55,0.4), transparent)"
        }} />
        <div className="relative max-w-7xl mx-auto px-4 py-14">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(4,12,28,0.9) 100%)",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              <span className="text-xl">⚓</span>
            </div>
            <div>
              <div className="text-base font-serif font-bold tracking-[0.35em] gold-shimmer uppercase">
                SHAMBLES SEATING
              </div>
              <div className="text-[9px] tracking-[0.25em] text-tesoro-gold/35 uppercase mt-1">
                YOUR BERTH • YOUR CREW • YOUR VOYAGE
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 max-w-xs h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15))" }} />
            <span className="text-tesoro-gold/25">⚓</span>
            <div className="flex-1 max-w-xs h-px" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.15), transparent)" }} />
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6 text-[10px] font-mono">
            {["#capacity", "#rsvp", "#queue"].map((href, i) => (
              <a
                key={href}
                href={href}
                className="text-gray-600 hover:text-tesoro-gold/70 uppercase tracking-widest transition-colors"
              >
                {["Fleet Capacity", "Assemble Crew", "Poneglyph Queue"][i]}
              </a>
            ))}
          </div>

          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="text-gray-700">{DEMO_EVENT.NAME} • {DEMO_EVENT.DATE} • {DEMO_EVENT.VENUE}</div>
            <div className="text-gray-800">Gran Tesoro VIP Gala & Reverie Summit • PS-09 Smart Event RSVP System</div>
            <div className="text-tesoro-gold/15 tracking-widest mt-3">⚓ N 44°12′ W 28°09′ — GRAND LINE FLEET REGISTRY</div>
          </div>
        </div>
      </footer>
    </>
  );
}
