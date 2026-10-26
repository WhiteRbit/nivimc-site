"use client";

import { sticksFor } from "@/lib/workout/sticks";

const NEAR = "#f0f0f0";
const FAR = "#777";
const SCENE = "rgba(255,255,255,0.3)";

const Line = ({ a, b, c, w }) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />;

// One stick-figure frame (0 = start, 1 = finish) for exercises without a photo.
export default function StickFigure({ exId, frame, className, style, label }) {
  const fig = sticksFor(exId);
  if (!fig) return null;
  const f = fig.frames[frame];
  const limb = (from, [joint, end], c, w) => (
    <>
      <Line a={from} b={joint} c={c} w={w} />
      <Line a={joint} b={end} c={c} w={w - 1} />
    </>
  );
  return (
    <svg viewBox="0 0 220 150" className={className} style={style} role="img" aria-label={label}>
      <rect width="220" height="150" fill="#111" />
      <line x1="0" y1="140" x2="220" y2="140" stroke={SCENE} strokeWidth="2" />
      {(fig.scene ?? []).map(([a, b], i) => (
        <Line key={i} a={a} b={b} c={SCENE} w={3} />
      ))}
      {f.farLeg && limb(f.hip, f.farLeg, FAR, 7)}
      {f.farArm && limb(f.shoulder, f.farArm, FAR, 6)}
      <Line a={f.hip} b={f.shoulder} c={NEAR} w={10} />
      <circle cx={f.head[0]} cy={f.head[1]} r="8" fill={NEAR} />
      {limb(f.hip, f.leg, NEAR, 7)}
      {limb(f.shoulder, f.arm, NEAR, 6)}
    </svg>
  );
}
