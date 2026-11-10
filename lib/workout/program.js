// Default weekly plan + "Squat Every Day" logic.
//
// Cory Gregory's Squat Every Day program (Bodybuilding.com, 2015) pairs a daily
// back squat with a bodybuilding split that drops the separate leg day. Each day's
// squat is a pyramid: start light for 10 reps, then add weight and drop reps every
// set up to a clean heavy top set (no grinding). Every value is editable in the app.

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
      item("plank", 3, "30-45 s"),
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
      item("dead-bug", 3, "8 / side"),
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
      item("copenhagen-plank", 3, "20 s / side"),
      item("pallof-press", 3, "10 / side"),
      item("ab-wheel-rollout", 3, "8-12"),
      item("side-plank", 3, "30 s / side"),
      item("bird-dog", 3, "8 / side"),
      item("seated-calf-raises", 3, "15"),
    ],
  },
  0: {
    title: "Recovery",
    items: [],
  },
};

// ------------------------------------------------------- Plan migrations

// Saved plans from before the core update used the book's crunch-style ab work.
// Each retired exercise maps to the core exercise that trains the same job.
const AB_TO_CORE = {
  crunches: "plank",
  "sit-ups": "plank",
  "gym-ladder-sit-ups": "plank",
  "calves-over-bench-sit-ups": "dead-bug",
  "incline-bench-sit-ups": "dead-bug",
  "specific-bench-sit-ups": "ab-wheel-rollout",
  "high-pulley-crunches": "ab-wheel-rollout",
  "machine-crunches": "ab-wheel-rollout",
  "incline-leg-raises": "dead-bug",
  "leg-raises": "hollow-hold",
  "hanging-leg-raises": "hollow-hold",
  "broomstick-twists": "pallof-press",
  "dumbbell-side-bends": "side-plank",
  "roman-chair-side-bends": "side-plank",
  "machine-trunk-rotations": "cable-wood-chop",
};
const CORE_REPS = {
  plank: "30-45 s",
  "side-plank": "30 s / side",
  "dead-bug": "8 / side",
  "hollow-hold": "20-30 s",
  "pallof-press": "10 / side",
};
// The old default Saturday, recognised so it can be replaced by the new core day as a whole.
const OLD_SATURDAY = ["incline-leg-raises", "broomstick-twists", "dumbbell-side-bends", "back-extension", "seated-calf-raises"];

export const PLAN_VERSION = 3; // 3: Bikini Pro plan became the leading program

// Settings saved by an older version: switch to the Bikini Pro plan once (chosen when the apps merged).
export function migrateSettings(settings, version = 1) {
  if (version >= 3) return settings;
  return { ...settings, trainingMode: "bikini" };
}

export function migratePlan(plan, version = 1) {
  if (version >= 2) return plan;
  const next = JSON.parse(JSON.stringify(plan));
  for (const wd of Object.keys(next)) {
    const day = next[wd];
    if (!day?.items) continue;
    if (day.items.map((it) => it.exId).join() === OLD_SATURDAY.join()) {
      next[wd] = JSON.parse(JSON.stringify(DEFAULT_PLAN[6]));
      continue;
    }
    for (const it of day.items) {
      const core = AB_TO_CORE[it.exId];
      if (!core) continue;
      it.exId = core;
      if (CORE_REPS[core]) it.reps = CORE_REPS[core];
    }
  }
  return next;
}

// ------------------------------------------------------------------ Squat

export const SQUAT_EXERCISE_ID = "squats";

// The daily pyramid lifts, logged on each day under their `key`.
export const LIFTS = [
  { key: "squat", exId: "squats", name: "Back Squat", startKey: "startingTop" },
  { key: "deadlift", exId: "deadlifts", name: "Deadlift", startKey: "deadliftStartingTop" },
];

// How the squat and deadlift are trained. The person picks one in the plan step or Settings.
export const TRAINING_MODES = [
  {
    id: "bikini",
    name: "Bikini Pro plan",
    short: "Bikini Pro",
    blurb:
      "Your 6-year plan leads: each day opens with that day's session (sets and reps change by month). The squat and deadlift pyramids are optional add-ons.",
  },
  {
    id: "daily",
    name: "Squat Every Day",
    short: "Squat every day",
    blurb:
      "Squat (and deadlift) every day as a pyramid: light 10s up to one heavy top set. How hard the top set felt decides the next step.",
  },
  {
    id: "progressive",
    name: "Progressive Overload",
    short: "Progressive overload",
    blurb:
      "Squat and deadlift on set days, same weight for every set (5 × 5). Get every rep → add weight next time. Miss 3 times in a row → drop 10% and build back up.",
  },
];

