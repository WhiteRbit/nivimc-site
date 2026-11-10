// The 6-year Bikini Pro plan (Nov 2026 to Oct 2032): phases, the weekly split for each
// stage, sets and reps by month, deload weeks, macros and yearly checkpoints.
// Exercises point at library ids; `note` adds the plan's own cue (e.g. "pause reps").

import { fromKey } from "./program";

export const PLAN_START = "2026-11-04";
const DAY_MS = 864e5;

const daysSince = (dateKey) => Math.round((fromKey(dateKey) - fromKey(PLAN_START)) / DAY_MS);
export const monthsIn = (dateKey) => Math.max(0, Math.floor(daysSince(dateKey) / 30.4375));
export const yearOf = (dateKey) => Math.min(6, Math.floor(monthsIn(dateKey) / 12) + 1);
export const weekOf = (dateKey) => Math.max(0, Math.floor(daysSince(dateKey) / 7)) + 1;

export const PHASES = [
  {
    id: 1,
    name: "Foundation",
    when: "Year 1 · Nov 2026 to Oct 2027",
    years: [1],
    goal: "Build base strength, learn every lift, lose some body fat.",
    notes: [
      "Months 1 to 3: 2 sets of 10 to 12, light weights, form first. Log machine settings.",
      "Months 4 to 6: 3 sets of 10 to 12. Move up a weight step when all sets hit 12.",
      "Months 7 to 12: 3 to 4 sets of 8 to 12 on main lifts, 12 to 15 on isolation moves.",
      "Cardio: 7,000 to 10,000 steps a day.",
    ],
  },
  {
    id: 2,
    name: "Build",
    when: "Year 2 · Nov 2027 to Oct 2028",
    years: [2],
    goal: "Shape the bikini look: round glutes, capped shoulders, wide upper back, small waist.",
    notes: [
      "Glutes 3 days, shoulders 2 days.",
      "Heavy compound lifts 6 to 10 reps; isolation 12 to 20 reps.",
      "Keep core work light: control and stomach vacuums, no heavy oblique work.",
      "Start posing practice halfway through the year, 10 to 15 min, 3 times a week.",
      "By month 18: hire a bikini coach and watch a local CPA show.",
    ],
  },
  {
    id: 3,
    name: "First show",
    when: "Year 3 · Nov 2028 to Oct 2029",
    years: [3],
    goal: "First competition, likely a local CPA show, in your Masters age class and Open bikini.",
    notes: [
      "Months 1 to 4: last off-season push on your weakest area.",
      "Months 5 to 10: contest prep, losing about 0.5% body weight a week. Training stays heavy. Posing daily in the last 8 weeks.",
      "Show week: follow your coach's peak week plan exactly.",
      "Months 11 to 12: reverse diet over 8 to 12 weeks.",
    ],
  },
  {
    id: 4,
    name: "Refine and compete",
    when: "Years 4 to 5 · Nov 2029 to Oct 2031",
    years: [4, 5],
    goal: "Alternate improvement seasons with one show season a year.",
    notes: [
      "Improvement season (7 to 9 months): small surplus, heaviest training of the cycle.",
      "Show season (4 to 6 months): prep, then 1 to 2 shows close together.",
      "Year 4 target: top 3 at provincials, qualify for CPA Nationals.",
      "Year 5 target: Nationals or another pro qualifier, top 5.",
      "After each show: ask judges for feedback and adjust.",
    ],
  },
  {
    id: 5,
    name: "Pro card push",
    when: "Year 6 · Nov 2031 to Oct 2032",
    years: [6],
    goal: "Peak for one or two pro qualifiers.",
    notes: [
      "Pick the target show early, such as the CPA Canadian National Pro Qualifier.",
      "Enter Masters and Open.",
      "Keep a backup qualifier 2 to 6 weeks after the first.",
      "No card yet? Another improvement season, then try again.",
    ],
  },
];

export const phaseOf = (dateKey) => PHASES.find((p) => p.years.includes(yearOf(dateKey)));

export const PLAN_RULES = [
  "Exercise order: assisted machines first, then free weights, then cables, then machines.",
  "Add one rep or a little weight on main lifts each week, and log everything.",
  "End most sets with 1 to 3 reps left in the tank.",
  "Deload every 7th week: half the sets, same weights.",
  "Sleep 7+ hours.",
  "Yearly bloodwork and a doctor check-in, plus one before each contest prep.",
];

