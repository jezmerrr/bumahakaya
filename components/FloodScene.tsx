"use client";

import { useId, type CSSProperties } from "react";
import { severityColor, waterLevelLabel } from "@/lib/severity";
import type { Severity, WaterLevel } from "@/lib/types";

// Brand colors (same values as the theme in app/globals.css).
const NAVY = "#0b2545";
const SIGNAL = "#1e6fd9";
const AMBER = "#e8972a";
const IMPASS = "#c93a3a";
const PASS = "#17845a";

const W = 360;
const H = 200;
// Street level: feet and tires touch this line.
const GROUND = 172;

type PersonMotion = "walk" | "wade" | "stuck";

// What the street looks like at each flood depth. The person in the scene is
// about 1.65 m tall and stands on y=172, so `top` lands at the ankle, the knee,
// and the waist. Deeper water is murkier, rougher, and rainier.
export const LEVELS: Record<
  WaterLevel,
  {
    top: number;
    depthNote: string;
    person: PersonMotion;
    sky: [string, string];
    water: { back: string; front: string; opacity: number };
    waveAmp: number;
    waveSeconds: number;
    rain: number;
    debris: number;
    current: boolean;
  }
> = {
  Ankle: {
    top: 165,
    depthNote: "about 15 cm",
    person: "walk",
    sky: ["#d6e6f5", "#f5f8fb"],
    water: { back: "#4aa6d6", front: "#8fd8f0", opacity: 0.55 },
    waveAmp: 1.5,
    waveSeconds: 5,
    rain: 8,
    debris: 0,
    current: false,
  },
  Knee: {
    top: 153,
    depthNote: "about 50 cm",
    person: "wade",
    sky: ["#c7d5e4", "#eef2f6"],
    water: { back: "#2f7fa8", front: "#4c9fb5", opacity: 0.68 },
    waveAmp: 3,
    waveSeconds: 3,
    rain: 18,
    debris: 2,
    current: false,
  },
  "Waist+": {
    top: 136,
    depthNote: "1 m or more",
    person: "stuck",
    sky: ["#a9b7c6", "#dbe1e8"],
    water: { back: "#5e5236", front: "#8a7650", opacity: 0.78 },
    waveAmp: 4.5,
    waveSeconds: 1.8,
    rain: 28,
    debris: 4,
    current: true,
  },
};

export const WATER_TOP: Record<WaterLevel, number> = {
  Ankle: LEVELS.Ankle.top,
  Knee: LEVELS.Knee.top,
  "Waist+": LEVELS["Waist+"].top,
};

type Motion = "drive" | "slow" | "stalled";

// How traffic behaves for each road condition (matches the post's tag).
export const SCENE: Record<
  Severity,
  { motion: Motion; title: string; advice: string }
> = {
  Passable: {
    motion: "drive",
    title: "Madadaanan",
    advice: "Cars and people can still get through. Ingat pa rin.",
  },
  Caution: {
    motion: "slow",
    title: "Mag-ingat",
    advice: "Slow down. Small cars may stall, and avoid wading if you can.",
  },
  Impassable: {
    motion: "stalled",
    title: "Hindi madaanan",
    advice: "Don't drive or wade through. Find another route.",
  },
};

// Fixed rain positions so the drawing is identical on every render.
const DROPS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 53 + 17) % (W + 40),
  y: (i * 29) % 120,
  delay: ((i * 37) % 90) / 100,
}));

// Spray thrown back from each wheel on gutter-deep streets: [dx, dy, delay].
const SPRAY: [number, number, number][] = [
  [-16, -14, 0],
  [-22, -8, 0.3],
  [-11, -19, 0.6],
];

// Floating debris, spread out along the current: [kind, x, delay seconds].
const DEBRIS: ["leaf" | "plank" | "bottle", number, number][] = [
  ["leaf", 40, 0],
  ["leaf", 230, 5.5],
  ["plank", 140, 2.5],
  ["bottle", 300, 8],
];

// Background buildings: [x, top, width].
const BUILDINGS: [number, number, number][] = [
  [0, 70, 46],
  [50, 96, 34],
  [88, 58, 52],
  [146, 84, 40],
  [192, 64, 58],
  [256, 92, 38],
  [298, 74, 62],
];

// A filled water shape whose top is a repeating wave (one crest + trough per
// 60 units), wide enough to slide left by one wavelength without a gap.
function wave(top: number, amp: number): string {
  let d = `M -60 ${top}`;
  for (let x = -60; x < W + 60; x += 60) d += ` q 15 ${-amp} 30 0 t 30 0`;
  return `${d} V ${H} H -60 Z`;
}

