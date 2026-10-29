"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import MuscleMap, { HeatLegend } from "./MuscleMap";
import WorkoutTime, { fmtDuration } from "./WorkoutTime";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { heatLevel, weeklyVolume } from "@/lib/workout/muscles";
import { LIFTS, estimateCalories, fromKey, lastTopSet, squatTop } from "@/lib/workout/program";

const num = (v) => {
  const n = Number(String(v ?? "").match(/\d+(\.\d+)?/)?.[0]);
  return Number.isFinite(n) ? n : 0;
};
const done = (sets) => (sets || []).filter((s) => s.done);
const fmtSet = (s) => `${s.weight === "" ? "BW" : s.weight}×${s.reps || "?"}`;
const fmtVolume = (v) => (v >= 10000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toLocaleString());

// Everything the person did in one session, shown when they finish it.
export function summarize(state, dateKey, day) {
  const units = state.settings.units;
  // Daily pyramid lifts (squat, deadlift) with their top set and change vs the last heavy day.
  const pyramids = LIFTS.map((l) => {
    const log = day[l.key] ?? { sets: [] };
    const top = squatTop(log);
    const before = lastTopSet(state.logs, dateKey, l.key);
    const bestBefore = Object.keys(state.logs)
      .filter((k) => k < dateKey)
      .reduce((m, k) => Math.max(m, squatTop(state.logs[k]?.[l.key])?.weight ?? 0), 0);
    return {
      ...l,
      sets: done(log.sets),
      top,
      light: log.light,
      change: top && before ? top.weight - before.weight : null,
      pr: top && top.weight > bestBefore && bestBefore > 0,
    };
  }).filter((p) => p.key === "squat" || p.sets.length);
  const lifts = day.exercises
    .map((e) => ({ exId: e.exId, name: EXERCISE_BY_ID[e.exId]?.name ?? e.exId, sets: done(e.sets) }))
    .filter((e) => e.sets.length);
  const allSets = [...pyramids.flatMap((p) => p.sets), ...lifts.flatMap((e) => e.sets)];
  const volume = allSets.reduce((sum, s) => sum + num(s.weight) * num(s.reps), 0);
  const reps = allSets.reduce((sum, s) => sum + num(s.reps), 0);

  const duration = day.startedAt && day.finishedAt && day.finishedAt > day.startedAt ? day.finishedAt - day.startedAt : null;

  return {
    units,
    title: day.title,
    duration,
    calories: estimateCalories(duration, state.settings.bodyWeight, units),
    setCount: allSets.length,
    reps,
    volume,
    pyramids,
    lifts,
    muscles: weeklyVolume({ [dateKey]: day }, [dateKey]),
    notes: day.notes,
  };
}

function shareText(sum, dateLabel) {
  const lines = [`${sum.title} workout · ${dateLabel}`];
  const stats = [
    sum.duration && fmtDuration(sum.duration),
    sum.calories && `~${sum.calories} kcal`,
    `${sum.setCount} sets`,
    `${sum.reps} reps`,
    sum.volume > 0 && `${fmtVolume(sum.volume)} ${sum.units} lifted`,
  ];
  lines.push(stats.filter(Boolean).join(" · "));
  for (const p of sum.pyramids)
    if (p.sets.length) lines.push(`${p.name}: ${p.sets.map(fmtSet).join(", ")}${p.top?.rpe ? ` (top set RPE ${p.top.rpe})` : ""}`);
  for (const l of sum.lifts) lines.push(`${l.name}: ${l.sets.map(fmtSet).join(", ")}`);
  if (sum.notes) lines.push(`Notes: ${sum.notes}`);
  return lines.join("\n");
}

