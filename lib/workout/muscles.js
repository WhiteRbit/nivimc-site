// Muscle regions shown on the body map, and which ones each exercise works.
// Primary/secondary follow the muscles the book highlights for each exercise.

export const REGIONS = {
  chest: "Chest",
  frontDelts: "Front delts",
  sideDelts: "Side delts",
  rearDelts: "Rear delts",
  traps: "Traps",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abs: "Abs",
  obliques: "Obliques",
  lats: "Lats",
  lowerBack: "Lower back",
  glutes: "Glutes",
  abductors: "Outer glutes",
  quads: "Quads",
  adductors: "Inner thighs",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

const m = (primary, secondary = []) => ({ primary, secondary });

export const EXERCISE_MUSCLES = {
  // Arms
  curls: m(["biceps"], ["forearms", "frontDelts"]),
  "concentration-curls": m(["biceps"], ["forearms"]),
  "hammer-curls": m(["forearms", "biceps"]),
  "low-pulley-curls": m(["biceps"], ["forearms"]),
  "high-pulley-curls": m(["biceps"]),
  "barbell-curls": m(["biceps"], ["forearms"]),
  "machine-curls": m(["biceps"]),
  "preacher-curls": m(["biceps"], ["forearms"]),
  "reverse-curls": m(["forearms"], ["biceps"]),
  "reverse-wrist-curls": m(["forearms"]),
  "wrist-curls": m(["forearms"]),
  pushdowns: m(["triceps"]),
  "reverse-pushdowns": m(["triceps"], ["forearms"]),
  "one-arm-reverse-pushdowns": m(["triceps"]),
  "triceps-extensions": m(["triceps"]),
  "dumbbell-triceps-extensions": m(["triceps"]),
  "one-arm-dumbbell-triceps-extensions": m(["triceps"]),
  "seated-dumbbell-triceps-extensions": m(["triceps"]),
  "seated-ez-bar-triceps-extensions": m(["triceps"]),
  "triceps-kickbacks": m(["triceps"]),
  "triceps-dips": m(["triceps"], ["chest", "frontDelts"]),

  // Shoulders
  "back-press": m(["sideDelts", "frontDelts"], ["traps", "triceps"]),
  "front-press": m(["frontDelts", "sideDelts"], ["chest", "triceps", "traps"]),
  "dumbbell-press": m(["sideDelts", "frontDelts"], ["triceps", "traps"]),
  "one-arm-dumbbell-press": m(["frontDelts"], ["sideDelts", "chest", "triceps"]),
  "lateral-raises": m(["sideDelts"], ["traps"]),
  "bent-over-lateral-raises": m(["rearDelts"], ["traps", "sideDelts"]),
  "front-raises": m(["frontDelts"], ["chest"]),
  "side-lying-lateral-raises": m(["sideDelts"]),
  "low-pulley-lateral-raises": m(["sideDelts"]),
  "low-pulley-front-raises": m(["frontDelts"], ["chest"]),
  "low-pulley-bent-over-lateral-raises": m(["rearDelts"], ["traps"]),
  "one-dumbbell-front-raises": m(["frontDelts"], ["chest"]),
  "barbell-front-raises": m(["frontDelts"], ["chest", "traps"]),
  "upright-rows": m(["sideDelts", "traps"], ["biceps"]),
  "nautilus-lateral-raises": m(["sideDelts"]),
  "pec-deck-rear-delt": m(["rearDelts"], ["traps"]),

  // Chest
  "bench-press": m(["chest"], ["triceps", "frontDelts"]),
  "close-grip-bench-press": m(["triceps", "chest"], ["frontDelts"]),
  "incline-press": m(["chest", "frontDelts"], ["triceps"]),
  "decline-press": m(["chest"], ["triceps"]),
  "push-ups": m(["chest"], ["triceps", "frontDelts", "abs"]),
  "parallel-bar-dips": m(["chest", "triceps"], ["frontDelts"]),
  "dumbbell-bench-press": m(["chest"], ["triceps", "frontDelts"]),
  "dumbbell-flys": m(["chest"], ["frontDelts"]),
  "incline-dumbbell-press": m(["chest", "frontDelts"], ["triceps"]),
  "incline-dumbbell-flys": m(["chest"], ["frontDelts"]),
  "pec-deck-flys": m(["chest"]),
  "cable-crossover-flys": m(["chest"]),
  "dumbbell-pullovers": m(["chest", "lats"], ["triceps"]),
  "barbell-pullovers": m(["lats", "chest"], ["triceps"]),

  // Back
  "chin-ups": m(["lats"], ["biceps", "forearms", "rearDelts"]),
  "reverse-chin-ups": m(["lats", "biceps"], ["forearms"]),
  "lat-pulldowns": m(["lats"], ["biceps", "traps"]),
  "back-lat-pulldowns": m(["lats"], ["biceps", "traps"]),
  "close-grip-lat-pulldowns": m(["lats"], ["biceps", "forearms"]),
  "straight-arm-lat-pulldowns": m(["lats"], ["triceps"]),
  "seated-rows": m(["lats", "traps"], ["rearDelts", "biceps", "lowerBack"]),
  "one-arm-dumbbell-rows": m(["lats"], ["rearDelts", "traps", "biceps"]),
  "bent-rows": m(["lats", "traps"], ["rearDelts", "biceps", "lowerBack"]),
  "t-bar-rows": m(["lats", "traps"], ["rearDelts", "biceps"]),
  "stiff-legged-deadlifts": m(["hamstrings", "glutes"], ["lowerBack"]),
  deadlifts: m(["lowerBack", "glutes", "quads"], ["hamstrings", "traps", "forearms"]),
  "sumo-deadlifts": m(["quads", "adductors", "glutes"], ["lowerBack"]),
  "back-extension": m(["glutes", "hamstrings"], ["lowerBack"]),
  "upright-rows-back": m(["traps"], ["sideDelts"]),
  "barbell-shrugs": m(["traps"]),
  "dumbbell-shrugs": m(["traps"]),
  "machine-shrugs": m(["traps"]),

  // Legs
  "dumbbell-squats": m(["quads", "glutes"]),
  squats: m(["quads", "glutes"], ["adductors", "lowerBack", "hamstrings", "abs"]),
  "front-squats": m(["quads"], ["glutes", "abs"]),
  "power-squats": m(["quads", "adductors", "glutes"], ["hamstrings"]),
  "angled-leg-press": m(["quads", "glutes"], ["hamstrings"]),
  "hack-squats": m(["quads"]),
  "leg-extensions": m(["quads"]),
  "lying-leg-curls": m(["hamstrings"], ["calves"]),
  "standing-leg-curls": m(["hamstrings"], ["calves"]),
  "seated-leg-curls": m(["hamstrings"], ["calves"]),
  "good-mornings": m(["hamstrings", "lowerBack"], ["glutes"]),
  "cable-adductions": m(["adductors"]),
  "machine-adductions": m(["adductors"]),
  "standing-calf-raises": m(["calves"]),
  "one-leg-toe-raises": m(["calves"]),
  "donkey-calf-raises": m(["calves"]),
  "seated-calf-raises": m(["calves"]),
  "seated-barbell-calf-raises": m(["calves"]),

  // Buttocks
  lunges: m(["glutes", "quads"], ["hamstrings"]),
  "cable-back-kicks": m(["glutes"], ["hamstrings"]),
  "machine-hip-extensions": m(["glutes"], ["hamstrings"]),
  "floor-hip-extensions": m(["glutes"], ["hamstrings"]),
  bridging: m(["glutes", "hamstrings"]),
  "cable-hip-abductions": m(["abductors"], ["glutes"]),
  "standing-machine-hip-abductions": m(["abductors"], ["glutes"]),
  "floor-hip-abductions": m(["abductors"], ["glutes"]),
  "seated-machine-hip-abductions": m(["abductors"], ["glutes"]),

  // Abdomen
  crunches: m(["abs"], ["obliques"]),
  "sit-ups": m(["abs"], ["obliques"]),
  "gym-ladder-sit-ups": m(["abs"], ["obliques"]),
  "calves-over-bench-sit-ups": m(["abs"]),
  "incline-bench-sit-ups": m(["abs"], ["obliques"]),
  "specific-bench-sit-ups": m(["abs"], ["obliques"]),
  "high-pulley-crunches": m(["abs"]),
  "machine-crunches": m(["abs"], ["obliques"]),
  "incline-leg-raises": m(["abs"]),
  "leg-raises": m(["abs"], ["obliques"]),
  "hanging-leg-raises": m(["abs"], ["obliques", "forearms"]),
  "broomstick-twists": m(["obliques"]),
  "dumbbell-side-bends": m(["obliques"], ["lowerBack"]),
  "roman-chair-side-bends": m(["obliques"], ["lowerBack"]),
  "machine-trunk-rotations": m(["obliques"], ["abs"]),

  // Core (not from the book)
  plank: m(["abs"], ["obliques", "glutes", "frontDelts"]),
  "side-plank": m(["obliques"], ["abductors", "abs"]),
  "copenhagen-plank": m(["adductors", "obliques"], ["abs"]),
  "dead-bug": m(["abs"], ["obliques"]),
  "bird-dog": m(["lowerBack", "glutes"], ["abs", "rearDelts"]),
  "hollow-hold": m(["abs"], ["obliques"]),
  "pallof-press": m(["obliques"], ["abs"]),
  "ab-wheel-rollout": m(["abs"], ["lats", "obliques"]),
  "cable-wood-chop": m(["obliques"], ["abs", "frontDelts"]),
  "landmine-180": m(["obliques"], ["abs", "frontDelts"]),
  "farmers-carry": m(["obliques", "traps", "forearms"], ["abs", "glutes"]),
};

export function musclesFor(exId) {
  return EXERCISE_MUSCLES[exId] ?? { primary: [], secondary: [] };
}

// Weighted set count per region over the given days: primary = 1, secondary = 0.5.
export function weeklyVolume(logs, dateKeys) {
  const totals = Object.fromEntries(Object.keys(REGIONS).map((r) => [r, 0]));
  const add = (exId, sets) => {
    if (!sets) return;
    const { primary, secondary } = musclesFor(exId);
    primary.forEach((r) => (totals[r] += sets));
    secondary.forEach((r) => (totals[r] += sets * 0.5));
  };
  for (const k of dateKeys) {
    const day = logs[k];
    if (!day) continue;
    for (const ex of day.exercises || []) add(ex.exId, ex.sets.filter((s) => s.done).length);
    const squat = day.squat;
    if (squat) {
      const legacyTop = squat.top && Number(squat.top.weight) > 0 ? 1 : 0; // older daily-max logs
      add("squats", legacyTop + (squat.sets || []).filter((s) => s.done).length);
    }
    if (day.deadlift) add("deadlifts", (day.deadlift.sets || []).filter((s) => s.done).length);
  }
  return totals;
}

// Exercises that work the same main muscles as `exId`, best match first.
// Score: +2 per shared primary muscle, +0.5 per other shared muscle,
// −0.5 per primary muscle the original doesn't train.
export function alternativesFor(exId, exercises) {
  const base = musclesFor(exId);
  const baseAll = new Set([...base.primary, ...base.secondary]);
  return exercises
    .filter((e) => e.id !== exId)
    .map((e) => {
      const m = musclesFor(e.id);
      const shared = m.primary.filter((r) => base.primary.includes(r));
      if (!shared.length) return null;
      const extra = m.primary.filter((r) => !base.primary.includes(r)).length;
      const otherShared = [...m.primary, ...m.secondary].filter((r) => baseAll.has(r) && !shared.includes(r)).length;
      return { exercise: e, shared, score: shared.length * 2 + otherShared * 0.5 - extra * 0.5 };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (a.exercise.page ?? 999) - (b.exercise.page ?? 999));
}

// Heat-map level 0–4 for a number of (weighted) sets.
export function heatLevel(sets) {
  return sets <= 0 ? 0 : sets < 4 ? 1 : sets < 8 ? 2 : sets < 12 ? 3 : 4;
}
