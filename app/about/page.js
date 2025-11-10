import SiteShell from "@/components/SiteShell";
import Image from "next/image";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="h2">About NIVIMC</h1>
          <p className="p mt-6">
            NIVIMC designs and codes high-fidelity web experiences. Minimal surfaces, engineered depth, and quietly
            ruthless attention to detail.
          </p>
        </div>
        <div className="border border-white/10 rounded-2xl p-6 text-center">
          <Image src="/nivimc-logo.png" alt="NIVIMC" width={120} height={120} className="mx-auto" />
          <p className="text-neutral-400 mt-4 text-sm">Identity mark</p>
        </div>
      </section>
    </SiteShell>
  );
}
