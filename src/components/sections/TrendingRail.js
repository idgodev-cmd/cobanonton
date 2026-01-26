import Link from "next/link";
import Card from "../ui/Card";

export default function TrendingRail({ items = [], contextPath = "/anime" }) {
  const listPath = contextPath === "/" ? "/anime/list" : `${contextPath}/list`;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Sedang Tren</h2>
        <Link href={listPath} className="text-sm font-bold text-primary hover:text-white transition-colors flex items-center gap-1 group">
          Lihat Semua
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="mt-3 -mx-4 overflow-x-auto no-scrollbar px-4 pb-4">
        <div className="flex gap-4 md:gap-5">
          {items.map((item, idx) => (
            <div key={`${item.slug ?? item.title}-${idx}`} className="w-40 md:w-48 shrink-0">
              <Card
                title={item.title}
                subtitle={[item.episode, item.status].filter(Boolean).join(" • ") || undefined}
                cover={item.img ?? null}
                slug={item.slug}
                type={item.type}
                episode={item.episode}
                contextPath={contextPath}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
