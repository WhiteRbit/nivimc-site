"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import HowTo from "./HowTo";
import SwapSheet from "./SwapSheet";
import MuscleMap from "./MuscleMap";
import { liftPlan, liftSkipped } from "./LiftBlock";
import { ACTIVE_EXERCISES, EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { suggestFor } from "@/lib/workout/angles";
import { REGIONS, musclesFor } from "@/lib/workout/muscles";
import { photosFor } from "@/lib/workout/photos";
import { LIFTS } from "@/lib/workout/program";
import { newSet } from "@/lib/workout/log";
import { buildWorkout } from "@/lib/workout/builder";

const fmtPyramid = (sets) => sets.map((s) => `${s.weight}×${s.reps}`).join(" → ");

// Step 1: daily lifts at the top, then pick muscles on the body and get exercises that
// cover each one from every angle. "Add to today's workout" moves on to step 2.
export default function PlanStep({ state, day, dateKey, edit, planned, onUseRoutine, onStart }) {
  const [regions, setRegions] = useState([]); // tapped muscles, in tap order
  const [choice, setChoice] = useState({}); // row key → chosen exercise id
  const [switching, setSwitching] = useState(null); // { exId, preferred, onPick } while the switch sheet is open
  const [builtSwap, setBuiltSwap] = useState({}); // built plan: suggested exercise id → switched-to id
  const [on, setOn] = useState({}); // row key → ticked
  const [extra, setExtra] = useState([]); // other exercises ticked from a muscle's full list
  const units = state.settings.units;

  const inWorkout = day.exercises.map((e) => e.exId);
  const rows = suggestFor(regions, inWorkout);
  const pick = (r) => choice[r.key] ?? r.exId;
  const isOn = (r) => (on[r.key] ?? r.on) && Boolean(pick(r));
  const chosen = rows.filter(isOn);
  const picked = new Set([...inWorkout, ...rows.map(pick).filter(Boolean)]);
  // Every other exercise that mainly works the muscle, so nothing is hidden.
  const othersFor = (region) => ACTIVE_EXERCISES.filter((e) => musclesFor(e.id).primary.includes(region) && !picked.has(e.id));
  const extraChosen = extra.filter((id) => !picked.has(id));
  const total = chosen.length + extraChosen.length;

  const toggleRegion = (r) => setRegions((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const lightNow = LIFTS.map((l) => liftPlan(state, day, dateKey, l).isLight).some(Boolean);

  // "Build it for me": fit the session into the minutes available.
  const [minutes, setMinutes] = useState(null);
  const built =
    minutes &&
    buildWorkout({
      settings: state.settings,
      logs: state.logs,
      dateKey,
      regions,
      minutes,
      taken: inWorkout,
      lifts: LIFTS.map((l) => ({ ...l, light: liftPlan(state, day, dateKey, l).isLight, skipped: liftSkipped(state, day, l) })),
    });

  const builtItems = built ? built.items.map((it) => ({ ...it, exId: builtSwap[it.exId] ?? it.exId, suggested: it.exId })) : [];

  const useBuilt = () => {
    edit((d) => {
      if (built.skipDeadlift && !liftSkipped(state, day, LIFTS[1])) d.deadlift.skip = true;
      for (const it of builtItems) {
        if (d.exercises.some((e) => e.exId === it.exId)) continue;
        d.exercises.push({ exId: it.exId, targetSets: it.sets, targetReps: it.reps, sets: Array.from({ length: it.sets }, newSet) });
      }
      if (!d.title) d.title = built.regions.length ? built.regions.map((r) => REGIONS[r]).join(" + ") : "Daily lifts";
      d.plannedMinutes = minutes;
      d.stage = "workout";
    });
    setMinutes(null);
    setRegions([]);
    setBuiltSwap({});
    onStart();
  };

  const add = () => {
    edit((d) => {
      for (const r of chosen) {
        const exId = pick(r);
        if (d.exercises.some((e) => e.exId === exId)) continue;
        d.exercises.push({ exId, targetSets: 3, targetReps: r.angle.reps, sets: [newSet(), newSet(), newSet()] });
      }
      for (const exId of extraChosen) {
        if (!d.exercises.some((e) => e.exId === exId))
          d.exercises.push({ exId, targetSets: 3, targetReps: "10-12", sets: [newSet(), newSet(), newSet()] });
      }
      if (!d.title && regions.length) d.title = regions.map((r) => REGIONS[r]).join(" + ");
      d.stage = "workout";
    });
    setRegions([]);
    setChoice({});
    setOn({});
    setExtra([]);
    onStart();
  };

  return (
    <div>
      {/* ---------------------------------------------------------- Daily lifts */}
      <section className={`${styles.card} ${styles.squatCard}`}>
        <div className={`${styles.row} ${styles.between}`}>
          <div className={styles.label}>Today&apos;s pyramid lifts</div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={lightNow}
              onChange={(e) =>
                edit((d) => {
                  for (const l of LIFTS) {
                    d[l.key].light = e.target.checked;
                    d[l.key].sets = d[l.key].sets.filter((x) => x.done); // planned numbers change with the day type
                  }
                })
              }
            />
            Light day
          </label>
        </div>
        {LIFTS.map((lift) => {
          const { isLight, target, sets } = liftPlan(state, day, dateKey, lift);
          const skipped = liftSkipped(state, day, lift);
          return (
            <div key={lift.key} className={styles.liftRow}>
              <div className={`${styles.row} ${styles.between}`}>
                <div style={{ fontWeight: 700 }}>
                  {lift.name}
                  {!skipped && !isLight && (
                    <span className={styles.subtitle}>
                      {" "}
                      · top set {target.weight} {units}
                    </span>
                  )}
                </div>
                {lift.key === "deadlift" && (
                  <button
                    className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                    onClick={() => edit((d) => (d.deadlift.skip = !skipped))}
                  >
                    {skipped ? "+ Include" : "Skip today"}
                  </button>
                )}
              </div>
              {skipped ? (
                <p>Skipped today.</p>
              ) : (
                <div className={styles.ramp}>
                  {sets.map((s, i) => (
                    <span key={i} className={`${styles.rampStep} ${!isLight && i === sets.length - 1 ? styles.pillAccent : ""}`}>
                      {s.weight}×{s.reps}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <p style={{ marginTop: 8 }}>
          Light weight for 10 reps, then add weight and drop reps every set. You&apos;ll log them in the next step.
        </p>
      </section>

      {/* ---------------------------------------------------------- Body map */}
      <section className={styles.card}>
        <div className={styles.label}>Add muscles to target today</div>
        <p style={{ marginTop: 4 }}>Tap one or more muscles on the body.</p>
        <div style={{ marginTop: 8 }}>
          <MuscleMap primary={regions} size="lg" onRegion={toggleRegion} />
        </div>
        {regions.length > 0 ? (
          <div className={styles.row} style={{ marginTop: 10 }}>
            {regions.map((r) => (
              <button key={r} className={`${styles.btn} ${styles.btnSmall} ${styles.btnPrimary}`} onClick={() => toggleRegion(r)}>
                {REGIONS[r]} ✕
              </button>
            ))}
          </div>
        ) : (
          planned?.items?.length > 0 && (
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnBlock}`} style={{ marginTop: 10 }} onClick={onUseRoutine}>
              Or use a saved routine · today: {planned.title}
            </button>
          )
        )}
      </section>

      {/* ---------------------------------------------------------- Build for time */}
      <section className={styles.card}>
        <div className={styles.label}>⏱ Short on time? Let the app build it</div>
        <p style={{ marginTop: 4 }}>
          {regions.length
            ? `Fits the pyramid lifts plus ${regions.map((r) => REGIONS[r]).join(" + ")} into the time you have.`
            : "Pick muscles above, or let it choose the ones you've trained least this week."}
        </p>
        <div className={styles.row} style={{ marginTop: 8 }}>
          {[20, 30, 45, 60, 75, 90].map((m) => (
            <button
              key={m}
              className={`${styles.btn} ${styles.btnSmall} ${minutes === m ? styles.btnPrimary : ""}`}
              onClick={() => setMinutes(minutes === m ? null : m)}
              aria-pressed={minutes === m}
            >
              {m} min
            </button>
          ))}
        </div>

        {built && (
          <div style={{ marginTop: 12 }}>
            <ul className={styles.list}>
              {built.lifts.map((l) => (
                <li key={l.key} className={styles.listItem}>
                  <span style={{ fontWeight: 700 }}>{l.name} pyramid</span>
                  <span className={styles.subtitle}>~{l.minutes} min</span>
                </li>
              ))}
              {builtItems.map((it) => (
                <li key={it.suggested} className={styles.listItem}>
                  <div className={styles.grow}>
                    <div style={{ fontWeight: 700 }}>{EXERCISE_BY_ID[it.exId]?.name}</div>
                    <div className={styles.muscles}>
                      {REGIONS[it.region]} · {it.angle} · {it.sets} × {it.reps} · ~{it.minutes} min
                    </div>
                  </div>
                  <button
                    className={`${styles.btn} ${styles.btnSmall}`}
                    onClick={() =>
                      setSwitching({
                        exId: it.exId,
                        region: it.region,
                        preferred: { label: it.angle, ids: it.options },
                        exclude: builtItems.map((x) => x.exId),
                        onPick: (id) => setBuiltSwap((m) => ({ ...m, [it.suggested]: id })),
                      })
                    }
                  >
                    ⇄ Switch
                  </button>
                </li>
              ))}
            </ul>
            {built.notes.map((n) => (
              <p key={n} style={{ marginTop: 6 }}>
                {n}
              </p>
            ))}
            <div style={{ fontWeight: 700, marginTop: 8 }}>
              ~{built.total} of {minutes} min · tap the button below to use it, or pick a different time
            </div>
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- Suggestions */}
      {regions.map((region) => (
        <section key={region} className={styles.card}>
          <div className={`${styles.row} ${styles.between}`}>
            <h3 className={styles.h3}>{REGIONS[region]}</h3>
            <span className={styles.subtitle}>
              {ACTIVE_EXERCISES.filter((e) => musclesFor(e.id).primary.includes(region)).length} exercises
            </span>
          </div>
          <p style={{ marginTop: 2 }}>
            Suggested to cover the whole muscle. Tap ⇄ Switch to swap one for another exercise for the same area, or untick it.
          </p>
          <ul className={styles.list} style={{ marginTop: 6 }}>
            {rows
              .filter((r) => r.region === region)
              .map((r) => (
                <SuggestionRow
                  key={r.key}
                  row={r}
                  exId={pick(r)}
                  checked={isOn(r)}
                  onCheck={(v) => setOn((o) => ({ ...o, [r.key]: v }))}
                  onSwitch={() =>
                    setSwitching({
                      exId: pick(r),
                      region: r.region,
                      preferred: { label: r.angle.label, ids: r.angle.options },
                      exclude: [...inWorkout, ...rows.filter((x) => x.key !== r.key).map(pick)].filter(Boolean),
                      onPick: (id) => {
                        setChoice((c) => ({ ...c, [r.key]: id }));
                        setOn((o) => ({ ...o, [r.key]: true }));
                      },
                    })
                  }
                />
              ))}
          </ul>
          {othersFor(region).length > 0 && (
            <>
              <div className={styles.label} style={{ marginTop: 14 }}>
                All other {REGIONS[region].toLowerCase()} exercises
              </div>
              <ul className={styles.list} style={{ marginTop: 4 }}>
                {othersFor(region).map((e) => (
                  <ExtraRow
                    key={e.id}
                    exercise={e}
                    checked={extra.includes(e.id)}
                    onCheck={(v) => setExtra((cur) => (v ? [...cur, e.id] : cur.filter((x) => x !== e.id)))}
                  />
                ))}
              </ul>
            </>
          )}
        </section>
      ))}

      {day.exercises.length > 0 && (
        <section className={styles.card}>
          <div className={styles.label}>Already in today&apos;s workout</div>
          <p style={{ marginTop: 4, color: "var(--text)" }}>{day.exercises.map((e) => EXERCISE_BY_ID[e.exId]?.name).join(", ")}</p>
        </section>
      )}

      {switching && (
        <SwapSheet
          exId={switching.exId}
          region={switching.region}
          preferred={switching.preferred}
          exclude={switching.exclude}
          onClose={() => setSwitching(null)}
          onPick={(id) => {
            switching.onPick(id);
            setSwitching(null);
          }}
        />
      )}

      <div className={styles.stickyCta}>
        {built ? (
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={useBuilt}>
            Use this {minutes}-min workout →
          </button>
        ) : total > 0 ? (
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={add}>
            Add {total} exercise{total > 1 ? "s" : ""} to today&apos;s workout →
          </button>
        ) : (
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={add}>
            {day.exercises.length ? "Go to today's workout →" : "Start with the pyramid lifts only →"}
          </button>
        )}
      </div>
    </div>
  );
}

function SuggestionRow({ row, exId, checked, onCheck, onSwitch }) {
  const info = EXERCISE_BY_ID[exId];
  const photo = exId ? photosFor(exId)?.[0] : null;

  return (
    <li className={styles.suggestion}>
      <div className={styles.cardHead}>
        <input
          type="checkbox"
          className={styles.bigCheck}
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label={`Include ${info?.name}`}
        />
        <div className={styles.grow}>
          <div className={styles.label} style={{ letterSpacing: "0.04em" }}>
            {row.angle.label}
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", marginTop: 2 }}>{info?.name ?? "No exercise left for this angle"}</div>
          <div className={styles.subtitle} style={{ marginTop: 2 }}>
            3 × {row.angle.reps}
          </div>
        </div>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className={styles.thumb} loading="lazy" />
        ) : (
          exId && <MuscleMap {...musclesFor(exId)} size="sm" />
        )}
      </div>
      <div className={styles.row} style={{ marginTop: 6 }}>
        {exId && (
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={onSwitch}>
            ⇄ Switch
          </button>
        )}
        {info && <HowTo exercise={info} />}
      </div>
    </li>
  );
}

// A compact, untouched-by-default row for the rest of a muscle's exercises.
function ExtraRow({ exercise, checked, onCheck }) {
  const photo = photosFor(exercise.id)?.[0];
  return (
    <li className={styles.suggestion}>
      <div className={styles.cardHead}>
        <input
          type="checkbox"
          className={styles.bigCheck}
          style={{ marginTop: 4 }}
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label={`Include ${exercise.name}`}
        />
        <div className={styles.grow}>
          <div style={{ fontWeight: 700 }}>{exercise.name}</div>
          <div className={styles.muscles}>{exercise.muscles}</div>
        </div>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className={styles.thumb} style={{ marginTop: 0 }} loading="lazy" />
        ) : (
          <MuscleMap {...musclesFor(exercise.id)} size="sm" />
        )}
      </div>
      <div className={styles.row} style={{ marginTop: 6 }}>
        <HowTo exercise={exercise} />
      </div>
    </li>
  );
}
