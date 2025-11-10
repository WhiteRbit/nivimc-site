import Link from "next/link";

export default function NavBar() {
  const links = [
    { href: "/home", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/30 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/home" className="font-semibold tracking-widest">NIVIMC</Link>
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-neutral-300 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
