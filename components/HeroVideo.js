// components/HeroVideo.js
"use client";
import { useState } from "react";
import Image from "next/image";

export default function HeroVideo() {
  const [ready, setReady] = useState(false);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden pb-24">
      {/* Video */}
      <video
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        src="/hero.mp4"
        muted
        playsInline
        autoPlay
        loop
        preload="metadata"
        onCanPlay={() => setReady(true)}
      />

      {/* Subtle gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b
                from-black/50 via-black/35 to-black/80" />

      {/* content */}
<div className="relative z-10 flex h-full w-full items-center justify-center">
  <div className="mx-auto max-w-4xl px-4 text-center">
    {/* Logo mark with quiet confidence */}
<Image
  src="/nivimc-logo.png"
  alt="NIVIMC"
  width={200}
  height={190}
  className="brand-mark mx-auto mb-8 fade-in drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
/>

    {/* Headline */}
    <h1 className="h1 text-shadow-sm fade-in-200">
      Precision. Purpose. Presence.
    </h1>

    {/* Support line with slight delay so it feels considered */}
    <p className="jakarta mt-4 text-neutral-300 fade-in-400">
      We design digital systems that speak quietly and work relentlessly.
    </p>

{/* Buttons */}
<div className="jakarta mt-12 cta-row flex items-center justify-center px-4">
  <a href="/home" className="btn btn-primary">Experience the Studio</a>
  <a href="/portfolio" className="btn btn-ghost">See What We’ve Made</a>
</div>

        </div>
      </div>
    </section>
  );
}