export const isProgressive = (settings) => settings?.trainingMode === "progressive";
export const isBikini = (settings) => (settings?.trainingMode ?? "bikini") === "bikini";

export const DEFAULT_SETTINGS = {
  trainingMode: "bikini", // "bikini" (Bikini Pro plan), "daily" (Squat Every Day pyramids) or "progressive"
  overloadSets: 5, // progressive overload: working sets…
  overloadReps: 5, // …of this many reps, all at the same weight
  squatDays: [1, 3, 5], // progressive overload: Mon, Wed, Fri
  deadliftDays: [2, 4], // progressive overload: Tue, Thu
  units: "kg",
  barWeight: 20, // empty bar
  startingTop: 60, // first-day squat target for the last (heaviest) pyramid set, in `units`
  deadliftStartingTop: 80, // first-day deadlift top-set target
  dailyDeadlift: true, // include the deadlift pyramid every day
  increment: 2.5, // added to the target after a clean day
  pyramidReps: "10, 8, 6, 4, 2", // reps per set; weight goes up every set
  startPct: 50, // first set's weight as % of the top-set target
  lightPct: 60, // light / recovery day as % of recent top
  lightSets: 3,
  lightReps: 5,
  lightDays: [0], // weekdays that default to a light squat day
  restSeconds: 90, // rest timer after a set (0 = off)
  squatRestSeconds: 150, // longer rest after squat sets
  bodyWeight: "", // in `units`, used to estimate calories
  lowerNote: "", // personal reminder shown on lower-body plan days (kept on this device only)
};

const startKeyOf = (lift) => LIFTS.find((l) => l.key === lift)?.startKey ?? "startingTop";

export function roundTo(weight, step) {
  if (!step) return weight;
  return Math.round(weight / step) * step;
}

export function pyramidReps(settings) {
  const reps = String(settings.pyramidReps ?? "")
    .split(/[^\d]+/)
    .map(Number)
    .filter((n) => n > 0);
  return reps.length ? reps : [10, 8, 6, 4, 2];
}

// Pyramid for today: light weight for high reps first, adding weight and dropping reps
// each set up to `target` on the last set.
export function pyramidSets(target, settings) {
  const reps = pyramidReps(settings);
  const step = settings.increment || 2.5;
  const start = target * ((Number(settings.startPct) || 50) / 100);
  let prev = 0;
  return reps.map((r, i) => {
    const raw = reps.length === 1 ? target : start + ((target - start) * i) / (reps.length - 1);
    const weight = Math.max(settings.barWeight || 0, prev, roundTo(raw, step));
    prev = weight;
    return { weight, reps: r };
  });
}

// Heaviest squat set of a logged day, or null for light days / nothing logged.
// Handles both the pyramid log ({ sets, rpe }) and the older daily-max log ({ top }).
export function squatTop(squat) {
  if (!squat || squat.light === true) return null;
  if (squat.top && Number(squat.top.weight) > 0) {
    return { weight: Number(squat.top.weight), reps: Number(squat.top.reps) || 1, rpe: Number(squat.top.rpe) || null };
  }
  const done = (squat.sets || []).filter((s) => s.done && Number(s.weight) > 0);
  if (!done.length) return null;
  const best = done.reduce((a, b) => (Number(b.weight) >= Number(a.weight) ? b : a));
  return { weight: Number(best.weight), reps: Number(best.reps) || 1, rpe: Number(squat.rpe) || null };
}

// Most recent heavy (non-light) day for a lift strictly before `dateKey`.
export function lastTopSet(logs, dateKey, lift = "squat") {
  const keys = Object.keys(logs)
    .filter((k) => k < dateKey)
    .sort()
    .reverse();
  for (const k of keys) {
    const top = squatTop(logs[k]?.[lift]);
    if (top) return { date: k, ...top };
  }
  return null;
}