export default function SessionSummary({ state, dateKey, day, title, onEditTime, onSetBodyWeight, onBack }) {
  const [copied, setCopied] = useState(false);
  const sum = summarize(state, dateKey, { ...day, title });
  const dateLabel = fromKey(dateKey).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  const levels = Object.fromEntries(Object.entries(sum.muscles).map(([r, v]) => [r, heatLevel(v)]));
  const { units } = sum;

  const share = async () => {
    const text = shareText(sum, dateLabel);
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      }
    } catch {
      // share sheet dismissed
    }
  };

  return (
    <div aria-label="Workout summary">
      <div>
        <div>
          <div className={styles.label}>Workout complete 💪</div>
          <h3 className={styles.h3}>
            {sum.title} · {dateLabel}
          </h3>
        </div>

        <div className={styles.stats} style={{ marginTop: 12, gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className={styles.stat}>
            <div className={styles.label}>Time</div>
            <div className={styles.statNum}>{sum.duration ? fmtDuration(sum.duration) : "–"}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>Sets</div>
            <div className={styles.statNum}>{sum.setCount}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>Reps</div>
            <div className={styles.statNum}>{sum.reps}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.label}>Total lifted</div>
            <div className={styles.statNum}>{sum.volume > 0 ? fmtVolume(sum.volume) : "–"}</div>
            {sum.volume > 0 && <div className={styles.subtitle}>{units} (weight × reps)</div>}
          </div>
        </div>

        <Calories sum={sum} onSetBodyWeight={onSetBodyWeight} />

        <section className={styles.card}>
          <WorkoutTime
            key={`${day.startedAt}-${day.finishedAt}`}
            dateKey={dateKey}
            startedAt={day.startedAt}
            finishedAt={day.finishedAt}
            onSave={onEditTime}
          />
        </section>

        {sum.pyramids.map((p) => (
          <section key={p.key} className={`${styles.card} ${styles.squatCard}`}>
            <div className={`${styles.row} ${styles.between}`}>
              <div className={styles.label}>
                {p.name}
                {p.light ? " · light day" : ""}
              </div>
              {p.pr && <span className={`${styles.pill} ${styles.pillOk}`}>🏆 New best</span>}
            </div>
            {p.sets.length ? (
              <>
                <p style={{ marginTop: 6, color: "var(--text)" }}>{p.sets.map(fmtSet).join(" → ")}</p>
                {p.top && !p.light && (
                  <p style={{ marginTop: 4 }}>
                    Top set {p.top.weight} {units} × {p.top.reps}
                    {p.top.rpe ? ` at RPE ${p.top.rpe}` : ""}
                    {p.change != null &&
                      (p.change > 0
                        ? ` · +${p.change} ${units} on last time`
                        : p.change < 0
                          ? ` · ${p.change} ${units} on last time`
                          : " · same as last time")}
                  </p>
                )}
              </>
            ) : (
              <p style={{ marginTop: 6 }}>No sets ticked off today.</p>
            )}
          </section>
        ))}

        <section className={styles.card}>
          <div className={styles.label}>Exercises</div>
          {sum.lifts.length ? (
            <ul className={styles.list}>
              {sum.lifts.map((l) => (
                <li key={l.exId} className={styles.listItem} style={{ alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span>
                  <span className={styles.subtitle} style={{ textAlign: "right" }}>
                    {l.sets.map(fmtSet).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ marginTop: 6 }}>No other sets ticked off.</p>
          )}
        </section>

        {sum.setCount > 0 && (
          <section className={styles.card}>
            <div className={styles.label}>Muscles worked today</div>
            <div style={{ marginTop: 8 }}>
              <MuscleMap levels={levels} size="md" />
            </div>
            <div style={{ marginTop: 8 }}>
              <HeatLegend />
            </div>
          </section>
        )}

        {sum.notes && (
          <section className={styles.card}>
            <div className={styles.label}>Notes</div>
            <p style={{ marginTop: 6 }}>{sum.notes}</p>
          </section>
        )}

        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={share}>
          {copied ? "Copied ✓" : "Share summary"}
        </button>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnBlock}`} style={{ marginTop: 8 }} onClick={onBack}>
          ← Back to workout (add or fix sets)
        </button>
      </div>
    </div>
  );
}

// Estimated calories, or what's missing to work them out.
function Calories({ sum, onSetBodyWeight }) {
  const [bw, setBw] = useState("");
  return (
    <section className={styles.card}>
      <div className={`${styles.row} ${styles.between}`}>
        <div className={styles.label}>Calories burned</div>
        {sum.calories != null && <span className={styles.subtitle}>estimate</span>}
      </div>
      {sum.calories != null ? (
        <>
          <div className={styles.statNum} style={{ marginTop: 4 }}>
            ~{sum.calories} <span className={styles.subtitle}>kcal</span>
          </div>
          <p style={{ marginTop: 4 }}>Based on your body weight and workout time (weight training ≈ 5 METs).</p>
        </>
      ) : !sum.duration ? (
        <p style={{ marginTop: 6 }}>Set the workout time below to see an estimate.</p>
      ) : (
        <>
          <p style={{ marginTop: 6 }}>Add your body weight to estimate calories.</p>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <input
              className={`${styles.input} ${styles.num}`}
              inputMode="decimal"
              placeholder={sum.units === "lb" ? "180" : "80"}
              value={bw}
              onChange={(e) => setBw(e.target.value.replace(/[^\d.]/g, ""))}
              aria-label="Body weight"
            />
            <span className={styles.subtitle}>{sum.units}</span>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
              disabled={!(Number(bw) > 0)}
              onClick={() => onSetBodyWeight(bw)}
            >
              Save
            </button>
          </div>
        </>
      )}
    </section>
  );
}
