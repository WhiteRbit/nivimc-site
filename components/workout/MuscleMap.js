"use client";

import styles from "./workout.module.css";
import { REGIONS } from "@/lib/workout/muscles";

// Front and back body figures. Each path is the figure's left half (viewer's left);
// it is drawn twice, the second time mirrored across the centre line (x = 60).

const FRONT = [
  ["traps", "M53,36 L44,43 L53,43 Z"],
  ["sideDelts", "M43,42 C35,42 30,48 29,59 L34,60 C34,52 37,47 43,45 Z"],
  ["frontDelts", "M43,45 C38,48 35,53 35,60 L41,58 C41,52 43,49 47,46 Z"],
  ["chest", "M47,46 C44,49 42,54 42,59 C46,65 54,66 59,63 L59,44 C55,43 50,44 47,46 Z"],
  ["biceps", "M30,62 C28,70 28,79 31,87 L38,85 C40,77 40,68 37,61 Z"],
  ["forearms", "M30,90 C27,100 26,110 27,121 L33,121 C36,110 38,100 38,89 Z"],
  ["obliques", "M43,62 C42,75 44,92 52,104 C51,90 51,78 51,66 C48,66 45,64 43,62 Z"],
  ["abs", "M52,66 L59,66 L59,108 L53,106 C51,95 51,80 52,66 Z"],
  ["quads", "M44,110 C40,128 40,150 44,170 L52,172 C55,155 56,130 54,112 Z"],
  ["adductors", "M55,112 C57,130 56,150 54,168 L58,166 C59,148 59,128 59,114 Z"],
  ["calves", "M44,182 C41,195 42,214 45,230 L50,230 C51,214 52,198 51,182 Z"],
];

const BACK = [
  ["traps", "M59,33 L53,35 C49,39 46,42 42,44 C50,47 55,56 59,70 Z"],
  ["sideDelts", "M42,42 C34,41 29,47 28,56 L31,58 C32,50 36,46 43,45 Z"],
  ["rearDelts", "M43,45 C37,47 33,52 32,59 L37,58 C38,53 41,50 46,48 Z"],
  ["triceps", "M30,62 C28,70 28,79 31,87 L38,85 C40,77 40,68 37,61 Z"],
  ["forearms", "M30,90 C27,100 26,110 27,121 L33,121 C36,110 38,100 38,89 Z"],
  ["lats", "M46,50 C42,58 42,72 45,84 C49,92 53,96 55,98 L55,72 C53,62 50,54 46,50 Z"],
  ["lowerBack", "M56,70 L59,70 L59,106 L54,106 C53,96 54,84 56,70 Z"],
  ["abductors", "M44,99 C42,103 42,108 43,112 L52,107 C50,103 48,100 44,99 Z"],
  ["glutes", "M44,113 C41,122 43,132 51,136 C55,137 59,134 59,130 L59,108 C54,108 49,109 44,113 Z"],
  ["hamstrings", "M44,139 C41,150 42,162 45,172 L53,172 C56,160 56,149 54,139 Z"],
  ["calves", "M43,180 C40,192 42,205 46,214 L52,214 C55,204 55,190 52,180 Z"],
];

// Non-muscle parts so the figure reads as a body.
const FRONT_BASE = [
  "M54,32 L54,40 L59,42 L59,32 Z", // neck
  "M27,123 C24,126 24,132 28,134 C31,132 33,128 33,123 Z", // hand
  "M45,173 C44,177 45,180 47,181 L51,181 C53,178 53,175 52,173 Z", // knee
  "M45,232 C43,236 45,240 51,240 L52,232 Z", // foot
];
const BACK_BASE = [
  "M54,30 L54,36 L59,34 L59,30 Z",
  "M27,123 C24,126 24,132 28,134 C31,132 33,128 33,123 Z",
  "M45,173 C44,176 45,179 47,180 L52,180 C54,177 54,175 53,173 Z",
  "M46,216 L51,216 L51,232 L46,232 Z", // achilles
  "M45,232 C43,236 45,240 52,240 L52,232 Z",
];

const BASE_FILL = "rgba(255,255,255,0.10)";
const MUSCLE_FILL = "rgba(255,255,255,0.16)";
const ACCENT = "#ff5a36";
const MIRROR = "translate(120,0) scale(-1,1)";

// Fill for one region: either primary/secondary highlighting or a heat level 0–4.
function regionStyle(region, { primary, secondary, levels }) {
  if (levels) {
    const lvl = levels[region] || 0;
    return lvl ? { fill: ACCENT, fillOpacity: [0, 0.3, 0.5, 0.75, 1][lvl] } : { fill: MUSCLE_FILL };
  }
  if (primary?.includes(region)) return { fill: ACCENT };
  if (secondary?.includes(region)) return { fill: ACCENT, fillOpacity: 0.4 };
  return { fill: MUSCLE_FILL };
}

function Figure({ parts, base, label, hl, onRegion }) {
  return (
    <svg viewBox="0 0 120 246" className={styles.figure} role="img" aria-label={label}>
      <ellipse cx="60" cy="18" rx="10" ry="13" fill={BASE_FILL} />
      {base.map((d, i) => (
        <g key={i} fill={BASE_FILL}>
          <path d={d} />
          <path d={d} transform={MIRROR} />
        </g>
      ))}
      {parts.map(([region, d]) => {
        const st = regionStyle(region, hl);
        const title = REGIONS[region];
        return (
          <g
            key={region}
            {...st}
            stroke="#000"
            strokeWidth="1"
            strokeLinejoin="round"
            onClick={onRegion ? () => onRegion(region) : undefined}
            style={onRegion ? { cursor: "pointer" } : undefined}
          >
            <title>{title}</title>
            <path d={d} />
            <path d={d} transform={MIRROR} />
          </g>
        );
      })}
    </svg>
  );
}

// `primary`/`secondary`: arrays of region ids. `levels`: { region: 0–4 } for a heat map.
export default function MuscleMap({ primary, secondary, levels, size = "md", onRegion }) {
  const hl = { primary, secondary, levels };
  const named = levels
    ? Object.keys(levels).filter((r) => levels[r]).map((r) => REGIONS[r])
    : (primary || []).map((r) => REGIONS[r]);
  const summary = named.length ? `Highlighted: ${named.join(", ")}` : "No muscles highlighted";
  return (
    <div className={`${styles.map} ${styles[`map_${size}`]}`}>
      <Figure parts={FRONT} base={FRONT_BASE} label={`Front view. ${summary}`} hl={hl} onRegion={onRegion} />
      <Figure parts={BACK} base={BACK_BASE} label={`Back view. ${summary}`} hl={hl} onRegion={onRegion} />
    </div>
  );
}

export function MapLegend() {
  return (
    <div className={styles.mapLegend}>
      <span>
        <i style={{ background: ACCENT }} /> Primary
      </span>
      <span>
        <i style={{ background: ACCENT, opacity: 0.4 }} /> Secondary
      </span>
    </div>
  );
}

export function HeatLegend() {
  return (
    <div className={styles.mapLegend}>
      <span>Fewer sets</span>
      {[0, 1, 2, 3, 4].map((l) => (
        <i
          key={l}
          style={l ? { background: ACCENT, opacity: [0, 0.3, 0.5, 0.75, 1][l] } : { background: MUSCLE_FILL }}
        />
      ))}
      <span>More sets</span>
    </div>
  );
}
