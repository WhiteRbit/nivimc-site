"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import MuscleMap, { HeatLegend } from "./MuscleMap";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { heatLevel, weeklyVolume } from "@/lib/workout/muscles";
import { fromKey, lastTopSet, squatTop } from "@/lib/workout/program";

const num = (v) => {
  const n = Number(String(v ?? "").match(/\d+(\.\d+)?/)?.[0]);
  return Number.isFinite(n) ? n : 0;
};
const done = (sets) => (sets || []).filter((s) => s.done);
const fmtSet = (s) => `${s.weight === "" ? "BW" : s.weight}×${s.reps || "?"}`;
const fmtVolume = (v) => (v >= 10000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toLocaleString());

function fmtDuration(ms) {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
}

// Everything the person did in one session, shown when they finish it.
export function summarize(state, dateKey, day) {
  const units = state.settings.units;
  const squatSets = done(day.squat.sets);
  const lifts = day.exercises
    .map((e) => ({ exId: e.exId, name: EXERCISE_BY_ID[e.exId]?.name ?? e.exId, sets: done(e.sets) }))
    .filter((e) => e.sets.length);
  const allSets = [...squatSets, ...lifts.flatMap((e) => e.sets)];
  const volume = allSets.reduce((sum, s) => sum + num(s.weight) * num(s.reps), 0);
  const reps = allSets.reduce((sum, s) => sum + num(s.reps), 0);

  const top = squatTop(day.squat);
  const before = lastTopSet(state.logs, dateKey);
  const bestBefore = Object.keys(state.logs)
    .filter((k) => k < dateKey)
    .reduce((m, k) => Math.max(m, squatTop(state.logs[k]?.squat)?.weight ?? 0), 0);

  return {
    units,
    title: day.title,
    duration: day.startedAt && day.finishedAt && day.finishedAt > day.startedAt ? day.finishedAt - day.startedAt : null,
    setCount: allSets.length,
    reps,
    volume,
    squat: { sets: squatSets, top, light: day.squat.light, change: top && before ? top.weight - before.weight : null, pr: top && top.weight > bestBefore && bestBefore > 0 },
    lifts,
    muscles: weeklyVolume({ [dateKey]: day }, [dateKey]),
    notes: day.notes,
  };
}

function shareText(sum, dateLabel) {
  const lines = [`${sum.title} workout · ${dateLabel}`];
  const stats = [sum.duration && fmtDuration(sum.duration), `${sum.setCount} sets`, `${sum.reps} reps`, sum.volume > 0 && `${fmtVolume(sum.volume)} ${sum.units} lifted`];
  lines.push(stats.filter(Boolean).join(" · "));
  if (sum.squat.sets.length) lines.push(`Back squat: ${sum.squat.sets.map(fmtSet).join(", ")}${sum.squat.top?.rpe ? ` (top set RPE ${sum.squat.top.rpe})` : ""}`);
  for (const l of sum.lifts) lines.push(`${l.name}: ${l.sets.map(fmtSet).join(", ")}`);
  if (sum.notes) lines.push(`Notes: ${sum.notes}`);
  return lines.join("\n");
}

export default function SessionSummary({ state, dateKey, day, title, onClose }) {
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
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Workout summary">
        <div className={`${styles.row} ${styles.between}`}>
          <div>
            <div className={styles.label}>Workout complete</div>
            <h3 className={styles.h3}>
              {sum.title} · {dateLabel}
            </h3>
          </div>
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={onClose}>
            Close
          </button>
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

        <section className={`${styles.card} ${styles.squatCard}`}>
          <div className={`${styles.row} ${styles.between}`}>
            <div className={styles.label}>Back squat{sum.squat.light ? " · light day" : ""}</div>
            {sum.squat.pr && <span className={`${styles.pill} ${styles.pillOk}`}>🏆 New best</span>}
          </div>
          {sum.squat.sets.length ? (
            <>
              <p style={{ marginTop: 6, color: "var(--text)" }}>{sum.squat.sets.map(fmtSet).join(" → ")}</p>
              {sum.squat.top && !sum.squat.light && (
                <p style={{ marginTop: 4 }}>
                  Top set {sum.squat.top.weight} {units} × {sum.squat.top.reps}
                  {sum.squat.top.rpe ? ` at RPE ${sum.squat.top.rpe}` : ""}
                  {sum.squat.change != null &&
                    (sum.squat.change > 0
                      ? ` · +${sum.squat.change} ${units} on last time`
                      : sum.squat.change < 0
                        ? ` · ${sum.squat.change} ${units} on last time`
                        : " · same as last time")}
                </p>
              )}
            </>
          ) : (
            <p style={{ marginTop: 6 }}>No squat sets ticked off today.</p>
          )}
        </section>

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
      </div>
    </div>
  );
}
