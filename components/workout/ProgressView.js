"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import { DAY_NAMES, fromKey, shiftDate, squatTop, toKey, weekdayOf } from "@/lib/workout/program";
import { REGIONS, weeklyVolume } from "@/lib/workout/muscles";
import MuscleMap, { HeatLegend } from "./MuscleMap";
import { dayHasActivity } from "@/lib/workout/log";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";

// Epley estimate of a one-rep max.
const e1rm = (w, r) => Math.round(w * (1 + (Math.max(1, r) - 1) / 30));

export default function ProgressView({ state, openDay }) {
  const { logs, settings, plan } = state;
  const units = settings.units;

  const tops = Object.keys(logs)
    .sort()
    .map((k) => ({ date: k, ...squatTop(logs[k]?.squat) }))
    .filter((x) => x.weight > 0);

  const best = tops.reduce((m, t) => (t.weight > (m?.weight ?? 0) ? t : m), null);
  const bestE1rm = tops.reduce((m, t) => Math.max(m, e1rm(t.weight, t.reps)), 0);
  const sessions = Object.keys(logs).filter((k) => dayHasActivity(logs[k])).sort().reverse();

  return (
    <div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.label}>Sessions</div>
          <div className={styles.statNum}>{sessions.length}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Best top set</div>
          <div className={styles.statNum}>{best ? `${best.weight}` : "–"}</div>
          {best && <div className={styles.subtitle}>{units} × {best.reps}</div>}
        </div>
        <div className={styles.stat}>
          <div className={styles.label}>Est. 1RM</div>
          <div className={styles.statNum}>{bestE1rm || "–"}</div>
          {bestE1rm > 0 && <div className={styles.subtitle}>{units} (Epley)</div>}
        </div>
      </div>

      <WeeklyMuscles logs={logs} />

      <section className={styles.card}>
        <div className={styles.label}>Squat top set ({units})</div>
        {tops.length < 2 ? (
          <p className={styles.empty}>Log at least two heavy squat days to see your trend.</p>
        ) : (
          <SquatChart points={tops.slice(-60)} units={units} />
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.label}>History</div>
        {!sessions.length && <p className={styles.empty}>Nothing logged yet. Your first squat is waiting on the Today tab.</p>}
        <ul className={styles.list}>
          {sessions.map((k) => {
            const d = logs[k];
            const top = squatTop(d.squat);
            const doneSets = (d.exercises || []).reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
            const lifts = (d.exercises || []).filter((e) => e.sets.some((s) => s.done)).map((e) => EXERCISE_BY_ID[e.exId]?.name);
            return (
              <li key={k} className={styles.listItem}>
                <div className={styles.grow}>
                  <div style={{ fontWeight: 600 }}>
                    {fromKey(k).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} ·{" "}
                    {d.title || plan[weekdayOf(k)]?.title || DAY_NAMES[weekdayOf(k)]}
                  </div>
                  <div className={styles.muscles}>
                    Squat:{" "}
                    {d.squat?.light
                      ? "light day"
                      : top
                        ? `${top.weight} × ${top.reps || "?"}${top.rpe ? ` @ RPE ${top.rpe}` : ""}`
                        : "—"}
                    {doneSets > 0 && ` · ${doneSets} sets: ${lifts.join(", ")}`}
                  </div>
                </div>
                {d.completed && <span className={`${styles.pill} ${styles.pillOk}`}>✓ Done</span>}
                <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => openDay(k)}>
                  Open
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

// Sets per muscle over the last 7 days (secondary muscles count half a set).
const level = (sets) => (sets <= 0 ? 0 : sets < 4 ? 1 : sets < 8 ? 2 : sets < 12 ? 3 : 4);

function WeeklyMuscles({ logs }) {
  const today = toKey(new Date());
  const keys = Array.from({ length: 7 }, (_, i) => shiftDate(today, -i));
  const volume = weeklyVolume(logs, keys);
  const levels = Object.fromEntries(Object.entries(volume).map(([r, v]) => [r, level(v)]));
  const ranked = Object.entries(volume).sort((a, b) => b[1] - a[1]);
  const missed = ranked.filter(([, v]) => v === 0).map(([r]) => REGIONS[r]);

  return (
    <section className={styles.card}>
      <div className={styles.label}>Muscles trained · last 7 days</div>
      <div style={{ marginTop: 8 }}>
        <MuscleMap levels={levels} size="lg" />
      </div>
      <div style={{ marginTop: 8 }}>
        <HeatLegend />
      </div>
      {missed.length > 0 && missed.length < ranked.length && (
        <p style={{ marginTop: 8 }}>Not hit this week: {missed.join(", ")}.</p>
      )}
      <ul className={styles.list} style={{ marginTop: 8 }}>
        {ranked
          .filter(([, v]) => v > 0)
          .map(([r, v]) => (
            <li key={r} className={styles.listItem} style={{ padding: "6px 0" }}>
              <span>{REGIONS[r]}</span>
              <span style={{ fontWeight: 700 }}>
                {Number.isInteger(v) ? v : v.toFixed(1)} {v === 1 ? "set" : "sets"}
              </span>
            </li>
          ))}
      </ul>
    </section>
  );
}

function SquatChart({ points, units }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 220;
  const pad = { l: 40, r: 12, t: 12, b: 26 };
  const ws = points.map((p) => p.weight);
  const lo = Math.floor((Math.min(...ws) * 0.95) / 5) * 5;
  const hi = Math.ceil((Math.max(...ws) * 1.03) / 5) * 5 || lo + 5;
  const x = (i) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
  const y = (w) => pad.t + (1 - (w - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const ticks = [lo, lo + (hi - lo) / 2, hi].map((v) => Math.round(v * 10) / 10);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.weight).toFixed(1)}`).join(" ");
  const fmt = (k) => fromKey(k).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  const h = hover != null ? points[hover] : null;

  return (
    <div style={{ position: "relative", marginTop: 8 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chart}
        role="img"
        aria-label={`Squat top set from ${points[0].weight} to ${points[points.length - 1].weight} ${units}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        style={{ touchAction: "pan-y" }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#a3a3a3">
              {t}
            </text>
          </g>
        ))}
        <text x={pad.l} y={H - 6} fontSize="11" fill="#a3a3a3">
          {fmt(points[0].date)}
        </text>
        <text x={W - pad.r} y={H - 6} fontSize="11" fill="#a3a3a3" textAnchor="end">
          {fmt(points[points.length - 1].date)}
        </text>
        {h && <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />}
        <path d={path} fill="none" stroke="#ff5a36" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={x(i)}
            cy={y(p.weight)}
            r={hover === i ? 5 : 4}
            fill="#ff5a36"
            stroke="#0b0b0b"
            strokeWidth="2"
          />
        ))}
      </svg>
      {h && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${(x(hover) / W) * 100}%`,
            transform: `translateX(${hover > points.length / 2 ? "-105%" : "5%"})`,
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "6px 8px",
            fontSize: 12,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            color: "#f5f5f5",
          }}
        >
          <div style={{ color: "#a3a3a3" }}>{fmt(h.date)}</div>
          <div style={{ fontWeight: 700 }}>
            {h.weight} {units} × {h.reps}
          </div>
          {h.rpe && <div style={{ color: "#a3a3a3" }}>RPE {h.rpe}</div>}
        </div>
      )}
    </div>
  );
}
