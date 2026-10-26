"use client";

import { useEffect, useState } from "react";
import styles from "./workout.module.css";
import { photosFor } from "@/lib/workout/photos";

const FLIP_MS = 1300;

// Start and finish photos, alternating like a short clip. Tap to pause.
// With reduced motion, both photos are shown side by side instead.
export default function ExercisePhotos({ exId, name }) {
  const photos = photosFor(exId);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

  useEffect(() => {
    if (!photos || !playing || reduced) return;
    const t = setInterval(() => setFrame((f) => 1 - f), FLIP_MS);
    return () => clearInterval(t);
  }, [photos, playing, reduced]);

  if (!photos) return null;

  if (reduced) {
    return (
      <div className={styles.photoPair}>
        {photos.map((src, i) => (
          <figure key={src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${name}, ${i ? "finish" : "start"} position`} loading="lazy" className={styles.photo} />
            <figcaption>{i ? "Finish" : "Start"}</figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.photoClip}
      onClick={() => setPlaying(!playing)}
      aria-label={playing ? "Pause demonstration" : "Play demonstration"}
    >
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`${name}, ${i ? "finish" : "start"} position`}
          loading="lazy"
          className={styles.photo}
          style={{ opacity: frame === i ? 1 : 0 }}
        />
      ))}
      <span className={styles.photoTag}>
        {frame ? "Finish" : "Start"}
        {!playing && " · paused"}
      </span>
    </button>
  );
}
