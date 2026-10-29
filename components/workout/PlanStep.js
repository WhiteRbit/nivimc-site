"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import HowTo from "./HowTo";
import MuscleMap from "./MuscleMap";
import { liftPlan, liftSkipped } from "./LiftBlock";
import { ACTIVE_EXERCISES, EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { ANGLES, suggestFor } from "@/lib/workout/angles";
import { REGIONS, musclesFor } from "@/lib/workout/muscles";
import { photosFor } from "@/lib/workout/photos";
import { LIFTS } from "@/lib/workout/program";
import { newSet } from "@/lib/workout/log";

const fmtPyramid = (sets) => sets.map((s) => `${s.weight}×${s.reps}`).join(" → ");

// Step 1: daily lifts at the top, then pick muscles on the body and get exercises that
// cover each one from every angle. "Add to today's workout" moves on to step 2.
export default function PlanStep({ state, day, dateKey, edit, planned, onUseRoutine, onStart }) {
  const [regions, setRegions] = useState([]); // tapped muscles, in tap order
  const [choice, setChoice] = useState({}); // row key → chosen exercise id
  const [on, setOn] = useState({}); // row key → ticked
  const units = state.settings.units;

  const inWorkout = day.exercises.map((e) => e.exId);
  const rows = suggestFor(regions, inWorkout);
  const pick = (r) => choice[r.key] ?? r.exId;
  const isOn = (r) => (on[r.key] ?? r.on) && Boolean(pick(r));
  const chosen = rows.filter(isOn);

  const toggleRegion = (r) => setRegions((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const lightNow = LIFTS.map((l) => liftPlan(state, day, dateKey, l).isLight).some(Boolean);

  const add = () => {
    edit((d) => {
      for (const r of chosen) {
        const exId = pick(r);
        if (d.exercises.some((e) => e.exId === exId)) continue;
        d.exercises.push({ exId, targetSets: 3, targetReps: r.angle.reps, sets: [newSet(), newSet(), newSet()] });
      }
      if (!d.title && regions.length) d.title = regions.map((r) => REGIONS[r]).join(" + ");
      d.stage = "workout";
    });
    setRegions([]);
    setChoice({});
    setOn({});
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

      {/* ---------------------------------------------------------- Suggestions */}
      {regions.map((region) => (
        <section key={region} className={styles.card}>
          <div className={`${styles.row} ${styles.between}`}>
            <h3 className={styles.h3}>{REGIONS[region]}</h3>
            <span className={styles.subtitle}>{(ANGLES[region] ?? []).length} angles</span>
          </div>
          <p style={{ marginTop: 2 }}>Suggested to cover the whole muscle. Change any of them or untick what you don&apos;t want.</p>
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
                  onChange={(id) => {
                    setChoice((c) => ({ ...c, [r.key]: id }));
                    setOn((o) => ({ ...o, [r.key]: true }));
                  }}
                />
              ))}
          </ul>
        </section>
      ))}

      {day.exercises.length > 0 && (
        <section className={styles.card}>
          <div className={styles.label}>Already in today&apos;s workout</div>
          <p style={{ marginTop: 4, color: "var(--text)" }}>{day.exercises.map((e) => EXERCISE_BY_ID[e.exId]?.name).join(", ")}</p>
        </section>
      )}

      <div className={styles.stickyCta}>
        {chosen.length > 0 ? (
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={add}>
            Add {chosen.length} exercise{chosen.length > 1 ? "s" : ""} to today&apos;s workout →
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

function SuggestionRow({ row, exId, checked, onCheck, onChange }) {
  const info = EXERCISE_BY_ID[exId];
  const photo = exId ? photosFor(exId)?.[0] : null;
  // The angle's own options first, then everything else that mainly works this muscle.
  const others = ACTIVE_EXERCISES.filter((e) => !row.angle.options.includes(e.id) && musclesFor(e.id).primary.includes(row.region));

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
          <select
            className={`${styles.select} ${styles.exSelect}`}
            value={exId ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={row.angle.label}
          >
            {!exId && <option value="">Choose…</option>}
            <optgroup label="Best for this angle">
              {row.angle.options.map((id) => (
                <option key={id} value={id}>
                  {EXERCISE_BY_ID[id]?.name}
                </option>
              ))}
            </optgroup>
            {others.length > 0 && (
              <optgroup label="Other exercises for this muscle">
                {others.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <div className={styles.subtitle} style={{ marginTop: 4 }}>
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
      {info && (
        <div className={styles.row} style={{ marginTop: 6 }}>
          <HowTo exercise={info} />
        </div>
      )}
    </li>
  );
}
