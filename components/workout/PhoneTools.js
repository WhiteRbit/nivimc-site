"use client";

import { useEffect, useRef, useState } from "react";
import { IS_ARTIFACT } from "@/lib/workout/env";
import styles from "./workout.module.css";

// ------------------------------------------------------------ Rest timer

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// A short tone. `freq`/`length` vary it: soft ticks for 3-2-1, a two-note chime at the end.
function beep(ctx, freq = 880, length = 0.5, volume = 0.25, delay = 0) {
  if (!ctx) return;
  try {
    const at = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.001, at + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + length);
  } catch {
    // audio unavailable — the vibration and on-screen message still fire
  }
}

// Returns [rest, startRest, setRest]. Call startRest(seconds, nextUp) from a tap so audio can unlock.
export function useRestTimer() {
  const [rest, setRest] = useState(null); // { endsAt, total, next }
  const audioRef = useRef(null);

  const startRest = (seconds, next = null) => {
    const total = Number(seconds) || 0;
    if (total <= 0) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !audioRef.current) audioRef.current = new AC();
      audioRef.current?.resume?.();
    } catch {
      audioRef.current = null;
    }
    setRest((r) => ({ endsAt: Date.now() + total * 1000, total, next, big: r?.big ?? false }));
  };

  return [rest, startRest, setRest, audioRef];
}

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

// Rest countdown: a ring that drains smoothly, shifts rose → amber (last 10 s) → green,
// ticks at 3-2-1 and chimes at zero. Tap the ring to switch to a full-screen view.
export function RestTimer({ rest, setRest, audioRef }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let frame;
    const tick = () => {
      setNow(Date.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const msLeft = Math.max(0, rest.endsAt - now);
  const left = Math.ceil(msLeft / 1000);
  const finished = msLeft === 0;
  const phase = finished ? "go" : left <= 10 ? "soon" : "rest";
  const fraction = Math.min(1, msLeft / (rest.total * 1000));

  // 3-2-1: a soft tick and a short buzz each second.
  useEffect(() => {
    if (left > 0 && left <= 3) {
      beep(audioRef.current, 660, 0.12, 0.12);
      navigator.vibrate?.(60);
    }
  }, [left, audioRef]);

  useEffect(() => {
    if (!finished) return;
    navigator.vibrate?.([200, 100, 200]);
    beep(audioRef.current, 880, 0.35);
    beep(audioRef.current, 1320, 0.5, 0.25, 0.18);
    const t = setTimeout(() => setRest(null), 6000);
    return () => clearTimeout(t);
  }, [finished, setRest, audioRef]);

  const adjust = (sec) =>
    setRest((r) => {
      const endsAt = Math.max(Date.now() + 1000, r.endsAt + sec * 1000);
      return { ...r, endsAt, total: Math.max(r.total + sec, Math.ceil((endsAt - Date.now()) / 1000)) };
    });
  const toggleBig = () => setRest((r) => ({ ...r, big: !r.big }));

  const ring = (
    <button className={styles.ringBtn} onClick={toggleBig} aria-label={rest.big ? "Make the timer small" : "Make the timer full screen"}>
      <svg viewBox="0 0 100 100" className={styles.ring} aria-hidden="true">
        <circle cx="50" cy="50" r={RING_R} className={styles.ringTrack} />
        <circle
          cx="50"
          cy="50"
          r={RING_R}
          className={styles.ringFill}
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - fraction)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className={styles.ringNum}>{finished ? "GO" : fmt(left)}</span>
    </button>
  );

  return (
    <div
      className={`${styles.timer} ${rest.big ? styles.timerBig : ""} ${styles["timer_" + phase]} ${left <= 3 && !finished ? styles.timerPulse : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={finished ? "Rest over" : `Rest: ${left} seconds left`}
    >
      {ring}
      <div className={styles.timerInfo}>
        <div className={styles.timerTitle}>{finished ? "Rest over · go!" : phase === "soon" ? "Get ready" : "Rest"}</div>
        <div className={styles.timerNext}>{rest.next ? `Next: ${rest.next}` : `${fmt(rest.total)} rest`}</div>
        <div className={styles.timerBtns}>
          {!finished && (
            <>
              <button className={styles.timerBtn} onClick={() => adjust(-15)} aria-label="15 seconds less">
                −15
              </button>
              <button className={styles.timerBtn} onClick={() => adjust(15)} aria-label="15 seconds more">
                +15
              </button>
            </>
          )}
          <button className={`${styles.timerBtn} ${styles.timerBtnMain}`} onClick={() => setRest(null)}>
            {finished ? "Done" : "Skip"}
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

// ------------------------------------------------------- Update check

const scriptPaths = (html) => new Set(html.match(/\/_next\/static\/[^"'\s]+\.js/g) ?? []);

// Home-screen apps often resume the page already in memory instead of reloading, so a
// newly published version never shows. When the app opens or comes back to the screen,
// compare this page's build scripts with the live ones and report when they differ.
export function useUpdateCheck() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // The Claude artifact updates itself when republished; only the website needs this check.
    if (process.env.NODE_ENV !== "production" || IS_ARTIFACT) return;
    let last = 0;
    const check = async () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 60000) return;
      last = Date.now();
      try {
        const res = await fetch(window.location.pathname, { cache: "no-store" });
        if (!res.ok) return;
        const live = scriptPaths(await res.text());
        const loaded = new Set(Array.from(document.scripts, (s) => (s.src ? new URL(s.src).pathname : "")));
        if (live.size && [...live].some((p) => !loaded.has(p))) setAvailable(true);
      } catch {
        // offline — try again next time
      }
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);

  return available;
}
