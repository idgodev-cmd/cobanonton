import Container from "../../../../../components/layout/Container";
import Badge from "../../../../../components/ui/Badge";
import Link from "next/link";
import EpisodeList from "../../../../../components/sections/EpisodeList";

// Fetch drama detail (info + episodes + video URLs) from micro API
async function getDramaDetail(dramaId) {
  try {
    const res = await fetch(
      `https://dramabos.asia/api/micro/api/v1/drama/${dramaId}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 120 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();

    const drama = json?.dassi?.bsex;
    const episodesRaw = json?.dassi?.erev || [];
    if (!drama || episodesRaw.length === 0) return null;

    const episodes = episodesRaw
      .map((ep) => {
        const video540p = ep.pjoint?.find((q) => q.Dpri === "540P");
        const firstVideo = ep.pjoint?.[0];
        const selectedVideo = video540p || firstVideo;
        if (!selectedVideo?.Mknee) return null;

        return {
          chapter_id: ep.echa,
          chapter_name: `Episode ${ep.echa}`,
          first_frame: selectedVideo.Mknee.split("?")[0] || "",
          is_free: true,
          chapter_price: 0,
          duration: selectedVideo.Dbonus || 0,
          videoUrl: selectedVideo.Mknee,
          qualities: ep.pjoint || [],
        };
      })
      .filter(Boolean)
      .sort((a, b) => Number(a.chapter_id) - Number(b.chapter_id));

    return {
      drama: {
        id: drama.dope,
        title: drama.ngrand,
        description: drama.dfill || "",
        tags: drama.sheat || [],
        cover: drama.pcoa,
        chapters: drama.eext || episodes.length,
      },
      episodes,
    };
  } catch (e) {
    console.error("Failed to fetch drama detail:", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id, chapterIndex } = await params;
  const detail = await getDramaDetail(id);
  if (!detail) return { title: "Episode tidak ditemukan" };

  const target = detail.episodes.find(
    (ep) => String(ep.chapter_id) === String(chapterIndex)
  );

  if (!target) return { title: "Episode tidak ditemukan" };

  return {
    title: `${detail.drama.title} - Episode ${target.chapter_id}`,
    description:
      detail.drama.description?.slice(0, 160) ||
      `${detail.drama.title} Episode ${target.chapter_id}`,
  };
}

export default async function WatchPage({ params }) {
  const { id, chapterIndex } = await params;

  const detail = await getDramaDetail(id);

  if (!detail || !detail.episodes || detail.episodes.length === 0) {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold">Episode tidak ditemukan</h1>
            <p className="mt-2 text-muted">
              Episode yang Anda cari tidak tersedia
            </p>
            <div className="mt-6">
              <Link href={`/drama/${id}`} className="text-primary hover:underline">
                Kembali ke Drama
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const episodes = detail.episodes;
  const currentEpisode = episodes.find(
    (ep) => String(ep.chapter_id) === String(chapterIndex)
  );

  if (!currentEpisode) {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold">Episode tidak ditemukan</h1>
            <p className="mt-2 text-muted">
              Episode yang Anda cari tidak tersedia
            </p>
            <div className="mt-6">
              <Link href={`/drama/${id}`} className="text-primary hover:underline">
                Kembali ke Drama
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Find next and prev episode based on current position
  const currentEpisodeIndex = episodes.findIndex(
    (ep) => String(ep.chapter_id) === String(chapterIndex)
  );
  const prevEpisode =
    currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode =
    currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  const playUrl = currentEpisode.videoUrl;

  return (
    <Container>
      <div className="py-6">
        {/* Video Player */}
        <div className="ios-surface ios-ring overflow-hidden">
          <div className="w-full bg-black">
            <video
              controls
              autoPlay
              className="w-full aspect-video"
              poster={currentEpisode.first_frame}
              src={playUrl}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="p-5">
            {/* Prev/Next Episode Buttons */}
            <div className="mb-4 flex gap-3">
              {prevEpisode ? (
                <Link
                  href={`/watch/drama/${id}/${prevEpisode.chapter_id}`}
                  className="flex-1 ios-surface ios-ring px-4 py-2 text-center font-medium text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-full"
                >
                  ← {prevEpisode.chapter_name}
                </Link>
              ) : (
                <div className="flex-1 ios-surface px-4 py-2 text-center font-medium text-muted rounded-full opacity-50 cursor-not-allowed">
                  ← Episode Sebelumnya
                </div>
              )}

              {nextEpisode ? (
                <Link
                  href={`/watch/drama/${id}/${nextEpisode.chapter_id}`}
                  className="flex-1 ios-surface ios-ring px-4 py-2 text-center font-medium text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-full"
                >
                  {nextEpisode.chapter_name} →
                </Link>
              ) : (
                <div className="flex-1 ios-surface px-4 py-2 text-center font-medium text-muted rounded-full opacity-50 cursor-not-allowed">
                  Episode Selanjutnya →
                </div>
              )}
            </div>

            <h1 className="text-2xl font-semibold">{detail.drama.title}</h1>
            <h2 className="mt-2 text-lg text-muted">{currentEpisode.chapter_name}</h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>
                {currentEpisode.chapter_id}/{detail.drama.chapters} Episode
              </Badge>
              <Badge>{currentEpisode.duration} Menit</Badge>
              {currentEpisode.is_free && <Badge variant="success">Gratis</Badge>}
            </div>

            {detail.drama.description && (
              <div className="mt-4">
                <h3 className="font-semibold">Sinopsis</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {detail.drama.description}
                </p>
              </div>
            )}

            {detail.drama.tags && detail.drama.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.drama.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episodes List with Infinite Scroll */}
        {episodes && episodes.length > 0 && (
          <EpisodeList
            dramaId={id}
            currentChapterId={String(chapterIndex)}
            allEpisodes={episodes}
          />
        )}
      </div>
    </Container>
  );
}
