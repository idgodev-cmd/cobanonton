import { Suspense } from "react";
import Hero from "../../components/sections/Hero";
import FeaturedGrid from "../../components/sections/FeaturedGrid";
import TrendingRail from "../../components/sections/TrendingRail";
import Categories from "../../components/sections/Categories";
import { FeaturedSkeleton, TrendingSkeleton } from "../../components/sections/HomeSkeleton";

async function getAnimeData() {
  try {
    const res = await fetch("https://dramabos.asia/api/tensei/anime?page=1&order=update", {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    
    // Deduplicate by slug
    const seen = new Set();
    const unique = data.filter((item) => {
      const key = item.slug || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    return unique;
  } catch (e) {
    return [];
  }
}

async function AnimeContent() {
  const items = await getAnimeData();
  const featured = items.slice(0, 6);
  const trending = items.slice(6, 18);

  return (
    <>
      <FeaturedGrid items={featured} contextPath="/anime" />
      <TrendingRail items={trending} contextPath="/anime" />
    </>
  );
}

export const metadata = {
  title: "Anime - Xenaflix",
  description: "Jelajahi koleksi lengkap anime dengan subtitle Indonesia",
};

export default function AnimePage() {
  return (
    <div className="py-4">
      <Hero />
      <Suspense fallback={
        <>
          <FeaturedSkeleton />
          <TrendingSkeleton />
        </>
      }>
        <AnimeContent />
      </Suspense>
      <Categories />
    </div>
  );
}