// Target for today's last (heaviest) pyramid set, based on how the last heavy day went.
export function suggestTarget(logs, dateKey, settings, lift = "squat") {
  const step = settings.increment || 2.5;
  const last = lastTopSet(logs, dateKey, lift);
  if (!last) {
    const start = Number(settings[startKeyOf(lift)]) || settings.startingTop;
    return { weight: start, reason: "Starting point — set it in Settings to a weight you can lift cleanly for the last set." };
  }
  const { weight, rpe } = last;
  if (rpe == null) {
    return { weight, reason: `Last top set was ${weight} ${settings.units}. Rate how hard it was so the app can progress you.` };
  }
  if (rpe <= 8) {
    return {
      weight: roundTo(weight + step, step),
      reason: `Last top set (${weight} × ${last.reps}) felt RPE ${rpe} — add ${step} ${settings.units}.`,
    };
  }
  if (rpe < 10) {
    return { weight, reason: `Last top set was RPE ${rpe} — match ${weight} ${settings.units} and own it.` };
  }
  return {
    weight: roundTo(weight * 0.9, step),
    reason: `Last top set hit RPE 10 — back off ~10% and rebuild. Squat every day means no grinders.`,
  };
}

export function lightWeight(logs, dateKey, settings, lift = "squat") {
  const last = lastTopSet(logs, dateKey, lift);
  const base = last ? last.weight : Number(settings[startKeyOf(lift)]) || settings.startingTop;
  return Math.max(settings.barWeight, roundTo(base * (settings.lightPct / 100), settings.increment || 2.5));
}

// ------------------------------------------------------------------ Progressive overload

// Weekdays a lift is scheduled on in progressive overload mode.
export function liftDays(settings, lift) {
  return (lift === "deadlift" ? settings.deadliftDays : settings.squatDays) ?? [];
}

// Deadlifts move in bigger jumps than squats.
const overloadStep = (settings, lift) => (settings.increment || 2.5) * (lift === "deadlift" ? 2 : 1);

const doneWeighted = (log) => (log?.sets || []).filter((s) => s.done && Number(s.weight) > 0);
const workingWeight = (log) => Math.max(0, ...doneWeighted(log).map((s) => Number(s.weight)));

// Did a progressive session get every planned rep at its working weight?
function hitEveryRep(log, settings) {
  const w = workingWeight(log);
  const good = doneWeighted(log).filter((s) => Number(s.weight) === w && (Number(s.reps) || 0) >= Number(settings.overloadReps));
  return w > 0 && good.length >= Number(settings.overloadSets);
}

// Working weight for today's straight sets, from how the last sessions went.
export function overloadTarget(logs, dateKey, settings, lift = "squat") {
  const step = overloadStep(settings, lift);
  const round = (w) => Math.max(settings.barWeight || 0, roundTo(w, settings.increment || 2.5));
  const scheme = `${settings.overloadSets} × ${settings.overloadReps}`;
  const sessions = Object.keys(logs)
    .filter((k) => k < dateKey)
    .sort()
    .reverse()
    .map((k) => logs[k]?.[lift])
    .filter((l) => l && l.light !== true && doneWeighted(l).length);

  if (!sessions.length) {
    const start = Number(settings[startKeyOf(lift)]) || settings.startingTop;
    return { weight: round(start * 0.8), reason: `Starting point for ${scheme}. Warm up with lighter sets first.` };
  }
  const last = sessions[0];
  if (last.mode !== "progressive") {
    const top = squatTop(last)?.weight ?? workingWeight(last);
    return {
      weight: round(top * 0.8),
      reason: `First ${scheme} session: about 80% of your last pyramid top set (${top} ${settings.units}).`,
    };
  }
  const w = workingWeight(last);
  if (hitEveryRep(last, settings)) {
    return { weight: round(w + step), reason: `Last time you got every rep of ${scheme} at ${w} ${settings.units} — add ${step}.` };
  }
  let misses = 0;
  for (const l of sessions) {
    if (l.mode !== "progressive" || workingWeight(l) !== w || hitEveryRep(l, settings)) break;
    misses += 1;
  }
  if (misses >= 3) {
    return { weight: round(w * 0.9), reason: `Missed reps at ${w} ${settings.units} three times — drop about 10% and build back up.` };
  }
  return {
    weight: w,
    reason: `Some reps were missed at ${w} ${settings.units} last time (try ${misses} of 3) — repeat it and get every rep.`,
  };
}

// Straight sets at the working weight.
export function overloadPlan(target, settings) {
  const sets = Math.max(1, Number(settings.overloadSets) || 5);
  return Array.from({ length: sets }, () => ({ weight: target, reps: Number(settings.overloadReps) || 5 }));
}

