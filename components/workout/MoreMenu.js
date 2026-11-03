"use client";

import { useState } from "react";
import styles from "./workout.module.css";

// "⋯" button that opens a short action sheet, so cards only show what's used most.
// `actions`: [{ label, onClick, danger, hidden }]
export default function MoreMenu({ title, actions }) {
  const [open, setOpen] = useState(false);
  const shown = actions.filter((a) => !a.hidden);
  return (
    <>
      <button className={styles.iconBtn} onClick={() => setOpen(true)} aria-label={`More for ${title}`} title="More">
        ⋯
      </button>
      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} role="presentation">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
            <div className={styles.sectionTitle}>{title}</div>
            <div className={styles.sheetList}>
              {shown.map((a) => (
                <button
                  key={a.label}
                  className={`${styles.btn} ${a.danger ? styles.danger : ""}`}
                  onClick={() => {
                    setOpen(false);
                    a.onClick();
                  }}
                >
                  {a.label}
                </button>
              ))}
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
