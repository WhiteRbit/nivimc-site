"use client";

import styles from "./workout.module.css";
import HowTo from "./HowTo";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { photosFor } from "@/lib/workout/photos";

// Compact exercise line: optional tick, small photo, name + one meta line, then actions.
export default function ExRow({ exId, meta, checked, onCheck, onSwitch, children }) {
  const e = EXERCISE_BY_ID[exId];
  const photo = photosFor(exId)?.[0];
  return (
    <li className={styles.exRow}>
      {onCheck && (
        <input
          type="checkbox"
          className={styles.bigCheck}
          checked={checked}
          onChange={(ev) => onCheck(ev.target.checked)}
          aria-label={`Include ${e?.name}`}
        />
      )}
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className={styles.exThumb} loading="lazy" />
      ) : (
        <span className={styles.exThumb} aria-hidden="true" />
      )}
      <div className={styles.grow}>
        <div className={styles.exName}>{e?.name ?? "—"}</div>
        {meta && <div className={styles.exMeta}>{meta}</div>}
      </div>
      {children}
      {onSwitch && (
        <button className={styles.iconBtn} onClick={onSwitch} aria-label={`Switch ${e?.name}`} title="Switch">
          ⇄
        </button>
      )}
      <HowTo exercise={e} />
    </li>
  );
}
