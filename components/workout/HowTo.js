"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import ExercisePhotos from "./ExercisePhotos";
import { photosFor } from "@/lib/workout/photos";
import { sticksFor } from "@/lib/workout/sticks";

// Collapsible how-to: demonstration photos plus form cues paraphrased from the book.
export default function HowTo({ exercise }) {
  const [open, setOpen] = useState(false);
  if (!exercise) return null;
  return (
    <>
      <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Hide how-to" : "▶ How to do it"}
      </button>
      {open && (
        <div className={styles.howto}>
          {photosFor(exercise.id) || sticksFor(exercise.id) ? (
            <ExercisePhotos exId={exercise.id} name={exercise.name} />
          ) : (
            <p style={{ marginBottom: 8 }}>No photo for this one yet — follow the steps below.</p>
          )}
          <div className={styles.label}>
            {exercise.page ? `Strength Training Anatomy · p. ${exercise.page}` : "Core exercise · not in the book"}
          </div>
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
