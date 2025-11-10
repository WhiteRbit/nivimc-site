import Image from "next/image";

export default function PortfolioGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => (
        <a
          key={p.slug}
          href={p.href ?? "#"}
          target={p.href ? "_blank" : undefined}
          className="group border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="relative aspect-[16/10]">
            <Image
              src={p.thumb}
              alt={p.title}
              fill
              className="object-cover transition scale-100 group-hover:scale-[1.02]"
            />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{p.title}</h4>
              <p className="text-sm text-neutral-400">{p.tags?.join(" • ")}</p>
            </div>
            <span className="text-xs text-neutral-400">{p.year}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
