"use client";

import { useMemo, useState } from "react";
import styles from "./workout.module.css";
import { EXERCISES, GROUPS } from "@/lib/workout/exercises";

// Modal list of every exercise in the book, filterable by chapter and name.
export default function ExercisePicker({ title, initialGroup = "all", onPick, onClose }) {
  const [group, setGroup] = useState(initialGroup);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (e) =>
        (group === "all" || e.group === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q)),
    );
  }, [group, query]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className={`${styles.row} ${styles.between}`}>
          <h3 className={styles.h3}>{title}</h3>
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={onClose}>
            Close
          </button>
        </div>
        <div className={styles.row} style={{ marginTop: 12 }}>
          <input
            className={`${styles.input} ${styles.grow}`}
            placeholder="Search name or muscle…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <select className={styles.select} value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Chapter">
            <option value="all">All chapters</option>
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <ul className={styles.list} style={{ marginTop: 8 }}>
          {results.map((e) => (
            <li key={e.id} className={styles.listItem}>
              <div className={styles.grow}>
                <div style={{ fontWeight: 600 }}>{e.name}</div>
                <div className={styles.muscles}>
                  {e.muscles} · p. {e.page}
                </div>
              </div>
              <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => onPick(e.id)}>
                Choose
              </button>
            </li>
          ))}
          {!results.length && <li className={styles.empty}>No matches.</li>}
        </ul>
      </div>
    </div>
  );
}
