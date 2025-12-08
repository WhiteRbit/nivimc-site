// components/HeroVideo.js
"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroVideo() {
  return (
    <section className="relative w-full vh overflow-hidden rounded-b-2xl">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero.mp4"        // place your hero.mp4 in /public
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg" // optional static preview
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Foreground content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        {/* Logo mark */}
        <Image
          src="/logo-nivimc.png"
          alt="NIVIMC"
          width={96}
          height={96}
          priority
          className="brand-mark"
        />

        {/* Main headline */}
        <h1 className="h1 mt-6 fade-in">
          NIVIMC
        </h1>

        {/* Subtext */}
        <p className="p max-w-lg mt-3 text-neutral-300 fade-in-200">
          Web design and code for brands that want silence, speed, and precision.
        </p>

        {/* CTA buttons */}
        <div className="cta-row mt-10 fade-in-400">
          <Link href="/portfolio" className="btn">
            View Work
          </Link>
          <Link href="/services" className="btn btn-ghost">
            Services
          </Link>
        </div>
      </div>
    </section>
  );
}
