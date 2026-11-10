"use client";

import { useEffect, useState } from "react";
import styles from "./workout.module.css";
import SetTable, { toggleSet } from "./SetTable";
import HowTo from "./HowTo";
import MoreMenu from "./MoreMenu";
import SwapSheet from "./SwapSheet";
import WorkoutPicker from "./WorkoutPicker";
import SessionSummary from "./SessionSummary";
import WorkoutTime from "./WorkoutTime";
import PlanStep from "./PlanStep";
import LiftBlock, { liftSkipped } from "./LiftBlock";
import { EXERCISE_BY_ID, customId } from "@/lib/workout/exercises";
import { DAY_NAMES, LIFTS, accessoryTarget, fromKey, isBikini, isProgressive, shiftDate, weekdayOf } from "@/lib/workout/program";
import { lastPerformance, newSet, postponeExercises, snapshotFromWeekday, viewDay, withDay } from "@/lib/workout/log";

const STEPS = [
  { id: "plan", label: "Plan" },
  { id: "workout", label: "Workout" },
  { id: "done", label: "Summary" },
];

// The Today tab: 1 · plan the session, 2 · log it, 3 · summary.
export default function TodayView({ state, update, dateKey, setDateKey, todayKey, onSetDone }) {
  const [choosing, setChoosing] = useState(false); // saved-routine sheet open
  const day = viewDay(state, dateKey);
  const weekday = weekdayOf(dateKey);
  const planDay = state.plan[weekday] || { title: "Rest", items: [] };
  const title = day.title ?? (day.exercises.length ? planDay.title : "Daily lifts");
  const stage = day.stage;

  const edit = (fn) => update((s) => withDay(s, dateKey, fn));
  const goTo = (to) => {
    edit((d) => {
      d.stage = to;
      if (to !== "done") d.completed = false;
    });
    window.scrollTo({ top: 0 });
  };

  // Load a saved routine from the weekly plan into today and go straight to the workout.
  const pickWorkout = (wd, swapDays) => {
    update((s) => {
      let plan = s.plan;
      if (swapDays && wd !== weekday) plan = { ...s.plan, [weekday]: s.plan[wd], [wd]: s.plan[weekday] };
      return withDay({ ...s, plan }, dateKey, (d) => {
        const have = new Set(d.exercises.map((e) => e.exId));
        d.title = plan[wd].title;
        d.exercises.push(...snapshotFromWeekday(plan, swapDays ? weekday : wd).filter((e) => !have.has(e.exId)));
        d.stage = "workout";
      });
    });
    setChoosing(false);
    window.scrollTo({ top: 0 });
  };

  const dateLabel = fromKey(dateKey).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const relative = dateKey === todayKey ? "Today" : dateKey === shiftDate(todayKey, -1) ? "Yesterday" : DAY_NAMES[weekday];
  const reached = { plan: true, workout: stage !== "plan" || day.exercises.length > 0, done: day.completed };

  return (
    <div>
      <div className={styles.dateBar}>
        <button className={styles.iconBtn} onClick={() => setDateKey(shiftDate(dateKey, -1))} aria-label="Previous day">
          ‹
        </button>
        <div className={styles.dateText}>
          <div className={styles.dateMain}>{relative}</div>
          <div className={styles.subtitle}>
            {dateLabel}
            {day.title ? ` · ${title}` : ""}
            {dateKey !== todayKey && (
              <>
                {" · "}
                <button className={styles.linkBtn} style={{ padding: 0 }} onClick={() => setDateKey(todayKey)}>
                  Today
                </button>
              </>
            )}
          </div>
        </div>
        <button className={styles.iconBtn} onClick={() => setDateKey(shiftDate(dateKey, 1))} aria-label="Next day">
          ›
        </button>
      </div>

      <nav className={styles.stepper} aria-label="Workout steps">
        {STEPS.map((st, i) => (
          <button
            key={st.id}
            className={`${styles.step} ${stage === st.id ? styles.stepOn : ""}`}
            disabled={!reached[st.id]}
            onClick={() => goTo(st.id)}
            aria-current={stage === st.id ? "step" : undefined}
          >
            {i + 1} · {st.label}
          </button>
        ))}
      </nav>

      {stage === "plan" && (
        <PlanStep
          state={state}
          day={day}
          dateKey={dateKey}
          edit={edit}
          planned={planDay}
          onUseRoutine={() => setChoosing(true)}
          addCustom={(name) => {
            const id = customId(name);
            update((s) =>
              s.custom?.some((c) => c.id === id) ? s : { ...s, custom: [...(s.custom ?? []), { id, name: name.trim().slice(0, 80) }] },
            );
            return id;
          }}
          onStart={() => window.scrollTo({ top: 0 })}
        />
      )}

      {stage === "workout" && (
        <WorkoutStep state={state} update={update} day={day} dateKey={dateKey} edit={edit} onSetDone={onSetDone} goTo={goTo} />
      )}

      {stage === "done" && (
        <SessionSummary
          state={state}
          dateKey={dateKey}
          day={day}
          title={title}
          onEditTime={(startedAt, finishedAt) =>
            edit((d) => {
              d.startedAt = startedAt;
              d.finishedAt = finishedAt;
              d.timeManual = true;
            })
          }
          onSetBodyWeight={(bw) => update((st) => ({ ...st, settings: { ...st.settings, bodyWeight: bw } }))}
          onBack={() => goTo("workout")}
        />
      )}

      {choosing && (
        <WorkoutPicker
          plan={state.plan}
          weekday={weekday}
          currentTitle={day.title}
          overridden={false}
          onPick={pickWorkout}
          onReset={() => pickWorkout(weekday, false)}
          onClose={() => setChoosing(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Step 2

function WorkoutStep({ state, update, day, dateKey, edit, onSetDone, goTo }) {
  const [swapIndex, setSwapIndex] = useState(null); // exercise being swapped
  const [undo, setUndo] = useState(null); // { prev, message } after moving exercises to the next day
  const units = state.settings.units;

  const nextKey = shiftDate(dateKey, 1);
  const nextLabel = DAY_NAMES[weekdayOf(nextKey)];
  const unfinished = day.exercises.map((e, i) => (e.sets.some((x) => !x.done) ? i : -1)).filter((i) => i >= 0);

  // Push unfinished sets to the next day; keeps the previous state so the move can be undone.
  const postpone = (indexes) => {
    const { state: next, moved } = postponeExercises(state, dateKey, indexes, nextKey, (id) => EXERCISE_BY_ID[id]?.name ?? id);
    if (!moved.length) return;
    const prev = state;
    update(() => next);
    setUndo({ prev, message: `Moved ${moved.length > 1 ? `${moved.length} exercises` : moved[0]} to ${nextLabel}` });
  };

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 8000);
    return () => clearTimeout(t);
  }, [undo]);

  const move = (index, by) =>
    edit((d) => {
      const to = index + by;
      if (to < 0 || to >= d.exercises.length) return;
      const [ex] = d.exercises.splice(index, 1);
      d.exercises.splice(to, 0, ex);
    });

  const finish = () => {
    edit((d) => {
      d.completed = true;
      d.stage = "done";
      if (!d.timeManual) d.finishedAt = Date.now(); // keep a time the person entered by hand
    });
    window.scrollTo({ top: 0 });
  };

  return (
    <div>
      {LIFTS.filter((l) => !liftSkipped(state, day, l, dateKey)).map((lift) => (
        <LiftBlock key={lift.key} state={state} day={day} dateKey={dateKey} lift={lift} edit={edit} onSetDone={onSetDone} />
      ))}

      {day.exercises.map((ex, index) => (
        <ExerciseCard
          key={`${ex.exId}-${index}`}
          ex={ex}
          index={index}
          count={day.exercises.length}
          units={units}
          last={lastPerformance(state.logs, ex.exId, dateKey)}
          progressive={isProgressive(state.settings) || isBikini(state.settings)}
          settings={state.settings}
          edit={edit}
          onMove={(by) => move(index, by)}
          onSwap={() => setSwapIndex(index)}
          onPostpone={() => postpone([index])}
          nextLabel={nextLabel}
          dayLabel={(k) => DAY_NAMES[weekdayOf(k)]}
          nextName={EXERCISE_BY_ID[day.exercises[index + 1]?.exId]?.name}
          onSetDone={onSetDone}
        />
      ))}

      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnBlock}`} style={{ marginBottom: 10 }} onClick={() => goTo("plan")}>
        + Add exercises
      </button>

      <div className={styles.card}>
        <WorkoutTime
          key={`${day.startedAt}-${day.finishedAt}`}
          dateKey={dateKey}
          startedAt={day.startedAt}
          finishedAt={day.finishedAt}
          onSave={(startedAt, finishedAt) =>
            edit((d) => {
              d.startedAt = startedAt;
              d.finishedAt = finishedAt;
              d.timeManual = true;
            })
          }
        />
        <textarea
          className={styles.textarea}
          style={{ marginTop: 10 }}
          aria-label="Notes"
          placeholder="Notes"
          value={day.notes}
          onChange={(e) => edit((d) => (d.notes = e.target.value))}
        />
        {unfinished.length > 0 && (
          <button className={styles.linkBtn} style={{ marginTop: 6 }} onClick={() => postpone(unfinished)}>
            Move unfinished to {nextLabel} →
          </button>
        )}
      </div>

      {undo && (
        <div className={styles.toast} role="status">
          <span>{undo.message}</span>
          <button
            className={`${styles.btn} ${styles.btnSmall}`}
            onClick={() => {
              update(() => undo.prev);
              setUndo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}

      <div className={styles.stickyCta}>
        <button className={`${styles.btn} ${styles.btnBlock} ${styles.btnPrimary}`} onClick={finish}>
          Finish workout
        </button>
      </div>

      {swapIndex != null && day.exercises[swapIndex] && (
        <SwapSheet
          exId={day.exercises[swapIndex].exId}
          onClose={() => setSwapIndex(null)}
          onPick={(newId) => {
            edit((d) => {
              const ex = d.exercises[swapIndex];
              ex.exId = newId;
              // Numbers typed for the old exercise don't apply to the new one.
              ex.sets = ex.sets.map((set) => (set.done ? set : newSet()));
            });
            setSwapIndex(null);
          }}
        />
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  index,
  count,
  units,
  last,
  progressive,
  settings,
  edit,
  onMove,
  onSwap,
  onSetDone,
  nextName,
  onPostpone,
  nextLabel,
  dayLabel,
}) {
  const info = EXERCISE_BY_ID[ex.exId];
  const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
  // Progressive overload: next step from last time (more weight once every set hits the top reps).
  const assisted = Boolean(info?.assisted);
  const next = progressive ? accessoryTarget(last, ex.targetReps, settings, assisted) : null;

  const writeSet = (i, fn) => edit((d) => (d.exercises[index].sets[i] = fn(d.exercises[index].sets[i])));

  const lastText = last ? last.sets.map((s) => `${s.weight || "BW"}×${s.reps || "?"}`).join(", ") : null;
  const meta = [
    `${ex.targetSets} × ${ex.targetReps}`,
    ex.note,
    lastText && `last ${lastText}`,
    ex.carriedFrom && `from ${dayLabel(ex.carriedFrom)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={`${styles.card} ${allDone ? styles.cardDone : ""}`}>
      <div className={styles.sectionHead}>
        <div className={styles.grow}>
          <h3 className={styles.h3}>{info?.name ?? ex.exId}</h3>
          <div className={styles.exMeta}>{meta}</div>
          {next && (
            <div className={styles.exMeta} style={{ color: "var(--accent)" }}>
              ↑ {next.text}
            </div>
          )}
        </div>
        <HowTo exercise={info} />
        <MoreMenu
          title={info?.name ?? "Exercise"}
          actions={[
            { label: "↑ Move up", onClick: () => onMove(-1), hidden: index === 0 },
            { label: "↓ Move down", onClick: () => onMove(1), hidden: index === count - 1 },
            { label: "⇄ Swap for another exercise", onClick: onSwap },
            { label: "+ Add a set", onClick: () => edit((d) => d.exercises[index].sets.push(newSet())) },
            { label: "− Remove a set", onClick: () => edit((d) => d.exercises[index].sets.pop()), hidden: ex.sets.length <= 1 },
            { label: `→ Do the rest on ${nextLabel}`, onClick: onPostpone, hidden: allDone },
            { label: "Remove exercise", onClick: () => edit((d) => d.exercises.splice(index, 1)), danger: true },
          ]}
        />
      </div>

      <SetTable
        sets={ex.sets}
        units={units}
        weightLabel={assisted ? `Assist ${units}` : undefined}
        placeholder={(i) => ({
          weight: next?.weight || last?.sets[i]?.weight || last?.sets[last.sets.length - 1]?.weight || null,
          reps: ex.targetReps,
        })}
        onChange={(i, field, value) => writeSet(i, (s) => ({ ...s, [field]: value }))}
        onToggle={(i, ph) => {
          if (!ex.sets[i].done) {
            // What the rest timer shows as next: this exercise's next open set, else the next exercise.
            const open = ex.sets.findIndex((s, k) => k !== i && !s.done);
            const name = info?.name ?? "this exercise";
            onSetDone?.(undefined, open >= 0 ? `${name} · set ${open + 1} of ${ex.sets.length}` : (nextName ?? "finish your workout"));
          }
          writeSet(i, (s) => toggleSet(s, ph));
        }}
      />
    </section>
  );
}
