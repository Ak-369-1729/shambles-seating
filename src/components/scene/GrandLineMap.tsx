"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GrandLineMapProps {
  confirmedCount: number;
  capacity: number;
  availableCapacity: number;
  waitlistCount: number;
  shamblesActive?: boolean;
  onShamblesComplete?: () => void;
}

// Generate a stable curved Grand Line path through SVG viewBox 0 0 1200 500
function getRoutePath(): string {
  return "M 60 350 C 150 280, 250 200, 380 220 C 480 235, 520 300, 620 270 C 720 240, 760 160, 880 180 C 960 195, 1020 260, 1140 240";
}

// Sample 50 points along the SVG path
function samplePathPoints(count: number): Array<{ x: number; y: number }> {
  if (typeof document === "undefined") {
    // SSR fallback — simple linear interpolation
    return Array.from({ length: count }, (_, i) => ({
      x: 60 + (i / (count - 1)) * 1080,
      y: 280 + Math.sin((i / count) * Math.PI * 2) * 60,
    }));
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", getRoutePath());
  svg.appendChild(path);
  document.body.appendChild(svg);
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";
  const len = path.getTotalLength();
  const pts = Array.from({ length: count }, (_, i) => {
    const pt = path.getPointAtLength((i / (count - 1)) * len);
    return { x: pt.x, y: pt.y };
  });
  document.body.removeChild(svg);
  return pts;
}

// Crew names for waitlist markers
const WAITLIST_NAMES = [
  "Grand Line Coders", "Devil Fruit Devs", "Lost Poneglyph Files",
  "Bug Hunters", "Straw Hat Stack", "Void Century Engineers",
  "All Blue Algorists", "Loguetown Hackers",
];

// Stars
const STARS = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  cx: Math.random() * 1200,
  cy: Math.random() * 200,
  r: Math.random() * 1.5 + 0.3,
  dur: 2 + Math.random() * 4,
  delay: Math.random() * 5,
}));

