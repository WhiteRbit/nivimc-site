"use client";

import { useRef, useState } from "react";
import styles from "./workout.module.css";
import { isIOS } from "./PhoneTools";
import { PLAN_VERSION, convertUnits, migratePlan } from "@/lib/workout/program";

const NUMBER_FIELDS = [
  { key: "bodyWeight", label: "Your body weight (for calorie estimates)", unit: true },
  { key: "startingTop", label: "Starting top-set weight (first day)", unit: true },
  { key: "barWeight", label: "Empty bar weight", unit: true },
  { key: "increment", label: "Progression step (and plate rounding)", unit: true },
  { key: "startPct", label: "First pyramid set (% of top set)", suffix: "%" },
  { key: "lightPct", label: "Light day weight (% of last top set)", suffix: "%" },
  { key: "lightSets", label: "Light day sets" },
  { key: "lightReps", label: "Light day reps" },
  { key: "restSeconds", label: "Rest timer after a set (0 = off)", suffix: "s" },
  { key: "squatRestSeconds", label: "Rest timer after a squat set", suffix: "s" },
];

export default function SettingsView({ state, update, reset, installer }) {
  const { settings } = state;
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");

  const set = (key, value) => update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workout-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || !data.logs || !data.plan) throw new Error("bad file");
      update((s) => ({
        version: PLAN_VERSION,
        settings: { ...s.settings, ...data.settings },
        plan: migratePlan(data.plan, data.version ?? 1),
        logs: data.logs,
      }));
      setMsg("Backup restored.");
    } catch {
      setMsg("That file doesn't look like a workout backup.");
    }
  };

  return (
    <div>
      <section className={styles.card}>
        <div className={styles.label}>Put it on your phone</div>
        {installer.installed ? (
          <p style={{ marginTop: 6 }}>Installed — you&apos;re using the home-screen app. It works offline at the gym.</p>
        ) : installer.canInstall ? (
          <>
            <p style={{ marginTop: 6 }}>Add it to your home screen: full screen, its own icon, and it works offline.</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 10 }} onClick={installer.install}>
              Install app
            </button>
          </>
        ) : isIOS() ? (
          <ol className={styles.steps}>
            <li>Open this page in Safari.</li>
            <li>
              Tap the <strong>Share</strong> button (square with an arrow).
            </li>
            <li>
              Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
            </li>
          </ol>
        ) : (
          <ol className={styles.steps}>
            <li>Open this page in Chrome.</li>
            <li>
              Tap the <strong>⋮</strong> menu.
            </li>
            <li>
              Choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.
            </li>
          </ol>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.label}>Units</div>
        <div className={styles.row} style={{ marginTop: 8 }}>
          {["kg", "lb"].map((u) => (
            <button
              key={u}
              className={`${styles.btn} ${settings.units === u ? styles.btnPrimary : ""}`}
              onClick={() => update((s) => convertUnits(s, u))}
            >
              {u}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 8 }}>
          Switching converts everything: your logged weights, squat target, bar weight (20 kg ⇄ 45 lb) and progression step
          (2.5 kg ⇄ 5 lb).
        </p>
      </section>

      <section className={styles.card}>
        <div className={styles.label}>Squat Every Day settings</div>
        <ul className={styles.list} style={{ marginTop: 4 }}>
          <li className={styles.listItem}>
            <span className={styles.grow} style={{ fontSize: "0.9rem" }}>
              Pyramid reps per set
            </span>
            <input
              className={styles.input}
              style={{ width: 130, textAlign: "center" }}
              value={settings.pyramidReps}
              onChange={(e) => set("pyramidReps", e.target.value)}
              aria-label="Pyramid reps per set"
            />
          </li>
          {NUMBER_FIELDS.map((f) => (
            <li key={f.key} className={styles.listItem}>
              <span className={styles.grow} style={{ fontSize: "0.9rem" }}>
                {f.label}
              </span>
              <input
                className={`${styles.input} ${styles.num}`}
                inputMode="decimal"
                value={settings[f.key]}
                onChange={(e) => {
                  const v = e.target.value;
                  set(f.key, v === "" ? "" : Number(v) || 0);
                }}
                aria-label={f.label}
              />
              <span className={styles.subtitle} style={{ width: 20 }}>
                {f.unit ? settings.units : f.suffix || ""}
              </span>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 8 }}>
          The squat is a pyramid: the first set is light for the most reps, then every set adds weight and drops reps up
          to the top set. Rate the top set after you finish: RPE 8 or easier → next heavy day adds one step. RPE 9 →
          repeat the weight. RPE 10 → drop about 10% and rebuild.
        </p>
      </section>

      <section className={styles.card}>
        <div className={styles.label}>Your data</div>
        <p style={{ marginTop: 6 }}>
          Everything is saved in this browser only. Export a backup now and then, especially before clearing your browser or
          switching phones.
        </p>
        <div className={styles.row} style={{ marginTop: 10 }}>
          <button className={styles.btn} onClick={exportData}>
            Export backup
          </button>
          <button className={styles.btn} onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) importData(e.target.files[0]);
              e.target.value = "";
            }}
          />
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => {
              if (window.confirm("Delete all logged workouts and reset the plan? This can't be undone.")) {
                reset();
                setMsg("Everything was reset.");
              }
            }}
          >
            Reset everything
          </button>
        </div>
        {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
      </section>

      <p className={styles.note}>
        Exercises, page numbers and form cues are drawn from Frédéric Delavier&apos;s <em>Strength Training Anatomy</em>{" "}
        (Human Kinetics). Exercise photos come from the Free Exercise DB (github.com/yuhonas/free-exercise-db). The daily squat follows the idea of Cory Gregory&apos;s &quot;Squat Every Day&quot; program: squat every
        day, pyramiding from light high-rep sets up to a clean heavy top set without grinding. The exact numbers here are this
        app&apos;s defaults, not the official program — tune them to you. This is a tracker, not medical advice; stop if
        something hurts.
      </p>
    </div>
  );
}
