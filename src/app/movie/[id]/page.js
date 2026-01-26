import Container from "../../../components/layout/Container";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Link from "next/link";
import Image from "next/image";

async function getMovieInfo(id) {
  try {
    // Extract subjectId from detailPath or use id directly
    const subjectId = id;

    const res = await fetch(
      `https://dramabos.asia/api/moviebox/v1/info/${subjectId}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return null;
    const json = await res.json();

    const subject = json?.subject;
    if (!subject) return null;

    return {
      subjectId: subject.subjectId,
      subjectType: subject.subjectType,
      title: subject.title,
      description: subject.description,
      cover: subject.cover?.url,
      releaseDate: subject.releaseDate,
      duration: subject.duration,
      genre: subject.genre,
      countryName: subject.countryName,
      imdbRatingValue: subject.imdbRatingValue,
      imdbRatingCount: subject.imdbRatingCount,
      subtitles: subject.subtitles,
      trailer: subject.trailer,
      stars: json?.stars || [],
      resource: json?.resource,
      stills: subject.stills?.url,
    };
  } catch (e) {
    console.error("Failed to fetch movie info:", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const info = await getMovieInfo(id);
  if (!info) return { title: "Movie tidak ditemukan" };
  return {
    title: `${info.title} - Xenaflix`,
    description: info.description?.slice(0, 160) || `${info.title}`,
  };
}

export default async function MovieDetailPage({ params }) {
  const { id } = await params;

  if (!id) {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center text-center">
          <p className="text-muted">ID tidak valid</p>
        </div>
      </Container>
    );
  }

  const info = await getMovieInfo(id);

  if (!info) {
    console.error(`[Movie Detail] Failed to fetch info for id: ${id}`);
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold">Movie tidak ditemukan</h1>
            <p className="mt-2 text-muted">
              Halaman yang Anda cari tidak tersedia
            </p>
            <div className="mt-6">
              <Link href="/movie/list">
                <Button>Kembali ke Movie</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const genres = info.genre ? info.genre.split(',').map(g => g.trim()) : [];
  const isSeries = info.subjectType === 2;
  const isMovie = info.subjectType === 1;

  // Format duration from seconds to hours and minutes
  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Container>
      <div className="py-6">
        {/* Header with cover and info */}
        <div className="ios-surface ios-ring overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row">
            <div className="w-full shrink-0 sm:w-48 relative aspect-3/4">
              {info.cover ? (
                <Image
                  src={info.cover}
                  alt={info.title}
                  fill
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-md bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{info.title}</h1>

              <div className="mt-3 flex flex-wrap gap-2">
                {info.countryName && <Badge>{info.countryName}</Badge>}
                {isMovie && <Badge>Movie</Badge>}
                {isSeries && <Badge>Series</Badge>}
                {info.releaseDate && <Badge>{new Date(info.releaseDate).getFullYear()}</Badge>}
                {info.duration && <Badge>{formatDuration(info.duration)}</Badge>}
                {info.imdbRatingValue && (
                  <Badge>⭐ {info.imdbRatingValue}</Badge>
                )}
              </div>

              {genres.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge key={genre}>{genre}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {info.imdbRatingCount > 0 && (
                <p className="mt-3 text-sm text-muted">
                  {info.imdbRatingCount.toLocaleString()} ratings
                </p>
              )}
            </div>
          </div>

          {info.description && (
            <div className="border-t border-black/5 p-5 dark:border-white/5">
              <h2 className="text-lg font-semibold">Sinopsis</h2>
              <p className="mt-2 leading-relaxed text-muted">
                {info.description}
              </p>
            </div>
          )}

          {/* Trailer */}
          {info.trailer?.videoAddress?.url && (
            <div className="border-t border-black/5 p-5 dark:border-white/5">
              <h2 className="text-lg font-semibold mb-3">Trailer</h2>
              <div className="aspect-video overflow-hidden rounded-lg bg-black">
                <video
                  controls
                  poster={info.trailer?.cover?.url}
                  className="h-full w-full"
                  preload="metadata"
                >
                  <source src={info.trailer.videoAddress.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Cast */}
          {info.stars && info.stars.length > 0 && (
            <div className="border-t border-black/5 p-5 dark:border-white/5">
              <h2 className="text-lg font-semibold mb-4">Cast</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {info.stars.slice(0, 8).map((star, idx) => (
                  <div key={`${star.staffId}-${idx}`} className="text-center">
                    {star.avatarUrl && (
                      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <Image
                          src={star.avatarUrl}
                          alt={star.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-sm font-medium">{star.name}</p>
                    {star.character && (
                      <p className="text-xs text-muted">{star.character}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seasons Info for Series */}
          {isSeries && info.resource?.seasons && info.resource.seasons.length > 0 && (
            <div className="border-t border-black/5 p-5 dark:border-white/5">
              <h2 className="text-lg font-semibold mb-4">Episodes</h2>
              <div className="space-y-6">
                {info.resource.seasons.map((season) => (
                  <div key={season.se}>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Season {season.se}</p>
                        <p className="text-sm text-muted">{season.maxEp} Episodes</p>
                      </div>
                      {season.resolutions && season.resolutions.length > 0 && (
                        <div className="flex gap-2">
                          {season.resolutions.map((res) => (
                            <span
                              key={res.resolution}
                              className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted bg-white/5"
                            >
                              {res.resolution}p
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Episode Grid */}
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-8">
                      {Array.from({ length: season.maxEp }, (_, i) => i + 1).map((ep) => (
                        <Link
                          key={ep}
                          href={`/movie/${info.subjectId}/watch?s=${season.se}&e=${ep}`}
                          className="aspect-square flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base font-semibold text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {ep}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtitles */}
          {info.subtitles && (
            <div className="border-t border-black/5 p-5 dark:border-white/5">
              <h2 className="text-lg font-semibold mb-2">Subtitle tersedia</h2>
              <p className="text-sm text-muted">{info.subtitles}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {/* Watch Button - Show if movie/series has resources */}
          {info.resource && (
            <Link
              href={isSeries ? `/movie/${info.subjectId}/watch?s=1&e=1` : `/movie/${info.subjectId}/watch`}
              className="flex-1"
            >
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {isMovie ? "Tonton Film" : "Tonton Episode 1"}
              </Button>
            </Link>
          )}

          <Link href="/movie/list" className="flex-1">
            <Button className="w-full" variant="outline">Kembali ke Movie</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
