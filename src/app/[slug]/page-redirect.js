import { redirect, notFound } from "next/navigation";

// Helper to extract series slug from episode slug
// pandora-hearts-episode-25 -> pandora-hearts-sub-indo (best guess)
function guessSeriesSlug(episodeSlug) {
  // Remove episode number pattern
  const cleaned = episodeSlug
    .replace(/-episode-\d+.*$/, '')
    .replace(/-ep-?\d+.*$/, '');
  
  // Try adding -sub-indo suffix (common pattern)
  return `${cleaned}-sub-indo`;
}

export default async function EpisodePage({ params }) {
  const { slug } = await params;
  
  // If slug contains "episode", try to redirect to series page
  if (slug.includes('-episode-') || slug.match(/-ep-?\d+/)) {
    const seriesSlug = guessSeriesSlug(slug);
    redirect(`/${seriesSlug}`);
  }
  
  // Otherwise not found
  notFound();
}
