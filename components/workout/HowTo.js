"use client";

import { useState } from "react";
import styles from "./workout.module.css";

// Collapsible form cues for an exercise, paraphrased from the book.
export default function HowTo({ exercise }) {
  const [open, setOpen] = useState(false);
  if (!exercise) return null;
  return (
    <>
      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Hide form cues" : "Form cues"}
      </button>
      {open && (
        <div className={styles.howto}>
          <div className={styles.label}>Strength Training Anatomy · p. {exercise.page}</div>
          <ol>
            {exercise.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {exercise.tip && <div className={styles.tip}>{exercise.tip}</div>}
        </div>
      )}
    </>
  );
}
