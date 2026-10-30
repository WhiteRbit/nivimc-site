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
    // A new day starts empty: the plan step adds exercises (or a saved routine from the week).
    exercises: log?.exercises ?? [],
    squat: log?.squat ?? { light: null, sets: [], rpe: null },
    deadlift: log?.deadlift ?? { light: null, sets: [], rpe: null, skip: null },
    // Which step of the Today flow the day is on: "plan" → "workout" → "done".
    stage: log?.stage ?? legacyStage(log),
    notes: log?.notes ?? "",
    completed: log?.completed ?? false,
    startedAt: log?.startedAt ?? null, // ms timestamp of the first ticked set
    finishedAt: log?.finishedAt ?? null, // ms timestamp of "Finish workout"
    timeManual: log?.timeManual ?? false, // times were entered by hand
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
  return [day.squat, day.deadlift].some((l) => l?.sets?.some((s) => s.done)) || day.exercises.some((e) => e.sets.some((s) => s.done));
}

// Days saved before the step flow existed: finished → summary, any set ticked → workout,
// otherwise (e.g. a routine copied from the week plan but not started) → plan.
function legacyStage(log) {
  if (!log) return "plan";
  if (log.completed) return "done";
  const lifted = log.squat?.sets?.some((s) => s.done) || log.squat?.top?.weight;
  const trained = log.exercises?.some((e) => e.sets?.some((s) => s.done));
  return lifted || trained ? "workout" : "plan";
}

export function newSet() {
  return blankSet();
}

// Most recent completed sets for an exercise before `dateKey`.
export function lastPerformance(logs, exId, dateKey) {
  const keys = Object.keys(logs)
    .filter((k) => k < dateKey)
    .sort()
    .reverse();
  for (const k of keys) {
    const ex = logs[k]?.exercises?.find((e) => e.exId === exId);
    const done = ex?.sets?.filter((s) => s.done && (s.weight !== "" || s.reps !== ""));
    if (done && done.length) return { date: k, sets: done };
  }
  return null;
}

export function dayHasActivity(day) {
  if (!day) return false;
  const squat = [day.squat, day.deadlift].some((l) => l && (squatTop(l) || l.sets?.some((s) => s.done)));
  const lifts = day.exercises?.some((e) => e.sets.some((s) => s.done));
  return Boolean(squat || lifts || day.completed);
}

// Moves the unfinished sets of the exercises at `indexes` from `dateKey` to the next day
// (e.g. equipment busy, out of time, not feeling well). Finished sets stay where they were.
// Returns the new state and the names of what moved.
export function postponeExercises(state, dateKey, indexes, nextKey, nameOf) {
  const day = viewDay(state, dateKey);
  const carried = [];
  const keep = day.exercises.map((ex, i) => {
    if (!indexes.includes(i)) return ex;
    const left = ex.sets.filter((s) => !s.done);
    if (!left.length) return ex;
    carried.push({ ...ex, sets: left.map((s) => ({ ...s, done: false })) });
    const done = ex.sets.filter((s) => s.done);
    return done.length ? { ...ex, sets: done, movedTo: nextKey } : null;
  });
  if (!carried.length) return { state, moved: [] };

  let next = withDay(state, dateKey, (d) => {
    d.exercises = keep.filter(Boolean);
  });
  next = withDay(next, nextKey, (d) => {
    for (const ex of carried) {
      const existing = d.exercises.find((e) => e.exId === ex.exId && e.carriedFrom === dateKey);
      if (existing) existing.sets.push(...ex.sets);
      else d.exercises.push({ exId: ex.exId, targetSets: ex.sets.length, targetReps: ex.targetReps, sets: ex.sets, carriedFrom: dateKey });
    }
  });
  return { state: next, moved: carried.map((e) => nameOf(e.exId)) };
}
