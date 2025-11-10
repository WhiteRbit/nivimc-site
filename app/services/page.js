import SiteShell from "@/components/SiteShell";

export default function ServicesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-24 space-y-10">
        <h1 className="h2">Services</h1>
        <div className="space-y-6">
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">Brand Web Design</h3>
            <p className="p mt-2">Research, IA, wireframes, high-fidelity design, responsive patterns.</p>
          </div>
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">Front-end Engineering</h3>
            <p className="p mt-2">Next.js, performance, accessibility, CMS integration.</p>
          </div>
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold">Care & Growth</h3>
            <p className="p mt-2">A/B tests, SEO hygiene, iterations that compound.</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
