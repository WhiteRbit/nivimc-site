// Exercise library drawn from Frédéric Delavier, "Strength Training Anatomy" (1st ed.).
// `page` is the book page; `steps` and `tip` are short paraphrases of the book's cues.
// The "core" group is not in the book (page: null). The book's abdomen chapter is
// retired: kept so old logs still show names, but no longer offered in the app.

export const GROUPS = [
  { id: "arms", label: "Arms" },
  { id: "shoulders", label: "Shoulders" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "legs", label: "Legs" },
  { id: "buttocks", label: "Buttocks" },
  { id: "core", label: "Core" },
  { id: "abdomen", label: "Abdomen (book)", retired: true },
];

export const EXERCISES = [
  // ---------------------------------------------------------------- Arms
  {
    id: "curls", group: "arms", page: 2, name: "Curls",
    muscles: "Biceps, brachialis, brachioradialis, front delts",
    steps: ["Sit on a bench, a dumbbell in each hand, palms facing in.", "Curl one arm at a time, turning the palm up as you lift.", "Raise the elbow slightly at the top to finish the curl."],
    tip: "Turning the palm up (supination) is what fully works the biceps.",
  },
  {
    id: "concentration-curls", group: "arms", page: 3, name: "Concentration Curls",
    muscles: "Biceps, brachialis, brachioradialis",
    steps: ["Sit, underhand grip on one dumbbell, elbow braced on the inside of your thigh.", "Inhale and curl the dumbbell; exhale as you finish."],
    tip: "Isolation move: control range, speed and alignment.",
  },
  {
    id: "hammer-curls", group: "arms", page: 4, name: "Hammer Curls",
    muscles: "Brachioradialis, biceps, brachialis",
    steps: ["Stand or sit, dumbbells in each hand, palms facing in.", "Curl toward the shoulders together or alternating; exhale at the top."],
    tip: "The book's best exercise for the brachioradialis.",
  },
  {
    id: "low-pulley-curls", group: "arms", page: 5, name: "Low Pulley Curls",
    muscles: "Biceps, brachialis",
    steps: ["Face the machine, underhand grip on the handle.", "Curl the handle up; exhale as you finish."],
    tip: "Good for isolating and pumping the biceps. Can be done two-armed.",
  },
  {
    id: "high-pulley-curls", group: "arms", page: 6, name: "High Pulley Curls",
    muscles: "Biceps (long head), brachialis",
    steps: ["Stand between the high pulleys, arms spread, underhand grip.", "Curl the handles toward your head; exhale as you finish."],
    tip: "Never go heavy here — focus on the contraction.",
  },
  {
    id: "barbell-curls", group: "arms", page: 7, name: "Barbell Curls",
    muscles: "Biceps, brachialis, brachioradialis, forearm flexors",
    steps: ["Stand tall, underhand grip slightly wider than shoulders.", "Brace glutes, abs and back so the torso doesn't swing.", "Curl the bar; exhale at the top."],
    tip: "Wide grip = short head, narrow grip = long head. Back against a wall for strict reps.",
  },
  {
    id: "machine-curls", group: "arms", page: 8, name: "Machine Curls",
    muscles: "Biceps, brachialis",
    steps: ["Sit, arms straight, elbows on the angled pad, underhand grip.", "Curl the bar; exhale as you finish."],
    tip: "Warm up light and don't fully lock the elbows — protects against tendinitis.",
  },
  {
    id: "preacher-curls", group: "arms", page: 9, name: "Preacher Curls",
    muscles: "Biceps, brachialis, brachioradialis",
    steps: ["Arms resting on the preacher bench.", "Curl the bar; exhale as you finish."],
    tip: "Big tension at full extension — warm up well and start moderate.",
  },
  {
    id: "reverse-curls", group: "arms", page: 10, name: "Reverse Curls",
    muscles: "Wrist extensors, brachioradialis, brachialis",
    steps: ["Stand, arms straight, overhand grip (thumbs toward each other).", "Curl the bar; exhale as you finish."],
    tip: "Strengthens the wrist; bench pressers use it to steady heavy bars.",
  },
  {
    id: "reverse-wrist-curls", group: "arms", page: 11, name: "Reverse Wrist Curls",
    muscles: "Wrist and finger extensors",
    steps: ["Forearms on thighs or a bench, overhand grip, wrists hanging.", "Curl the wrists back toward you, then return."],
    tip: "Balances the usually stronger wrist flexors.",
  },
  {
    id: "wrist-curls", group: "arms", page: 12, name: "Wrist Curls",
    muscles: "Wrist and finger flexors",
    steps: ["Forearms on thighs or a bench, underhand grip, wrists extended.", "Curl the wrists up; exhale as you finish."],
  },
  {
    id: "pushdowns", group: "arms", page: 13, name: "Pushdowns",
    muscles: "Triceps, anconeus",
    steps: ["Face the machine, hands on the bar, elbows pinned to your sides.", "Straighten the arms without letting the elbows drift; exhale."],
    tip: "Hold 1–2 s at the bottom. A rope hits the lateral head harder.",
  },
  {
    id: "reverse-pushdowns", group: "arms", page: 14, name: "Reverse Pushdowns",
    muscles: "Triceps (medial head), anconeus, wrist extensors",
    steps: ["Underhand grip, elbows flexed against your sides.", "Straighten the arms, elbows stay put; exhale."],
    tip: "Use light weight — the underhand grip limits the load.",
  },
  {
    id: "one-arm-reverse-pushdowns", group: "arms", page: 15, name: "One-Arm Reverse Pushdowns",
    muscles: "Triceps",
    steps: ["Face the machine, underhand grip on a single handle.", "Straighten the arm; exhale as you finish."],
  },
  {
    id: "triceps-extensions", group: "arms", page: 16, name: "Triceps Extensions",
    muscles: "Triceps",
    steps: ["Lie on a flat bench, overhand grip, arms extended.", "Inhale and bend the elbows without letting them flare.", "Extend back up, exhaling."],
    tip: "To the forehead = medial/lateral heads; behind the head = long head.",
  },
  {
    id: "dumbbell-triceps-extensions", group: "arms", page: 17, name: "Dumbbell Triceps Extensions",
    muscles: "All three triceps heads",
    steps: ["Lie on a flat bench, a dumbbell in each hand, arms straight up.", "Inhale and slowly bend the arms; extend back up, exhaling."],
  },
  {
    id: "one-arm-dumbbell-triceps-extensions", group: "arms", page: 18, name: "One-Arm Dumbbell Triceps Extensions",
    muscles: "Triceps (long head emphasis)",
    steps: ["Stand or sit, one dumbbell overhead, arm straight.", "Bend the elbow to lower behind the neck; extend back up."],
    tip: "The upright arm stretches the long head.",
  },
  {
    id: "seated-dumbbell-triceps-extensions", group: "arms", page: 19, name: "Seated Dumbbell Triceps Extensions",
    muscles: "Triceps (long head emphasis)",
    steps: ["Sit holding one dumbbell in both hands behind your neck.", "Extend the arms overhead; exhale."],
    tip: "Brace your abs so your back doesn't arch; use a short-backed bench.",
  },
  {
    id: "seated-ez-bar-triceps-extensions", group: "arms", page: 20, name: "Seated EZ-Bar Triceps Extensions",
    muscles: "Triceps (long and lateral heads)",
    steps: ["Stand or sit, overhand grip, arms extended up.", "Bend the elbows to lower the bar behind your neck; extend back."],
    tip: "Don't arch your back.",
  },
  {
    id: "triceps-kickbacks", group: "arms", page: 21, name: "Triceps Kickbacks",
    muscles: "Triceps",
    steps: ["Knees soft, bend forward with a flat back, upper arm against your side at 90°.", "Straighten the arm; exhale."],
    tip: "Great finisher — go until you feel the burn.",
  },
  {
    id: "triceps-dips", group: "arms", page: 22, name: "Triceps Dips (Bench)",
    muscles: "Triceps, pecs, front delts",
    steps: ["Hands on one bench edge, feet on another, torso/legs at ~90°.", "Bend the arms, then straighten back up, exhaling."],
    tip: "A plate on your thighs makes it harder.",
  },

  // ----------------------------------------------------------- Shoulders
  {
    id: "back-press", group: "shoulders", page: 24, name: "Back Press",
    muscles: "Delts (middle), upper traps, triceps",
    steps: ["Sit tall, bar resting across the shoulders behind the neck, overhand grip.", "Press straight up without arching; exhale."],
    tip: "Hard on the rotator cuff — the book says to use caution.",
  },
  {
    id: "front-press", group: "shoulders", page: 25, name: "Front Press",
    muscles: "Front and middle delts, upper pecs, triceps",
    steps: ["Sit tall, bar resting on the upper chest, overhand grip.", "Press straight up; exhale at the top."],
    tip: "Elbows forward = front delts; flared = middle delts. Avoid over-arching when standing.",
  },
  {
    id: "dumbbell-press", group: "shoulders", page: 26, name: "Dumbbell Shoulder Press",
    muscles: "Delts (middle), upper traps, triceps",
    steps: ["Sit tall, dumbbells at shoulder height, palms forward.", "Press to arms' length; exhale."],
    tip: "Seated version protects the lower back.",
  },
  {
    id: "one-arm-dumbbell-press", group: "shoulders", page: 27, name: "One-Arm Dumbbell Press",
    muscles: "Front delts, upper pecs, triceps",
    steps: ["Sit, dumbbells at shoulders with an underhand grip.", "Press alternately, rotating so the palm faces forward at the top."],
  },
  {
    id: "lateral-raises", group: "shoulders", page: 28, name: "Lateral Raises",
    muscles: "Middle delts, supraspinatus",
    steps: ["Stand, back straight, a dumbbell in each hand at your sides.", "Raise to shoulder level, elbows slightly bent; lower."],
    tip: "Never heavy. The book recommends sets of 10–25, short rest, to the burn.",
  },
  {
    id: "bent-over-lateral-raises", group: "shoulders", page: 30, name: "Bent-Over Lateral Raises",
    muscles: "Rear delts, traps, rhomboids",
    steps: ["Feet apart, knees bent, lean forward with a flat back.", "Raise the dumbbells out to the sides, elbows soft; exhale."],
    tip: "Pinch the shoulder blades at the top to bring in traps and rhomboids.",
  },
  {
    id: "front-raises", group: "shoulders", page: 31, name: "Front Raises",
    muscles: "Front delts, upper pecs",
    steps: ["Stand, dumbbells on your thighs, overhand grip.", "Alternate raising each arm forward to shoulder height."],
  },
  {
    id: "side-lying-lateral-raises", group: "shoulders", page: 32, name: "Side-Lying Lateral Raises",
    muscles: "Delts, supraspinatus",
    steps: ["Lie on your side on a bench or floor, dumbbell in the top hand.", "Raise the arm; exhale."],
    tip: "Loads the start of the range, unlike standing raises.",
  },
  {
    id: "low-pulley-lateral-raises", group: "shoulders", page: 33, name: "Low Pulley Lateral Raises",
    muscles: "Middle delts",
    steps: ["Hold the low handle with the arm at your side.", "Raise the arm to shoulder height; exhale."],
  },
  {
    id: "low-pulley-front-raises", group: "shoulders", page: 34, name: "Low Pulley Front Raises",
    muscles: "Front delts, upper pecs",
    steps: ["Overhand grip, arm at your side.", "Raise the arm forward to shoulder height; exhale."],
  },
  {
    id: "low-pulley-bent-over-lateral-raises", group: "shoulders", page: 35, name: "Low Pulley Bent-Over Lateral Raises",
    muscles: "Rear delts, traps, rhomboids",
    steps: ["Bend forward with a flat back, a handle in each hand, cables crossed.", "Raise the arms to just above shoulder level; exhale."],
  },
  {
    id: "one-dumbbell-front-raises", group: "shoulders", page: 36, name: "One-Dumbbell Front Raises",
    muscles: "Front delts, upper pecs",
    steps: ["Abs tight, one dumbbell held in both hands on your thighs.", "Raise to shoulder level, lower slowly with no jerking."],
  },
  {
    id: "barbell-front-raises", group: "shoulders", page: 37, name: "Barbell Front Raises",
    muscles: "Front delts, upper pecs",
    steps: ["Overhand grip, bar on thighs, back straight, abs tight.", "Raise the bar with straight arms to eye level; exhale."],
  },
  {
    id: "upright-rows", group: "shoulders", page: 38, name: "Upright Rows",
    muscles: "Delts, traps, biceps",
    steps: ["Overhand grip slightly wider than shoulders, bar on thighs.", "Pull close to the body to your chin, elbows high.", "Lower slowly without jerking."],
  },
  {
    id: "nautilus-lateral-raises", group: "shoulders", page: 39, name: "Machine Lateral Raises",
    muscles: "Middle delts",
    steps: ["Sit in the machine and grasp the handles.", "Raise the elbows to shoulder level; exhale."],
    tip: "Beginner-friendly — easy to set up correctly.",
  },
  {
    id: "pec-deck-rear-delt", group: "shoulders", page: 40, name: "Pec Deck Rear Delt Laterals",
    muscles: "Rear delts, infraspinatus, traps, rhomboids",
    steps: ["Sit facing the pad, arms out on the handles.", "Drive the elbows back, pinching the shoulder blades at the end."],
  },

  // --------------------------------------------------------------- Chest
  {
    id: "bench-press", group: "chest", page: 42, name: "Bench Press",
    muscles: "Pecs, triceps, front delts",
    steps: ["Lie flat, glutes on the bench, feet flat on the floor.", "Overhand grip wider than shoulders.", "Lower slowly to the chest; press up, exhaling."],
    tip: "Narrow grip = inner pecs, wide = outer. Feet up if you have back problems.",
  },
  {
    id: "close-grip-bench-press", group: "chest", page: 44, name: "Close-Grip Bench Press",
    muscles: "Pecs, triceps",
    steps: ["Lie flat, hands 4–15 in. apart (to wrist comfort).", "Lower to the chest, elbows drifting out; press up, exhaling."],
    tip: "Elbows tucked shifts work to the front delts. Fits an arm day.",
  },
  {
    id: "incline-press", group: "chest", page: 45, name: "Incline Press",
    muscles: "Upper pecs, front delts, triceps",
    steps: ["Bench at 45–60°, grip wider than shoulders.", "Lower to the base of the neck; press to lockout, exhaling."],
  },
  {
    id: "decline-press", group: "chest", page: 46, name: "Decline Press",
    muscles: "Pecs (lower), triceps, front delts",
    steps: ["Bench at 20–40° decline, feet anchored.", "Lower slowly to the lower edge of the pecs; press up."],
  },
  {
    id: "push-ups", group: "chest", page: 47, name: "Push-Ups",
    muscles: "Pecs, triceps",
    steps: ["Arms straight, hands shoulder-width or wider, feet together.", "Lower your torso near the floor without sagging; push back up."],
    tip: "Feet raised = upper pecs; torso raised = lower pecs.",
  },
  {
    id: "parallel-bar-dips", group: "chest", page: 48, name: "Parallel Bar Dips",
    muscles: "Pecs, triceps, front delts",
    steps: ["Support yourself on straight arms.", "Lower as far as comfortable between the bars; press back up."],
    tip: "Lean forward for chest, upright for triceps. Sets of 10–20 work best. Go carefully on the shoulders.",
  },
  {
    id: "dumbbell-bench-press", group: "chest", page: 49, name: "Dumbbell Press",
    muscles: "Pecs, triceps, front delts",
    steps: ["Lie flat, arms up, palms facing in.", "Lower to chest level, rotating to an overhand grip.", "Press up and squeeze briefly at the top."],
    tip: "Longer range than a barbell, so a bigger stretch.",
  },
  {
    id: "dumbbell-flys", group: "chest", page: 50, name: "Dumbbell Flys",
    muscles: "Pecs",
    steps: ["Lie on a narrow bench, arms up, elbows slightly bent.", "Lower until elbows reach shoulder height; raise, exhaling.", "Brief squeeze at the top."],
    tip: "Never heavy — it's an isolation and flexibility move.",
  },
  {
    id: "incline-dumbbell-press", group: "chest", page: 51, name: "Incline Dumbbell Press",
    muscles: "Upper pecs, front delts, triceps",
    steps: ["Bench under 60°, elbows bent, overhand grip.", "Press until the dumbbells touch; exhale."],
  },
  {
    id: "incline-dumbbell-flys", group: "chest", page: 52, name: "Incline Dumbbell Flys",
    muscles: "Upper pecs",
    steps: ["Bench at 45–60°, arms up, elbows slightly bent.", "Lower until elbows reach shoulder height; raise, exhaling."],
    tip: "Never heavy.",
  },
  {
    id: "pec-deck-flys", group: "chest", page: 53, name: "Pec Deck Flys",
    muscles: "Pecs",
    steps: ["Sit with elbows on the pads, forearms relaxed.", "Squeeze the pads together in front of your chest; exhale."],
    tip: "Recommended for beginners.",
  },
  {
    id: "cable-crossover-flys", group: "chest", page: 54, name: "Cable Crossover Flys",
    muscles: "Pecs, pec minor",
    steps: ["Stand slightly forward, elbows soft, arms spread.", "Bring the handles together until the hands touch; exhale."],
    tip: "Vary torso tilt and arm angle to hit the whole chest.",
  },
  {
    id: "dumbbell-pullovers", group: "chest", page: 55, name: "Dumbbell Pullovers",
    muscles: "Pecs, lats, triceps long head, serratus",
    steps: ["Lie on the bench, one dumbbell held in both hands above your chest.", "Lower behind your head, elbows slightly bent; return, exhaling."],
    tip: "Light weight, big breath — stretches the rib cage.",
  },
  {
    id: "barbell-pullovers", group: "chest", page: 56, name: "Barbell Pullovers",
    muscles: "Pecs, lats, triceps long head, serratus",
    steps: ["Arms up, overhand grip at shoulder width.", "Inhale as you lower the bar behind your head, elbows soft; return, exhaling."],
  },

  // ---------------------------------------------------------------- Back
  {
    id: "chin-ups", group: "back", page: 58, name: "Chin-Ups (Wide Grip)",
    muscles: "Lats, teres major, biceps, brachialis",
    steps: ["Wide overhand grip on the bar.", "Pull up until your eyes clear the bar; exhale."],
    tip: "Chest out and elbows back to hit the upper lats and add back thickness.",
  },
  {
    id: "reverse-chin-ups", group: "back", page: 60, name: "Reverse Chin-Ups",
    muscles: "Lats, teres major, biceps",
    steps: ["Underhand grip, hands shoulder-width.", "Stick your chest out and pull until your chin reaches the bar."],
    tip: "Easier to learn on a high pulley.",
  },
  {
    id: "lat-pulldowns", group: "back", page: 61, name: "Lat Pulldowns",
    muscles: "Lats, teres major, traps, rhomboids",
    steps: ["Knees under the pad, very wide overhand grip.", "Pull to the upper chest, back arched, elbows back."],
  },
  {
    id: "back-lat-pulldowns", group: "back", page: 62, name: "Behind-Neck Lat Pulldowns",
    muscles: "Lats, teres major, rhomboids",
    steps: ["Thighs under the pad, very wide overhand grip.", "Pull behind your neck, driving the elbows back."],
    tip: "Builds back width. Good stepping stone to chin-ups.",
  },
  {
    id: "close-grip-lat-pulldowns", group: "back", page: 63, name: "Close-Grip Lat Pulldowns",
    muscles: "Lats, teres major, brachioradialis",
    steps: ["Palms facing each other on the handle.", "Pull to the upper chest, back arched, leaning back slightly."],
  },
  {
    id: "straight-arm-lat-pulldowns", group: "back", page: 64, name: "Straight-Arm Lat Pulldowns",
    muscles: "Lats, teres major, triceps long head",
    steps: ["Stand facing the machine, shoulder-width overhand grip, arms straight.", "Abs tight, back still; pull the bar down to your thighs."],
  },
  {
    id: "seated-rows", group: "back", page: 65, name: "Seated Cable Rows",
    muscles: "Lats, teres major, rear delts, traps, rhomboids",
    steps: ["Feet on the stops, lean toward the pulley.", "Pull to the lower ribs, elbows travelling far back; exhale."],
    tip: "Never round your back under heavy load.",
  },
  {
    id: "one-arm-dumbbell-rows", group: "back", page: 66, name: "One-Arm Dumbbell Rows",
    muscles: "Lats, teres major, rear delts, traps",
    steps: ["One hand and knee on the bench, palm facing in.", "Pull the dumbbell as high as possible, elbow back and slightly out."],
  },
  {
    id: "bent-rows", group: "back", page: 67, name: "Bent-Over Barbell Rows",
    muscles: "Lats, teres major, rear delts, traps, rhomboids",
    steps: ["Knees soft, torso ~45°, back flat, grip wider than shoulders.", "Brace the abs and pull the bar to your chest; lower, exhaling."],
    tip: "Your back must never round.",
  },
  {
    id: "t-bar-rows", group: "back", page: 68, name: "T-Bar Rows",
    muscles: "Lats, teres major, rear delts, traps",
    steps: ["Feet on the platforms, knees soft, back flat at ~45°.", "Pull until the plates touch your chest; exhale."],
  },
  {
    id: "stiff-legged-deadlifts", group: "back", page: 69, name: "Stiff-Legged Deadlifts",
    muscles: "Hamstrings, glutes, spinal erectors",
    steps: ["Feet close, bend at the hips with an arched back, legs straight-ish.", "Stand up by extending at the hips, back rigid; lower with a straight back."],
    tip: "Caution if you have back problems.",
  },
  {
    id: "deadlifts", group: "back", page: 70, name: "Deadlifts",
    muscles: "Nearly everything: back, glutes, quads, traps",
    steps: ["Feet slightly apart, back slightly arched, thighs near parallel, grip just outside the shins.", "Brace and lift by straightening the legs, bar close to the shins.", "Past the knees, stand tall; hold 2 s, lower without rounding."],
    tip: "\"Block\": big breath, tight abs, arched low back — every heavy rep.",
  },
  {
    id: "sumo-deadlifts", group: "back", page: 72, name: "Sumo Deadlifts",
    muscles: "Quads, adductors, glutes, back",
    steps: ["Feet well wider than shoulders, toes out with knees.", "Thighs parallel, hands shoulder-width; brace, arch slightly and stand up."],
  },
  {
    id: "back-extension", group: "back", page: 73, name: "Back Extensions",
    muscles: "Glutes, hamstrings, spinal erectors",
    steps: ["Face down on the Roman chair, hips on the pads.", "Raise your torso to parallel with the floor, keeping the back arched."],
    tip: "Hold the top a few seconds to isolate the work.",
  },
  {
    id: "upright-rows-back", group: "back", page: 74, name: "Narrow Upright Rows",
    muscles: "Upper traps, middle/rear delts",
    steps: ["Overhand grip, hands about palm-width apart.", "Pull straight up to the chin, elbows as high as possible; lower slowly."],
    tip: "Wider grip = more delts, less traps.",
  },
  {
    id: "barbell-shrugs", group: "back", page: 75, name: "Barbell Shrugs",
    muscles: "Trapezius",
    steps: ["Overhand grip a little wider than shoulders.", "Arms and back straight, abs tight; shrug up and back as high as possible."],
  },
  {
    id: "dumbbell-shrugs", group: "back", page: 76, name: "Dumbbell Shrugs",
    muscles: "Traps, levator scapulae, rhomboids",
    steps: ["Dumbbells at your sides, head straight.", "Shrug as high and as far back as possible; lower."],
  },
  {
    id: "machine-shrugs", group: "back", page: 77, name: "Machine Shrugs",
    muscles: "Upper traps, levator scapulae",
    steps: ["Grip slightly wider than shoulders (or neutral).", "Head and back straight; shrug and return."],
  },

  // ---------------------------------------------------------------- Legs
  {
    id: "dumbbell-squats", group: "legs", page: 79, name: "Dumbbell Squats",
    muscles: "Quads, glutes",
    steps: ["Dumbbells at your sides, feet slightly apart.", "Look ahead, inhale, slightly arch and squat until thighs are parallel; stand."],
  },
  {
    id: "squats", group: "legs", page: 80, name: "Back Squats",
    muscles: "Quads, glutes, adductors, spinal erectors, abs, hamstrings",
    steps: ["Bar across the traps, elbows pulled back; step out, feet shoulder-width, toes forward or slightly out.", "Inhale deeply, slightly arch, look ahead.", "Bend the knees, bending forward only at the hips, until thighs are parallel; stand and exhale."],
    tip: "Never round the spine. \"Block\" every heavy rep: big breath, tight abs, arched low back.",
  },
  {
    id: "front-squats", group: "legs", page: 82, name: "Front Squats",
    muscles: "Quads (primary), glutes, hamstrings, abs",
    steps: ["Bar across the front delts, upper arms parallel to the floor.", "Squat down with a perfectly straight back; stand, exhaling."],
    tip: "Use lighter weights than the back squat.",
  },
  {
    id: "power-squats", group: "legs", page: 83, name: "Wide-Stance (Power) Squats",
    muscles: "Quads, adductors, glutes, hamstrings",
    steps: ["Like a back squat, but legs wide and toes pointed out."],
  },
  {
    id: "angled-leg-press", group: "legs", page: 84, name: "Angled Leg Press",
    muscles: "Quads, glutes, hamstrings",
    steps: ["Back on the pad, feet shoulder-width; release the stops.", "Bend the legs as far as possible, knees travelling to the sides of your chest; press back."],
    tip: "Feet high = glutes/hamstrings, low = quads. Keep your buttocks on the pad.",
  },
  {
    id: "hack-squats", group: "legs", page: 85, name: "Hack Squats",
    muscles: "Quads",
    steps: ["Back on the pad, shoulders under the yokes, feet fairly close.", "Release, bend the legs, and press back up."],
    tip: "Brace the abs so the pelvis doesn't swing.",
  },
  {
    id: "leg-extensions", group: "legs", page: 86, name: "Leg Extensions",
    muscles: "Quadriceps",
    steps: ["Sit, grip the seat, ankles under the rollers.", "Raise the legs until almost horizontal; exhale."],
    tip: "The best quad isolation move; good for beginners.",
  },
  {
    id: "lying-leg-curls", group: "legs", page: 87, name: "Lying Leg Curls",
    muscles: "Hamstrings, calves",
    steps: ["Face down, feet under the rollers, knees straight.", "Curl as far as possible toward your buttocks; lower slowly."],
    tip: "Pointed toes = more hamstrings; flexed feet = more calves.",
  },
  {
    id: "standing-leg-curls", group: "legs", page: 88, name: "Standing Leg Curls",
    muscles: "Hamstrings",
    steps: ["Knee against the pad, ankle under the roller.", "Bend the knee; exhale."],
  },
  {
    id: "seated-leg-curls", group: "legs", page: 89, name: "Seated Leg Curls",
    muscles: "Hamstrings",
    steps: ["Sit with legs straight, ankles on the roller, thigh pad locked.", "Bend the knees to push the roller down; exhale."],
  },
  {
    id: "good-mornings", group: "legs", page: 90, name: "Good Mornings",
    muscles: "Hamstrings, glutes, spinal erectors",
    steps: ["Bar across the traps, feet slightly apart.", "Bend at the hips to about parallel with a straight back; return, exhaling."],
    tip: "Never heavy. Regular use can reduce injury risk on heavy squats.",
  },
  {
    id: "cable-adductions", group: "legs", page: 91, name: "Cable Adductions",
    muscles: "Adductors",
    steps: ["Cuff on the ankle, hold the machine.", "Bring the leg in and across the other leg; return."],
  },
  {
    id: "machine-adductions", group: "legs", page: 92, name: "Machine Adductions",
    muscles: "Adductors",
    steps: ["Sit with legs spread.", "Squeeze your thighs together; return slowly."],
  },
  {
    id: "standing-calf-raises", group: "legs", page: 93, name: "Standing Calf Raises",
    muscles: "Gastrocnemius, soleus",
    steps: ["Shoulders under the yoke, balls of the feet on the block, heels low.", "Rise as high as possible on your toes, knees straight; return."],
    tip: "Full stretch and full rise every rep.",
  },
  {
    id: "one-leg-toe-raises", group: "legs", page: 94, name: "One-Leg Toe Raises",
    muscles: "Gastrocnemius, soleus",
    steps: ["One foot on the block, dumbbell in the same-side hand, other hand steadying.", "Rise as high as possible, knee straight; return."],
    tip: "Long sets until you feel the burn.",
  },
  {
    id: "donkey-calf-raises", group: "legs", page: 95, name: "Donkey Calf Raises",
    muscles: "Calves",
    steps: ["Torso parallel to the floor, forearms on the support, toes on the plate.", "Drop the heels low, then rise as high as possible."],
  },
  {
    id: "seated-calf-raises", group: "legs", page: 96, name: "Seated Calf Raises",
    muscles: "Soleus",
    steps: ["Pads tight across the thighs, toes on the bar.", "Stretch the heels low, then rise as high as possible."],
  },
  {
    id: "seated-barbell-calf-raises", group: "legs", page: 97, name: "Seated Barbell Calf Raises",
    muscles: "Soleus",
    steps: ["Sit, toes on a block, barbell across the lower thighs.", "Push up onto your toes as fully as possible."],
    tip: "No weight? Long sets on a chair to the burn.",
  },

  // ------------------------------------------------------------- Buttocks
  {
    id: "lunges", group: "buttocks", page: 99, name: "Lunges",
    muscles: "Glutes, quads, hamstrings",
    steps: ["Feet hip-width, light bar across the shoulders.", "Step forward, torso upright, front thigh to just below parallel; return."],
    tip: "Short step = quads, long step = glutes/hamstrings. Start very light.",
  },
  {
    id: "cable-back-kicks", group: "buttocks", page: 100, name: "Cable Kick Backs",
    muscles: "Gluteus maximus, hamstrings",
    steps: ["Cuff on the ankle, face the stack, hold the frame.", "Tilt the pelvis forward and bring the leg back."],
  },
  {
    id: "machine-hip-extensions", group: "buttocks", page: 101, name: "Machine Hip Extensions",
    muscles: "Glutes, hamstrings",
    steps: ["One foot on the plate, pad between knee and ankle of the other leg.", "Drive the thigh back to full hip extension, hold 2 s, return."],
  },
  {
    id: "floor-hip-extensions", group: "buttocks", page: 102, name: "Floor Hip Extensions",
    muscles: "Glutes, hamstrings",
    steps: ["Kneel on one leg, elbows or hands on the floor.", "Tuck the other knee to the chest, then drive it back to full hip extension."],
    tip: "Straight leg = more hamstrings; bent knee = glutes only. Ankle weight for intensity.",
  },
  {
    id: "bridging", group: "buttocks", page: 103, name: "Bridging",
    muscles: "Glutes, hamstrings",
    steps: ["Lie on your back, knees at 90°, hands by your hips.", "Push through the feet to lift the hips as high as possible, hold 2 s.", "Lower without resting the hips; repeat."],
    tip: "Feet on a bench for more intensity.",
  },
  {
    id: "cable-hip-abductions", group: "buttocks", page: 104, name: "Cable Hip Abductions",
    muscles: "Gluteus medius/minimus, TFL",
    steps: ["Low pulley on the ankle, hold the machine.", "Raise the leg out to the side as far as you can."],
  },
  {
    id: "standing-machine-hip-abductions", group: "buttocks", page: 105, name: "Standing Machine Hip Abductions",
    muscles: "Gluteus medius/minimus",
    steps: ["One foot on the plate, outside of the other leg against the pad.", "Move the leg out to the side as high as possible."],
  },
  {
    id: "floor-hip-abductions", group: "buttocks", page: 106, name: "Floor Hip Abductions",
    muscles: "Gluteus medius/minimus",
    steps: ["Lie on your side, head and shoulders in line.", "Lift the straight top leg up to 70°; lower and repeat."],
  },
  {
    id: "seated-machine-hip-abductions", group: "buttocks", page: 107, name: "Seated Machine Hip Abductions",
    muscles: "Gluteus medius/maximus",
    steps: ["Sit in the abductor machine.", "Push the legs apart as far as comfortable; return."],
    tip: "Upright torso = medius, leaning forward = maximus. Vary each set.",
  },

  // -------------------------------------------------------------- Abdomen
  {
    id: "crunches", group: "abdomen", page: 110, name: "Crunches",
    muscles: "Rectus abdominis",
    steps: ["On your back, hands behind the head, hips and knees at 90°.", "Lift the shoulders and bring knees toward your head by shortening the torso."],
    tip: "Twist elbow-to-opposite-knee to add the obliques.",
  },
  {
    id: "sit-ups", group: "abdomen", page: 111, name: "Sit-Ups",
    muscles: "Rectus abdominis, obliques, hip flexors",
    steps: ["Knees bent, feet flat, hands behind the head.", "Curl up off the floor; return without resting the torso."],
    tip: "Arms forward makes it easier for beginners.",
  },
  {
    id: "gym-ladder-sit-ups", group: "abdomen", page: 112, name: "Gym Ladder Sit-Ups",
    muscles: "Rectus abdominis, obliques",
    steps: ["Feet hooked in the ladder, hips and knees at 90°, hands behind the head.", "Curl the torso as high as possible."],
  },
  {
    id: "calves-over-bench-sit-ups", group: "abdomen", page: 113, name: "Calves-Over-Bench Sit-Ups",
    muscles: "Rectus abdominis (upper)",
    steps: ["On your back, calves resting on a bench, hands behind the head.", "Lift the shoulders and try to touch your knees with your head."],
  },
  {
    id: "incline-bench-sit-ups", group: "abdomen", page: 114, name: "Incline Bench Sit-Ups",
    muscles: "Rectus abdominis, hip flexors",
    steps: ["Feet under the rollers, hands behind the neck.", "Lean back less than 20°, then come up curling the torso."],
    tip: "Twist alternately on the way up to add the obliques.",
  },
  {
    id: "specific-bench-sit-ups", group: "abdomen", page: 115, name: "Roman Bench Sit-Ups",
    muscles: "Rectus abdominis, hip flexors",
    steps: ["Feet under the rollers, torso parallel to the floor, hands behind the head.", "Curl up and try to touch your knees with your head."],
    tip: "Beginners: start with easier ab work first.",
  },
  {
    id: "high-pulley-crunches", group: "abdomen", page: 116, name: "High Pulley Crunches",
    muscles: "Rectus abdominis",
    steps: ["Kneel, bar behind your neck.", "Shorten the torso to bring your chest toward your thighs."],
    tip: "Never heavy — focus on ab tension.",
  },
  {
    id: "machine-crunches", group: "abdomen", page: 117, name: "Machine Crunches",
    muscles: "Rectus abdominis",
    steps: ["Grip the handles, feet under the roller.", "Shorten the torso to bring the chest toward the thighs."],
  },
  {
    id: "incline-leg-raises", group: "abdomen", page: 118, name: "Incline Leg Raises",
    muscles: "Lower abs, hip flexors",
    steps: ["On your back on an incline board, holding the rungs.", "Bring the feet over the hips, then lift the hips toward your head."],
    tip: "Beginners: lower the board angle.",
  },
  {
    id: "leg-raises", group: "abdomen", page: 119, name: "Leg Raises (Captain's Chair)",
    muscles: "Hip flexors, obliques, rectus abdominis",
    steps: ["Elbows on the pads, lower back against the pad.", "Pull the knees to your chest, rounding the back."],
    tip: "Don't drop the knees below horizontal to keep it on the abs.",
  },
  {
    id: "hanging-leg-raises", group: "abdomen", page: 120, name: "Hanging Leg Raises",
    muscles: "Hip flexors, rectus abdominis, obliques",
    steps: ["Hang from a chin-up bar, overhand grip.", "Raise the knees as high as possible toward your chest."],
    tip: "Don't lower knees below horizontal to isolate the abs. Twist side to side for obliques.",
  },
  {
    id: "broomstick-twists", group: "abdomen", page: 121, name: "Broomstick Twists",
    muscles: "Obliques",
    steps: ["Feet spread, a stick across your traps.", "Rotate the upper body side to side; hips stay still (squeeze the glutes)."],
  },
  {
    id: "dumbbell-side-bends", group: "abdomen", page: 122, name: "Dumbbell Side Bends",
    muscles: "Obliques, quadratus lumborum",
    steps: ["One hand behind the neck, dumbbell in the other.", "Bend to the free side; return and go slightly past centre."],
    tip: "Do equal sets each side with no rest between.",
  },
  {
    id: "roman-chair-side-bends", group: "abdomen", page: 123, name: "Roman Chair Side Bends",
    muscles: "Obliques, quadratus lumborum",
    steps: ["Hip on the pad, feet under the rollers, body slightly above horizontal.", "Lift and twist the upper body up; finish one side, then switch."],
  },
  {
    id: "machine-trunk-rotations", group: "abdomen", page: 124, name: "Machine Trunk Rotations",
    muscles: "Obliques",
    steps: ["Stand on the swivel plate, hold the handles.", "Twist the hips side to side, shoulders still, knees soft, under control."],
  },
  // ---------------------------------------------------------------- Core
  // Not from the book: stability and anti-movement work that replaces crunch-style ab training.
  {
    id: "plank", group: "core", page: null, name: "Plank",
    muscles: "Abs, obliques, glutes",
    steps: ["Forearms under shoulders, legs straight, up on your toes.", "Squeeze glutes and brace the abs so your body is one straight line.", "Breathe steadily and hold — don't let the hips sag or pike."],
    tip: "Quality over time: stop when the hips start to drop.",
  },
  {
    id: "side-plank", group: "core", page: null, name: "Side Plank",
    muscles: "Obliques, outer glutes",
    steps: ["Lie on your side, elbow under the shoulder, feet stacked.", "Lift the hips until the body is straight from head to feet.", "Hold, then switch sides."],
    tip: "Too hard? Bend the knees and plank from the knees.",
  },
  {
    id: "copenhagen-plank", group: "core", page: null, name: "Copenhagen Plank",
    muscles: "Inner thighs (adductors), obliques",
    steps: ["Side plank on your elbow with the top leg resting on a bench — inner knee to ankle on the bench.", "Lift the hips so the body is straight; the bottom leg can hang or tuck under the bench.", "Hold, then switch sides."],
    tip: "Start with the knee (not the ankle) on the bench — it's much easier.",
  },
  {
    id: "dead-bug", group: "core", page: null, name: "Dead Bug",
    muscles: "Abs (deep core), hip flexors",
    steps: ["Lie on your back, arms straight up, hips and knees at 90°.", "Press your lower back into the floor and keep it there.", "Slowly reach one arm overhead and straighten the opposite leg, return, then switch."],
    tip: "If the lower back lifts off the floor, shorten the reach.",
  },
  {
    id: "bird-dog", group: "core", page: null, name: "Bird Dog",
    muscles: "Lower back, glutes, deep core",
    steps: ["On hands and knees, hands under shoulders, knees under hips.", "Brace and reach one arm forward and the opposite leg back until level.", "Pause, return without rocking, then switch."],
    tip: "Imagine a glass of water on your lower back — don't spill it.",
  },
  {
    id: "hollow-hold", group: "core", page: null, name: "Hollow Body Hold",
    muscles: "Abs, hip flexors",
    steps: ["Lie on your back, lower back pressed into the floor.", "Lift shoulders and straight legs a few inches off the floor, arms reaching past your head.", "Hold the banana shape and breathe."],
    tip: "Bend the knees or bring the arms to your sides to make it easier.",
  },
  {
    id: "pallof-press", group: "core", page: null, name: "Pallof Press",
    muscles: "Obliques, abs (anti-rotation)",
    steps: ["Stand side-on to a cable or band at chest height, handle at your chest.", "Brace and press the handle straight out without letting your torso turn.", "Hold 2 s, bring it back. Finish the set, then face the other way."],
  },
  {
    id: "ab-wheel-rollout", group: "core", page: null, name: "Ab Wheel Rollout",
    muscles: "Abs, lats",
    steps: ["Kneel holding an ab wheel (or loaded barbell) under your shoulders.", "Brace and roll forward as far as you can without the lower back sagging.", "Pull back to the start using your abs."],
    tip: "Start with short rollouts and build range over weeks.",
  },
  {
    id: "cable-wood-chop", group: "core", page: null, name: "Cable Wood Chop",
    muscles: "Obliques, abs",
    steps: ["Stand side-on to a high cable, both hands on the handle.", "Rotate through the torso and pull the handle down and across to the opposite hip, arms long.", "Return under control. Finish the set, then switch sides."],
  },
  {
    id: "landmine-180", group: "core", page: null, name: "Landmine 180s",
    muscles: "Obliques, abs, shoulders",
    steps: ["Hold the end of a landmine bar at arm's length above your head height.", "Keeping arms straight and hips mostly still, arc the bar down to one hip.", "Arc it back over the top to the other hip."],
  },
  {
    id: "farmers-carry", group: "core", page: null, name: "Farmer's Carry",
    muscles: "Obliques, traps, forearms, abs",
    steps: ["Pick up a heavy dumbbell or kettlebell in each hand.", "Stand tall, shoulders back, ribs down, and walk with short steps.", "Carry one weight only (suitcase carry) to work the obliques harder."],
  },
];

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

// What the app offers: everything except the retired book chapter.
export const ACTIVE_GROUPS = GROUPS.filter((g) => !g.retired);
export const ACTIVE_EXERCISES = EXERCISES.filter((e) => !GROUPS.find((g) => g.id === e.group)?.retired);

// "p. 42" for book exercises, "Core" for the added ones.
export function sourceLabel(e) {
  return e?.page ? `p. ${e.page}` : "Core";
}

export function groupLabel(id) {
  return GROUPS.find((g) => g.id === id)?.label ?? id;
}
