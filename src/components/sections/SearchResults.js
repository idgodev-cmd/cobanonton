import Card from "../../components/ui/Card";
import { searchDrama } from "../../lib/api";

async function searchAnime(query) {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://dramabos.asia/api/tensei/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    const seen = new Set();
    const unique = data.filter((item) => {
      const key = item.slug || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.map((item) => ({ ...item, type: item.type || "Anime" }));
  } catch (e) {
    return [];
  }
}

async function searchMovie(query) {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://dramabos.asia/api/moviebox/v1/find?q=${encodeURIComponent(query)}`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = Array.isArray(json?.items) ? json.items : [];

    const seen = new Set();
    const normalized = [];

    for (const item of data) {
      const id = item?.subjectId;
      if (!id || seen.has(id)) continue;
      seen.add(id);

      normalized.push({
        slug: `${id}`,
        title: item?.title || "Movie",
        img: item?.cover?.url,
        status: item?.imdbRatingValue ? `⭐ ${item.imdbRatingValue}` : undefined,
        type: item?.subjectType === 2 ? "Series" : "Movie",
      });
    }

    return normalized;
  } catch (e) {
    return [];
  }
}

export default async function SearchResults({ query }) {
  const [animeResults, dramaResults, movieResults] = await Promise.all([
    searchAnime(query),
    searchDrama(query, 20),
    searchMovie(query),
  ]);

  const combined = [...animeResults, ...dramaResults, ...movieResults];
  const seen = new Set();
  const results = combined.filter((item) => {
    const key = item.slug || item.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!query) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <p className="text-muted">
            Gunakan kolom pencarian di atas untuk mencari anime dan drama
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <p className="text-muted">
            Tidak ada hasil untuk &quot;{query}&quot;
          </p>
          <p className="mt-2 text-sm text-muted">Coba kata kunci lain</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-muted">
        Ditemukan {results.length} hasil untuk &quot;{query}&quot;
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map((item, idx) => (
          <Card
            key={`${item.slug ?? item.title}-${idx}`}
            title={item.title}
            subtitle={[item.type, item.status].filter(Boolean).join(" · ") || undefined}
            cover={item.img ?? null}
            slug={item.slug}
            type={item.type}
          />
        ))}
      </div>
    </>
  );
}
