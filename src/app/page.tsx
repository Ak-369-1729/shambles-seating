"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { CinematicLoader } from "@/components/scene/CinematicLoader";
import { LandingHero } from "@/components/scene/LandingHero";
import { GrandLineMap } from "@/components/scene/GrandLineMap";
import { AssembleCrewForm } from "@/components/registration/AssembleCrewForm";
import { PoneglyphQueueView } from "@/components/waitlist/PoneglyphQueueView";
import { BoardingPermitModal } from "@/components/offer/BoardingPermitModal";
import { GrandLineAccessPass } from "@/components/pass/GrandLineAccessPass";
import { DEMO_EVENT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [queueList, setQueueList] = useState<any[]>([]);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shamblesActive, setShamblesActive] = useState(false);
  const lastConfirmedCount = useRef<number | null>(null);

  const fetchFleetState = useCallback(async () => {
    try {
      const [eventRes, queueRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/admin/queue"),
      ]);
      const eventJson = await eventRes.json();
      const queueJson = await queueRes.json();
      const nextConfirmedCount = Number(eventJson.confirmed_count);
      if (Number.isFinite(nextConfirmedCount)) {
        if (lastConfirmedCount.current !== null && nextConfirmedCount < lastConfirmedCount.current) {
          setShamblesActive(true);
        }
        lastConfirmedCount.current = nextConfirmedCount;
      }
      setEventData(eventJson);
      setQueueList(Array.isArray(queueJson.queue) ? queueJson.queue : []);
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
      setQueueList([]);
    }
  }, []);

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
        .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => fetchFleetState())
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
        shamblesActive={shamblesActive}
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

      {/* 3. Gala to Reverie charter */}
      <section id="themes" className="world-bridge">
        <div className="world-bridge-inner grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div className="tesoro-side">
            <p className="mb-5 text-[9px] font-mono uppercase tracking-[0.35em] text-tesoro-gold/55">Two worlds. One passage.</p>
            <div id="gala" className="flex items-center gap-5 border-l border-tesoro-gold/35 py-1 pl-5">
              <span className="world-seal"><span>G</span></span>
              <div>
                <p className="text-[8px] font-mono uppercase tracking-[0.28em] text-tesoro-gold/50">The golden port</p>
                <h2 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.1em] text-[#e4c26b] sm:text-2xl">Gran Tesoro VIP Gala</h2>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.15em] text-parchment/55">Private access. Limited berths.</p>
              </div>
            </div>
            <div className="ml-5 mt-5 h-8 w-px bg-gradient-to-b from-tesoro-gold/40 to-reverie-crimson/50" />
            <div id="reverie" className="reverie-side flex items-center gap-5 border-l border-reverie-crimson/45 py-1 pl-5">
              <span className="world-seal" style={{ borderColor: "rgba(196,30,58,0.55)", color: "#cf6267" }}><span>R</span></span>
              <div>
                <p className="text-[8px] font-mono uppercase tracking-[0.28em] text-reverie-crimson/70">The summit beyond the gates</p>
                <h2 className="mt-1 font-serif text-xl font-bold uppercase tracking-[0.1em] text-[#e0b6a9] sm:text-2xl">World Government Reverie</h2>
                <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.15em] text-parchment/55">A chamber built for the chosen few.</p>
              </div>
            </div>
          </div>

          <div className="official-charter border-t border-[#d4af37]/35 pt-5 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
            <p className="text-[8px] font-mono uppercase tracking-[0.3em] text-tesoro-gold/50">Official Grand Line charter</p>
            <h2 className="mt-2 font-serif text-2xl font-bold uppercase tracking-[0.06em] text-parchment sm:text-3xl">{DEMO_EVENT.NAME}</h2>
            <p className="mt-2 text-[9px] font-mono uppercase tracking-[0.2em] text-reverie-crimson/80">Limited berth allocation</p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-4 text-[9px] font-mono uppercase tracking-[0.12em] text-parchment/65">
              <span>{DEMO_EVENT.DATE}</span>
              <span>{DEMO_EVENT.TIME}</span>
              <span className="col-span-2">{DEMO_EVENT.VENUE}</span>
              <span>{DEMO_EVENT.MIN_CREW_SIZE}–{DEMO_EVENT.MAX_CREW_SIZE} crew members</span>
            </div>
          </div>
        </div>
      </section>

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

      {/* 6. Captain's Log */}
      <footer className="captains-log relative overflow-hidden">
        <div className="captains-log-inner mx-auto grid max-w-7xl gap-9 px-6 py-12 md:grid-cols-[1fr_1.15fr_0.9fr] md:items-center lg:px-10">
          <div className="captains-log-brand">
            <p className="captains-log-kicker">Captain&apos;s Log · PS-09</p>
            <h2 className="mt-3 font-serif text-2xl font-black uppercase tracking-[0.08em] text-[#f6e7c1] sm:text-3xl">Shambles Seating</h2>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#83c5be]">Your berth. Your crew. Your voyage.</p>
            <p className="mt-4 text-xs text-[#f6e7c1]/60">Crew of record: <span className="text-[#f6e7c1]/85">The Lost Poneglyph Files</span></p>
          </div>

          <div className="captains-log-chart" aria-label="Decorative Grand Line route chart">
            <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-[#83c5be]/70">
              <span>Magnetic course</span><span>Reverse Mountain</span>
            </div>
            <svg viewBox="0 0 520 100" role="img" aria-label="A marked sea route crossing the Grand Line">
              <path className="log-route-halo" d="M8 74 C68 65 63 28 132 40 S207 82 267 53 339 18 381 43 438 83 512 22" />
              <path className="log-route-line" d="M8 74 C68 65 63 28 132 40 S207 82 267 53 339 18 381 43 438 83 512 22" />
              {[8, 132, 267, 381, 512].map((x, index) => <circle key={x} className={index === 4 ? "log-route-end" : "log-route-point"} cx={x} cy={[74, 40, 53, 43, 22][index]} r={index === 4 ? 5 : 3} />)}
            </svg>
            <div className="flex justify-between font-mono text-[8px] text-[#f6e7c1]/38"><span>N 44°12′</span><span>W 28°09′</span></div>
          </div>

          <div className="captains-log-record">
            <p className="captains-log-kicker">Official event charter</p>
            <h3 className="mt-2 font-serif text-lg font-bold uppercase text-[#e9b949]">{DEMO_EVENT.NAME}</h3>
            <p className="mt-2 text-[10px] leading-5 text-[#f6e7c1]/65">{DEMO_EVENT.DATE} · {DEMO_EVENT.TIME}<br />{DEMO_EVENT.VENUE}</p>
            <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-mono uppercase tracking-[0.1em]" aria-label="Footer navigation">
              {[["#capacity", "Voyage"], ["#rsvp", "Manifest"], ["#queue", "Queue"]].map(([href, label]) => <a key={href} href={href}>{label}</a>)}
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
