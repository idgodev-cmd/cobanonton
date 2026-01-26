import WatchPage from "./page";

async function getEpisodeData(slug) {
  try {
    const res = await fetch(
      `https://dramabos.asia/api/tensei/watch/${slug}`,
      {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
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
  const data = await getEpisodeData(slug);
  if (!data) return { title: "Episode tidak ditemukan" };
  return {
    title: data.title || "Tonton Episode",
  };
}

export default async function WatchPageWrapper({ params }) {
  const { slug } = await params;
  const data = await getEpisodeData(slug);
  return <WatchPage params={params} data={data} />;
}
