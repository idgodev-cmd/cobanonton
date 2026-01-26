import { Suspense } from "react";
import Hero from "../../components/sections/Hero";
import FeaturedGrid from "../../components/sections/FeaturedGrid";
import TrendingRail from "../../components/sections/TrendingRail";
import Categories from "../../components/sections/Categories";
import { FeaturedSkeleton, TrendingSkeleton } from "../../components/sections/HomeSkeleton";

async function getDramaData() {
  try {
    const res = await fetch("https://dramabos.asia/api/micro/api/v1/list?lang=id&page=1&limit=20", {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = Array.isArray(json?.dassi?.lspee) ? json.dassi.lspee : [];
    
    // Normalize drama data to match anime structure and deduplicate
    const seen = new Set();
    const normalized = [];
    
    for (const item of data) {
      const id = item?.dope;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      
      normalized.push({
        slug: id,
        title: item?.ngrand || "Drama",
        img: item?.pcoa,
        type: "Drama",
        status: item?.eext ? `${item.eext} Episode` : "Series",
      });
    }
    
    return normalized;
  } catch (e) {
    return [];
  }
}

async function DramaContent() {
  const items = await getDramaData();
  const featured = items.slice(0, 6);
  const trending = items.slice(6, 18);

  return (
    <>
      <FeaturedGrid items={featured} contextPath="/drama" />
      <TrendingRail items={trending} contextPath="/drama" />
    </>
  );
}

export const metadata = {
  title: "Drama - Xenaflix",
  description: "Jelajahi koleksi lengkap drama dengan subtitle Indonesia",
};

export default function DramaPage() {
  return (
    <div className="py-4">
      <Hero />
      <Suspense fallback={
        <>
          <FeaturedSkeleton />
          <TrendingSkeleton />
        </>
      }>
        <DramaContent />
      </Suspense>
      <Categories />
    </div>
  );
}
