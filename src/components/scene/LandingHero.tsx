"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { DEMO_EVENT } from "@/lib/constants";

const ThreeWaterScene = dynamic(() => import("./ThreeWaterScene"), { ssr: false });

interface LandingHeroProps {
  confirmedCount: number;
  capacity: number;
  availableCapacity: number;
  waitlistCount: number;
  shamblesActive?: boolean;
}

const ROULETTE_COLORS = ["#e7b84b", "#741f2b", "#0b7a75", "#e7b84b", "#151515", "#c44536"];

function pointOnWheel(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return { x: 80 + Math.cos(radians) * radius, y: 80 + Math.sin(radians) * radius };
}

function RouletteEmblem({ shamblesActive }: { shamblesActive: boolean }) {
  const segmentCount = 12;

  return (
    <div className={`roulette-emblem${shamblesActive ? " is-shambling" : ""}`} aria-label="Grand Line Roulette event emblem">
      <svg viewBox="0 0 160 160" role="img" aria-label="Compass and roulette wheel, event emblem">
        <circle cx="80" cy="80" r="76" fill="#081626" stroke="#e7b84b" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="69" fill="none" stroke="#e6d2a3" strokeOpacity="0.65" strokeWidth="1" />
        <g className="roulette-disc">
          {Array.from({ length: segmentCount }, (_, index) => {
            const start = -90 + (360 / segmentCount) * index;
            const end = start + 360 / segmentCount;
            const a = pointOnWheel(start, 64);
            const b = pointOnWheel(end, 64);
            const label = pointOnWheel((start + end) / 2, 52);
            return (
              <g key={index}>
                <path
                  d={`M80 80 L${a.x} ${a.y} A64 64 0 0 1 ${b.x} ${b.y} Z`}
                  fill={ROULETTE_COLORS[index % ROULETTE_COLORS.length]}
                  stroke="#f7e7c6"
                  strokeOpacity="0.52"
                  strokeWidth="0.8"
                />
                <text x={label.x} y={label.y + 2} textAnchor="middle" fill="#f7e7c6" fontSize="6" fontFamily="monospace">{String(index + 1).padStart(2, "0")}</text>
              </g>
            );
          })}
          <circle cx="80" cy="80" r="20" fill="#081626" stroke="#e7b84b" strokeWidth="1.5" />
          <path d="M80 65L84 80L80 77L76 80Z" fill="#3eb6a8" />
          <path d="M80 95L76 80L80 83L84 80Z" fill="#c44536" />
          <circle cx="80" cy="80" r="3" fill="#f7e7c6" />
        </g>
        <path className="roulette-ship" d="M73 13h14l-3 4h-8zM79 12V5l5 6h-4z" fill="#c44536" stroke="#f7e7c6" strokeWidth="0.8" />
        <path d="M80 2L84 11L80 9L76 11Z" fill="#f7e7c6" />
      </svg>
    </div>
  );
}

