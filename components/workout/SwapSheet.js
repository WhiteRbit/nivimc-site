"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import HowTo from "./HowTo";
import MuscleMap, { MapLegend } from "./MuscleMap";
import { ACTIVE_EXERCISES, EXERCISE_BY_ID, searchExercises, sourceLabel } from "@/lib/workout/exercises";
import { REGIONS, alternativesFor, musclesFor } from "@/lib/workout/muscles";
import { photosFor } from "@/lib/workout/photos";
import { LIFTS } from "@/lib/workout/program";

const DAILY_LIFTS = new Set(LIFTS.map((l) => l.exId));

// Bottom sheet listing exercises that work the same area as `exId`.
// `preferred` ({ label, ids }) puts a group first, e.g. the other options for the same angle.
// `region` keeps the rest of the list to that muscle; `exclude` hides exercises already in use. `keepLabel`, when given, shows a "keep this swap"
// checkbox (checked by default).
export default function SwapSheet({ exId, region, preferred, exclude = [], keepLabel, onPick, onClose }) {
  const [keep, setKeep] = useState(true);
  const [query, setQuery] = useState(""); // search every exercise by name
  const current = EXERCISE_BY_ID[exId];
  const target = musclesFor(exId).primary;
  const hidden = new Set([exId, ...exclude, ...DAILY_LIFTS]);

  const first = (preferred?.ids ?? []).filter((id) => !hidden.has(id)).map((id) => EXERCISE_BY_ID[id]);
  const firstIds = new Set(first.map((e) => e.id));
  // `region` narrows the list to exercises that mainly work that muscle (e.g. the one picked on the body map).
  const area = region ? [region] : target;
  const rest = alternativesFor(exId, ACTIVE_EXERCISES).filter(
    (a) => !hidden.has(a.exercise.id) && !firstIds.has(a.exercise.id) && (!region || musclesFor(a.exercise.id).primary.includes(region)),
  );

  // Typing a name searches the whole library, not just this muscle.
  const found = query.trim() ? searchExercises(query).filter((e) => !hidden.has(e.id)) : null;
  const worksText = (id) =>
    musclesFor(id)
      .primary.map((r) => REGIONS[r])
      .join(", ");

  const item = (e, works) => (
    <li key={e.id} className={styles.swapItem}>
      <div className={styles.cardHead}>
        <div className={styles.grow}>
          <div style={{ fontWeight: 700 }}>{e.name}</div>
          <div className={styles.muscles}>
            {works} · {sourceLabel(e)}
          </div>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={() => onPick(e.id, keep)}>
              Use this
            </button>
            <HowTo exercise={e} />
          </div>
        </div>
        {photosFor(e.id) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photosFor(e.id)[0]} alt="" className={styles.thumb} style={{ marginTop: 0 }} loading="lazy" />
        ) : (
          <MuscleMap {...musclesFor(e.id)} size="sm" />
        )}
      </div>
    </li>
  );

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Swap exercise">
        <div className={`${styles.row} ${styles.between}`}>
          <div className={styles.label}>Switch exercise</div>
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.cardHead} style={{ marginTop: 8 }}>
          <div className={styles.grow}>
            <h3 className={styles.h3}>{current?.name}</h3>
            <p style={{ marginTop: 4 }}>
              Works: <strong style={{ color: "var(--text)" }}>{target.map((r) => REGIONS[r]).join(", ")}</strong>
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

        <input
          type="search"
          className={styles.input}
          style={{ width: "100%", marginTop: 12 }}
          placeholder="Search any exercise by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises by name"
        />

        {found && (
          <>
            <div className={styles.label} style={{ marginTop: 14 }}>
              {found.length ? `${found.length} found for “${query.trim()}”` : `Nothing found for “${query.trim()}”`}
            </div>
            <ul className={styles.list}>{found.slice(0, 20).map((e) => item(e, worksText(e.id)))}</ul>
          </>
        )}

        {!found && first.length > 0 && (
          <>
            <div className={styles.label} style={{ marginTop: 14 }}>
              Same angle · {preferred.label}
            </div>
            <ul className={styles.list}>{first.map((e) => item(e, worksText(e.id)))}</ul>
          </>
        )}

        {!found && rest.length > 0 && (
          <>
            <div className={styles.label} style={{ marginTop: 14 }}>
              Also works {area.map((r) => REGIONS[r]).join(" / ")}
            </div>
            <ul className={styles.list}>
              {rest.map(({ exercise: e, shared }) => item(e, `Works ${shared.map((r) => REGIONS[r]).join(", ")}`))}
            </ul>
          </>
        )}

        {!found && !first.length && !rest.length && <p style={{ marginTop: 12 }}>No other exercises for this area.</p>}

        <div style={{ marginTop: 12 }}>
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
