"use client";

import { useEffect, useState } from "react";
import styles from "./workout.module.css";
import StickFigure from "./StickFigure";
import { photosFor } from "@/lib/workout/photos";
import { sticksFor } from "@/lib/workout/sticks";

const FLIP_MS = 1300;

// Start and finish photos (or stick figures when there is no photo), alternating like a
// short clip. Tap to pause. With reduced motion, both are shown side by side instead.
export default function ExercisePhotos({ exId, name }) {
  const photos = photosFor(exId);
  const hasMedia = Boolean(photos || sticksFor(exId));
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

  useEffect(() => {
    if (!hasMedia || !playing || reduced) return;
    const t = setInterval(() => setFrame((f) => 1 - f), FLIP_MS);
    return () => clearInterval(t);
  }, [hasMedia, playing, reduced]);

  if (!hasMedia) return null;

  const alt = (i) => `${name}, ${i ? "finish" : "start"} position`;
  const media = (i, style) =>
    photos ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={i} src={photos[i]} alt={alt(i)} loading="lazy" className={styles.photo} style={style} />
    ) : (
      <StickFigure key={i} exId={exId} frame={i} label={alt(i)} className={styles.photo} style={style} />
    );

  if (reduced) {
    return (
      <div className={styles.photoPair}>
        {[0, 1].map((i) => (
          <figure key={i}>
            {media(i)}
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
      {[0, 1].map((i) => media(i, { opacity: frame === i ? 1 : 0 }))}
      <span className={styles.photoTag}>
        {frame ? "Finish" : "Start"}
        {!photos && " · drawing"}
        {!playing && " · paused"}
      </span>
    </button>
  );
}
