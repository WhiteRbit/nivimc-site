"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./workout.module.css";
import TodayView from "./TodayView";
import WeekView from "./WeekView";
import ProgressView from "./ProgressView";
import LibraryView from "./LibraryView";
import SettingsView from "./SettingsView";
import { RestTimer, useInstallPrompt, useRestTimer, useUpdateCheck, useWakeLock } from "./PhoneTools";
import { DEFAULT_PLAN, DEFAULT_SETTINGS, PLAN_VERSION, migratePlan, squatStreak, toKey } from "@/lib/workout/program";

const STORAGE_KEY = "nivimc-workout-v1";

const TABS = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "progress", label: "Progress" },
  { id: "library", label: "Library" },
  { id: "settings", label: "Settings" },
];

function freshState() {
  return {
    version: PLAN_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    plan: JSON.parse(JSON.stringify(DEFAULT_PLAN)),
    logs: {},
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    const base = freshState();
    return {
      version: PLAN_VERSION,
      settings: { ...base.settings, ...saved.settings },
      plan: saved.plan ? migratePlan(saved.plan, saved.version ?? 1) : base.plan,
      logs: saved.logs || {},
    };
  } catch {
    return freshState();
  }
}

export default function WorkoutApp() {
  const [state, setState] = useState(loadState); // client-only component, see WorkoutLoader
  const [tab, setTab] = useState("today");
  const [dateKey, setDateKey] = useState(() => toKey(new Date()));
  const todayKey = toKey(new Date());
  const [rest, startRest, setRest, audioRef] = useRestTimer();
  const wake = useWakeLock();
  const installer = useInstallPrompt();
  const updateAvailable = useUpdateCheck();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked — the session still works in memory
    }
  }, [state]);

  // Offline support for the installed app (production builds only).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/workout-sw.js", { scope: "/workout" }).catch(() => {});
  }, []);

  const update = useCallback((fn) => setState((s) => fn(s)), []);
  const onSetDone = (seconds) => startRest(seconds ?? state.settings.restSeconds);

  const streak = squatStreak(state.logs, todayKey);
  const openDay = (key) => {
    setDateKey(key);
    setTab("today");
  };

  return (
    <div className={styles.app} id="workout-app">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Squat Every Day</h1>
          <div className={styles.subtitle}>
            Daily tracker · Strength Training Anatomy routines · v{process.env.NEXT_PUBLIC_APP_VERSION}
          </div>
        </div>
        <div className={styles.streak}>
          <span className={styles.streakNum}>{streak}</span>
          day squat streak
        </div>
      </header>

      {updateAvailable && (
        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`}
          style={{ marginBottom: 12 }}
          onClick={() => window.location.reload()}
        >
          ↻ New version available · Update
        </button>
      )}

      {(wake.supported || installer.canInstall) && (
        <div className={styles.row} style={{ marginBottom: 12 }}>
          {wake.supported && (
            <button
              className={`${styles.btn} ${styles.btnSmall} ${wake.on ? styles.btnPrimary : ""}`}
              onClick={() => wake.setOn(!wake.on)}
              aria-pressed={wake.on}
            >
              {wake.on ? "☀ Screen stays on" : "☀ Keep screen on"}
            </button>
          )}
          {installer.canInstall && (
            <button className={`${styles.btn} ${styles.btnSmall}`} onClick={installer.install}>
              ⬇ Install app
            </button>
          )}
        </div>
      )}

      <nav className={styles.tabs} aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "today" && (
        <TodayView state={state} update={update} dateKey={dateKey} setDateKey={setDateKey} todayKey={todayKey} onSetDone={onSetDone} />
      )}
      {tab === "week" && <WeekView state={state} update={update} todayKey={todayKey} openDay={openDay} />}
      {tab === "progress" && <ProgressView state={state} openDay={openDay} />}
      {tab === "library" && <LibraryView state={state} update={update} />}
      {tab === "settings" && <SettingsView state={state} update={update} reset={() => setState(freshState())} installer={installer} />}

      {rest && <RestTimer key={rest.endsAt - rest.total * 1000} rest={rest} setRest={setRest} audioRef={audioRef} />}
    </div>
  );
}
