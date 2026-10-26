"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import ExercisePicker from "./ExercisePicker";
import SwapSheet from "./SwapSheet";
import { REGIONS, musclesFor } from "@/lib/workout/muscles";
import { EXERCISE_BY_ID, sourceLabel } from "@/lib/workout/exercises";
import { DAY_NAMES, DEFAULT_PLAN, pyramidReps, shiftDate, weekdayOf } from "@/lib/workout/program";

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

// Editor for the weekly template. Changes apply to days you haven't logged yet.
export default function WeekView({ state, update, todayKey, openDay }) {
  const [picker, setPicker] = useState(null); // weekday being added to
  const [swap, setSwap] = useState(null); // { wd, i } of the item being swapped
  const { plan, settings } = state;
  const todayWd = weekdayOf(todayKey);

  const editDay = (wd, fn) =>
    update((s) => {
      const next = JSON.parse(JSON.stringify(s.plan));
      next[wd] = next[wd] || { title: "", items: [] };
      fn(next[wd]);
      return { ...s, plan: next };
    });

  const toggleLight = (wd) =>
    update((s) => {
      const has = s.settings.lightDays.includes(wd);
      const lightDays = has ? s.settings.lightDays.filter((d) => d !== wd) : [...s.settings.lightDays, wd];
      return { ...s, settings: { ...s.settings, lightDays } };
    });

  // Date of weekday `wd` in the current Monday-to-Sunday week.
  const dateFor = (wd) => {
    const pos = (w) => (w + 6) % 7;
    return shiftDate(todayKey, pos(wd) - pos(todayWd));
  };

  return (
    <div>
      <p style={{ marginBottom: 12 }}>
        Every day starts with the back squat. The rest is a bodybuilding split built from the book — with no separate leg day, because your
        legs get trained daily. Edits here apply to days you haven&apos;t logged yet.
      </p>

      {ORDER.map((wd) => {
        const day = plan[wd] || { title: "", items: [] };
        const light = settings.lightDays.includes(wd);
        return (
          <section key={wd} className={`${styles.card} ${wd === todayWd ? styles.today : ""}`}>
            <div className={`${styles.row} ${styles.between}`}>
              <div className={styles.label}>
                {DAY_NAMES[wd]}
                {wd === todayWd && " · today"}
              </div>
              <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => openDay(dateFor(wd))}>
                Open
              </button>
            </div>
            <input
              className={styles.input}
              style={{ width: "100%", marginTop: 8, fontWeight: 700, boxSizing: "border-box" }}
              value={day.title}
              placeholder="Day name"
              onChange={(e) => editDay(wd, (d) => (d.title = e.target.value))}
              aria-label={`${DAY_NAMES[wd]} name`}
            />

            <ul className={styles.list} style={{ marginTop: 6 }}>
              <li className={styles.listItem}>
                <div className={styles.grow}>
                  <div style={{ fontWeight: 600 }}>Back Squat</div>
                  <div className={styles.muscles}>{light ? "Light / recovery sets" : `Pyramid ${pyramidReps(settings).join("-")} reps, light → heavy`}</div>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={light} onChange={() => toggleLight(wd)} />
                  Light
                </label>
              </li>
              {day.items.map((it, i) => (
                <li key={`${it.exId}-${i}`} className={`${styles.listItem} ${styles.planItem}`}>
                  <div className={styles.planName}>
                    <div style={{ fontWeight: 600 }}>{EXERCISE_BY_ID[it.exId]?.name ?? it.exId}</div>
                    <div className={styles.muscles}>
                      {musclesFor(it.exId)
                        .primary.map((r) => REGIONS[r])
                        .join(", ")}{" "}
                      · {sourceLabel(EXERCISE_BY_ID[it.exId])}
                    </div>
                  </div>
                  <div className={styles.planControls}>
                    <input
                      className={`${styles.input} ${styles.num}`}
                      style={{ width: 48 }}
                      inputMode="numeric"
                      value={it.sets}
                      onChange={(e) => editDay(wd, (d) => (d.items[i].sets = e.target.value.replace(/\D/g, "")))}
                      aria-label="Sets"
                    />
                    <span className={styles.subtitle}>×</span>
                    <input
                      className={`${styles.input} ${styles.num}`}
                      value={it.reps}
                      onChange={(e) => editDay(wd, (d) => (d.items[i].reps = e.target.value))}
                      aria-label="Reps"
                    />
                    <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={() => setSwap({ wd, i })}>
                      Swap
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                      disabled={i === 0}
                      onClick={() => editDay(wd, (d) => d.items.splice(i - 1, 0, d.items.splice(i, 1)[0]))}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                      onClick={() => editDay(wd, (d) => d.items.splice(i, 1))}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
              style={{ marginTop: 8 }}
              onClick={() => setPicker(wd)}
            >
              + Add exercise
            </button>
          </section>
        );
      })}

      <button
        className={`${styles.btn} ${styles.btnGhost} ${styles.btnBlock}`}
        onClick={() => {
          if (window.confirm("Replace your weekly plan with the default book-based split? Logged days are kept.")) {
            update((s) => ({ ...s, plan: JSON.parse(JSON.stringify(DEFAULT_PLAN)) }));
          }
        }}
      >
        Restore default plan
      </button>

      {swap && plan[swap.wd]?.items[swap.i] && (
        <SwapSheet
          exId={plan[swap.wd].items[swap.i].exId}
          onClose={() => setSwap(null)}
          onPick={(exId) => {
            editDay(swap.wd, (d) => (d.items[swap.i].exId = exId));
            setSwap(null);
          }}
        />
      )}

      {picker != null && (
        <ExercisePicker
          title={`Add to ${DAY_NAMES[picker]}`}
          onClose={() => setPicker(null)}
          onPick={(exId) => {
            editDay(picker, (d) => d.items.push({ exId, sets: 3, reps: "10" }));
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