export function GrandLineMap({
  confirmedCount,
  capacity,
  availableCapacity,
  waitlistCount,
  shamblesActive = false,
  onShamblesComplete,
}: GrandLineMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pathPoints, setPathPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredBerth, setHoveredBerth] = useState<number | null>(null);
  const [shamblesPhase, setShamblesPhase] = useState(0);

  // Sample route points client-side only
  useEffect(() => {
    setPathPoints(samplePathPoints(capacity));
  }, [capacity]);

  // SHAMBLES animation sequence
  useEffect(() => {
    if (!shamblesActive) { setShamblesPhase(0); return; }
    const phases = [500, 1000, 1200, 1000, 1200, 800];
    let phase = 1;
    setShamblesPhase(1);
    const advance = () => {
      if (phase >= phases.length) {
        setShamblesPhase(0);
        onShamblesComplete?.();
        return;
      }
      setTimeout(() => {
        phase++;
        setShamblesPhase(phase);
        advance();
      }, phases[phase - 1]);
    };
    const t = setTimeout(advance, phases[0]);
    return () => clearTimeout(t);
  }, [shamblesActive, onShamblesComplete]);

  // Mouse parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 10,
    });
  };

  const pct = Math.round((confirmedCount / capacity) * 100);
  const isFull = availableCapacity <= 0;

  return (
    <section
      id="capacity"
      className="relative w-full overflow-hidden deep-ocean-bg"
      style={{ minHeight: "600px" }}
      onMouseMove={handleMouseMove}
    >
      {/* ── Atmospheric fog layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 inset-x-0 h-64" style={{
          background: "linear-gradient(to top, rgba(1,5,9,0.9) 0%, rgba(2,11,20,0.6) 40%, transparent 100%)"
        }} />
        <div className="absolute top-0 inset-x-0 h-32" style={{
          background: "linear-gradient(to bottom, rgba(1,5,9,0.8) 0%, transparent 100%)"
        }} />
        <div className="absolute inset-y-0 left-0 w-24" style={{
          background: "linear-gradient(to right, rgba(1,5,9,0.7) 0%, transparent 100%)"
        }} />
        <div className="absolute inset-y-0 right-0 w-24" style={{
          background: "linear-gradient(to left, rgba(1,5,9,0.7) 0%, transparent 100%)"
        }} />
      </div>

      {/* ── SHAMBLES Overlay ── */}
      <AnimatePresence>
        {shamblesActive && shamblesPhase > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: shamblesPhase >= 4 ? 0 : 0.35 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(228,87,86,0.18) 0%, rgba(7,30,43,0.38) 100%)" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shamblesActive && shamblesPhase >= 2 && shamblesPhase < 5 && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="text-center">
              <div
                className="text-7xl sm:text-9xl font-serif font-black tracking-[0.2em] crimson-shimmer"
                style={{ textShadow: "0 0 80px rgba(228,87,86,0.6)" }}
              >
                SHAMBLES
              </div>
              <div className="text-sm font-mono tracking-[0.4em] text-gray-300 uppercase mt-2">
                BERTH REALLOCATION COMPLETE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shamblesActive && shamblesPhase >= 4 && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <div className="text-4xl sm:text-6xl font-serif font-black gold-shimmer tracking-wider">
                A BERTH HAS OPENED
              </div>
              <div className="text-xs font-mono tracking-[0.4em] text-tesoro-amber uppercase mt-3">
                THE GRAND LINE HAS CHOSEN YOU.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main SVG Canvas ── */}
      <div
        className="relative"
        style={{
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.2}px)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1200 500"
          preserveAspectRatio="xMidYMid slice"
          className="w-full"
          style={{ height: "500px" }}
        >
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a3000" stopOpacity="0.5" />
              <stop offset="30%" stopColor="#007c83" stopOpacity="0.78" />
              <stop offset="50%" stopColor="#e9b949" stopOpacity="1" />
              <stop offset="70%" stopColor="#007c83" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#4a3000" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#007c83" stopOpacity="0" />
              <stop offset="50%" stopColor="#83c5be" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#007c83" stopOpacity="0" />
            </linearGradient>
            <filter id="berthBlur">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="openBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="oceanBg" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#041a3a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#010509" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep ocean base glow */}
          <ellipse cx="600" cy="350" rx="700" ry="200" fill="url(#oceanBg)" />

          {/* Stars */}
          {STARS.map(star => (
            <circle key={star.id} cx={star.cx} cy={star.cy} r={star.r} fill="white">
              <animate
                attributeName="opacity"
                values="0.1;0.9;0.1"
                dur={`${star.dur}s`}
                begin={`${star.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Distant mountains silhouette */}
          <path
            d="M 0 320 Q 100 260 180 290 Q 260 200 340 240 Q 400 190 460 220 Q 550 160 620 200 Q 700 170 760 210 Q 840 150 920 190 Q 1000 160 1060 200 Q 1120 170 1200 200 L 1200 500 L 0 500 Z"
            fill="rgba(2,8,20,0.7)"
          />
          <path
            d="M 0 360 Q 80 310 150 340 Q 230 290 310 320 Q 380 280 450 310 Q 520 270 600 300 Q 680 270 760 300 Q 830 260 910 295 Q 980 270 1060 295 Q 1130 270 1200 290 L 1200 500 L 0 500 Z"
            fill="rgba(1,5,12,0.8)"
          />

          {/* Ocean swell lines */}
          {[380, 410, 430, 450].map((y, i) => (
            <path
              key={i}
              d={`M ${i * 100} ${y} Q ${300 + i * 80} ${y - 8} ${600 + i * 60} ${y} Q ${900 - i * 40} ${y + 6} 1200 ${y - 4}`}
              stroke={`rgba(100,160,255,${0.04 + i * 0.01})`}
              strokeWidth="1"
              fill="none"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 12,-3; 0,0"
                dur={`${4 + i * 0.7}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}

          {/* Grand Line route — glow layer */}
          <path
            d={getRoutePath()}
            stroke="url(#routeGlow)"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          >
            <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
          </path>
          {/* Grand Line route — main */}
          <path
            d={getRoutePath()}
            stroke="url(#routeGrad)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 4"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="2s" repeatCount="indefinite" />
          </path>

          {/* ── BERTH MARKERS ── */}
          {pathPoints.map((pt, i) => {
            const isOccupied = i < confirmedCount;
            const isOpen = !isOccupied;
            const isHovered = hoveredBerth === i;
            const isShamblesTarget = shamblesActive && i === confirmedCount;
            const markerType = i % 9;
            return (
              <g
                key={i}
                transform={`translate(${pt.x}, ${pt.y})`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredBerth(i)}
                onMouseLeave={() => setHoveredBerth(null)}
              >
                {isOccupied ? (
                  <g filter={isHovered ? "url(#berthBlur)" : undefined}>
                    {markerType === 0 ? (
                      <g>
                        <circle cx="0" cy="0" r="8" fill="rgba(231,184,75,0.1)" />
                        <path d="M -4,2 L 0,-5 L 4,2 L 2,5 L -2,5 Z" fill="#c44536" stroke="#f7e7c6" strokeWidth="0.6" />
                        <circle cx="0" cy="0" r="1.4" fill="#f7e7c6" />
                      </g>
                    ) : (
                      <g>
                    {/* Ship hull */}
                    <ellipse cx="0" cy="3" rx={markerType === 4 ? 9 : 7} ry="2.5" fill="#3a2417" opacity="0.95" />
                    {/* Ship body */}
                    <path d={markerType === 4 ? "M -8,3 Q 0,-5 8,3 Z" : "M -6,3 Q 0,-4 6,3 Z"} fill={isShamblesTarget ? "#c44536" : markerType === 4 ? "#0b7a75" : "#e7b84b"} opacity="0.95">
                      {isShamblesTarget && (
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite" />
                      )}
                    </path>
                    {/* Mast */}
                    <line x1="0" y1={markerType === 4 ? -6 : -4} x2="0" y2="3" stroke="#f7e7c6" strokeWidth="0.7" />
                    {/* Sail */}
                    <path d={markerType === 4 ? "M 0,-6 Q 5,-2 0,2 Z" : "M 0,-4 Q 3.5,0 0,3 Z"} fill="#f7e7c6" />
                    {markerType === 4 && <path d="M 0,-6 L 4,-9 L 4,-5 Z" fill="#c44536" />}
                    {/* Lantern glow */}
                    <circle cx="0" cy="-5" r={markerType === 4 ? 1.8 : 1.2} fill="#f7e7c6">
                      <animate attributeName="r" values="1;1.5;1" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    {/* Wake */}
                    <ellipse cx="0" cy="5" rx="5" ry="1" fill="rgba(180,220,255,0.2)" />
                    {isHovered && (
                      <text x="0" y="-12" textAnchor="middle" fontSize="6" fill="#e9b949" fontFamily="monospace">
                        #{i + 1}
                      </text>
                    )}
                      </g>
                    )}
                  </g>
                ) : (
                  // ── Open berth: glowing navigation marker ──
                  <g filter="url(#openBlur)">
                    <circle cx="0" cy="0" r="8" fill={isShamblesTarget ? "rgba(196,69,54,0.2)" : "rgba(62,182,168,0.12)"} stroke={isShamblesTarget ? "#c44536" : "#3eb6a8"} strokeWidth="1.2">
                      <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="0" cy="0" r="3" fill={isShamblesTarget ? "#e7b84b" : "#3eb6a8"}>
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <text x="0" y="-12" textAnchor="middle" fontSize="6" fill="rgba(131,197,190,0.95)" fontFamily="monospace">
                      OPEN
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ── HERO SHIP ── */}
          <g transform="translate(90, 300)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="90,298; 90,290; 90,296; 90,292; 90,298"
              dur="6s"
              repeatCount="indefinite"
            />
            {/* Wake */}
            <ellipse cx="0" cy="22" rx="28" ry="5" fill="rgba(180,220,255,0.12)">
              <animate attributeName="rx" values="20;35;20" dur="6s" repeatCount="indefinite" />
            </ellipse>
            {/* Hull */}
            <path d="M -28,12 Q 0,20 28,12 Q 20,24 0,26 Q -20,24 -28,12 Z" fill="#3d2208" stroke="#8a6c1b" strokeWidth="1" />
            <path d="M -24,14 Q 0,8 24,14" stroke="#e9b949" strokeWidth="0.8" fill="none" />
            {/* Body */}
            <path d="M -20,14 L -18,-2 Q 0,-6 18,-2 L 20,14 Z" fill="#6b3c14" stroke="#8a6c1b" strokeWidth="0.8" />
            {/* Bridge */}
            <rect x="-8" y="-10" width="16" height="10" rx="2" fill="#4a2810" stroke="#8a6c1b" strokeWidth="0.8" />
            {/* Fore mast */}
            <line x1="-8" y1="-30" x2="-8" y2="10" stroke="#3d2208" strokeWidth="2" />
            {/* Main mast */}
            <line x1="4" y1="-45" x2="4" y2="14" stroke="#3d2208" strokeWidth="2.5" />
            {/* Crossbeam */}
            <line x1="-14" y1="-28" x2="20" y2="-28" stroke="#3d2208" strokeWidth="1.2" />
            {/* Main sail */}
            <path d="M 4,-44 Q 18,-32 18,-10 Q 4,-8 4,-10 Q 4,-32 4,-44 Z" fill="rgba(240,230,200,0.85)" stroke="#c8b060" strokeWidth="0.5">
              <animate attributeName="d"
                values="M 4,-44 Q 18,-32 18,-10 Q 4,-8 4,-10 Q 4,-32 4,-44 Z;M 4,-44 Q 20,-30 20,-10 Q 4,-8 4,-10 Q 4,-30 4,-44 Z;M 4,-44 Q 18,-32 18,-10 Q 4,-8 4,-10 Q 4,-32 4,-44 Z"
                dur="4s" repeatCount="indefinite" />
            </path>
            {/* Fore sail */}
            <path d="M -8,-28 Q 4,-20 4,-2 Q -8,0 -8,0 Q -8,-20 -8,-28 Z" fill="rgba(220,210,180,0.7)" stroke="#c8b060" strokeWidth="0.5" />
            {/* Flag */}
            <g transform="translate(4,-45)">
              <line x1="0" y1="0" x2="0" y2="-12" stroke="#3d2208" strokeWidth="1" />
              <rect x="0" y="-12" width="14" height="8" rx="1" fill="#e45756">
                <animateTransform attributeName="transform" type="skewY"
                  values="0;3;-2;3;0" dur="2s" repeatCount="indefinite" />
              </rect>
              <text x="7" y="-7" textAnchor="middle" fontSize="5" fill="white">☠</text>
            </g>
            {/* Lantern glow */}
            <circle cx="-8" cy="-30" r="3" fill="#f6e7c1" opacity="0.5">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="2.5;4;2.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            {/* Ropes */}
            <path d="M -8,-28 L -28,12" stroke="rgba(180,140,60,0.5)" strokeWidth="0.7" fill="none" />
            <path d="M 4,-44 L 28,12" stroke="rgba(180,140,60,0.5)" strokeWidth="0.7" fill="none" />
          </g>

          {/* ── Grand Line text label ── */}
          <text x="600" y="60" textAnchor="middle" fontSize="11" fill="rgba(233,185,73,0.8)" fontFamily="monospace" letterSpacing="5" textDecoration="none">
            ── GRAND LINE ──
          </text>

          {/* Waiting fleet holds outside the final berth gate */}
          {Array.from({ length: Math.min(waitlistCount, 5) }, (_, i) => (
            <g key={`wait-${i}`} transform={`translate(${1110 + i * 18}, ${260 + i * 16})`}>
              {shamblesActive && i === 0 && pathPoints[confirmedCount] && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`1110,260; 1100,250; ${pathPoints[confirmedCount].x},${pathPoints[confirmedCount].y}`}
                  begin="0.45s"
                  dur="1.25s"
                  fill="freeze"
                />
              )}
              <ellipse cx="0" cy="4" rx="5" ry="2" fill="#3d2208" opacity="0.8" />
              <path d="M -4,4 Q 0,-2 4,4 Z" fill="rgba(228,87,86,0.82)" />
              <line x1="0" y1="-2" x2="0" y2="4" stroke="rgba(233,185,73,0.72)" strokeWidth="0.6" />
              <circle cx="0" cy="-3" r="0.8" fill="rgba(233,185,73,0.8)">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <text x="0" y="-8" textAnchor="middle" fontSize="5" fill="rgba(233,185,73,0.85)" fontFamily="monospace">
                #{i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="route-title absolute inset-x-0 top-0 z-20 pointer-events-none">
        <div>
          <span>01 · Live berth registry</span>
          <h2>The Grand Line</h2>
        </div>
        <div className="route-live"><i />Realtime fleet signal</div>
      </div>

      <div className="route-ledger absolute inset-x-0 bottom-0 z-20 pointer-events-none">
        <div className="route-ledger-inner">
          <div className="route-ledger-main">
            <span>Confirmed crews · event capacity</span>
            <div><strong>{confirmedCount}</strong><i>/</i><b>{capacity}</b><em>berths claimed</em></div>
          </div>
          <div className="route-ledger-open">
            <span>{isFull ? "Port status" : "Open berth gates"}</span>
            <strong className={isFull ? "is-closed" : ""}>{isFull ? "CLOSED" : String(availableCapacity).padStart(2, "0")}</strong>
          </div>
          <div className="route-ledger-queue">
            <span>Ships approaching</span>
            <strong>{String(waitlistCount).padStart(2, "0")}</strong>
          </div>
          <div className="route-key"><i className="key-ship" />Claimed <i className="key-gate" />Open <i className="key-queue" />Queue</div>
        </div>
      </div>

      {/* Berth hover tooltip */}
      {hoveredBerth !== null && pathPoints[hoveredBerth] && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: `calc(${(pathPoints[hoveredBerth].x / 1200) * 100}% - 40px)`,
            top: `calc(${(pathPoints[hoveredBerth].y / 500) * 100}% - 48px)`,
          }}
        >
          <div
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap"
            style={{
              background: "rgba(4,12,28,0.95)",
              border: `1px solid ${hoveredBerth < confirmedCount ? "rgba(233,185,73,0.45)" : "rgba(131,197,190,0.58)"}`,
              color: hoveredBerth < confirmedCount ? "#e9b949" : "rgba(131,197,190,0.95)",
            }}
          >
            Berth #{hoveredBerth + 1} — {hoveredBerth < confirmedCount ? "Claimed" : "OPEN"}
          </div>
        </div>
      )}
    </section>
  );
}
