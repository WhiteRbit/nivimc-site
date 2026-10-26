"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./workout.module.css";

// ------------------------------------------------------------ Rest timer

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function beep(ctx) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // audio unavailable — the vibration and on-screen message still fire
  }
}

// Returns [rest, startRest, setRest]. Call startRest(seconds) from a tap so audio can unlock.
export function useRestTimer() {
  const [rest, setRest] = useState(null); // { endsAt, total }
  const audioRef = useRef(null);

  const startRest = (seconds) => {
    const total = Number(seconds) || 0;
    if (total <= 0) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !audioRef.current) audioRef.current = new AC();
      audioRef.current?.resume?.();
    } catch {
      audioRef.current = null;
    }
    setRest({ endsAt: Date.now() + total * 1000, total });
  };

  return [rest, startRest, setRest, audioRef];
}

export function RestTimer({ rest, setRest, audioRef }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, Math.ceil((rest.endsAt - now) / 1000));
  const finished = left === 0;

  useEffect(() => {
    if (!finished) return;
    navigator.vibrate?.([200, 100, 200]);
    beep(audioRef.current);
    const t = setTimeout(() => setRest(null), 5000);
    return () => clearTimeout(t);
  }, [finished, setRest, audioRef]);

  const pct = Math.min(100, ((rest.total - left) / rest.total) * 100);

  return (
    <div className={`${styles.timer} ${finished ? styles.timerDone : ""}`} role="timer" aria-live="polite">
      <div className={styles.timerBar} style={{ width: `${pct}%` }} />
      <div className={styles.timerBody}>
        <div>
          <div className={styles.label}>{finished ? "Rest over" : "Rest"}</div>
          <div className={styles.timerNum}>{finished ? "Next set" : fmt(left)}</div>
        </div>
        <div className={styles.row}>
          {!finished && (
            <button
              className={styles.btn}
              onClick={() => setRest((r) => ({ total: r.total + 30, endsAt: r.endsAt + 30000 }))}
            >
              +30s
            </button>
          )}
          <button className={styles.btn} onClick={() => setRest(null)}>
            {finished ? "OK" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------- Keep screen on

export function useWakeLock() {
  const [on, setOn] = useState(false);
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  useEffect(() => {
    if (!on || !supported) return;
    let lock = null;
    let active = true;
    const acquire = async () => {
      try {
        const l = await navigator.wakeLock.request("screen");
        if (active) lock = l;
        else l.release();
      } catch {
        // denied (e.g. low battery) — nothing else to do
      }
    };
    const onVisible = () => document.visibilityState === "visible" && acquire();
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release();
    };
  }, [on, supported]);

  return { on, setOn, supported };
}

// -------------------------------------------------------------- Install

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// Captures Chrome/Android's install prompt so we can offer our own button.
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    setPromptEvent(null);
  };

  return { canInstall: Boolean(promptEvent), installed, install };
}
