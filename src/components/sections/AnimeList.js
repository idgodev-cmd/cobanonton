"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";

export default function AnimeList() {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);

  // Deduplicate function
  const deduplicateAnime = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  };

  const fetchAnime = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://dramabos.asia/api/tensei/anime?page=${pageNum}&order=update`,
        {
          headers: { accept: "application/json" },
        }
      );

      if (!res.ok) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const json = await res.json();
      const newData = json?.data || [];

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      const dedupData = deduplicateAnime(newData);
      setAnimeList(dedupData);
      setHasPrev(pageNum > 1);
    } catch (error) {
      console.error("Failed to fetch anime:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAnime(1);
  }, [fetchAnime]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    setPage((prev) => {
      const next = prev + 1;
      fetchAnime(next);
      requestAnimationFrame(scrollToTop);
      return next;
    });
  };

  const handlePrev = () => {
    setPage((prev) => {
      if (prev <= 1) return prev;
      const next = prev - 1;
      fetchAnime(next);
      requestAnimationFrame(scrollToTop);
      return next;
    });
  };

  if (loading && animeList.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg">
            <Skeleton className="aspect-3/4 w-full" />
            <div className="p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (animeList.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <p className="text-muted">Tidak ada anime tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading skeleton or content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg">
              <Skeleton className="aspect-3/4 w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {animeList.map((anime) => (
            <Card
              key={anime.slug}
              title={anime.title}
              subtitle={`${anime.type} • ${anime.status}`}
              cover={anime.img}
              slug={anime.slug}
              type={anime.type}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 sm:mt-8 flex w-full max-w-xl flex-col items-center mx-auto gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm text-muted text-center">
          Halaman <span className="font-semibold text-foreground">{page}</span>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:gap-4">
          <Button
            onClick={handlePrev}
            disabled={!hasPrev || loading}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto rounded-md"
          >
            ← Sebelumnya
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasMore || loading}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto rounded-md"
          >
            Berikutnya →
          </Button>
        </div>
      </div>
    </>
  );
}
