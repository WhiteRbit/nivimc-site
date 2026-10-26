"use client";

import { useRef, useState } from "react";
import styles from "./workout.module.css";
import { isIOS } from "./PhoneTools";

const NUMBER_FIELDS = [
  { key: "startingTop", label: "First daily-max target", unit: true },
  { key: "barWeight", label: "Empty bar weight", unit: true },
  { key: "increment", label: "Progression step (and plate rounding)", unit: true },
  { key: "backoffPct", label: "Back-off weight (% of top set)", suffix: "%" },
  { key: "backoffSets", label: "Back-off sets" },
  { key: "backoffReps", label: "Back-off reps" },
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
      update((s) => ({ settings: { ...s.settings, ...data.settings }, plan: data.plan, logs: data.logs }));
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
              onClick={() => set("units", u)}
            >
              {u}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 8 }}>Switching units only changes the label — numbers you&apos;ve already logged aren&apos;t converted.</p>
      </section>

      <section className={styles.card}>
        <div className={styles.label}>Squat Every Day settings</div>
        <ul className={styles.list} style={{ marginTop: 4 }}>
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
          How the app progresses you: log your top set and its RPE. RPE 8 or easier → next heavy day adds one step. RPE 9 →
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
        (Human Kinetics). The daily squat follows the idea of Cory Gregory&apos;s &quot;Squat Every Day&quot; program: squat every
        day, work up to a clean daily max without grinding, then do back-off sets. The exact percentages here are this
        app&apos;s defaults, not the official program — tune them to you. This is a tracker, not medical advice; stop if
        something hurts.
      </p>
    </div>
  );
}
