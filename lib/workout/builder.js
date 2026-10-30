// Builds a session that fits the time available: the daily pyramid lifts first, then
// exercises for the chosen muscles, most important angles first, until time runs out.

import { ANGLES } from "./angles";
import { REGIONS, weeklyVolume } from "./muscles";
import { pyramidReps, shiftDate } from "./program";

const SET_MINUTES = 0.75; // time under the bar per set, including setting up the weight
const LIFT_SETUP = 3; // warm-up and loading the bar for a pyramid lift
const EXERCISE_SETUP = 2; // moving to the next station
const EXERCISE_SETS = 3;

// Muscles the builder may pick by itself (the pyramid lifts already cover legs and lower back).
const AUTO_REGIONS = ["chest", "lats", "sideDelts", "rearDelts", "biceps", "triceps", "abs", "obliques", "calves", "hamstrings"];

export function liftMinutes(settings, light) {
  const sets = light ? Number(settings.lightSets) || 3 : pyramidReps(settings).length;
  const rest = (Number(settings.squatRestSeconds) || 150) / 60;
  return Math.round(sets * SET_MINUTES + (sets - 1) * rest + LIFT_SETUP);
}

export function exerciseMinutes(settings, sets = EXERCISE_SETS) {
  const rest = (Number(settings.restSeconds) || 90) / 60;
  return Math.round(sets * SET_MINUTES + (sets - 1) * rest + EXERCISE_SETUP);
}

// The two least-trained muscles over the last 7 days.
export function leastTrained(logs, dateKey, count = 2) {
  const keys = Array.from({ length: 7 }, (_, i) => shiftDate(dateKey, -i));
  const volume = weeklyVolume(logs, keys);
  return [...AUTO_REGIONS].sort((a, b) => volume[a] - volume[b] || AUTO_REGIONS.indexOf(a) - AUTO_REGIONS.indexOf(b)).slice(0, count);
}

// `lifts`: [{ key, name, light, skipped }] for today. Returns the plan, its time and what changed.
export function buildWorkout({ settings, logs, dateKey, regions, minutes, lifts, taken = [] }) {
  const notes = [];
  let liftPlan = lifts.filter((l) => !l.skipped).map((l) => ({ ...l, minutes: liftMinutes(settings, l.light) }));
  let liftTime = liftPlan.reduce((t, l) => t + l.minutes, 0);

  // Not enough time for both pyramids: keep the squat (the daily lift), drop the deadlift.
  if (liftTime > minutes && liftPlan.length > 1) {
    const dropped = liftPlan.filter((l) => l.key !== "squat");
    liftPlan = liftPlan.filter((l) => l.key === "squat");
    liftTime = liftPlan.reduce((t, l) => t + l.minutes, 0);
    notes.push(`Skipping the ${dropped.map((l) => l.name.toLowerCase()).join(" and ")} today to fit ${minutes} minutes.`);
  }

  let targets = regions;
  if (!targets.length) {
    targets = leastTrained(logs, dateKey);
    notes.push(`Least trained this week: ${targets.map((r) => REGIONS[r]).join(" and ")}.`);
  }

  // Round-robin across the muscles: first angle of each, then the second, and so on;
  // optional angles only once every main angle is in.
  const perExercise = exerciseMinutes(settings);
  const used = new Set(taken);
  const queue = [];
  for (const pass of [false, true]) {
    const longest = Math.max(0, ...targets.map((r) => (ANGLES[r] ?? []).length));
    for (let i = 0; i < longest; i++) {
      for (const region of targets) {
        const angle = (ANGLES[region] ?? [])[i];
        if (angle && angle.optional === pass) queue.push({ region, angle });
      }
    }
  }

  const items = [];
  let time = liftTime;
  for (const { region, angle } of queue) {
    if (time + perExercise > minutes) break;
    const exId = angle.options.find((id) => !used.has(id));
    if (!exId) continue;
    used.add(exId);
    items.push({ exId, region, angle: angle.label, reps: angle.reps, sets: EXERCISE_SETS, minutes: perExercise });
    time += perExercise;
  }

  if (liftTime > minutes) notes.push(`The squat pyramid alone takes about ${liftTime} min.`);
  else if (!items.length) notes.push(`Only the pyramid lifts fit in ${minutes} minutes.`);

  return { lifts: liftPlan, items, regions: targets, total: time, skipDeadlift: !liftPlan.some((l) => l.key === "deadlift"), notes };
}

