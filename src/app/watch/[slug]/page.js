import WatchClient from "./watch-client";
import Container from "../../../components/layout/Container";
import Button from "../../../components/ui/Button";
import Link from "next/link";

async function getEpisodeData(slug) {
  try {
    // Handle Dramabox (Dracin) content
    if (slug.startsWith("dr-")) {
      const parts = slug.replace("dr-", "").split("-");
      const bookId = parts[0];
      const episode = parts[1] || "1";

      const res = await fetch(
        `https://dramabos.asia/api/dramabox/api/watch/${bookId}/${episode}?lang=in`,
        { cache: "no-store" }
      );
      if (!res.ok) return null;
      const json = await res.json();

      // Map Dramabox data to our common format
      // Structure: { chapterId: "...", name: "EP 1", videos: [{ quality: 1080, videoPath: "..." }] }
      const servers = json.videos?.map(v => ({
        name: v.quality + "P",
        embed: v.videoPath
      })) || [];

      return {
        title: "Dramabox Episode " + (json.name || episode),
        servers: servers,
        next: servers.length > 0 ? `dr-${bookId}-${parseInt(episode) + 1}` : null,
        prev: parseInt(episode) > 1 ? `dr-${bookId}-${parseInt(episode) - 1}` : null,
        animeSlug: `dr-${bookId}`
      };
    }

    // Default Tensei content
    const res = await fetch(
      `https://dramabos.asia/api/tensei/watch/${slug}`,
      {
        headers: { accept: "application/json" },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    console.error("Watch fetch error:", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getEpisodeData(slug);
  if (!data) return { title: "Episode tidak ditemukan" };
  return {
    title: data.title || "Tonton Episode",
  };
}

export default async function WatchPage({ params }) {
  const { slug } = await params;
  const data = await getEpisodeData(slug);

  if (!data) {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-semibold">Episode tidak ditemukan</h1>
            <p className="mt-2 text-muted">
              Episode yang Anda cari tidak tersedia
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button>Kembali ke Halaman Utama</Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return <WatchClient data={data} slug={slug} />;
}
