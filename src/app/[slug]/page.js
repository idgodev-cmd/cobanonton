import { redirect } from "next/navigation";
import Container from "../../components/layout/Container";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Link from "next/link";
import Image from "next/image";

// Helper to extract possible series slugs from episode slug
function generateSeriesSlugs(episodeSlug) {
  const variations = [];

  // Remove episode patterns
  let base = episodeSlug
    .replace(/-episode-\d+.*$/i, '')
    .replace(/-ep-?\d+.*$/i, '');

  // Try original base with -sub-indo
  if (!base.endsWith('-sub-indo') && !base.endsWith('-sub')) {
    variations.push(`${base}-sub-indo`);
  }

  // Try original base with -sub
  variations.push(`${base}-sub`);

  // Try without last segment and add -sub-indo
  const parts = base.split('-');
  if (parts.length > 2) {
    const withoutLast = parts.slice(0, -1).join('-');
    variations.push(`${withoutLast}-sub-indo`);
  }

  // Try original base as-is
  variations.push(base);

  return [...new Set(variations)]; // Remove duplicates
}

async function getAnimeDetail(slug) {
  try {
    if (slug.startsWith("dr-")) {
      const bookId = slug.replace("dr-", "");
      const res = await fetch(
        `https://dramabos.asia/api/dramabox/api/drama/${bookId}?lang=in`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) return null;
      const json = await res.json();

      // Map Dramabox to Common format
      return {
        title: json.bookName,
        img: json.imageUrl || json.coverWap || json.cover,
        synopsis: json.introduction,
        rating: json.score || "9.5",
        status: "Completed", // Usually Dramabox items are complete or ongoing
        type: "Dracin",
        genres: json.category ? [json.category] : [],
        episodes: Array.from({ length: json.chapterCount || 0 }, (_, i) => ({
          ep: i + 1,
          slug: `dr-${bookId}-${i + 1}`
        }))
      };
    }

    const res = await fetch(
      `https://dramabos.asia/api/tensei/detail/${slug}`,
      {
        headers: {
          siteName: "COBANONTON",
          accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getAnimeDetail(slug);
  if (!data) return { title: "Anime tidak ditemukan" };
  return {
    title: data.title,
    description: data.synopsis?.slice(0, 160) || data.altTitle,
  };
}

export default async function DetailPage({ params }) {
  const { slug } = await params;

  // If slug is numeric, it's a movie/series ID—redirect to /movie/[id]
  if (/^\d+$/.test(slug)) {
    redirect(`/movie/${slug}`);
  }

  // Try original slug first
  let data = await getAnimeDetail(slug);
  let actualSlug = slug;

  // If failed and looks like episode slug, try series variations
  if (!data && (slug.includes('-episode-') || slug.match(/-ep-?\d+/i))) {
    const variations = generateSeriesSlugs(slug);

    for (const variant of variations) {
      data = await getAnimeDetail(variant);
      if (data) {
        actualSlug = variant;
        redirect(`/${variant}`);
        break;
      }
    }
  }

  if (!data) {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-3xl font-bold">Anime tidak ditemukan</h1>
            <p className="mt-2 text-muted">
              Halaman yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <div className="mt-8">
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-md">Kembali ke Beranda</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="pb-12 pt-6">
      <Container>
        {/* Header with cover and info */}
        <div className="netflix-surface overflow-hidden relative group">
          <div className="flex flex-col gap-6 p-6 sm:flex-row md:p-10">
            <div className="w-full shrink-0 sm:w-56 md:w-64 relative aspect-2/3 overflow-hidden rounded-md shadow-2xl">
              {data.img ? (
                <Image
                  src={data.img}
                  alt={data.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-zinc-700 font-black text-2xl uppercase tracking-tighter opacity-20">COBANONTON</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4">
                <span className="text-primary font-black uppercase tracking-widest text-[10px]">Featured Series</span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1">{data.title}</h1>
                {data.altTitle && (
                  <p className="mt-2 text-base text-muted/80 font-medium">
                    {data.altTitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {data.rating && <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{data.rating}</Badge>}
                {data.status && <Badge className="bg-primary/10 text-primary border-primary/20">{data.status}</Badge>}
                {data.type && <Badge className="bg-white/10 text-white border-white/20 capitalize">{data.type}</Badge>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm border-t border-white/5 pt-6">
                {data.studio && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted font-bold uppercase tracking-wider text-[10px]">Studio</span>
                    <span className="font-semibold">{data.studio}</span>
                  </div>
                )}
                {data.released && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted font-bold uppercase tracking-wider text-[10px]">Rilis</span>
                    <span className="font-semibold">{data.released}</span>
                  </div>
                )}
                {data.season && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted font-bold uppercase tracking-wider text-[10px]">Season</span>
                    <span className="font-semibold">{data.season}</span>
                  </div>
                )}
                {data.duration && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted font-bold uppercase tracking-wider text-[10px]">Durasi</span>
                    <span className="font-semibold">{data.duration}</span>
                  </div>
                )}
              </div>

              {data.genres && data.genres.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {data.genres.map((genre) => (
                      <span key={genre} className="text-foreground/80 hover:text-white transition-colors cursor-default md:text-sm font-bold">
                        {genre}<span className="text-muted px-2 font-normal last:hidden">•</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {data.synopsis && (
            <div className="bg-black/20 border-t border-white/5 p-6 md:p-10">
              <h2 className="text-xl font-bold mb-4">Sinopsis</h2>
              <p className="leading-relaxed text-muted/90 text-sm md:text-base max-w-4xl">
                {data.synopsis}
              </p>
            </div>
          )}
        </div>

        {/* Episodes list */}
        {data.episodes && data.episodes.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Daftar Episode</h2>
              <span className="text-sm font-bold text-muted">{data.episodes.length} Episodes</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {data.episodes.map((ep) => (
                <Link
                  key={ep.slug}
                  href={`/watch/${ep.slug}`}
                  className="group relative aspect-video flex items-center justify-center rounded-lg border border-white/5 bg-zinc-900 overflow-hidden transition-all hover:border-primary hover:scale-105"
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-100" />
                  <span className="relative z-10 text-xl font-black text-white group-hover:text-primary transition-colors">
                    {ep.ep}
                  </span>
                  <div className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-widest text-center">
                    Episode {ep.ep}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Metadata footer */}
        {(data.producers || data.posted_by || data.updated_on) && (
          <div className="mt-12 rounded-lg bg-zinc-900/50 p-6 text-xs text-muted/60 border border-white/5 max-w-xl">
            {data.producers && (
              <div className="mb-2">
                <span className="font-bold uppercase tracking-widest mr-2 text-[9px]">Producers</span>
                {data.producers}
              </div>
            )}
            <div className="flex gap-4">
              {data.posted_by && (
                <div>Post by <span className="text-foreground/40">{data.posted_by}</span></div>
              )}
              {data.updated_on && (
                <div>Updated <span className="text-foreground/40">{data.updated_on}</span></div>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
