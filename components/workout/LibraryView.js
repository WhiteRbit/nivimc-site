"use client";

import { useMemo, useState } from "react";
import styles from "./workout.module.css";
import HowTo from "./HowTo";
import { EXERCISES, GROUPS } from "@/lib/workout/exercises";
import { DAY_NAMES } from "@/lib/workout/program";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

// Browse every exercise in the book and add any to a weekday in the plan.
export default function LibraryView({ state, update }) {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(
      (e) => (group === "all" || e.group === group) && (!q || e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q)),
    );
  }, [group, query]);

  const addTo = (exId, wd) => {
    update((s) => {
      const plan = JSON.parse(JSON.stringify(s.plan));
      plan[wd] = plan[wd] || { title: DAY_NAMES[wd], items: [] };
      plan[wd].items.push({ exId, sets: 3, reps: "10" });
      return { ...s, plan };
    });
    setAdded(`${exId}:${wd}`);
  };

  return (
    <div>
      <p style={{ marginBottom: 12 }}>
        All {EXERCISES.length} exercises from <em>Strength Training Anatomy</em>, with the book page and form cues.
      </p>
      <div className={styles.row} style={{ marginBottom: 12 }}>
        <input
          className={`${styles.input} ${styles.grow}`}
          placeholder="Search name or muscle…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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

      {results.map((e) => (
        <section key={e.id} className={styles.card}>
          <div className={`${styles.row} ${styles.between}`} style={{ alignItems: "flex-start" }}>
            <div className={styles.grow}>
              <h3 className={styles.h3}>{e.name}</h3>
              <div className={styles.muscles}>{e.muscles}</div>
            </div>
            <span className={styles.pill}>p. {e.page}</span>
          </div>
          <div className={styles.row} style={{ marginTop: 10 }}>
            <HowTo exercise={e} />
            <select
              className={`${styles.select} ${styles.btnSmall}`}
              value=""
              onChange={(ev) => ev.target.value !== "" && addTo(e.id, Number(ev.target.value))}
              aria-label={`Add ${e.name} to a day`}
            >
              <option value="">+ Add to day…</option>
              {ORDER.map((wd) => (
                <option key={wd} value={wd}>
                  {DAY_NAMES[wd]} — {state.plan[wd]?.title || "Rest"}
                </option>
              ))}
            </select>
            {added?.startsWith(`${e.id}:`) && (
              <span className={`${styles.pill} ${styles.pillOk}`}>Added to {DAY_NAMES[Number(added.split(":")[1])]}</span>
            )}
          </div>
        </section>
      ))}
      {!results.length && <p className={styles.empty}>No matches.</p>}
    </div>
  );
}
