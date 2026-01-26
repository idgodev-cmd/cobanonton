import MovieWatchClient from "./movie-watch-client";
import { notFound } from "next/navigation";
import { cache } from "react";

const fetchInfo = cache(async (id) => {
  try {
    const res = await fetch(`https://dramabos.asia/api/moviebox/v1/info/${id}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.subject || null;
  } catch (e) {
    return null;
  }
});

export default async function MovieWatchPage({ params, searchParams }) {
  const { id } = await params;
  const season = parseInt(searchParams.s) || 1;
  const episode = parseInt(searchParams.e) || 1;

  const subject = await fetchInfo(id);
  if (!subject) notFound();

  const isSeries = subject.subjectType === 2;

  // Redirect non-series to film watch without s/e params
  if (!isSeries && (searchParams.s || searchParams.e)) {
    return notFound();
  }

  return (
    <MovieWatchClient
      subjectId={id}
      initialSeason={season}
      initialEpisode={episode}
      isSeries={isSeries}
    />
  );
}

export async function generateMetadata({ params, searchParams }) {
  const { id } = await params;
  const subject = await fetchInfo(id);
  if (!subject) return { title: "Video tidak ditemukan" };

  const isSeries = subject.subjectType === 2;
  const season = searchParams.s || 1;
  const episode = searchParams.e || 1;

  return {
    title: isSeries
      ? `${subject.title} - Season ${season} Episode ${episode}`
      : `${subject.title} - Tonton Film`,
    description: subject.description?.slice(0, 160) || `Streaming ${subject.title}`,
  };
}
