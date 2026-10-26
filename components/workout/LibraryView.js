"use client";

import { useMemo, useState } from "react";
import styles from "./workout.module.css";
import HowTo from "./HowTo";
import MuscleMap, { MapLegend } from "./MuscleMap";
import { REGIONS, musclesFor } from "@/lib/workout/muscles";
import { ACTIVE_EXERCISES, ACTIVE_GROUPS, sourceLabel } from "@/lib/workout/exercises";
import { DAY_NAMES } from "@/lib/workout/program";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

// Browse every exercise in the book and add any to a weekday in the plan.
export default function LibraryView({ state, update }) {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(null);
  const [muscle, setMuscle] = useState(null); // region tapped on the body map

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ACTIVE_EXERCISES.filter(
      (e) =>
        (group === "all" || e.group === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q)) &&
        (!muscle || musclesFor(e.id).primary.includes(muscle)),
    );
  }, [group, query, muscle]);

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
        {ACTIVE_EXERCISES.length} exercises: the lifts from <em>Strength Training Anatomy</em> (with book page) plus core work, each with form cues.
      </p>
      <section className={styles.card}>
        <div className={styles.label}>Tap a muscle to find exercises for it</div>
        <div style={{ marginTop: 8 }}>
          <MuscleMap primary={muscle ? [muscle] : []} size="lg" onRegion={(r) => setMuscle(muscle === r ? null : r)} />
        </div>
        <div className={`${styles.row} ${styles.between}`} style={{ marginTop: 8 }}>
          <span style={{ fontWeight: 600 }}>{muscle ? `${REGIONS[muscle]} · ${results.length} exercises` : "All muscles"}</span>
          {muscle && (
            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => setMuscle(null)}>
              Clear
            </button>
          )}
        </div>
      </section>

      <div className={styles.row} style={{ marginBottom: 8 }}>
        <input
          className={`${styles.input} ${styles.grow}`}
          placeholder="Search name or muscle…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={styles.select} value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Chapter">
          <option value="all">All chapters</option>
          {ACTIVE_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <MapLegend />
      </div>

      {results.map((e) => (
        <section key={e.id} className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.grow}>
              <h3 className={styles.h3}>{e.name}</h3>
              <div className={styles.muscles}>{e.muscles}</div>
              <span className={styles.pill} style={{ marginTop: 8 }}>
                {sourceLabel(e)}
              </span>
            </div>
            <MuscleMap {...musclesFor(e.id)} size="sm" />
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
