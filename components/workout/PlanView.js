"use client";

import styles from "./workout.module.css";
import { EXERCISE_BY_ID } from "@/lib/workout/exercises";
import { DAY_NAMES, shiftDate, weekdayOf } from "@/lib/workout/program";
import {
  MACROS,
  MACRO_RULES,
  PHASES,
  PLAN_RULES,
  bikiniDay,
  macroKey,
  monthsIn,
  phaseOf,
  stageNotes,
  weekOf,
  yearOf,
} from "@/lib/workout/bikini";

// The Bikini Pro plan at a glance: where you are, this week's split, macros and the road ahead.
export default function PlanView({ todayKey, openDay }) {
  const phase = phaseOf(todayKey);
  const notes = stageNotes(todayKey);
  const mKey = macroKey(todayKey);
  const macros = MACROS.find((m) => m.key === mKey);
  // Monday-first week containing today.
  const monday = shiftDate(todayKey, -((weekdayOf(todayKey) + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));

  return (
    <div>
      <section className={`${styles.card} ${styles.squatCard}`}>
        <div className={styles.exMeta}>
          Year {yearOf(todayKey)} · Month {(monthsIn(todayKey) % 12) + 1} · Week {weekOf(todayKey)}
        </div>
        <h3 className={styles.h3} style={{ marginTop: 2 }}>
          {phase.name}
        </h3>
        <p style={{ marginTop: 4 }}>{phase.goal}</p>
        {notes.map((n) => (
          <p key={n} className={styles.notice}>
            {n}
          </p>
        ))}
      </section>

      <section className={styles.card}>
        <span className={styles.sectionTitle}>This week</span>
        <ul className={styles.list}>
          {week.map((k) => {
            const day = bikiniDay(k);
            const names = (day.ex ?? []).map((e) => EXERCISE_BY_ID[e.exId]?.name).filter(Boolean);
            return (
              <li key={k} className={styles.exRow}>
                <div className={styles.grow}>
                  <div className={styles.exName} style={k === todayKey ? { color: "var(--accent)" } : undefined}>
                    {DAY_NAMES[weekdayOf(k)].slice(0, 3)} · {day.title}
                  </div>
                  <div className={styles.exMeta}>{day.rest ? "Walk, stretch, sleep." : names.join(" · ")}</div>
                </div>
                {!day.rest && (
                  <button className={styles.linkBtn} onClick={() => openDay(k)}>
                    Open
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Macros now</span>
          <span className={styles.exMeta}>{macros.phase}</span>
        </div>
        <div className={styles.macroGrid}>
          {[
            ["Calories", macros.cal],
            ["Protein", macros.p],
            ["Fat", macros.f],
            ["Carbs", macros.c],
          ].map(([label, value]) => (
            <div key={label} className={styles.macro}>
              <div className={styles.macroValue}>{value}</div>
              <div className={styles.exMeta}>{label}</div>
            </div>
          ))}
        </div>
        <details className={styles.more}>
          <summary>All phases and rules</summary>
          <ul className={styles.list}>
            {MACROS.map((m) => (
              <li key={m.key} className={styles.exRow}>
                <div className={styles.grow}>
                  <div className={styles.exName} style={m.key === mKey ? { color: "var(--accent)" } : undefined}>
                    {m.phase}
                  </div>
                  <div className={styles.exMeta}>
                    {m.cal} kcal · P {m.p} · F {m.f} · C {m.c}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <ul className={styles.bullets}>
            {MACRO_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      </section>

      <section className={styles.card}>
        <span className={styles.sectionTitle}>The 6-year road</span>
        <ul className={styles.list}>
          {PHASES.map((p) => {
            const current = p.id === phase.id;
            return (
              <li key={p.id} className={styles.phaseRow}>
                <details open={current}>
                  <summary>
                    <span className={styles.exName} style={current ? { color: "var(--accent)" } : undefined}>
                      {p.name}
                    </span>
                    <span className={styles.exMeta}> · {p.when}</span>
                  </summary>
                  <p style={{ marginTop: 6 }}>{p.goal}</p>
                  <ul className={styles.bullets}>
                    {p.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.card}>
        <details className={styles.more} style={{ marginTop: 0 }}>
          <summary>Rules for every phase</summary>
          <ul className={styles.bullets}>
            {PLAN_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
