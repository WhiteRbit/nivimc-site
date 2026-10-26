"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import SetTable, { toggleSet } from "./SetTable";
import HowTo from "./HowTo";
import ExercisePicker from "./ExercisePicker";
import SwapSheet from "./SwapSheet";
import MuscleMap, { MapLegend } from "./MuscleMap";
import { EXERCISE_BY_ID, groupLabel } from "@/lib/workout/exercises";
import {
  DAY_NAMES,
  SQUAT_EXERCISE_ID,
  backoffWeight,
  fromKey,
  lightWeight,
  shiftDate,
  suggestTarget,
  warmupSets,
  weekdayOf,
} from "@/lib/workout/program";
import { lastPerformance, newSet, viewDay, withDay } from "@/lib/workout/log";
import { musclesFor } from "@/lib/workout/muscles";

export default function TodayView({ state, update, dateKey, setDateKey, todayKey, onSetDone }) {
  const [picker, setPicker] = useState(false); // add-exercise list open
  const [swapIndex, setSwapIndex] = useState(null); // exercise being swapped
  const day = viewDay(state, dateKey);
  const weekday = weekdayOf(dateKey);
  const planDay = state.plan[weekday] || { title: "Rest", items: [] };
  const units = state.settings.units;

  const edit = (fn) => update((s) => withDay(s, dateKey, fn));

  const dateLabel = fromKey(dateKey).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const relative = dateKey === todayKey ? "Today" : dateKey === shiftDate(todayKey, -1) ? "Yesterday" : DAY_NAMES[weekday];

  return (
    <div>
      <div className={styles.dateBar}>
        <button className={styles.btn} onClick={() => setDateKey(shiftDate(dateKey, -1))} aria-label="Previous day">
          ←
        </button>
        <div className={styles.dateText}>
          <div className={styles.dateMain}>
            {relative} · {planDay.title}
          </div>
          <div className={styles.subtitle}>{dateLabel}</div>
        </div>
        <button className={styles.btn} onClick={() => setDateKey(shiftDate(dateKey, 1))} aria-label="Next day">
          →
        </button>
      </div>
      {dateKey !== todayKey && (
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnBlock}`}
          style={{ marginBottom: 12 }}
          onClick={() => setDateKey(todayKey)}
        >
          Jump to today
        </button>
      )}

      <div style={{ marginBottom: 10 }}>
        <MapLegend />
      </div>

      <SquatBlock state={state} day={day} dateKey={dateKey} edit={edit} onSetDone={onSetDone} />

      {day.exercises.length === 0 && (
        <div className={`${styles.card} ${styles.empty}`}>
          <p>No other lifts planned — just the squat. Add an exercise if you want more.</p>
        </div>
      )}

      {day.exercises.map((ex, index) => (
        <ExerciseCard
          key={`${ex.exId}-${index}`}
          ex={ex}
          index={index}
          units={units}
          last={lastPerformance(state.logs, ex.exId, dateKey)}
          edit={edit}
          onSwap={() => setSwapIndex(index)}
          onSetDone={onSetDone}
        />
      ))}

      <button className={`${styles.btn} ${styles.btnBlock}`} onClick={() => setPicker(true)}>
        + Add exercise from the book
      </button>

      <div className={styles.card} style={{ marginTop: 12 }}>
        <div className={styles.label}>Notes</div>
        <textarea
          className={styles.textarea}
          style={{ marginTop: 6 }}
          placeholder="Sleep, soreness, how the squat felt…"
          value={day.notes}
          onChange={(e) => edit((d) => (d.notes = e.target.value))}
        />
      </div>

      <button
        className={`${styles.btn} ${styles.btnBlock} ${day.completed ? "" : styles.btnPrimary}`}
        onClick={() => edit((d) => (d.completed = !d.completed))}
      >
        {day.completed ? "✓ Workout complete — tap to reopen" : "Finish workout"}
      </button>

      {picker && (
        <ExercisePicker
          title="Add exercise"
          onClose={() => setPicker(false)}
          onPick={(exId) => {
            edit((d) => d.exercises.push({ exId, targetSets: 3, targetReps: "10", sets: [newSet(), newSet(), newSet()] }));
            setPicker(false);
          }}
        />
      )}

      {swapIndex != null && day.exercises[swapIndex] && (
        <SwapSheet
          exId={day.exercises[swapIndex].exId}
          keepLabel={`Keep this swap every ${DAY_NAMES[weekday]}`}
          onClose={() => setSwapIndex(null)}
          onPick={(newId, keep) => {
            const oldId = day.exercises[swapIndex].exId;
            update((s) => {
              const next = withDay(s, dateKey, (d) => {
                const ex = d.exercises[swapIndex];
                ex.exId = newId;
                // Numbers typed for the old exercise don't apply to the new one.
                ex.sets = ex.sets.map((set) => (set.done ? set : newSet()));
              });
              if (!keep) return next;
              const plan = JSON.parse(JSON.stringify(next.plan));
              // Match by exercise; if it was already swapped for today only, fall back to its slot.
              const items = plan[weekday]?.items ?? [];
              const item = items.find((it) => it.exId === oldId) ?? items[swapIndex];
              if (item) item.exId = newId;
              return { ...next, plan };
            });
            setSwapIndex(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Squat

function SquatBlock({ state, day, dateKey, edit, onSetDone }) {
  const { settings, logs } = state;
  const units = settings.units;
  const squat = day.squat;
  const isLight = squat.light ?? settings.lightDays.includes(weekdayOf(dateKey));
  const target = suggestTarget(logs, dateKey, settings);
  const ex = EXERCISE_BY_ID[SQUAT_EXERCISE_ID];

  const setCount = isLight ? settings.lightSets : settings.backoffSets;
  const sets = Array.from({ length: Math.max(setCount, squat.sets.length) }, (_, i) => squat.sets[i] || newSet());
  const topWeight = Number(squat.top.weight) || target.weight;
  const workWeight = isLight ? lightWeight(logs, dateKey, settings) : backoffWeight(topWeight, settings);
  const workReps = isLight ? settings.lightReps : settings.backoffReps;
  const topDone = Number(squat.top.weight) > 0 && squat.top.rpe != null;

  const writeSet = (i, fn) =>
    edit((d) => {
      d.squat.sets = Array.from({ length: sets.length }, (_, k) => d.squat.sets[k] || newSet());
      d.squat.sets[i] = fn(d.squat.sets[i]);
    });

  return (
    <section className={`${styles.card} ${styles.squatCard}`}>
      <div className={styles.cardHead}>
        <div className={styles.grow}>
          <div className={styles.label}>Every day · Cory Gregory style</div>
          <h3 className={styles.h3}>Back Squat</h3>
          <div className={styles.muscles}>{ex.muscles}</div>
          <label className={styles.toggle} style={{ marginTop: 8 }}>
            <input type="checkbox" checked={isLight} onChange={(e) => edit((d) => (d.squat.light = e.target.checked))} />
            Light / recovery day
          </label>
        </div>
        <MuscleMap {...musclesFor(SQUAT_EXERCISE_ID)} size="sm" />
      </div>

      {!isLight && (
        <div className={styles.stack} style={{ marginTop: 12 }}>
          <div>
            <div className={styles.label}>Today&apos;s daily-max target</div>
            <div className={styles.target}>
              {target.weight} <span className={styles.subtitle}>{units} × 1–3</span>
            </div>
            <p>{target.reason}</p>
          </div>

          <div>
            <div className={styles.label}>Warm-up ramp</div>
            <div className={styles.ramp}>
              {warmupSets(target.weight, settings).map((w, i) => (
                <span key={i} className={styles.rampStep}>
                  {w.weight} × {w.reps}
                </span>
              ))}
              <span className={`${styles.rampStep} ${styles.pillAccent}`}>Top set</span>
            </div>
          </div>

          <div>
            <div className={styles.label}>Top set — stop before form breaks, no grinders</div>
            <div className={styles.row} style={{ marginTop: 6 }}>
              <input
                className={`${styles.input} ${styles.num}`}
                inputMode="decimal"
                placeholder={String(target.weight)}
                value={squat.top.weight}
                onChange={(e) => edit((d) => (d.squat.top.weight = e.target.value))}
                aria-label="Top set weight"
              />
              <span className={styles.subtitle}>{units} ×</span>
              <input
                className={`${styles.input} ${styles.num}`}
                inputMode="numeric"
                placeholder="1–3"
                value={squat.top.reps}
                onChange={(e) => edit((d) => (d.squat.top.reps = e.target.value))}
                aria-label="Top set reps"
              />
              <span className={styles.subtitle}>reps</span>
            </div>
            <div className={styles.label} style={{ marginTop: 10 }}>
              How hard was it? (RPE)
            </div>
            <div className={styles.rpeRow} style={{ marginTop: 6 }}>
              {[6, 7, 8, 9, 10].map((r) => (
                <button
                  key={r}
                  className={`${styles.rpe} ${squat.top.rpe === r ? styles.rpeOn : ""}`}
                  onClick={() =>
                    edit((d) => {
                      d.squat.top.rpe = d.squat.top.rpe === r ? null : r;
                      if (d.squat.top.weight === "") d.squat.top.weight = String(target.weight);
                    })
                  }
                >
                  {r}
                </button>
              ))}
            </div>
            <p style={{ marginTop: 6 }}>8 = 2 reps left in the tank · 9 = 1 left · 10 = nothing left.</p>
          </div>
        </div>
      )}

      {isLight && (
        <p style={{ marginTop: 12 }}>
          Still squatting — just easy. {settings.lightSets} × {settings.lightReps} at about {settings.lightPct}% of your last heavy top set.
          Move well, get blood flowing, leave fresher than you came in.
        </p>
      )}

      <div className={styles.label} style={{ marginTop: 14 }}>
        {isLight ? "Light sets" : `Back-off sets @ ${settings.backoffPct}% of top`}
        {!isLight && !topDone && " (log your top set first)"}
      </div>
      <SetTable
        sets={sets}
        units={units}
        placeholder={() => ({ weight: workWeight, reps: workReps })}
        onChange={(i, field, value) => writeSet(i, (s) => ({ ...s, [field]: value }))}
        onToggle={(i, ph) => {
          if (!sets[i].done) onSetDone?.(state.settings.squatRestSeconds);
          writeSet(i, (s) => toggleSet(s, ph));
        }}
      />
      <div className={styles.row} style={{ marginTop: 10 }}>
        <HowTo exercise={ex} />
      </div>
    </section>
  );
}

// ------------------------------------------------------------- Exercises

function ExerciseCard({ ex, index, units, last, edit, onSwap, onSetDone }) {
  const info = EXERCISE_BY_ID[ex.exId];
  const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);

  const writeSet = (i, fn) => edit((d) => (d.exercises[index].sets[i] = fn(d.exercises[index].sets[i])));

  return (
    <section className={`${styles.card} ${allDone ? styles.cardDone : ""}`}>
      <div className={styles.cardHead}>
        <div className={styles.grow}>
          <h3 className={styles.h3}>{info?.name ?? ex.exId}</h3>
          <div className={styles.muscles}>{info?.muscles}</div>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <span className={styles.pill}>{groupLabel(info?.group)}</span>
            <span className={`${styles.pill} ${styles.pillAccent}`}>
              {ex.targetSets} × {ex.targetReps}
            </span>
          </div>
          {last && <p style={{ marginTop: 6 }}>Last time: {last.sets.map((s) => `${s.weight || "BW"}×${s.reps || "?"}`).join(", ")}</p>}
        </div>
        <MuscleMap {...musclesFor(ex.exId)} size="sm" />
      </div>

      <SetTable
        sets={ex.sets}
        units={units}
        placeholder={(i) => ({
          weight: last?.sets[i]?.weight || last?.sets[last.sets.length - 1]?.weight || null,
          reps: ex.targetReps,
        })}
        onChange={(i, field, value) => writeSet(i, (s) => ({ ...s, [field]: value }))}
        onToggle={(i, ph) => {
          if (!ex.sets[i].done) onSetDone?.();
          writeSet(i, (s) => toggleSet(s, ph));
        }}
      />

      <div className={styles.row} style={{ marginTop: 10 }}>
        <HowTo exercise={info} />
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
          onClick={() => edit((d) => d.exercises[index].sets.push(newSet()))}
        >
          + Set
        </button>
        {ex.sets.length > 1 && (
          <button
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
            onClick={() => edit((d) => d.exercises[index].sets.pop())}
          >
            − Set
          </button>
        )}
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={onSwap}>
          Swap
        </button>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={() => edit((d) => d.exercises.splice(index, 1))}>
          Remove
        </button>
      </div>
    </section>
  );
}