// Progressive overload hint for any other exercise ("double progression"): once every set
// reaches the top of the rep range, add weight; until then, add reps at the same weight.
// `assisted` machines work the other way: less assistance is progress.
export function accessoryTarget(last, targetReps, settings, assisted = false) {
  if (!last?.sets?.length) return null;
  const units = settings.units;
  const top = Math.max(0, ...(String(targetReps ?? "").match(/\d+/g) ?? []).map(Number));
  const weights = last.sets.map((s) => Number(s.weight)).filter((n) => n > 0);
  if (!weights.length) return { weight: null, text: "Beat last time: add a rep (or a few seconds) to each set." };
  const step = settings.increment || 2.5;
  const allTop = top > 0 && last.sets.every((s) => (Number(s.reps) || 0) >= top);
  if (assisted) {
    const a = Math.min(...weights);
    if (allTop) return { weight: Math.max(0, roundTo(a - step, step)), text: `Every set hit ${top} reps — take ${step} ${units} less assistance.` };
    return { weight: a, text: `Same assistance (${a} ${units}); add reps until every set hits ${top || "the target"}.` };
  }
  const w = Math.max(...weights);
  if (allTop)
    return { weight: roundTo(w + step, step), text: `Every set hit ${top} reps at ${w} — go up to ${roundTo(w + step, step)} ${units}.` };
  return {
    weight: w,
    text: top ? `Stay at ${w} ${units} and add reps until every set hits ${top}.` : `Stay at ${w} ${units} and add a rep.`,
  };
}

// Days in the last week (ending `todayKey`) with something logged.
export function workoutsThisWeek(logs, todayKey) {
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = logs[shiftDate(todayKey, -i)];
    if (!d) continue;
    const lifted = [d.squat, d.deadlift].some((l) => l?.sets?.some((s) => s.done));
    if (lifted || d.completed || d.exercises?.some((e) => e.sets?.some((s) => s.done))) n += 1;
  }
  return n;
}

// Consecutive days, ending today or yesterday, with any squat logged.
export function squatStreak(logs, todayKey) {
  const did = (k) => {
    const s = logs[k]?.squat;
    if (!s) return false;
    return Boolean(squatTop(s)) || (s.sets || []).some((x) => x.done);
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

// ------------------------------------------------------------------ Units

const KG_PER_LB = 0.45359237;
// Standard bar and plate step for each unit.
const UNIT_DEFAULTS = { kg: { barWeight: 20, increment: 2.5 }, lb: { barWeight: 45, increment: 5 } };

function convertWeight(value, to) {
  if (value === "" || value == null) return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  const out = to === "lb" ? n / KG_PER_LB : n * KG_PER_LB;
  return String(Math.round(out * 10) / 10); // keep 0.1 precision so history stays accurate
}

// Converts every stored weight (logs and squat settings) between kg and lb.
export function convertUnits(state, to) {
  const from = state.settings.units;
  if (from === to) return state;
  const conv = (v) => convertWeight(v, to);
  const sets = (list) => (list || []).map((s) => ({ ...s, weight: conv(s.weight) }));
  const logs = Object.fromEntries(
    Object.entries(state.logs).map(([k, d]) => [
      k,
      {
        ...d,
        exercises: (d.exercises || []).map((e) => ({ ...e, sets: sets(e.sets) })),
        ...Object.fromEntries(
          LIFTS.filter((l) => d[l.key]).map((l) => [
            l.key,
            {
              ...d[l.key],
              sets: sets(d[l.key].sets),
              ...(d[l.key].top ? { top: { ...d[l.key].top, weight: conv(d[l.key].top.weight) } } : {}),
            },
          ]),
        ),
      },
    ]),
  );
  const step = UNIT_DEFAULTS[to].increment;
  const settings = {
    ...state.settings,
    units: to,
    ...UNIT_DEFAULTS[to],
    startingTop: roundTo(Number(convertWeight(state.settings.startingTop, to)), step),
    deadliftStartingTop: roundTo(Number(convertWeight(state.settings.deadliftStartingTop ?? 80, to)), step),
    bodyWeight: state.settings.bodyWeight ? String(Math.round(Number(convertWeight(state.settings.bodyWeight, to)))) : "",
  };
  return { ...state, settings, logs };
}

// ---------------------------------------------------------------- Calories

// Weight training averages about 5 METs (between the Compendium of Physical
// Activities' moderate ~3.5 and vigorous ~6 resistance-training values).
export const WEIGHT_TRAINING_MET = 5;

// Estimated kcal for a session: MET × body weight (kg) × hours. Null when either input is missing.
export function estimateCalories(durationMs, bodyWeight, units) {
  const bw = Number(bodyWeight);
  if (!durationMs || !(bw > 0)) return null;
  const kg = units === "lb" ? bw * KG_PER_LB : bw;
  return Math.round(WEIGHT_TRAINING_MET * kg * (durationMs / 3600000));
}
