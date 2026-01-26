import FeaturedGrid from "../../components/sections/FeaturedGrid";
import TrendingRail from "../../components/sections/TrendingRail";

async function getHome() {
  try {
    const res = await fetch("https://dramabos.asia/api/tensei/home?page=1", {
      headers: {
        accept: "application/json",
      },
      next: { 
        revalidate: 300, // 5 minutes cache
        tags: ['anime-home']
      },
      cache: 'force-cache',
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
    console.error('getHome error:', e);
    return [];
  }
}

export default async function HomeContent() {
  const items = await getHome();

  const featured = items.slice(0, 6);
  const trending = items.slice(6, 18);

  return (
    <>
      <FeaturedGrid items={featured} contextPath="/" />
      <TrendingRail items={trending} contextPath="/" />
    </>
  );
}
