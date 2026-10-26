"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import HowTo from "./HowTo";
import MuscleMap, { MapLegend } from "./MuscleMap";
import { EXERCISES, EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { REGIONS, alternativesFor, musclesFor } from "@/lib/workout/muscles";
import { SQUAT_EXERCISE_ID } from "@/lib/workout/program";

// Bottom sheet listing exercises that train the same main muscles as `exId`.
// `keepLabel`, when given, shows a "keep this swap" checkbox (checked by default).
export default function SwapSheet({ exId, keepLabel, onPick, onClose }) {
  const [keep, setKeep] = useState(true);
  const current = EXERCISE_BY_ID[exId];
  const target = musclesFor(exId).primary;
  const options = alternativesFor(exId, EXERCISES).filter((a) => a.exercise.id !== SQUAT_EXERCISE_ID);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Swap exercise">
        <div className={`${styles.row} ${styles.between}`}>
          <div className={styles.label}>Swap exercise</div>
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.cardHead} style={{ marginTop: 8 }}>
          <div className={styles.grow}>
            <h3 className={styles.h3}>{current?.name}</h3>
            <p style={{ marginTop: 4 }}>
              Same muscles: <strong style={{ color: "var(--text)" }}>{target.map((r) => REGIONS[r]).join(", ")}</strong>
            </p>
          </div>
          <MuscleMap {...musclesFor(exId)} size="sm" />
        </div>

        {keepLabel && (
          <label className={styles.toggle} style={{ marginTop: 10 }}>
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
            {keepLabel}
          </label>
        )}

        <div style={{ marginTop: 12 }}>
          <MapLegend />
        </div>

        <ul className={styles.list} style={{ marginTop: 4 }}>
          {options.map(({ exercise: e, shared }) => (
            <li key={e.id} className={styles.swapItem}>
              <div className={styles.cardHead}>
                <div className={styles.grow}>
                  <div style={{ fontWeight: 700 }}>{e.name}</div>
                  <div className={styles.muscles}>
                    Works {shared.map((r) => REGIONS[r]).join(", ")} · p. {e.page}
                  </div>
                  <div className={styles.row} style={{ marginTop: 8 }}>
                    <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={() => onPick(e.id, keep)}>
                      Use this
                    </button>
                    <HowTo exercise={e} />
                  </div>
                </div>
                <MuscleMap {...musclesFor(e.id)} size="sm" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
