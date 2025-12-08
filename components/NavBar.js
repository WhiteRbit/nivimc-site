"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavBar() {
  const links = [
    { href: "/home", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const [open, setOpen] = useState(false); // mobile drawer open/close

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/home" className="font-semibold tracking-widest text-white">
          NIVIMC
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-neutral-300 hover:text-white transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-[2px] bg-white mb-1"></span>
          <span className="block w-5 h-[2px] bg-white mb-1"></span>
          <span className="block w-5 h-[2px] bg-white"></span>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-black/90 backdrop-blur-lg border-b border-white/10">
          <nav className="flex flex-col py-4 px-6 gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-neutral-300 hover:text-white transition"
                onClick={() => setOpen(false)} // close menu after tap
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
