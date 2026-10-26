"use client";

import styles from "./workout.module.css";

// Editable rows of weight × reps with a done check.
// Blank cells show `placeholder(i)` and get filled with it when the set is checked off.
export default function SetTable({ sets, units, placeholder, onChange, onToggle, labelFor }) {
  return (
    <table className={styles.sets}>
      <thead>
        <tr>
          <th>Set</th>
          <th>{units}</th>
          <th>Reps</th>
          <th aria-label="Done" />
        </tr>
      </thead>
      <tbody>
        {sets.map((s, i) => {
          const ph = placeholder ? placeholder(i) : {};
          return (
            <tr key={i} className={s.done ? styles.setDone : undefined}>
              <td className={styles.setIdx}>{labelFor ? labelFor(i) : i + 1}</td>
              <td>
                <input
                  className={`${styles.input} ${styles.num}`}
                  inputMode="decimal"
                  value={s.weight}
                  placeholder={ph.weight != null ? String(ph.weight) : "–"}
                  onChange={(e) => onChange(i, "weight", e.target.value)}
                  aria-label={`Set ${i + 1} weight`}
                />
              </td>
              <td>
                <input
                  className={`${styles.input} ${styles.num}`}
                  inputMode="numeric"
                  value={s.reps}
                  placeholder={ph.reps != null ? String(ph.reps) : "–"}
                  onChange={(e) => onChange(i, "reps", e.target.value)}
                  aria-label={`Set ${i + 1} reps`}
                />
              </td>
              <td>
                <button
                  className={`${styles.check} ${s.done ? styles.checkOn : ""}`}
                  onClick={() => onToggle(i, ph)}
                  aria-pressed={s.done}
                  aria-label={s.done ? `Set ${i + 1} done` : `Mark set ${i + 1} done`}
                >
                  ✓
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Toggle a set's done flag, filling blank cells from the placeholder when completing.
export function toggleSet(set, ph = {}) {
  const done = !set.done;
  if (!done) return { ...set, done };
  const firstNumber = (v) => {
    const m = String(v ?? "").match(/\d+(\.\d+)?/);
    return m ? m[0] : "";
  };
  return {
    ...set,
    done,
    weight: set.weight === "" && ph.weight != null ? firstNumber(ph.weight) : set.weight,
    reps: set.reps === "" && ph.reps != null ? firstNumber(ph.reps) : set.reps,
  };
}
