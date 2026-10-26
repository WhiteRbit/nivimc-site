"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import MuscleMap from "./MuscleMap";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { musclesFor } from "@/lib/workout/muscles";
import { DAY_NAMES } from "@/lib/workout/program";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

// Main and helper muscles across a whole routine, for its body map.
function routineMuscles(items) {
  const primary = new Set();
  const secondary = new Set();
  for (const it of items) {
    const m = musclesFor(it.exId);
    m.primary.forEach((r) => primary.add(r));
    m.secondary.forEach((r) => secondary.add(r));
  }
  return { primary: [...primary], secondary: [...secondary].filter((r) => !primary.has(r)) };
}

// Bottom sheet for training a different day's routine (muscle group) today.
export default function WorkoutPicker({ plan, weekday, currentTitle, overridden, onPick, onReset, onClose }) {
  const [swapDays, setSwapDays] = useState(false);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Change workout">
        <div className={`${styles.row} ${styles.between}`}>
          <div className={styles.label}>Change {DAY_NAMES[weekday]}&apos;s workout</div>
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={onClose}>
            Close
          </button>
        </div>
        <p style={{ marginTop: 6 }}>Pick the muscle group you want to train. The back squat stays as it is.</p>

        <label className={styles.toggle} style={{ marginTop: 10 }}>
          <input type="checkbox" checked={swapDays} onChange={(e) => setSwapDays(e.target.checked)} />
          Also swap the two days in my weekly plan
        </label>

        {overridden && (
          <button className={`${styles.btn} ${styles.btnBlock}`} style={{ marginTop: 12 }} onClick={onReset}>
            ↺ Back to the planned {plan[weekday]?.title || DAY_NAMES[weekday]} workout
          </button>
        )}

        <ul className={styles.list} style={{ marginTop: 8 }}>
          {ORDER.filter((wd) => plan[wd]?.items?.length).map((wd) => {
            const day = plan[wd];
            const isCurrent = day.title === currentTitle;
            return (
              <li key={wd} className={styles.swapItem}>
                <div className={styles.cardHead}>
                  <div className={styles.grow}>
                    <div style={{ fontWeight: 700 }}>
                      {day.title || DAY_NAMES[wd]}
                      {isCurrent && (
                        <span className={`${styles.pill} ${styles.pillAccent}`} style={{ marginLeft: 8 }}>
                          Today
                        </span>
                      )}
                    </div>
                    <div className={styles.muscles}>
                      Planned for {DAY_NAMES[wd]} · {day.items.map((it) => EXERCISE_BY_ID[it.exId]?.name).join(", ")}
                    </div>
                    {!isCurrent && (
                      <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                        style={{ marginTop: 8 }}
                        onClick={() => onPick(wd, swapDays)}
                      >
                        Do this today
                      </button>
                    )}
                  </div>
                  <MuscleMap {...routineMuscles(day.items)} size="sm" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