export function LandingHero({
  confirmedCount,
  capacity,
  availableCapacity,
  waitlistCount,
  shamblesActive = false,
}: LandingHeroProps) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [sceneMode, setSceneMode] = useState<"desktop" | "lite" | null>(null);
  const [scrollTurn, setScrollTurn] = useState(0);
  const isFull = availableCapacity <= 0;
  const fillPercent = capacity > 0 ? Math.min(100, Math.round((confirmedCount / capacity) * 100)) : 0;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactScreen = window.matchMedia("(max-width: 640px)");
    const updateSceneMode = () => {
      setSceneMode(reducedMotion.matches ? null : compactScreen.matches ? "lite" : "desktop");
    };
    updateSceneMode();
    reducedMotion.addEventListener("change", updateSceneMode);
    compactScreen.addEventListener("change", updateSceneMode);
    return () => {
      reducedMotion.removeEventListener("change", updateSceneMode);
      compactScreen.removeEventListener("change", updateSceneMode);
    };
  }, []);

  useEffect(() => {
    const updateScrollTurn = () => setScrollTurn(Math.min(window.scrollY * 0.012, 18));
    window.addEventListener("scroll", updateScrollTurn, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollTurn);
  }, []);

  const handlePointerMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 8,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 5,
    });
  }, []);

  return (
    <section
      className={`landing-world relative isolate overflow-hidden${isFull ? " is-full" : ""}${shamblesActive ? " is-shambling" : ""}`}
      onMouseMove={handlePointerMove}
      aria-label="Shambles Seating event access"
    >
      <div className="landing-world-sea absolute inset-0" aria-hidden="true" />
      <figure
        className="landing-art"
        style={{ transform: `translate3d(${parallax.x * -0.24}px, ${parallax.y * -0.2}px, 0)` }}
      >
        <Image
          src="/assets/landing-bg.png"
          alt="Luffy and the crew above the Grand Line sea"
          fill
          priority
          sizes="100vw"
          className="landing-poster-image"
        />
        <figcaption>GRAND LINE · KEY ART</figcaption>
      </figure>

      <svg className="landing-course" viewBox="0 0 760 86" aria-hidden="true">
        <path d="M8 62 C100 62 110 28 204 35 S340 74 430 47 585 17 752 31" />
        <circle cx="8" cy="62" r="4" />
        <circle cx="430" cy="47" r="3" />
        <circle cx="752" cy="31" r="5" />
        <path className="course-vessel" d="M330 42l13-3-5 8h-12z M337 38v-12l8 9h-7z" />
      </svg>

      {sceneMode && (
        <div className="landing-three absolute inset-0 pointer-events-none" aria-hidden="true">
          <ThreeWaterScene lite={sceneMode === "lite"} />
        </div>
      )}

      <aside className="landing-charter" aria-label="Grand Line event invitation">
        <div className="charter-rules" aria-hidden="true"><i /><i /><i /></div>
        <div className="charter-header">
          <div>
            <p className="charter-kicker">A private invitation from</p>
            <h2>Gran Tesoro <span>VIP Gala</span></h2>
          </div>
          <div className="charter-seal" aria-hidden="true">GT</div>
        </div>

        <p className="charter-reverie">World Government Reverie</p>
        <h1 className="landing-title">Shambles <span>Seating</span></h1>
        <p className="charter-tagline">Your berth. Your crew. Your voyage.</p>

        <div className="charter-event-heading">
          <div style={{ transform: `rotate(${scrollTurn}deg)` }}>
            <RouletteEmblem shamblesActive={shamblesActive} />
          </div>
          <div>
            <p className="charter-kicker">Grand Line Roulette</p>
            <h3>Frontend Roulette <b>1.0</b></h3>
            <p className="charter-system">Smart event access system</p>
          </div>
        </div>

        <div className="charter-details">
          <div><span>DATE</span><strong>{DEMO_EVENT.DATE}</strong></div>
          <div><span>HOURS</span><strong>{DEMO_EVENT.TIME}</strong></div>
          <div className="charter-venue"><span>HARBOR</span><strong>{DEMO_EVENT.VENUE}</strong></div>
        </div>

        {isFull ? (
          <div className="landing-port-closed" role="status">
            <svg className="landing-pirate-skull" viewBox="0 0 100 100" role="img" aria-label="Pirate skull wearing a red bandana">
              <path d="M18 48C15 26 29 10 50 10s35 16 32 38l-5 18H23z" fill="#f7e7c6" />
              <path d="M22 30Q49 21 78 30l-3 12Q49 34 25 43z" fill="#c44536" />
              <circle cx="37" cy="51" r="9" fill="#151515" /><circle cx="63" cy="51" r="9" fill="#151515" />
              <path d="M50 54l-5 10h10zM35 71h30l-4 12H39z" fill="#151515" />
              <path d="M41 71v8m9-8v8m9-8v8" stroke="#f7e7c6" strokeWidth="2" />
            </svg>
            <div><strong>THE PORT IS CLOSED</strong><span>Every berth has been claimed. The queue is still moving.</span></div>
          </div>
        ) : null}

        <div className="charter-capacity" aria-label={`${confirmedCount} of ${capacity} berths claimed, ${availableCapacity} remaining, ${waitlistCount} waiting`}>
          <div className="capacity-copy">
            <span>Live berth registry</span>
            <strong>{confirmedCount}<i>/</i>{capacity}</strong>
            <em>{availableCapacity} berths remaining</em>
          </div>
          <div className="capacity-signals" role="img" aria-label={`${fillPercent}% of berths claimed, ${waitlistCount} crews waiting`}>
            {Array.from({ length: Math.min(capacity, 50) }, (_, index) => <i key={index} className={index < confirmedCount ? "claimed" : "open"} />)}
          </div>
          <span className="waitlist-signal">{waitlistCount} WAITING</span>
        </div>

        <div className="charter-actions">
          <a href={isFull ? "#queue" : "#rsvp"} className={`landing-cta${isFull ? " landing-cta-red" : ""}`}>
            {isFull ? "Enter the Poneglyph Queue" : "Secure Your Berth"}<span aria-hidden="true">↗</span>
          </a>
          <a href="#capacity" className="landing-secondary">Enter the Voyage <span aria-hidden="true">↓</span></a>
        </div>

        <div className="charter-foot"><span>THE LOST PONEGLYPH FILES</span><span>CHARTER · PS-09</span></div>
      </aside>

      <div className="landing-voyage-strip" aria-label={`${confirmedCount} of ${capacity} berths claimed, ${availableCapacity} open, ${waitlistCount} waiting`}>
        <div className="voyage-coordinate"><span>MAGNETIC COURSE</span><strong>N 44°12′ <i>·</i> W 28°09′</strong></div>
        <div className="voyage-stat"><span>CLAIMED</span><strong>{confirmedCount}<i>/</i>{capacity}</strong></div>
        <div className="voyage-stat voyage-open"><span>OPEN GATES</span><strong>{String(availableCapacity).padStart(2, "0")}</strong></div>
        <div className="voyage-stat voyage-waiting"><span>WAITING</span><strong>{String(waitlistCount).padStart(2, "0")}</strong></div>
        <a href="#capacity">ENTER THE VOYAGE <b>↘</b></a>
      </div>
      {shamblesActive && <div className="landing-shambles-flash" aria-hidden="true" />}
    </section>
  );
}