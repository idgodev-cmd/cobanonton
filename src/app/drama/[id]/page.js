import Container from "../../../components/layout/Container";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import EpisodeList from "../../../components/sections/EpisodeList";

// Fetch drama detail (info + episodes + video URLs) from micro API
async function getDramaDetail(dramaId) {
  try {
    const res = await fetch(
      `https://dramabos.asia/api/micro/api/v1/drama/${dramaId}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();

    const drama = json?.dassi?.bsex;
    const episodesRaw = json?.dassi?.erev || [];
    if (!drama) return null;

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
  const { id } = await params;
  const detail = await getDramaDetail(id);
  if (!detail) return { title: "Drama tidak ditemukan" };
  return {
    title: detail.drama.title,
    description: detail.drama.description?.slice(0, 160) || `Drama ${detail.drama.title}`,
  };
}

export default async function DramaDetailPage({ params }) {
  const { id } = await params;

  const detail = await getDramaDetail(id);

  if (!detail) {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold">Drama tidak ditemukan</h1>
            <p className="mt-2 text-muted">
              Halaman yang Anda cari tidak tersedia
            </p>
            <div className="mt-6">
              <Link href="/drama/list">
                <Button>Kembali ke Drama</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const { drama, episodes } = detail;

  return (
    <Container>
      <div className="py-6">
        {/* Header with cover and info */}
        <div className="ios-surface ios-ring overflow-hidden">
          <div className="flex flex-col gap-4 p-5 sm:flex-row">
            <div className="w-full shrink-0 sm:w-48 relative aspect-3/4">
              {drama.cover ? (
                <Image
                  src={drama.cover}
                  alt={drama.title}
                  fill
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-md bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{drama.title}</h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>Drama</Badge>
                {drama.chapters > 0 && <Badge>{drama.chapters} Episode</Badge>}
              </div>

              {drama.tags && drama.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {drama.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {drama.description && (
            <div className="border-t border-black/5 p-5 dark:border-white/5">
              <h2 className="text-lg font-semibold">Sinopsis</h2>
              <p className="mt-2 leading-relaxed text-muted">
                {drama.description}
              </p>
            </div>
          )}
        </div>

        {/* Episodes list */}
        {episodes && episodes.length > 0 && (
          <EpisodeList
            dramaId={id}
            currentChapterId={null}
            allEpisodes={episodes}
          />
        )}

        {episodes.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">Episode belum tersedia</p>
          </div>
        )}
      </div>
    </Container>
  );
}
