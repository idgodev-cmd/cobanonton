"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const EPISODES_PER_PAGE = 12;

export default function EpisodeList({
  dramaId,
  currentChapterId,
  allEpisodes,
}) {
  const [visibleEpisodes, setVisibleEpisodes] = useState(allEpisodes.slice(0, EPISODES_PER_PAGE));
  const [displayedCount, setDisplayedCount] = useState(EPISODES_PER_PAGE);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => {
            const newCount = Math.min(prev + EPISODES_PER_PAGE, allEpisodes.length);
            setVisibleEpisodes(allEpisodes.slice(0, newCount));
            return newCount;
          });
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [allEpisodes]);

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">Semua Episode</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {visibleEpisodes.map((ep) => (
          <Link
            key={ep.chapter_id}
            href={`/watch/drama/${dramaId}/${ep.chapter_id}`}
            className={`aspect-square flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground ${
              ep.chapter_id === currentChapterId ? "border-primary bg-primary/10" : ""
            }`}
          >
            {ep.chapter_name.replace(/Episode\s+/i, "")}
          </Link>
        ))}
      </div>

      {displayedCount < allEpisodes.length && (
        <div
          ref={observerTarget}
          className="mt-6 flex justify-center text-sm text-muted"
        >
          Gulir ke bawah untuk memuat lebih banyak episode...
        </div>
      )}

      {displayedCount >= allEpisodes.length && (
        <div className="mt-6 text-center text-sm text-muted">
          Semua {allEpisodes.length} episode sudah ditampilkan
        </div>
      )}
    </div>
  );
}
