"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import SetTable, { toggleSet } from "./SetTable";
import HowTo from "./HowTo";
import ExercisePicker from "./ExercisePicker";
import SwapSheet from "./SwapSheet";
import WorkoutPicker from "./WorkoutPicker";
import SessionSummary from "./SessionSummary";
import WorkoutTime from "./WorkoutTime";
import MuscleMap, { MapLegend } from "./MuscleMap";
import { EXERCISE_BY_ID, groupLabel } from "@/lib/workout/exercises";
import {
  DAY_NAMES,
  SQUAT_EXERCISE_ID,
  fromKey,
  lightWeight,
  pyramidSets,
  shiftDate,
  suggestTarget,
  weekdayOf,
} from "@/lib/workout/program";
import { lastPerformance, newSet, snapshotFromWeekday, viewDay, withDay } from "@/lib/workout/log";
import { musclesFor } from "@/lib/workout/muscles";

export default function TodayView({ state, update, dateKey, setDateKey, todayKey, onSetDone }) {
  const [picker, setPicker] = useState(false); // add-exercise list open
  const [swapIndex, setSwapIndex] = useState(null); // exercise being swapped
  const [choosing, setChoosing] = useState(false); // change-workout sheet open
  const [summaryOpen, setSummaryOpen] = useState(false); // end-of-session summary
  const day = viewDay(state, dateKey);
  const weekday = weekdayOf(dateKey);
  const planDay = state.plan[weekday] || { title: "Rest", items: [] };
  const title = day.title ?? planDay.title;

  const hasDoneSets = day.exercises.some((e) => e.sets.some((x) => x.done));
  const confirmReplace = () =>
    !hasDoneSets || window.confirm("Replace today's exercises? Sets you've already ticked off on them will be removed.");

  const pickWorkout = (wd, swapDays) => {
    if (!confirmReplace()) return;
    update((s) => {
      let plan = s.plan;
      if (swapDays && wd !== weekday) {
        plan = { ...s.plan, [weekday]: s.plan[wd], [wd]: s.plan[weekday] };
      }
      const next = withDay({ ...s, plan }, dateKey, (d) => {
        // After a plan swap the chosen routine *is* today's plan, so no override is needed.
        d.title = swapDays ? null : plan[wd].title;
        d.exercises = snapshotFromWeekday(plan, swapDays ? weekday : wd);
      });
      return next;
    });
    setChoosing(false);
  };

  // Manually entered workout time (e.g. when logging a session afterwards).
  const setTime = (startedAt, finishedAt) =>
    edit((d) => {
      d.startedAt = startedAt;
      d.finishedAt = finishedAt;
      d.timeManual = true;
    });

  const resetWorkout = () => {
    if (!confirmReplace()) return;
    edit((d) => {
      d.title = null;
      d.exercises = snapshotFromWeekday(state.plan, weekday);
    });
    setChoosing(false);
  };
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
            {relative} · {title}
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

      <button className={`${styles.btn} ${styles.btnBlock}`} style={{ marginBottom: 12 }} onClick={() => setChoosing(true)}>
        ⇄ Change workout{day.title ? ` · planned: ${planDay.title}` : ""}
      </button>

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
        <WorkoutTime
          key={`${day.startedAt}-${day.finishedAt}`}
          dateKey={dateKey}
          startedAt={day.startedAt}
          finishedAt={day.finishedAt}
          onSave={setTime}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Notes</div>
        <textarea
          className={styles.textarea}
          style={{ marginTop: 6 }}
          placeholder="Sleep, soreness, how the squat felt…"
          value={day.notes}
          onChange={(e) => edit((d) => (d.notes = e.target.value))}
        />
      </div>

      {day.completed ? (
        <div className={styles.row}>
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.grow}`} onClick={() => setSummaryOpen(true)}>
            ✓ Done · View summary
          </button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => edit((d) => (d.completed = false))}>
            Reopen
          </button>
        </div>
      ) : (
        <button
          className={`${styles.btn} ${styles.btnBlock} ${styles.btnPrimary}`}
          onClick={() => {
            edit((d) => {
              d.completed = true;
              if (!d.timeManual) d.finishedAt = Date.now(); // keep a time the person entered by hand
            });
            setSummaryOpen(true);
          }}
        >
          Finish workout
        </button>
      )}

      {summaryOpen && (
        <SessionSummary
          state={state}
          dateKey={dateKey}
          day={day}
          title={title}
          onEditTime={setTime}
          onClose={() => setSummaryOpen(false)}
        />
      )}

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

      {choosing && (
        <WorkoutPicker
          plan={state.plan}
          weekday={weekday}
          currentTitle={title}
          overridden={Boolean(day.title)}
          onPick={pickWorkout}
          onReset={resetWorkout}
          onClose={() => setChoosing(false)}
        />
      )}

      {swapIndex != null && day.exercises[swapIndex] && (
        <SwapSheet
          exId={day.exercises[swapIndex].exId}
          keepLabel={day.title ? undefined : `Keep this swap every ${DAY_NAMES[weekday]}`}
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
              // A routine borrowed from another day isn't this weekday's plan, so swaps there stay today-only.
              if (!keep || day.title) return next;
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

  // Planned sets: a pyramid up to the target, or flat light sets.
  const plan = isLight
    ? Array.from({ length: settings.lightSets }, () => ({ weight: lightWeight(logs, dateKey, settings), reps: settings.lightReps }))
    : pyramidSets(target.weight, settings);
  const sets = Array.from({ length: Math.max(plan.length, squat.sets.length) }, (_, i) => squat.sets[i] || newSet());
  const lastIndex = plan.length - 1;

  const writeSet = (i, fn) =>
    edit((d) => {
      d.squat.light = isLight; // pin the day type once something is logged
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
            <input
              type="checkbox"
              checked={isLight}
              onChange={(e) =>
                edit((d) => {
                  d.squat.light = e.target.checked;
                  d.squat.sets = d.squat.sets.filter((x) => x.done); // planned numbers change with the day type
                })
              }
            />
            Light / recovery day
          </label>
        </div>
        <MuscleMap {...musclesFor(SQUAT_EXERCISE_ID)} size="sm" />
      </div>

      {isLight ? (
        <p style={{ marginTop: 12 }}>
          Still squatting — just easy. {settings.lightSets} × {settings.lightReps} at about {settings.lightPct}% of your last heavy top set.
          Move well and leave fresher than you came in.
        </p>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div className={styles.label}>Pyramid · add weight, drop reps every set</div>
          <div className={styles.target} style={{ marginTop: 4 }}>
            {target.weight}{" "}
            <span className={styles.subtitle}>
              {units} top set × {plan[lastIndex].reps}
            </span>
          </div>
          <p>{target.reason}</p>
        </div>
      )}

      <SetTable
        sets={sets}
        units={units}
        placeholder={(i) => plan[i] ?? plan[lastIndex]}
        labelFor={(i) => (!isLight && i === lastIndex ? "Top" : i + 1)}
        onChange={(i, field, value) => writeSet(i, (s) => ({ ...s, [field]: value }))}
        onToggle={(i, ph) => {
          if (!sets[i].done) onSetDone?.(state.settings.squatRestSeconds);
          writeSet(i, (s) => toggleSet(s, ph));
        }}
      />

      {!isLight && (
        <div style={{ marginTop: 12 }}>
          <div className={styles.label}>How hard was the top set? (RPE)</div>
          <div className={styles.rpeRow} style={{ marginTop: 6 }}>
            {[6, 7, 8, 9, 10].map((r) => (
              <button
                key={r}
                className={`${styles.rpe} ${squat.rpe === r ? styles.rpeOn : ""}`}
                onClick={() =>
                  edit((d) => {
                    d.squat.light = isLight;
                    d.squat.rpe = d.squat.rpe === r ? null : r;
                  })
                }
              >
                {r}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 6 }}>8 = 2 reps left in the tank · 9 = 1 left · 10 = nothing left. Stop before form breaks.</p>
        </div>
      )}

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