// kind: "main" (compound), "iso" (isolation), "assist" (assisted machine), "core" (fixed reps)
const x = (exId, kind = "main", extra = {}) => ({ exId, kind, ...extra });

const FOUNDATION = {
  0: { title: "Rest day", rest: true },
  1: {
    title: "Lower: quads",
    lower: true,
    ex: [x("goblet-squats"), x("dumbbell-split-squats"), x("step-ups"), x("one-leg-toe-raises", "iso")],
  },
  2: {
    title: "Upper: push",
    ex: [x("assisted-dips", "assist"), x("dumbbell-bench-press"), x("dumbbell-press"), x("lateral-raises", "iso"), x("pushdowns", "iso")],
  },
  3: {
    title: "Lower: glutes + hamstrings",
    lower: true,
    ex: [
      x("hip-thrusts"),
      x("dumbbell-romanian-deadlifts"),
      x("cable-pull-throughs"),
      x("cable-hip-abductions", "iso"),
      x("seated-leg-curls", "iso"),
    ],
  },
  4: {
    title: "Upper: pull",
    ex: [x("assisted-pull-ups", "assist"), x("one-arm-dumbbell-rows"), x("lat-pulldowns"), x("face-pulls", "iso"), x("curls", "iso")],
  },
  5: {
    title: "Lower: full leg + glutes",
    lower: true,
    ex: [
      x("dumbbell-sumo-squats"),
      x("walking-lunges"),
      x("cable-back-kicks", "iso"),
      x("cable-adductions", "iso"),
      x("standing-calf-raises", "iso"),
    ],
  },
  6: {
    title: "Core (mat, no machines)",
    core: true,
    ex: [
      x("dead-bug", "core", { reps: "8 / side" }),
      x("bridging", "core", { reps: "12", note: "Glute bridge" }),
      x("bird-dog", "core", { reps: "8 / side" }),
      x("side-plank", "core", { reps: "20 s / side", note: "From the knees" }),
      x("heel-taps", "core", { reps: "10 / side" }),
      x("plank", "core", { reps: "20 s", note: "Forearms, from the knees" }),
    ],
  },
};

const BUILD = {
  0: { title: "Rest day", rest: true },
  1: {
    title: "Glutes + hamstrings",
    lower: true,
    ex: [x("hip-thrusts"), x("romanian-deadlifts"), x("cable-pull-throughs"), x("cable-back-kicks", "iso"), x("lying-leg-curls", "iso")],
  },
  2: {
    title: "Shoulders + back",
    ex: [
      x("assisted-pull-ups", "assist"),
      x("dumbbell-press", "main", { note: "Standing" }),
      x("lateral-raises", "iso"),
      x("chest-supported-rows"),
      x("lat-pulldowns"),
      x("cable-rear-delt-flys", "iso"),
    ],
  },
  3: {
    title: "Quads + glutes",
    lower: true,
    ex: [x("squats", "main", { note: "Glute stance" }), x("bulgarian-split-squats"), x("step-ups"), x("cable-hip-abductions", "iso")],
  },
  4: {
    title: "Shoulders + arms + chest",
    ex: [
      x("assisted-dips", "assist"),
      x("arnold-press"),
      x("incline-dumbbell-press"),
      x("low-pulley-lateral-raises", "iso"),
      x("curls", "iso"),
      x("cable-overhead-triceps-extensions", "iso"),
    ],
  },
  5: {
    title: "Glute focus",
    lower: true,
    ex: [
      x("hip-thrusts", "main", { note: "Pause reps" }),
      x("deficit-reverse-lunges"),
      x("back-extension", "iso", { note: "45°, holding a plate" }),
      x("cable-back-kicks", "iso"),
      x("seated-machine-hip-abductions", "iso"),
    ],
  },
  6: {
    title: "Core + posing",
    core: true,
    ex: [
      x("stomach-vacuum", "core", { reps: "20 s", sets: 5 }),
      x("dead-bug", "core", { reps: "8 / side" }),
      x("side-plank", "core", { reps: "20-30 s / side" }),
      x("posing-practice", "core", { reps: "15 min", sets: 1 }),
    ],
  },
};

export const splitFor = (dateKey) => (yearOf(dateKey) === 1 ? FOUNDATION : BUILD);

// Today's session in the plan, with sets and reps for the current month.
export function bikiniDay(dateKey) {
  const day = splitFor(dateKey)[fromKey(dateKey).getDay()];
  const deload = isDeload(dateKey);
  const ex = (day.ex ?? []).map((e) => {
    const p = prescribe(e, dateKey);
    return { ...e, ...p, sets: deload ? Math.max(1, Math.ceil(p.sets / 2)) : p.sets };
  });
  return { ...day, ex, deload };
}

