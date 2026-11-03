"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import ExercisePhotos from "./ExercisePhotos";
import { photosFor } from "@/lib/workout/photos";
import { sticksFor } from "@/lib/workout/sticks";

// "?" button that opens a sheet with demonstration photos and form cues from the book.
// `text` shows a labelled button instead of the icon.
export default function HowTo({ exercise, text }) {
  const [open, setOpen] = useState(false);
  if (!exercise) return null;
  return (
    <>
      {text ? (
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={() => setOpen(true)}>
          {text}
        </button>
      ) : (
        <button className={styles.iconBtn} onClick={() => setOpen(true)} aria-label={`How to do ${exercise.name}`} title="How to do it">
          ?
        </button>
      )}
      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} role="presentation">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={exercise.name}>
            <div className={styles.sectionHead}>
              <h3 className={styles.h3}>{exercise.name}</h3>
              <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className={styles.howto}>
              {photosFor(exercise.id) || sticksFor(exercise.id) ? <ExercisePhotos exId={exercise.id} name={exercise.name} /> : null}
              <ol>
                {exercise.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              {exercise.tip && <div className={styles.tip}>{exercise.tip}</div>}
              <div className={styles.exMeta} style={{ marginTop: 10 }}>
                {exercise.page ? `Strength Training Anatomy · p. ${exercise.page}` : "Core exercise · not in the book"}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
