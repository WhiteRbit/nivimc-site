"use client";

import styles from "./workout.module.css";
import SetTable, { toggleSet } from "./SetTable";
import HowTo from "./HowTo";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import {
  DAY_NAMES,
  isBikini,
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
  // Bikini Pro plan: the pyramids are optional add-ons, off until added for the day.
  if (isBikini(settings)) return day[lift.key]?.skip ?? true;
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

  const meta = isLight
    ? `Light day · ${state.settings.lightSets} × ${state.settings.lightReps}`
    : progressive
      ? `${plan.length} × ${plan[0].reps} at ${target.weight} ${units}`
      : `Pyramid to ${target.weight} ${units} × ${plan[lastIndex].reps}`;

  return (
    <section className={`${styles.card} ${styles.squatCard}`}>
      <div className={styles.sectionHead}>
        <div className={styles.grow}>
          <h3 className={styles.h3}>{lift.name}</h3>
          <div className={styles.exMeta}>{meta}</div>
          {!isLight && <div className={styles.exMeta}>{target.reason}</div>}
        </div>
        <HowTo exercise={ex} />
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

      {!isLight && !progressive && (
        <div className={styles.sectionHead} style={{ marginTop: 10 }}>
          <span className={styles.exMeta} title="How hard was the top set? 8 = 2 reps left · 9 = 1 left · 10 = nothing left">
            Top set effort
          </span>
          <div className={styles.rpeRow} role="group" aria-label="How hard was the top set (RPE)">
            {[6, 7, 8, 9, 10].map((r) => (
              <button
                key={r}
                className={`${styles.rpe} ${log.rpe === r ? styles.rpeOn : ""}`}
                aria-pressed={log.rpe === r}
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
        </div>
      )}
    </section>
  );
}
