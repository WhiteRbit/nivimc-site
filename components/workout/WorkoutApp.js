"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./workout.module.css";
import TodayView from "./TodayView";
import WeekView from "./WeekView";
import ProgressView from "./ProgressView";
import LibraryView from "./LibraryView";
import SettingsView from "./SettingsView";
import PlanView from "./PlanView";
import { RestTimer, useInstallPrompt, useRestTimer, useUpdateCheck, useWakeLock } from "./PhoneTools";
import {
  DEFAULT_PLAN,
  DEFAULT_SETTINGS,
  PLAN_VERSION,
  isBikini,
  isProgressive,
  migratePlan,
  migrateSettings,
  squatStreak,
  toKey,
  workoutsThisWeek,
} from "@/lib/workout/program";
import { phaseOf, weekOf, yearOf } from "@/lib/workout/bikini";
import { registerCustom } from "@/lib/workout/exercises";

const STORAGE_KEY = "nivimc-workout-v1";

export const APP_NAME = "Sculpt";

// The Bikini Pro plan shows its own Plan tab; the other programs keep the editable Week.
const tabsFor = (bikini) => [
  { id: "today", label: "Today" },
  bikini ? { id: "plan", label: "Plan" } : { id: "week", label: "Week" },
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
    custom: [], // exercises added by name
    milestones: {}, // Bikini Pro checkpoints ticked off
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
      settings: migrateSettings({ ...base.settings, ...saved.settings }, saved.version ?? 1),
      plan: saved.plan ? migratePlan(saved.plan, saved.version ?? 1) : base.plan,
      logs: saved.logs || {},
      custom: saved.custom || [],
      milestones: saved.milestones || {},
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
  registerCustom(state.custom); // idempotent: makes added exercises visible everywhere

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

  const bikini = isBikini(state.settings);
  const perWeek = bikini || isProgressive(state.settings);
  // Squat every day counts the streak; the other programs count sessions this week.
  const streak = perWeek ? workoutsThisWeek(state.logs, todayKey) : squatStreak(state.logs, todayKey);
  const visibleTab = tab === "plan" && !bikini ? "week" : tab === "week" && bikini ? "plan" : tab;
  const openDay = (key) => {
    setDateKey(key);
    setTab("today");
  };

  return (
    <div className={styles.app} id="workout-app">
      <header className={styles.header}>
        <div className={styles.grow}>
          <h1 className={styles.title}>{APP_NAME}</h1>
          {bikini && (
            <div className={styles.exMeta}>
              {phaseOf(todayKey).name} · Year {yearOf(todayKey)} · Week {weekOf(todayKey)}
            </div>
          )}
        </div>
        <div className={styles.row} style={{ gap: 6, flexWrap: "nowrap" }}>
          <span className={styles.pill} title={perWeek ? "Workouts this week" : "Day squat streak"}>
            {perWeek ? `${streak} this week` : `🔥 ${streak}`}
          </span>
          {wake.supported && (
            <button
              className={styles.iconBtn}
              onClick={() => wake.setOn(!wake.on)}
              aria-pressed={wake.on}
              aria-label="Keep screen on"
              title={wake.on ? "Screen stays on" : "Keep screen on"}
            >
              ☀
            </button>
          )}
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

      <nav className={styles.tabs} aria-label="Sections">
        {tabsFor(bikini).map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${visibleTab === t.id ? styles.tabActive : ""}`}
            onClick={() => setTab(t.id)}
            aria-current={visibleTab === t.id ? "page" : undefined}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {visibleTab === "today" && (
        <TodayView state={state} update={update} dateKey={dateKey} setDateKey={setDateKey} todayKey={todayKey} onSetDone={onSetDone} />
      )}
      {visibleTab === "plan" && <PlanView state={state} todayKey={todayKey} openDay={openDay} />}
      {visibleTab === "week" && <WeekView state={state} update={update} todayKey={todayKey} openDay={openDay} />}
      {visibleTab === "progress" && <ProgressView state={state} update={update} openDay={openDay} />}
      {visibleTab === "library" && <LibraryView state={state} update={update} />}
      {visibleTab === "settings" && (
        <SettingsView state={state} update={update} reset={() => setState(freshState())} installer={installer} />
      )}

      {rest && <RestTimer key={rest.endsAt - rest.total * 1000} rest={rest} setRest={setRest} audioRef={audioRef} />}
    </div>
  );
}
