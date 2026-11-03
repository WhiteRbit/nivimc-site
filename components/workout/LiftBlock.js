"use client";

import styles from "./workout.module.css";
import SetTable, { toggleSet } from "./SetTable";
import HowTo from "./HowTo";
import MuscleMap from "./MuscleMap";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import {
  DAY_NAMES,
  isProgressive,
  liftDays,
  lightWeight,
  overloadPlan,
  overloadTarget,
  pyramidSets,
  suggestTarget,
  weekdayOf,
} from "@/lib/workout/program";
import { newSet } from "@/lib/workout/log";
import { musclesFor } from "@/lib/workout/muscles";

// Today's planned sets for a main lift: a pyramid up to the target, flat light sets, or
// (progressive overload) straight sets at the working weight.
export function liftPlan(state, day, dateKey, lift) {
  const { settings, logs } = state;
  const log = day[lift.key];
  if (isProgressive(settings)) {
    const target = overloadTarget(logs, dateKey, settings, lift.key);
    return { isLight: false, target, sets: overloadPlan(target.weight, settings), progressive: true };
  }
  const isLight = log.light ?? settings.lightDays.includes(weekdayOf(dateKey));
  const target = suggestTarget(logs, dateKey, settings, lift.key);
  const sets = isLight
    ? Array.from({ length: settings.lightSets }, () => ({
        weight: lightWeight(logs, dateKey, settings, lift.key),
        reps: settings.lightReps,
      }))
    : pyramidSets(target.weight, settings);
  return { isLight, target, sets };
}

// Whether a main lift is off today: skipped by hand, not one of its days (progressive
// overload), or the deadlift turned off (squat every day).
export function liftSkipped(state, day, lift, dateKey) {
  const { settings } = state;
  if (isProgressive(settings)) return day[lift.key]?.skip ?? !liftDays(settings, lift.key).includes(weekdayOf(dateKey));
  if (lift.key !== "deadlift") return false;
  return day.deadlift.skip ?? settings.dailyDeadlift === false;
}

// Next weekday name a lift is scheduled on after `dateKey` (progressive overload).
export function nextLiftDay(state, lift, dateKey) {
  const days = liftDays(state.settings, lift.key);
  const wd = weekdayOf(dateKey);
  for (let i = 1; i <= 7; i++) if (days.includes((wd + i) % 7)) return DAY_NAMES[(wd + i) % 7];
  return null;
}

// The full logging card for a daily pyramid lift (squat or deadlift).
export default function LiftBlock({ state, day, dateKey, lift, edit, onSetDone }) {
  const units = state.settings.units;
  const log = day[lift.key];
  const { isLight, target, sets: plan, progressive } = liftPlan(state, day, dateKey, lift);
  const ex = EXERCISE_BY_ID[lift.exId];
  const sets = Array.from({ length: Math.max(plan.length, log.sets.length) }, (_, i) => log.sets[i] || newSet());
  const lastIndex = plan.length - 1;

  const writeSet = (i, fn) =>
    edit((d) => {
      d[lift.key].light = isLight; // pin the day type once something is logged
      d[lift.key].mode = progressive ? "progressive" : "daily"; // how the next target is worked out
      d[lift.key].sets = Array.from({ length: sets.length }, (_, k) => d[lift.key].sets[k] || newSet());
      d[lift.key].sets[i] = fn(d[lift.key].sets[i]);
    });

  return (
    <section className={`${styles.card} ${styles.squatCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.grow}>
          <div className={styles.label}>
            {progressive ? `Progressive overload · ${plan.length} × ${plan[0].reps}` : `Daily pyramid${isLight ? " · light day" : ""}`}
          </div>
          <h3 className={styles.h3}>{lift.name}</h3>
          {!isLight && (
            <div style={{ marginTop: 4 }}>
              <span className={styles.target} style={{ fontSize: "1.5rem" }}>
                {target.weight}
              </span>{" "}
              <span className={styles.subtitle}>
                {progressive ? `${units} × ${plan[0].reps} reps, every set` : `${units} top set × ${plan[lastIndex].reps}`}
              </span>
            </div>
          )}
          <p style={{ marginTop: 2 }}>
            {isLight ? `Easy: ${state.settings.lightSets} × ${state.settings.lightReps}, move well.` : target.reason}
          </p>
        </div>
        <MuscleMap {...musclesFor(lift.exId)} size="sm" />
      </div>

      <SetTable
        sets={sets}
        units={units}
        placeholder={(i) => plan[i] ?? plan[lastIndex]}
        labelFor={(i) => (!isLight && !progressive && i === lastIndex ? "Top" : i + 1)}
        onChange={(i, field, value) => writeSet(i, (s) => ({ ...s, [field]: value }))}
        onToggle={(i, ph) => {
          if (!sets[i].done) onSetDone?.(state.settings.squatRestSeconds);
          writeSet(i, (s) => toggleSet(s, ph));
        }}
      />

      {progressive && (
        <p style={{ marginTop: 10 }}>Get every rep on every set and the weight goes up next time. Change the reps if you fell short.</p>
      )}

      {!isLight && !progressive && (
        <div style={{ marginTop: 12 }}>
          <div className={styles.label}>How hard was the top set? (RPE)</div>
          <div className={styles.rpeRow} style={{ marginTop: 6 }}>
            {[6, 7, 8, 9, 10].map((r) => (
              <button
                key={r}
                className={`${styles.rpe} ${log.rpe === r ? styles.rpeOn : ""}`}
                onClick={() =>
                  edit((d) => {
                    d[lift.key].light = isLight;
                    d[lift.key].rpe = d[lift.key].rpe === r ? null : r;
                  })
                }
              >
                {r}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 6 }}>8 = 2 reps left · 9 = 1 left · 10 = nothing left. Stop before form breaks.</p>
        </div>
      )}

      <div className={styles.row} style={{ marginTop: 10 }}>
        <HowTo exercise={ex} />
      </div>
    </section>
  );
}