export function prescribe(e, dateKey) {
  if (e.kind === "core") return { sets: e.sets ?? 2, reps: e.reps };
  const year = yearOf(dateKey);
  const month = monthsIn(dateKey);
  const iso = e.kind === "iso";
  if (year === 1) {
    if (month < 3) return { sets: 2, reps: "10-12" };
    if (month < 6) return { sets: 3, reps: "10-12" };
    return iso ? { sets: 3, reps: "12-15" } : { sets: 3, reps: "8-12", build: "build to 3-4 sets" };
  }
  return iso ? { sets: 3, reps: "12-20" } : { sets: 3, reps: "6-10" };
}

export const isDeload = (dateKey) => weekOf(dateKey) % 7 === 0;

// Short reminders for the day: deloads, prep windows, posing.
export function stageNotes(dateKey) {
  const year = yearOf(dateKey);
  const m = monthsIn(dateKey) % 12;
  const out = [];
  if (isDeload(dateKey)) out.push("Deload week: half the sets, same weights, so joints and hormones recover.");
  if (year === 3) {
    if (m < 4) out.push("Off-season push: bring up your weakest area.");
    else if (m < 10) out.push("Contest prep: training stays heavy; follow your coach's calories and cardio.");
    else out.push("Reverse diet: add calories back slowly, carbs first.");
  }
  if (year === 2 && m >= 6) out.push("Posing practice: 10 to 15 min, 3 times this week.");
  return out;
}


export const MACROS = [
  { key: "y1", phase: "Year 1 · Foundation (small deficit)", cal: "1,600", p: "140 g", f: "50 g", c: "145 g" },
  { key: "y2", phase: "Year 2 · Build (maintenance)", cal: "1,900–2,000", p: "140 g", f: "55–60 g", c: "205–220 g" },
  { key: "off", phase: "Off-season (small surplus)", cal: "2,000–2,200", p: "140 g", f: "60–65 g", c: "225–260 g" },
  { key: "prep", phase: "Contest prep (set by coach)", cal: "~1,700 → ~1,400", p: "140–150 g", f: "40–45 g", c: "110–175 g" },
  { key: "rev", phase: "Reverse diet (after a show)", cal: "+50–100 kcal a week", p: "140 g", f: "back to 55 g", c: "add carbs first" },
];

export function macroKey(dateKey) {
  const year = yearOf(dateKey);
  const m = monthsIn(dateKey) % 12;
  if (year === 1) return "y1";
  if (year === 2) return "y2";
  if (year === 3) return m < 4 ? "off" : m < 10 ? "prep" : "rev";
  return "off";
}

export const MACRO_RULES = [
  "Protein stays fixed; fat stays at 25 to 30% of calories (never below about 40 g); carbs move with the phase.",
  "Spread protein over 3 to 4 meals of 30 to 40 g.",
  "From Year 2, weigh in every 2 to 4 weeks. Gaining more than 0.25 to 0.5 kg a month? Cut 100 kcal from carbs.",
  "Creatine 3 to 5 g a day.",
];

export const MILESTONES = [
  {
    id: "m1",
    when: "End of Year 1 · Oct 2027",
    strength: "Hip thrust 95–135 lb, DB RDL 2 × 30 lb, lat pulldown 60 lb",
    other: "5 days a week is a habit; visible shape in glutes and shoulders",
  },
  {
    id: "m2",
    when: "End of Year 2 · Oct 2028",
    strength: "Hip thrust 185 lb, RDL 115 lb, lat pulldown 80 lb",
    other: "Coach hired; posing basics learned; first show picked",
  },
  { id: "m3", when: "End of Year 3 · Oct 2029", strength: "Keep strength through prep", other: "First show completed in Masters and Open" },
  {
    id: "m4",
    when: "End of Year 4 · Oct 2030",
    strength: "Keep adding to hip thrust and shoulder lifts",
    other: "Top 3 at provincials; qualified for Nationals",
  },
  { id: "m5", when: "End of Year 5 · Oct 2031", strength: "Personal bests in off-season", other: "Top 5 at Nationals or a pro qualifier" },
  { id: "m6", when: "End of Year 6 · Oct 2032", strength: "Peak physique", other: "IFBB Pro card" },
];
