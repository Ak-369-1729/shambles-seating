"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { CinematicLoader } from "@/components/scene/CinematicLoader";
import { LandingHero } from "@/components/scene/LandingHero";
import { NauticalCapacityMeter } from "@/components/capacity/NauticalCapacityMeter";
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

  // Initial waitlist fallback list
  const defaultQueue = INITIAL_WAITLIST_CREWS.map((name, index) => ({
    id: `waitlist-${index + 1}`,
    crew_name: name,
    captain_name: `Captain ${name.split(" ")[0]}`,
    queue_position: index + 1,
    created_at: new Date(Date.now() - (10 - index) * 60000).toISOString(),
  }));

  // Fetch Event & Queue State
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

      // Check if there is an active offer in flight
      if (eventJson.active_offer) {
        setActiveOffer(eventJson.active_offer);
      }
    } catch (err) {
      console.error("Failed to load fleet state:", err);
      // Sensible defaults
      setEventData({
        confirmed_count: DEMO_EVENT.DEMO_CONFIRMED,
        capacity: DEMO_EVENT.TOTAL_CAPACITY,
        available_capacity: DEMO_EVENT.DEMO_REMAINING,
        waitlist_count: DEMO_EVENT.DEMO_WAITLIST,
      });
      setQueueList(defaultQueue);
    }
  }, []);

  useEffect(() => {
    fetchFleetState();

    // Check if user has already seen loader in current session
    const seen = sessionStorage.getItem("shambles_loader_seen");
    if (seen === "true") {
      setShowLoader(false);
    }

    // Try Realtime connection via browser client
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("fleet_updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "registrations" },
          () => fetchFleetState()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "berth_offers" },
          () => fetchFleetState()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "events" },
          () => fetchFleetState()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      // Supabase env vars might be placeholders until user inputs keys
      console.warn("Realtime listener standing by.");
    }
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
    if (userRegistration) {
      setUserRegistration({
        ...userRegistration,
        status: "CONFIRMED",
      });
    }
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
      {/* 1. Signature Handcrafted 13-Step Loading Sequence */}
      {showLoader && <CinematicLoader onComplete={handleLoaderComplete} />}

      {/* 2. Top Navigation Bar */}
      <Navbar
        confirmedCount={confirmedCount}
        capacity={capacity}
        waitlistCount={waitlistCount}
      />

      {/* 3. Interactive Parallax Landing Scene */}
      <LandingHero
        confirmedCount={confirmedCount}
        capacity={capacity}
        availableCapacity={availableCapacity}
        waitlistCount={waitlistCount}
      />

      {/* 4. Live Nautical Capacity Meter */}
      <NauticalCapacityMeter
        confirmedCount={confirmedCount}
        capacity={capacity}
        availableCapacity={availableCapacity}
        activeOfferInFlight={Boolean(activeOffer)}
      />

      {/* 5. Conditional Display: Secured Pass vs. Registration vs. Waitlist */}
      {userRegistration?.status === "CONFIRMED" ? (
        <GrandLineAccessPass
          registration={userRegistration}
          onAbandonSuccess={handleAbandonSuccess}
        />
      ) : (
        <>
          {/* Assemble Your Crew (RSVP) */}
          <AssembleCrewForm
            availableCapacity={availableCapacity}
            onSuccess={handleRegistrationSuccess}
          />

          {/* Poneglyph Queue Tracker */}
          <PoneglyphQueueView
            userRegistration={userRegistration}
            queueList={queueList}
          />
        </>
      )}

      {/* 6. Active Boarding Permit Modal (10-minute Server-Synced Window) */}
      {activeOffer && (
        <BoardingPermitModal
          offer={activeOffer}
          onClaimed={handleClaimSuccess}
          onExpired={() => {
            setActiveOffer(null);
            fetchFleetState();
          }}
        />
      )}

      {/* 7. Footer */}
      <footer className="py-12 border-t border-tesoro-gold/20 text-center text-xs font-mono text-gray-500 bg-marine-950">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-serif font-bold text-tesoro-gold tracking-widest uppercase">
            SHAMBLES SEATING
          </div>
          <div>
            YOUR BERTH • YOUR CREW • YOUR VOYAGE • {DEMO_EVENT.NAME}
          </div>
          <div className="text-[10px] text-gray-600">
            Gran Tesoro VIP Gala & Reverie Summit Architecture • PS-09 Smart Event RSVP System
          </div>
        </div>
      </footer>
    </>
  );
}
