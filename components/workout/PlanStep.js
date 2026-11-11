"use client";

import { useState } from "react";
import styles from "./workout.module.css";
import ExRow from "./ExRow";
import SwapSheet from "./SwapSheet";
import MuscleMap from "./MuscleMap";
import { liftPlan, liftSkipped, nextLiftDay } from "./LiftBlock";
import { ACTIVE_EXERCISES, EXERCISE_BY_ID, searchExercises } from "@/lib/workout/exercises";
import { suggestFor } from "@/lib/workout/angles";
import { REGIONS, musclesFor } from "@/lib/workout/muscles";
import { LIFTS, isBikini, isProgressive } from "@/lib/workout/program";
import { newSet } from "@/lib/workout/log";
import { buildWorkout, exerciseMinutes } from "@/lib/workout/builder";
import { bikiniDay, stageNotes } from "@/lib/workout/bikini";

// Step 1: daily lifts at the top, then pick muscles on the body and get exercises that
// cover each one from every angle. "Add to today's workout" moves on to step 2.
export default function PlanStep({ state, day, dateKey, edit, planned, onUseRoutine, onStart, addCustom }) {
  const [regions, setRegions] = useState([]); // tapped muscles, in tap order
  const [choice, setChoice] = useState({}); // row key → chosen exercise id
  const [switching, setSwitching] = useState(null); // { exId, preferred, onPick } while the switch sheet is open
  const [builtSwap, setBuiltSwap] = useState({}); // built plan: suggested exercise id → switched-to id
  const [on, setOn] = useState({}); // row key → ticked
  const [extra, setExtra] = useState([]); // other exercises ticked from a muscle's full list or the search
  const [query, setQuery] = useState(""); // find an exercise by name
  const units = state.settings.units;
  const progressive = isProgressive(state.settings);
  const bikini = isBikini(state.settings);
  const [showAll, setShowAll] = useState({}); // region → full exercise list open

  const inWorkout = day.exercises.map((e) => e.exId);

  // Bikini Pro plan: today's session leads. Each exercise can be unticked or switched,
  // and "Short on time?" keeps only the first ones that fit.
  const session = bikini ? bikiniDay(dateKey) : null;
  const [sessionOff, setSessionOff] = useState({}); // planned exercise id → unticked
  const [sessionSwap, setSessionSwap] = useState({}); // planned exercise id → switched-to id
  const [fit, setFit] = useState(null); // minutes to fit the session into
  const sessionRows = (session?.ex ?? [])
    .map((e) => ({ ...e, planned: e.exId, exId: sessionSwap[e.exId] ?? e.exId }))
    .filter((e) => !inWorkout.includes(e.exId));
  // Running total of minutes after each exercise.
  const sessionTimes = sessionRows.reduce((acc, e) => [...acc, (acc.at(-1) ?? 0) + exerciseMinutes(state.settings, e.sets)], []);
  const fitTime = sessionTimes.at(-1) ?? 0;
  const sessionFits = sessionTimes.map((t) => !fit || t <= fit);
  const sessionChosen = sessionRows.filter((e, i) => !sessionOff[e.planned] && sessionFits[i]);
  const trimSession = Boolean(session && !session.rest && sessionRows.length); // time chips trim the plan
  const addSession = (d) => {
    for (const e of sessionChosen) {
      if (d.exercises.some((x) => x.exId === e.exId)) continue;
      d.exercises.push({
        exId: e.exId,
        targetSets: e.sets,
        targetReps: e.reps,
        note: e.note,
        sets: Array.from({ length: e.sets }, newSet),
      });
    }
    if (!d.title && sessionChosen.length) d.title = session.title;
  };
  const rows = suggestFor(regions, inWorkout);
  const pick = (r) => choice[r.key] ?? r.exId;
  const isOn = (r) => (on[r.key] ?? r.on) && Boolean(pick(r));
  const chosen = rows.filter(isOn);
  const picked = new Set([...inWorkout, ...sessionRows.map((e) => e.exId), ...rows.map(pick).filter(Boolean)]);
  // Every other exercise that mainly works the muscle, so nothing is hidden.
  const othersFor = (region) => ACTIVE_EXERCISES.filter((e) => musclesFor(e.id).primary.includes(region) && !picked.has(e.id));
  const extraChosen = extra.filter((id) => !picked.has(id));
  const total = sessionChosen.length + chosen.length + extraChosen.length;

  const toggleExtra = (id, v) => setExtra((cur) => (v ? [...cur, id] : cur.filter((x) => x !== id)));
  const found = query.trim() ? searchExercises(query).filter((e) => !picked.has(e.id)) : []; // already in the workout or suggested above: left out
  const fromSearch = extraChosen.filter((id) => !regions.some((r) => musclesFor(id).primary.includes(r)));

  const toggleRegion = (r) => setRegions((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]));

  const lightNow = LIFTS.map((l) => liftPlan(state, day, dateKey, l).isLight).some(Boolean);

  // "Build it for me": fit the session into the minutes available.
  const [minutes, setMinutes] = useState(null);
  const built =
    minutes &&
    buildWorkout({
      settings: state.settings,
      logs: state.logs,
      dateKey,
      regions,
      minutes,
      taken: inWorkout,
      lifts: LIFTS.map((l) => ({
        ...l,
        light: liftPlan(state, day, dateKey, l).isLight,
        skipped: liftSkipped(state, day, l, dateKey),
      })),
    });

  const builtItems = built
    ? built.items.map((it) => ({
        ...it,
        exId: builtSwap[it.exId] ?? it.exId,
        suggested: it.exId,
      }))
    : [];

  const useBuilt = () => {
    edit((d) => {
      for (const key of built.dropped) d[key].skip = true;
      for (const it of builtItems) {
        if (d.exercises.some((e) => e.exId === it.exId)) continue;
        d.exercises.push({
          exId: it.exId,
          targetSets: it.sets,
          targetReps: it.reps,
          sets: Array.from({ length: it.sets }, newSet),
        });
      }
      for (const exId of extraChosen) {
        if (!d.exercises.some((e) => e.exId === exId))
          d.exercises.push({
            exId,
            targetSets: 3,
            targetReps: "10-12",
            sets: [newSet(), newSet(), newSet()],
          });
      }
      if (!d.title) d.title = built.regions.length ? built.regions.map((r) => REGIONS[r]).join(" + ") : "Daily lifts";
      d.plannedMinutes = minutes;
      d.stage = "workout";
    });
    setMinutes(null);
    setRegions([]);
    setBuiltSwap({});
    setExtra([]);
    setQuery("");
    onStart();
  };

  const add = () => {
    edit((d) => {
      addSession(d);
      for (const r of chosen) {
        const exId = pick(r);
        if (d.exercises.some((e) => e.exId === exId)) continue;
        d.exercises.push({
          exId,
          targetSets: 3,
          targetReps: r.angle.reps,
          sets: [newSet(), newSet(), newSet()],
        });
      }
      for (const exId of extraChosen) {
        if (!d.exercises.some((e) => e.exId === exId))
          d.exercises.push({
            exId,
            targetSets: 3,
            targetReps: "10-12",
            sets: [newSet(), newSet(), newSet()],
          });
      }
      if (!d.title && regions.length) d.title = regions.map((r) => REGIONS[r]).join(" + ");
      d.stage = "workout";
    });
    setRegions([]);
    setChoice({});
    setOn({});
    setExtra([]);
    setQuery("");
    setSessionOff({});
    setSessionSwap({});
    setFit(null);
    onStart();
  };

  const liftSummary = (lift) => {
    const { isLight, target, sets } = liftPlan(state, day, dateKey, lift);
    if (isLight) return `Light · ${sets.length} × ${sets[0].reps} at ${sets[0].weight} ${units}`;
    if (progressive) return `${sets.length} × ${sets[0].reps} at ${target.weight} ${units}`;
    return `${sets[0].weight} → ${target.weight} ${units} · ${sets.map((x) => x.reps).join("-")}`;
  };

  return (
    <div>
      {/* ---------------------------------------------------------- Bikini Pro session */}
      {session && (
        <section className={`${styles.card} ${styles.squatCard}`}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>{session.title}</span>
            <span className={styles.exMeta}>Bikini Pro{session.deload ? " · deload" : ""}</span>
          </div>
          {stageNotes(dateKey).map((n) => (
            <p key={n} className={styles.notice}>
              {n}
            </p>
          ))}
          {session.rest ? (
            <p style={{ marginTop: 6 }}>
              Rest and recover: an easy walk, stretching and good sleep. Recovery is when the muscle gets built.
            </p>
          ) : (
            <>
              <ul className={styles.list}>
                {sessionRows.map((e, i) => (
                  <ExRow
                    key={e.planned}
                    exId={e.exId}
                    meta={`${e.sets} × ${e.reps}${e.build ? ` · ${e.build}` : ""}${e.note ? ` · ${e.note}` : ""}${sessionFits[i] ? "" : " · doesn't fit"}`}
                    checked={!sessionOff[e.planned] && sessionFits[i]}
                    onCheck={(v) => setSessionOff((m) => ({ ...m, [e.planned]: !v }))}
                    onSwitch={() =>
                      setSwitching({
                        exId: e.exId,
                        region: musclesFor(e.exId).primary[0],
                        exclude: [...inWorkout, ...sessionRows.map((x) => x.exId)],
                        onPick: (id) => {
                          setSessionSwap((m) => ({ ...m, [e.planned]: id }));
                          setSessionOff((m) => ({ ...m, [e.planned]: false }));
                        },
                      })
                    }
                  />
                ))}
              </ul>
              {!sessionRows.length && <p style={{ marginTop: 6 }}>All of today&apos;s session is in your workout.</p>}
              {session.lower && state.settings.lowerNote && (
                <p className={styles.exMeta} style={{ marginTop: 8 }}>
                  {state.settings.lowerNote}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* ---------------------------------------------------------- Main lifts */}
      <section className={`${styles.card} ${bikini ? "" : styles.squatCard}`}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>{bikini ? "Squat & deadlift pyramids" : "Main lifts"}</span>
          {bikini && <span className={styles.exMeta}>optional</span>}
          {!progressive && !bikini && (
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={lightNow}
                onChange={(e) =>
                  edit((d) => {
                    for (const l of LIFTS) {
                      d[l.key].light = e.target.checked;
                      d[l.key].sets = d[l.key].sets.filter((x) => x.done); // planned numbers change with the day type
                    }
                  })
                }
              />
              Light day
            </label>
          )}
        </div>
        <ul className={styles.list}>
          {LIFTS.map((lift) => {
            const skipped = liftSkipped(state, day, lift, dateKey);
            const next = progressive && skipped && day[lift.key].skip == null ? nextLiftDay(state, lift, dateKey) : null;
            const canSkip = progressive || bikini || lift.key === "deadlift";
            return (
              <li key={lift.key} className={styles.exRow}>
                <div className={styles.grow} style={{ opacity: skipped ? 0.5 : 1 }}>
                  <div className={styles.exName}>{lift.name}</div>
                  <div className={styles.exMeta}>
                    {skipped
                      ? next
                        ? `Rest day · next ${next}`
                        : bikini && day[lift.key].skip == null
                          ? liftSummary(lift)
                          : "Skipped today"
                      : liftSummary(lift)}
                  </div>
                </div>
                {canSkip && (
                  <button className={styles.linkBtn} onClick={() => edit((d) => (d[lift.key].skip = !skipped))}>
                    {skipped ? "Add" : "Skip"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------------------------------------------------- Muscles + search */}
      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>Add muscles</span>
          {regions.length === 0 && planned?.items?.length > 0 && (
            <button className={styles.linkBtn} onClick={onUseRoutine}>
              Saved routine
            </button>
          )}
        </div>
        <div style={{ marginTop: 6 }}>
          <MuscleMap primary={regions} size="md" onRegion={toggleRegion} />
        </div>
        {regions.length > 0 && (
          <div className={styles.chipScroll}>
            {regions.map((r) => (
              <button key={r} className={`${styles.chip} ${styles.chipOn}`} onClick={() => toggleRegion(r)}>
                {REGIONS[r]} ✕
              </button>
            ))}
          </div>
        )}
        <input
          type="search"
          className={styles.input}
          style={{ width: "100%", marginTop: 10, boxSizing: "border-box" }}
          placeholder="🔍  Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises by name"
        />
        {query.trim() && (
          <ul className={styles.list} style={{ marginTop: 4 }}>
            {found.slice(0, 15).map((e) => (
              <ExRow key={e.id} exId={e.id} meta={e.muscles} checked={extra.includes(e.id)} onCheck={(v) => toggleExtra(e.id, v)} />
            ))}
            {!found.some((e) => e.name.toLowerCase() === query.trim().toLowerCase()) && (
              <li className={styles.exRow}>
                <button
                  className={styles.linkBtn}
                  onClick={() => {
                    toggleExtra(addCustom(query), true);
                    setQuery("");
                  }}
                >
                  + Add “{query.trim()}” as your own exercise
                </button>
              </li>
            )}
          </ul>
        )}
        {fromSearch.length > 0 && (
          <div className={styles.chipScroll}>
            {fromSearch.map((id) => (
              <button key={id} className={`${styles.chip} ${styles.chipOn}`} onClick={() => toggleExtra(id, false)}>
                {EXERCISE_BY_ID[id]?.name} ✕
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- Suggestions */}
      {!built &&
        regions.map((region) => {
          const others = othersFor(region);
          return (
            <section key={region} className={styles.card}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionTitle}>{REGIONS[region]}</span>
                {others.length > 0 && (
                  <button className={styles.linkBtn} onClick={() => setShowAll((m) => ({ ...m, [region]: !m[region] }))}>
                    {showAll[region] ? "Show less" : `All ${others.length + rows.filter((r) => r.region === region).length}`}
                  </button>
                )}
              </div>
              <ul className={styles.list}>
                {rows
                  .filter((r) => r.region === region)
                  .map((r) => (
                    <ExRow
                      key={r.key}
                      exId={pick(r)}
                      meta={pick(r) ? `3 × ${r.angle.reps}` : "No exercise left for this angle"}
                      checked={isOn(r)}
                      onCheck={pick(r) ? (v) => setOn((o) => ({ ...o, [r.key]: v })) : undefined}
                      onSwitch={
                        pick(r)
                          ? () =>
                              setSwitching({
                                exId: pick(r),
                                region: r.region,
                                preferred: { label: r.angle.label, ids: r.angle.options },
                                exclude: [...inWorkout, ...rows.filter((x) => x.key !== r.key).map(pick)].filter(Boolean),
                                onPick: (id) => {
                                  setChoice((c) => ({ ...c, [r.key]: id }));
                                  setOn((o) => ({ ...o, [r.key]: true }));
                                },
                              })
                          : undefined
                      }
                    />
                  ))}
                {showAll[region] &&
                  others.map((e) => (
                    <ExRow key={e.id} exId={e.id} meta={e.muscles} checked={extra.includes(e.id)} onCheck={(v) => toggleExtra(e.id, v)} />
                  ))}
              </ul>
            </section>
          );
        })}

      {/* ---------------------------------------------------------- Build for time */}
      <section className={styles.card}>
        <span className={styles.sectionTitle}>Short on time?</span>
        <div className={styles.chipScroll}>
          {[20, 30, 45, 60, 75, 90].map((m) => {
            const on = (trimSession ? fit : minutes) === m;
            return (
              <button
                key={m}
                className={`${styles.chip} ${on ? styles.chipOn : ""}`}
                onClick={() => (trimSession ? setFit(on ? null : m) : setMinutes(on ? null : m))}
                aria-pressed={on}
              >
                {m} min
              </button>
            );
          })}
        </div>
        {trimSession && (
          <div className={styles.exMeta} style={{ marginTop: 6 }}>
            {fit
              ? `Keeps the first ${sessionFits.filter(Boolean).length} of ${sessionRows.length} exercises (~${sessionTimes.filter((t) => t <= fit).at(-1) ?? 0} min).`
              : `Today's session takes about ${fitTime} min. Pick a time to keep the first exercises that fit.`}
          </div>
        )}

        {built && (
          <>
            <ul className={styles.list} style={{ marginTop: 6 }}>
              {built.lifts.map((l) => (
                <li key={l.key} className={styles.exRow}>
                  <div className={styles.grow}>
                    <div className={styles.exName}>{l.name}</div>
                    <div className={styles.exMeta}>~{l.minutes} min</div>
                  </div>
                </li>
              ))}
              {builtItems.map((it) => (
                <ExRow
                  key={it.suggested}
                  exId={it.exId}
                  meta={`${REGIONS[it.region]} · ${it.sets} × ${it.reps} · ~${it.minutes} min`}
                  onSwitch={() =>
                    setSwitching({
                      exId: it.exId,
                      region: it.region,
                      preferred: { label: it.angle, ids: it.options },
                      exclude: builtItems.map((x) => x.exId),
                      onPick: (id) => setBuiltSwap((m) => ({ ...m, [it.suggested]: id })),
                    })
                  }
                />
              ))}
            </ul>
            <div className={styles.exMeta} style={{ marginTop: 6 }}>
              ~{built.total} of {minutes} min{built.notes.length ? ` · ${built.notes.join(" ")}` : ""}
            </div>
          </>
        )}
      </section>

      {day.exercises.length > 0 && (
        <p style={{ margin: "4px 2px 10px" }}>
          In today&apos;s workout: {day.exercises.map((e) => EXERCISE_BY_ID[e.exId]?.name).join(", ")}
        </p>
      )}

      {switching && (
        <SwapSheet
          exId={switching.exId}
          region={switching.region}
          preferred={switching.preferred}
          exclude={switching.exclude}
          onClose={() => setSwitching(null)}
          onPick={(id) => {
            switching.onPick(id);
            setSwitching(null);
          }}
        />
      )}

      <div className={styles.stickyCta}>
        {built ? (
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={useBuilt}>
            Start {minutes}-min workout{extraChosen.length ? ` + ${extraChosen.length}` : ""}
          </button>
        ) : (
          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`} onClick={add}>
            {total > 0
              ? `Start · ${total} exercise${total > 1 ? "s" : ""}`
              : day.exercises.length || !LIFTS.some((l) => !liftSkipped(state, day, l, dateKey))
                ? "Go to workout"
                : "Start with main lifts"}
          </button>
        )}
      </div>
    </div>
  );
}
