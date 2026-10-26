"use client";

import dynamic from "next/dynamic";
import styles from "./workout.module.css";

// The tracker reads and writes localStorage, so it renders on the client only.
const WorkoutApp = dynamic(() => import("./WorkoutApp"), {
  ssr: false,
  loading: () => (
    <div className={styles.app}>
      <p>Loading your training log…</p>
    </div>
  ),
});

export default WorkoutApp;
