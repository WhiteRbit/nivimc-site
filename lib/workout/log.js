// Helpers for reading and writing a day's log.
// A day's exercises are snapshotted from the weekly plan the first time you log
// anything, so later plan edits never rewrite history.

import { squatTop, weekdayOf } from "./program";

const blankSet = () => ({ weight: "", reps: "", done: false });

export function snapshotFromPlan(plan, dateKey) {
  return snapshotFromWeekday(plan, weekdayOf(dateKey));
}

// Fresh exercise list for one weekday's routine in the plan.
export function snapshotFromWeekday(plan, weekday) {
  const day = plan[weekday] || { items: [] };
  return day.items.map((it) => ({
    exId: it.exId,
    targetSets: it.sets,
    targetReps: it.reps,
    sets: Array.from({ length: Number(it.sets) || 1 }, blankSet),
  }));
}

// Read-only view of a day (falls back to the plan when nothing is logged yet).
export function viewDay(state, dateKey) {
  const log = state.logs[dateKey];
  return {
    // Set when the person picks another day's routine for this date.
    title: log?.title ?? null,
    exercises: log?.exercises ?? snapshotFromPlan(state.plan, dateKey),
    squat: log?.squat ?? { light: null, sets: [], rpe: null },
    notes: log?.notes ?? "",
    completed: log?.completed ?? false,
    startedAt: log?.startedAt ?? null, // ms timestamp of the first ticked set
    finishedAt: log?.finishedAt ?? null, // ms timestamp of "Finish workout"
  };
}

// Returns a new state with `fn` applied to a mutable copy of the day.
export function withDay(state, dateKey, fn) {
  const day = JSON.parse(JSON.stringify(viewDay(state, dateKey)));
  fn(day);
  if (!day.startedAt && dayHasDoneSet(day)) day.startedAt = Date.now();
  return { ...state, logs: { ...state.logs, [dateKey]: day } };
}

function dayHasDoneSet(day) {
  return day.squat.sets.some((s) => s.done) || day.exercises.some((e) => e.sets.some((s) => s.done));
}

export function newSet() {
  return blankSet();
}

// Most recent completed sets for an exercise before `dateKey`.
export function lastPerformance(logs, exId, dateKey) {
  const keys = Object.keys(logs).filter((k) => k < dateKey).sort().reverse();
  for (const k of keys) {
    const ex = logs[k]?.exercises?.find((e) => e.exId === exId);
    const done = ex?.sets?.filter((s) => s.done && (s.weight !== "" || s.reps !== ""));
    if (done && done.length) return { date: k, sets: done };
  }
  return null;
}

export function dayHasActivity(day) {
  if (!day) return false;
  const squat = day.squat && (squatTop(day.squat) || day.squat.sets?.some((s) => s.done));
  const lifts = day.exercises?.some((e) => e.sets.some((s) => s.done));
  return Boolean(squat || lifts || day.completed);
}
