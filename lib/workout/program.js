// Default weekly plan + "Squat Every Day" logic.
//
// Cory Gregory's Squat Every Day program (Bodybuilding.com, 2015) pairs a daily
// back squat with a bodybuilding split that drops the separate leg day. Each day
// you work up to a clean "daily max" (no grinding), then do back-off sets.
// The numbers below are this app's interpretation of that idea, not a copy of
// the original trainer; every value is editable in the app.

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const item = (exId, sets, reps) => ({ exId, sets, reps });

// Keyed by JS weekday (0 = Sunday).
export const DEFAULT_PLAN = {
  1: {
    title: "Chest",
    items: [
      item("bench-press", 4, "6-8"),
      item("incline-dumbbell-press", 3, "8-10"),
      item("dumbbell-flys", 3, "12"),
      item("parallel-bar-dips", 3, "10-20"),
      item("crunches", 3, "20"),
    ],
  },
  2: {
    title: "Back",
    items: [
      item("chin-ups", 4, "6-10"),
      item("bent-rows", 4, "8"),
      item("one-arm-dumbbell-rows", 3, "10"),
      item("straight-arm-lat-pulldowns", 3, "12"),
      item("barbell-shrugs", 3, "12"),
    ],
  },
  3: {
    title: "Shoulders",
    items: [
      item("front-press", 4, "6-8"),
      item("lateral-raises", 3, "12-20"),
      item("bent-over-lateral-raises", 3, "12-15"),
      item("upright-rows", 3, "10"),
      item("hanging-leg-raises", 3, "10-15"),
    ],
  },
  4: {
    title: "Arms",
    items: [
      item("close-grip-bench-press", 4, "8"),
      item("barbell-curls", 4, "8-10"),
      item("triceps-extensions", 3, "10"),
      item("hammer-curls", 3, "10"),
      item("pushdowns", 3, "12"),
      item("reverse-wrist-curls", 2, "15"),
    ],
  },
  5: {
    title: "Posterior chain & glutes",
    items: [
      item("stiff-legged-deadlifts", 3, "8-10"),
      item("lying-leg-curls", 3, "10-12"),
      item("lunges", 3, "10 / leg"),
      item("bridging", 3, "15"),
      item("standing-calf-raises", 4, "15"),
    ],
  },
  6: {
    title: "Core & calves",
    items: [
      item("incline-leg-raises", 3, "12"),
      item("broomstick-twists", 3, "30"),
      item("dumbbell-side-bends", 3, "15 / side"),
      item("back-extension", 3, "12"),
      item("seated-calf-raises", 3, "15"),
    ],
  },
  0: {
    title: "Recovery",
    items: [],
  },
};

// ------------------------------------------------------------------ Squat

export const SQUAT_EXERCISE_ID = "squats";

export const DEFAULT_SETTINGS = {
  units: "kg",
  barWeight: 20, // empty bar
  startingTop: 60, // first-day daily-max target, in `units`
  increment: 2.5, // added to the target after a clean day
  backoffPct: 80, // back-off sets as % of today's top set
  backoffSets: 3,
  backoffReps: 4,
  lightPct: 60, // light / recovery day as % of recent top
  lightSets: 3,
  lightReps: 5,
  lightDays: [0], // weekdays that default to a light squat day
};

export function roundTo(weight, step) {
  if (!step) return weight;
  return Math.round(weight / step) * step;
}

// Most recent logged top set strictly before `dateKey`.
export function lastTopSet(logs, dateKey) {
  const keys = Object.keys(logs).filter((k) => k < dateKey).sort().reverse();
  for (const k of keys) {
    const top = logs[k]?.squat?.top;
    if (top && Number(top.weight) > 0 && !logs[k].squat.light) {
      return { date: k, ...top, weight: Number(top.weight), reps: Number(top.reps) || 1, rpe: Number(top.rpe) || null };
    }
  }
  return null;
}

// Suggested daily-max target for `dateKey`, based on how the last heavy day went.
export function suggestTarget(logs, dateKey, settings) {
  const step = settings.increment || 2.5;
  const last = lastTopSet(logs, dateKey);
  if (!last) {
    return { weight: settings.startingTop, reason: "Starting point — adjust it to something you can squat cleanly for 1–3 reps." };
  }
  const { weight, rpe } = last;
  if (rpe == null) {
    return { weight, reason: `Last top set was ${weight} ${settings.units}. Log an RPE so the app can progress you.` };
  }
  if (rpe <= 8) {
    return { weight: roundTo(weight + step, step), reason: `Last top set (${weight} × ${last.reps}) felt RPE ${rpe} — add ${step} ${settings.units}.` };
  }
  if (rpe < 10) {
    return { weight, reason: `Last top set was RPE ${rpe} — match ${weight} ${settings.units} and own it.` };
  }
  return {
    weight: roundTo(weight * 0.9, step),
    reason: `Last top set hit RPE 10 — back off ~10% and rebuild. Squat every day means no grinders.`,
  };
}

// Warm-up ramp toward the target.
export function warmupSets(target, settings) {
  const step = settings.increment || 2.5;
  const bar = settings.barWeight;
  const ramp = [
    { pct: 0, reps: 10 },
    { pct: 0.4, reps: 5 },
    { pct: 0.6, reps: 3 },
    { pct: 0.75, reps: 2 },
    { pct: 0.875, reps: 1 },
  ];
  const seen = new Set();
  return ramp
    .map(({ pct, reps }) => ({ weight: Math.max(bar, roundTo(target * pct, step)), reps }))
    .filter((s) => {
      if (s.weight >= target || seen.has(s.weight)) return false;
      seen.add(s.weight);
      return true;
    });
}

export function backoffWeight(topWeight, settings) {
  return roundTo(topWeight * (settings.backoffPct / 100), settings.increment || 2.5);
}

export function lightWeight(logs, dateKey, settings) {
  const last = lastTopSet(logs, dateKey);
  const base = last ? last.weight : settings.startingTop;
  return Math.max(settings.barWeight, roundTo(base * (settings.lightPct / 100), settings.increment || 2.5));
}

// Consecutive days, ending today or yesterday, with any squat logged.
export function squatStreak(logs, todayKey) {
  const did = (k) => {
    const s = logs[k]?.squat;
    if (!s) return false;
    return (s.top && Number(s.top.weight) > 0) || (s.sets || []).some((x) => x.done);
  };
  let cursor = todayKey;
  if (!did(cursor)) cursor = shiftDate(cursor, -1);
  let streak = 0;
  while (did(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

// ------------------------------------------------------------------ Dates

export function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDate(key, days) {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

export function weekdayOf(key) {
  return fromKey(key).getDay();
}
