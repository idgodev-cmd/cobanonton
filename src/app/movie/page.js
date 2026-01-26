import { Suspense } from "react";
import Hero from "../../components/sections/Hero";
import FeaturedGrid from "../../components/sections/FeaturedGrid";
import TrendingRail from "../../components/sections/TrendingRail";
import Categories from "../../components/sections/Categories";
import { FeaturedSkeleton, TrendingSkeleton } from "../../components/sections/HomeSkeleton";

async function getMovieData() {
  try {
    const res = await fetch("https://dramabos.asia/api/moviebox/v1/popular?p=0", {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = Array.isArray(json?.subjectList) ? json.subjectList : [];
    
    // Normalize and deduplicate
    const seen = new Set();
    const normalized = [];
    
    for (const item of data) {
      const id = item?.subjectId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      
      normalized.push({
        slug: item?.subjectId,
        title: item?.title || "Movie",
        img: item?.cover?.url,
        type: item?.genre || "Movie",
        status: item?.imdbRatingValue ? `⭐ ${item.imdbRatingValue}` : "Movie",
      });
    }
    
    return normalized;
  } catch (e) {
    return [];
  }
}

async function MovieContent() {
  const items = await getMovieData();
  const featured = items.slice(0, 6);
  const trending = items.slice(6, 18);

  return (
    <>
      <FeaturedGrid items={featured} contextPath="/movie" />
      <TrendingRail items={trending} contextPath="/movie" />
    </>
  );
}

export const metadata = {
  title: "Movie - Xenaflix",
  description: "Jelajahi koleksi lengkap movie dengan subtitle Indonesia",
};

export default function MoviePage() {
  return (
    <>
      <Hero
        title="Movie Terbaru"
        subtitle="Nikmati koleksi movie dengan subtitle Indonesia"
      />
      <Categories />
      <div className="space-y-8">
        <Suspense fallback={<FeaturedSkeleton />}>
          <MovieContent />
        </Suspense>
      </div>
    </>
  );
}
