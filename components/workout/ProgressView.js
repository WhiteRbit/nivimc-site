"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import { DAY_NAMES, fromKey, isBikini, shiftDate, squatTop, toKey, weekdayOf } from "@/lib/workout/program";
import { MILESTONES } from "@/lib/workout/bikini";
import { REGIONS, heatLevel as level, weeklyVolume } from "@/lib/workout/muscles";
import MuscleMap, { HeatLegend } from "./MuscleMap";
import { dayHasActivity } from "@/lib/workout/log";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";

// Epley estimate of a one-rep max.
const e1rm = (w, r) => Math.round(w * (1 + (Math.max(1, r) - 1) / 30));

// Best set per day for one exercise: heaviest, or least assistance for assisted machines.
function exercisePoints(logs, exId) {
  const assisted = EXERCISE_BY_ID[exId]?.assisted;
  return Object.keys(logs)
    .sort()
    .map((date) => {
      const sets = (logs[date]?.exercises ?? [])
        .filter((e) => e.exId === exId)
        .flatMap((e) => e.sets)
        .filter((x) => x.done && Number(x.weight) > 0);
      if (!sets.length) return null;
      const best = sets.reduce((a, b) => ((assisted ? Number(b.weight) < Number(a.weight) : Number(b.weight) > Number(a.weight)) ? b : a));
      return { date, weight: Number(best.weight), reps: Number(best.reps) || 0 };
    })
    .filter(Boolean);
}

export default function ProgressView({ state, update, openDay }) {
  const { logs, settings, plan } = state;
  const units = settings.units;
  const bikini = isBikini(settings);
  const milestones = state.milestones ?? {};
  // Exercises logged with a weight, most recent first.
  const logged = [
    ...new Set(
      Object.keys(logs)
        .sort()
        .reverse()
        .flatMap((k) => (logs[k]?.exercises ?? []).filter((e) => e.sets.some((x) => x.done && Number(x.weight) > 0)).map((e) => e.exId)),
    ),
  ];
  const [chartEx, setChartEx] = useState(null);
  const shownEx = logged.includes(chartEx) ? chartEx : logged.includes("hip-thrusts") ? "hip-thrusts" : logged[0];
  const exPoints = shownEx ? exercisePoints(logs, shownEx) : [];

  const tops = Object.keys(logs)
    .sort()
    .map((k) => ({ date: k, ...squatTop(logs[k]?.squat) }))
    .filter((x) => x.weight > 0);

  const best = tops.reduce((m, t) => (t.weight > (m?.weight ?? 0) ? t : m), null);
  const bestE1rm = tops.reduce((m, t) => Math.max(m, e1rm(t.weight, t.reps)), 0);
  const sessions = Object.keys(logs)
    .filter((k) => dayHasActivity(logs[k]))
    .sort()
    .reverse();

  return (
    <div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.label}>Sessions</div>
          <div className={styles.statNum}>{sessions.length}</div>
        </div>
        {bikini ? (
          <>
            <div className={styles.stat}>
              <div className={styles.label}>Last 7 days</div>
              <div className={styles.statNum}>{sessions.filter((k) => k > shiftDate(toKey(new Date()), -7)).length}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.label}>Exercises</div>
              <div className={styles.statNum}>{logged.length}</div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.stat}>
              <div className={styles.label}>Best top set</div>
              <div className={styles.statNum}>{best ? `${best.weight}` : "–"}</div>
              {best && (
                <div className={styles.subtitle}>
                  {units} × {best.reps}
                </div>
              )}
            </div>
            <div className={styles.stat}>
              <div className={styles.label}>Est. 1RM</div>
              <div className={styles.statNum}>{bestE1rm || "–"}</div>
              {bestE1rm > 0 && <div className={styles.subtitle}>{units} (Epley)</div>}
            </div>
          </>
        )}
      </div>

      {bikini && (
        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Yearly checkpoints</span>
            <span className={styles.exMeta}>
              {MILESTONES.filter((m) => milestones[m.id]).length} of {MILESTONES.length}
            </span>
          </div>
          <ul className={styles.list}>
            {MILESTONES.map((m) => (
              <li key={m.id} className={styles.exRow}>
                <input
                  type="checkbox"
                  className={styles.bigCheck}
                  checked={Boolean(milestones[m.id])}
                  onChange={(e) => update((st) => ({ ...st, milestones: { ...(st.milestones ?? {}), [m.id]: e.target.checked } }))}
                  aria-label={`Done: ${m.when}`}
                />
                <div className={styles.grow}>
                  <div className={styles.exName}>{m.when}</div>
                  <div className={styles.exMeta}>{m.strength}</div>
                  <div className={styles.exMeta}>{m.other}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.card}>
        <span className={styles.sectionTitle}>Lift progress</span>
        {!logged.length ? (
          <p className={styles.empty}>Log a workout with weights and your progress line shows here.</p>
        ) : (
          <>
            <select
              className={styles.select}
              style={{ width: "100%", marginTop: 8 }}
              value={shownEx}
              onChange={(e) => setChartEx(e.target.value)}
              aria-label="Exercise"
            >
              {logged.map((id) => (
                <option key={id} value={id}>
                  {EXERCISE_BY_ID[id]?.name ?? id}
                </option>
              ))}
            </select>
            {exPoints.length < 2 ? (
              <p className={styles.empty}>Log this exercise at least twice to see your progress line.</p>
            ) : (
              <>
                <SquatChart points={exPoints.slice(-60)} units={units} label={EXERCISE_BY_ID[shownEx]?.name} />
                <p className={styles.exMeta}>
                  {EXERCISE_BY_ID[shownEx]?.assisted
                    ? `Least assistance per session (lower is stronger): ${exPoints[0].weight} → ${exPoints.at(-1).weight} ${units}.`
                    : `Heaviest set per session: ${exPoints[0].weight} → ${exPoints.at(-1).weight} ${units}.`}
                </p>
              </>
            )}
          </>
        )}
      </section>

      <WeeklyMuscles logs={logs} />

      {(!bikini || tops.length > 0) && (
        <section className={styles.card}>
          <div className={styles.label}>Squat top set ({units})</div>
          {tops.length < 2 ? (
            <p className={styles.empty}>Log at least two heavy squat days to see your trend.</p>
          ) : (
            <SquatChart points={tops.slice(-60)} units={units} label="Squat top set" />
          )}
        </section>
      )}

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
                    {d.squat?.light ? "light day" : top ? `${top.weight} × ${top.reps || "?"}${top.rpe ? ` @ RPE ${top.rpe}` : ""}` : "—"}
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
      {missed.length > 0 && missed.length < ranked.length && <p style={{ marginTop: 8 }}>Not hit this week: {missed.join(", ")}.</p>}
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

function SquatChart({ points, units, label }) {
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
        aria-label={`${label}: ${points[0].weight} to ${points[points.length - 1].weight} ${units}`}
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
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.weight)} r={hover === i ? 5 : 4} fill="var(--accent)" stroke="#0b0b0b" strokeWidth="2" />
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