// An illustrated street for a report: water at the reported depth, and a car
// and a person behaving the way the road condition says they should.
export function FloodScene({
  level,
  severity,
}: {
  level: WaterLevel;
  severity: Severity;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const look = LEVELS[level];
  const top = look.top;
  const scene = SCENE[severity];
  const stalled = scene.motion === "stalled";
  const depth = waterLevelLabel(level);
  const rise = { "--flood-rise": `${H - top + 6}px` } as CSSProperties;
  const waveSpeed = { animationDuration: `${look.waveSeconds}s` };
  const backWaveSpeed = { animationDuration: `${look.waveSeconds * 1.5}s` };

  const label = `Illustration: ${depth.toLowerCase()} floodwater (${
    look.depthNote
  }), ${
    stalled
      ? "a stalled car"
      : scene.motion === "slow"
        ? "a car crawling through"
        : "a car driving through"
  }, and ${
    look.person === "walk"
      ? "a person walking"
      : look.person === "wade"
        ? "a person wading"
        : "a person stuck in the water"
  }, with a ${LIGHT[severity]} traffic light.`;

  return (
    <figure
      data-testid="flood-scene"
      data-level={level}
      data-severity={severity}
      data-person={look.person}
      className="overflow-hidden rounded-3xl bg-white shadow-sm"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={look.sky[0]} />
            <stop offset="1" stopColor={look.sky[1]} />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill={`url(#${uid}-sky)`} />

        {/* Skyline */}
        <g fill={NAVY} fillOpacity="0.08">
          {BUILDINGS.map(([x, y, w]) => (
            <rect key={x} x={x} y={y} width={w} height={GROUND - y} />
          ))}
        </g>

        <Rain count={look.rain} />

        {/* Water behind the car and person, for depth */}
        <g className="flood-water" style={rise}>
          <path
            className="flood-wave-back"
            style={backWaveSpeed}
            d={wave(top - 3, look.waveAmp * 0.8)}
            fill={look.water.back}
          />
        </g>

        <Car motion={scene.motion} waterTop={top} />
        <Person
          motion={look.person}
          careful={severity === "Caution"}
          waterTop={top}
        />
        <RoadSigns severity={severity} />

        {/* See-through water in front, so submerged parts show faintly */}
        <g className="flood-water" style={rise}>
          <path
            className="flood-wave"
            style={waveSpeed}
            d={wave(top, look.waveAmp)}
            fill={look.water.front}
            fillOpacity={look.water.opacity}
          />
          {look.current ? <Current top={top} /> : null}
          {look.debris > 0 ? <Debris count={look.debris} top={top} /> : null}
        </g>

        {/* Street, drawn over the water so the water only shows above street
            level (ankle-deep reads as a thin layer, not a pool). */}
        <rect y={GROUND} width={W} height={H - GROUND} fill="#8d99a6" />
        <rect y={GROUND} width={W} height="3" fill="#6b7785" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={i * 40 + 10}
            y={GROUND + 13}
            width="20"
            height="3"
            fill="#fff"
            fillOpacity="0.7"
          />
        ))}
      </svg>

      <figcaption className="flex items-start gap-3 px-4 py-3">
        <span
          aria-hidden="true"
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: severityColor(severity) }}
        />
        <div>
          <p className="font-display text-sm font-extrabold text-navy">
            {scene.title} · {depth}{" "}
            <span className="font-sans font-semibold text-navy/70">
              ({look.depthNote})
            </span>
          </p>
          <p className="text-sm text-navy/70">{scene.advice}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Rain({ count }: { count: number }) {
  return (
    <g>
      {DROPS.slice(0, count).map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y})`}>
          <line
            className="flood-rain"
            x1="0"
            y1="0"
            x2="-3"
            y2="9"
            stroke="#5b86b3"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ animationDelay: `-${d.delay}s` }}
          />
        </g>
      ))}
    </g>
  );
}

function Wheel({ x, spin }: { x: number; spin: "fast" | "slow" | "none" }) {
  const cls =
    spin === "fast"
      ? "flood-wheel"
      : spin === "slow"
        ? "flood-wheel flood-wheel-slow"
        : undefined;
  return (
    // Position lives on the outer group; the inner one spins in place.
    <g transform={`translate(${x} 162)`}>
      <g className={cls}>
        <circle r="10" fill="#1d2733" />
        <circle r="4" fill="#9aa5b1" />
        <path d="M-7 0 H7 M0 -7 V7" stroke="#9aa5b1" strokeWidth="1.5" />
      </g>
    </g>
  );
}

function Car({ motion, waterTop }: { motion: Motion; waterTop: number }) {
  const stalled = motion === "stalled";
  const cls =
    motion === "drive"
      ? "flood-drive"
      : motion === "slow"
        ? "flood-drive-slow"
        : "flood-float";

  return (
    <g transform="translate(176 0)">
      <g data-testid="flood-car" className={cls}>
        {/* Cabin and windows */}
        <path d="M20 137 L34 118 H72 L90 137 Z" fill={NAVY} />
        <path d="M38 122 H52 V135 H28 Z" fill="#cfe3f5" />
        <path d="M56 122 H70 L81 135 H56 Z" fill="#cfe3f5" />
        {/* Body and lights */}
        <rect x="0" y="135" width="104" height="27" rx="9" fill={NAVY} />
        <circle cx="99" cy="146" r="3" fill="#ffd66b" />
        <circle cx="5" cy="146" r="3" fill={IMPASS} />
        {stalled ? (
          <>
            <circle className="flood-blink" cx="99" cy="140" r="3.5" fill={AMBER} />
            <circle className="flood-blink" cx="5" cy="140" r="3.5" fill={AMBER} />
          </>
        ) : null}
        <Wheel x={24} spin={stalled ? "none" : motion === "slow" ? "slow" : "fast"} />
        <Wheel x={80} spin={stalled ? "none" : motion === "slow" ? "slow" : "fast"} />
        {/* Gutter-deep: brake light on, wheels throwing up spray */}
        {motion === "slow" ? (
          <>
            <circle cx="5" cy="146" r="7" fill={IMPASS} fillOpacity="0.35" />
            <ellipse className="flood-wake" cx="24" cy={waterTop} rx="14" ry="2.5" fill="#fff" />
            <ellipse className="flood-wake" cx="80" cy={waterTop} rx="14" ry="2.5" fill="#fff" />
            {[24, 80].map((wx) =>
              SPRAY.map(([dx, dy, delay], i) => (
                <circle
                  key={`${wx}-${i}`}
                  className="flood-spray"
                  cx={wx - 9}
                  cy={waterTop - 1}
                  r="1.8"
                  fill="#fff"
                  fillOpacity="0.9"
                  style={
                    {
                      "--sx": `${dx}px`,
                      "--sy": `${dy}px`,
                      animationDelay: `-${delay}s`,
                    } as CSSProperties
                  }
                />
              )),
            )}
          </>
        ) : null}
      </g>
    </g>
  );
}

function Person({
  motion,
  careful,
  waterTop,
}: {
  motion: PersonMotion;
  // Gutter-deep streets: step slowly even in shallow water.
  careful: boolean;
  waterTop: number;
}) {
  const moving = motion !== "stuck";
  const slow = motion === "wade" || careful;
  const leg = (side: "a" | "b") =>
    moving ? `flood-leg-${side}${slow ? " flood-leg-slow" : ""}` : undefined;

  return (
    <g transform="translate(78 0)">
      <g
        data-testid="flood-person"
        className={moving ? "flood-bob" : undefined}
        style={slow ? { animationDuration: "1.6s" } : undefined}
      >
        {/* Legs */}
        <line className={leg("a")} x1="-3" y1="139" x2="-3" y2="171" stroke={NAVY} strokeWidth="6" strokeLinecap="round" />
        <line className={leg("b")} x1="3" y1="139" x2="3" y2="171" stroke={NAVY} strokeWidth="6" strokeLinecap="round" />
        {/* Body, free arm, head */}
        <rect x="-8" y="116" width="16" height="25" rx="6" fill={SIGNAL} />
        {motion === "stuck" ? (
          // Free arm raised for balance
          <line x1="-7" y1="121" x2="-17" y2="111" stroke={SIGNAL} strokeWidth="5" strokeLinecap="round" />
        ) : (
          <line x1="-7" y1="121" x2="-11" y2="138" stroke={SIGNAL} strokeWidth="5" strokeLinecap="round" />
        )}
        <circle cx="0" cy="108" r="7.5" fill="#e0ac84" />
        <path d="M-7.5 107 a7.5 7.5 0 0 1 15 0 q-7.5 -3 -15 0 Z" fill={NAVY} />
        {/* Umbrella arm; it sways when the person is stuck */}
        <g className={moving ? undefined : "flood-sway"}>
          <line x1="6" y1="121" x2="11" y2="104" stroke={SIGNAL} strokeWidth="5" strokeLinecap="round" />
          <line x1="12" y1="104" x2="12" y2="80" stroke="#4b5563" strokeWidth="2" />
          <path
            d="M-14 82 Q12 54 38 82 Q31.5 78 25 82 Q18.5 78 12 82 Q5.5 78 -1 82 Q-7.5 78 -14 82 Z"
            fill={AMBER}
          />
        </g>
      </g>
      {/* Ripples where the water meets the person */}
      <ellipse className="flood-ripple" cx="0" cy={waterTop} rx="12" ry="2" fill="#fff" fillOpacity="0.8" />
      <ellipse
        className="flood-ripple"
        cx="0"
        cy={waterTop}
        rx="18"
        ry="2.5"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.6"
        style={{ animationDelay: "-0.8s" }}
      />
    </g>
  );
}

// Fast white streaks on the surface: strong current in deep water.
function Current({ top }: { top: number }) {
  return (
    <g data-testid="flood-current">
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          className="flood-current"
          x1={i * 80}
          y1={top + 8 + (i % 2) * 9}
          x2={i * 80 + 22}
          y2={top + 8 + (i % 2) * 9}
          stroke="#fff"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={
            {
              animationDelay: `-${i * 0.45}s`,
              "--drift-x": `${i * 80}px`,
            } as CSSProperties
          }
        />
      ))}
    </g>
  );
}

// Trash and leaves carried along by the water.
function Debris({ count, top }: { count: number; top: number }) {
  return (
    <g data-testid="flood-debris">
      {DEBRIS.slice(0, count).map(([kind, x, delay], i) => (
        <g key={i} transform={`translate(${x} ${top})`}>
          <g
            className="flood-drift"
            style={
              {
                animationDelay: `-${delay}s`,
                "--drift-x": `${x}px`,
              } as CSSProperties
            }
          >
            {kind === "leaf" ? (
              <ellipse cx="0" cy="0" rx="5" ry="2.2" fill="#3f7d3a" transform="rotate(-15)" />
            ) : kind === "plank" ? (
              <rect x="-14" y="-3" width="28" height="5" rx="1.5" fill="#8b5a2b" transform="rotate(6)" />
            ) : (
              <rect x="-6" y="-3" width="12" height="5" rx="2.5" fill="#6fae8e" fillOpacity="0.9" />
            )}
          </g>
        </g>
      ))}
    </g>
  );
}

// The lit lamp matches the post's road-condition tag.
const LIGHT: Record<Severity, "green" | "amber" | "red"> = {
  Passable: "green",
  Caution: "amber",
  Impassable: "red",
};

const LAMPS: [Severity, string][] = [
  ["Impassable", IMPASS],
  ["Caution", AMBER],
  ["Passable", PASS],
];

// A traffic light on every street, plus a warning sign for gutter-deep and a
// no-entry sign for not passable.
function RoadSigns({ severity }: { severity: Severity }) {
  return (
    <g>
      <line x1="334" y1={GROUND} x2="334" y2="104" stroke="#6b7785" strokeWidth="3" />
      <g data-testid="flood-light" data-lit={LIGHT[severity]}>
        <rect x="324" y="62" width="20" height="46" rx="6" fill="#1d2733" />
        {LAMPS.map(([s, color], i) => {
          const on = s === severity;
          const cy = 73 + i * 13;
          return (
            // Amber flashes, like a real caution light.
            <g key={s} className={on && s === "Caution" ? "flood-blink" : undefined}>
              {on ? <circle cx="334" cy={cy} r="9" fill={color} fillOpacity="0.35" /> : null}
              <circle cx="334" cy={cy} r="5" fill={on ? color : "#3b4654"} />
            </g>
          );
        })}
      </g>
      {severity === "Caution" ? (
        <g data-testid="flood-sign-caution">
          <rect
            x="325"
            y="118"
            width="18"
            height="18"
            rx="2"
            transform="rotate(45 334 127)"
            fill="#f2b632"
            stroke="#1d2733"
            strokeWidth="1.5"
          />
          <rect x="332.8" y="120.5" width="2.4" height="8" rx="1" fill="#1d2733" />
          <circle cx="334" cy="132" r="1.4" fill="#1d2733" />
        </g>
      ) : null}
      {severity === "Impassable" ? (
        <g data-testid="flood-sign-noentry">
          <circle cx="334" cy="127" r="11" fill={IMPASS} stroke="#fff" strokeWidth="2" />
          <rect x="327.5" y="124.5" width="13" height="5" rx="1.5" fill="#fff" />
        </g>
      ) : null}
    </g>
  );
}
