import SiteShell from "@/components/SiteShell";
import PortfolioGrid from "@/components/PortfolioGrid";

const items = [
  { slug: "site-1", title: "Luxury Studio", year: 2025, tags: ["Next.js","Design"], thumb: "/portfolio/site1.jpg", href: "https://example.com" },
  { slug: "site-2", title: "Technology Lab", year: 2025, tags: ["App","UI"], thumb: "/portfolio/site2.jpg" },
  { slug: "site-3", title: "Editorial Brand", year: 2024, tags: ["Web"], thumb: "/portfolio/site3.jpg" },
];

export default function PortfolioPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-24">
        <h1 className="h2 mb-8">Portfolio</h1>
        <PortfolioGrid items={items} />
      </section>
    </SiteShell>
  );
}
