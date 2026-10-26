"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import { fromKey } from "@/lib/workout/program";

const pad = (n) => String(n).padStart(2, "0");
const clock = (ms) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function fmtDuration(ms) {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${pad(min % 60)}`;
}

// Workout start time and length, editable for sessions logged after the fact.
// `onSave(startedAt, finishedAt)` receives ms timestamps on the workout's date.
export default function WorkoutTime({ dateKey, startedAt, finishedAt, onSave }) {
  const tracked = startedAt && finishedAt && finishedAt > startedAt;
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(startedAt ? clock(startedAt) : "18:00");
  const [minutes, setMinutes] = useState(tracked ? String(Math.round((finishedAt - startedAt) / 60000)) : "60");

  const save = () => {
    const [h, m] = start.split(":").map(Number);
    const mins = Number(minutes);
    if (!Number.isFinite(h) || !Number.isFinite(m) || !(mins > 0)) return;
    const s = fromKey(dateKey);
    s.setHours(h, m, 0, 0);
    onSave(s.getTime(), s.getTime() + mins * 60000);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className={`${styles.row} ${styles.between}`}>
        <div>
          <div className={styles.label}>Workout time</div>
          <div style={{ fontWeight: 700, marginTop: 2 }}>
            {tracked
              ? `${fmtDuration(finishedAt - startedAt)} · ${clock(startedAt)}–${clock(finishedAt)}`
              : startedAt
                ? `Started ${clock(startedAt)}`
                : "Not tracked"}
          </div>
        </div>
        <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => setEditing(true)}>
          ✎ {tracked ? "Edit" : "Set time"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.label}>Workout time</div>
      <div className={styles.row} style={{ marginTop: 8 }}>
        <label className={styles.timeField}>
          Started
          <input type="time" className={styles.input} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className={styles.timeField}>
          Length (min)
          <input
            className={`${styles.input} ${styles.num}`}
            inputMode="numeric"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
          />
        </label>
      </div>
      <div className={styles.row} style={{ marginTop: 10 }}>
        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={save}>
          Save
        </button>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`} onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
