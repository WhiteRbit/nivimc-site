// For each muscle region: the angles that train it fully, each with exercises in order of
// preference. The plan step suggests the first exercise of every angle (skipping ones already
// picked) so a session covers the whole muscle; the person can switch any of them.
// `optional` angles are offered but unticked by default.

const a = (label, options, reps = "8-10", optional = false) => ({ label, options, reps, optional });

export const ANGLES = {
  chest: [
    a("Flat press · mid chest", ["bench-press", "dumbbell-bench-press", "push-ups"]),
    a("Incline · upper chest", ["incline-dumbbell-press", "incline-press"]),
    a("Dips / decline · lower chest", ["parallel-bar-dips", "decline-press"], "8-12"),
    a("Fly · stretch & squeeze", ["dumbbell-flys", "cable-crossover-flys", "pec-deck-flys", "incline-dumbbell-flys"], "12"),
    a("Pullover · rib cage & serratus", ["dumbbell-pullovers", "barbell-pullovers"], "12", true),
  ],
  lats: [
    a("Vertical pull · width", ["chin-ups", "lat-pulldowns", "reverse-chin-ups", "close-grip-lat-pulldowns", "back-lat-pulldowns"], "6-10"),
    a("Horizontal row · thickness", ["bent-rows", "seated-rows", "t-bar-rows"]),
    a("Single-arm row · full stretch", ["one-arm-dumbbell-rows"], "10 / side"),
    a("Straight-arm · lat isolation", ["straight-arm-lat-pulldowns", "dumbbell-pullovers"], "12"),
  ],
  traps: [
    a("Shrug · upper traps", ["barbell-shrugs", "dumbbell-shrugs", "machine-shrugs"], "12"),
    a("Upright row · traps & delts", ["upright-rows", "upright-rows-back"], "10"),
    a("Row with squeeze · mid traps", ["seated-rows", "t-bar-rows"], "10", true),
  ],
  frontDelts: [
    a("Overhead press", ["front-press", "dumbbell-press", "one-arm-dumbbell-press", "back-press"], "6-10"),
    a("Front raise", ["front-raises", "one-dumbbell-front-raises", "barbell-front-raises", "low-pulley-front-raises"], "12"),
  ],
  sideDelts: [
    a("Overhead press", ["dumbbell-press", "front-press", "back-press"], "8-10"),
    a("Lateral raise", ["lateral-raises", "low-pulley-lateral-raises", "nautilus-lateral-raises"], "12-20"),
    a("Upright row", ["upright-rows"], "10"),
    a("Side-lying raise · lengthened", ["side-lying-lateral-raises"], "12", true),
  ],
  rearDelts: [
    a("Bent-over raise", ["bent-over-lateral-raises", "low-pulley-bent-over-lateral-raises"], "12-15"),
    a("Reverse fly machine", ["pec-deck-rear-delt"], "12-15"),
  ],
  biceps: [
    a("Standing curl · both heads", ["barbell-curls", "curls", "low-pulley-curls"]),
    a("Arms in front · short head", ["preacher-curls", "concentration-curls", "machine-curls"], "10-12"),
    a("Neutral grip · brachialis", ["hammer-curls", "reverse-curls"], "10-12"),
    a("Arms raised · peak", ["high-pulley-curls"], "12", true),
  ],
  triceps: [
    a(
      "Overhead · long head",
      ["seated-dumbbell-triceps-extensions", "one-arm-dumbbell-triceps-extensions", "seated-ez-bar-triceps-extensions"],
      "10-12",
    ),
    a("Pushdown · outer heads", ["pushdowns", "reverse-pushdowns", "one-arm-reverse-pushdowns", "triceps-kickbacks"], "12"),
    a("Lying extension", ["triceps-extensions", "dumbbell-triceps-extensions"], "10"),
    a("Heavy press", ["close-grip-bench-press", "triceps-dips"], "8", true),
  ],
  forearms: [
    a("Wrist flexors", ["wrist-curls"], "15"),
    a("Wrist extensors", ["reverse-wrist-curls"], "15"),
    a("Brachioradialis", ["hammer-curls", "reverse-curls"], "10-12"),
  ],
  abs: [
    a("Anti-extension", ["plank", "ab-wheel-rollout"], "30-45 s"),
    a("Core control", ["dead-bug", "hollow-hold", "bird-dog"], "8 / side"),
  ],
  obliques: [
    a("Anti-rotation", ["pallof-press"], "10 / side"),
    a("Lateral hold", ["side-plank", "copenhagen-plank"], "30 s / side"),
    a("Rotation", ["cable-wood-chop", "landmine-180"], "10 / side"),
    a("Loaded carry", ["farmers-carry"], "30 m", true),
  ],
  lowerBack: [
    a("Hip hinge", ["back-extension", "good-mornings", "stiff-legged-deadlifts"], "10-12"),
    a("Stability", ["bird-dog"], "8 / side"),
  ],
  glutes: [
    a("Bridge · top squeeze", ["bridging"], "15"),
    a("Hinge · stretch", ["stiff-legged-deadlifts", "back-extension"]),
    a("Single leg", ["lunges"], "10 / leg"),
    a("Kickback · isolation", ["cable-back-kicks", "machine-hip-extensions", "floor-hip-extensions"], "12 / leg"),
  ],
  abductors: [
    a(
      "Hip abduction",
      ["seated-machine-hip-abductions", "cable-hip-abductions", "standing-machine-hip-abductions", "floor-hip-abductions"],
      "15",
    ),
    a("Lateral stability", ["side-plank"], "30 s / side", true),
  ],
  quads: [
    a("Squat pattern", ["front-squats", "hack-squats", "angled-leg-press"]),
    a("Single leg", ["lunges"], "10 / leg"),
    a("Knee extension · rectus femoris", ["leg-extensions"], "12-15"),
  ],
  adductors: [
    a("Adduction", ["machine-adductions", "cable-adductions"], "12-15"),
    a("Isometric", ["copenhagen-plank"], "20 s / side"),
    a("Wide stance", ["power-squats", "sumo-deadlifts"], "8", true),
  ],
  hamstrings: [
    a("Hip hinge · long", ["stiff-legged-deadlifts", "good-mornings"]),
    a("Leg curl", ["lying-leg-curls", "standing-leg-curls"], "10-12"),
    a("Seated curl · lengthened", ["seated-leg-curls"], "10-12"),
  ],
  calves: [
    a("Straight knee · gastrocnemius", ["standing-calf-raises", "donkey-calf-raises", "one-leg-toe-raises"], "12-15"),
    a("Bent knee · soleus", ["seated-calf-raises", "seated-barbell-calf-raises"], "15"),
  ],
};

// Suggested exercises for the chosen regions: one per angle, skipping exercises already in
// `taken` (today's workout or an earlier region's pick). Returns rows the plan step renders.
export function suggestFor(regions, taken = []) {
  const used = new Set(taken);
  const rows = [];
  for (const region of regions) {
    (ANGLES[region] ?? []).forEach((angle, i) => {
      const pick = angle.options.find((id) => !used.has(id)) ?? null;
      if (pick) used.add(pick);
      rows.push({ key: `${region}:${i}`, region, angle, exId: pick, on: Boolean(pick) && !angle.optional });
    });
  }
  return rows;
}
