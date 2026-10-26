"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./workout.module.css";
import TodayView from "./TodayView";
import WeekView from "./WeekView";
import ProgressView from "./ProgressView";
import LibraryView from "./LibraryView";
import SettingsView from "./SettingsView";
import { DEFAULT_PLAN, DEFAULT_SETTINGS, squatStreak, toKey } from "@/lib/workout/program";

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
      settings: { ...base.settings, ...saved.settings },
      plan: saved.plan || base.plan,
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

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked — the session still works in memory
    }
  }, [state]);

  const update = useCallback((fn) => setState((s) => fn(s)), []);

  const streak = squatStreak(state.logs, todayKey);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Squat Every Day</h1>
          <div className={styles.subtitle}>Daily tracker · Strength Training Anatomy routines</div>
        </div>
        <div className={styles.streak}>
          <span className={styles.streakNum}>{streak}</span>
          day squat streak
        </div>
      </header>

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
        <TodayView state={state} update={update} dateKey={dateKey} setDateKey={setDateKey} todayKey={todayKey} />
      )}
      {tab === "week" && (
        <WeekView
          state={state}
          update={update}
          todayKey={todayKey}
          openDay={(key) => {
            setDateKey(key);
            setTab("today");
          }}
        />
      )}
      {tab === "progress" && (
        <ProgressView
          state={state}
          openDay={(key) => {
            setDateKey(key);
            setTab("today");
          }}
        />
      )}
      {tab === "library" && <LibraryView state={state} update={update} />}
      {tab === "settings" && <SettingsView state={state} update={update} reset={() => setState(freshState())} />}
    </div>
  );
}
