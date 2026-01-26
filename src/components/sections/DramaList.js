"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";

const PAGE_SIZE = 20;

export default function DramaList() {
  const [dramaList, setDramaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);

  const normalizeData = useCallback((incoming) => {
    const normalized = [];
    const seen = new Set();

    for (const item of incoming) {
      const id = item?.dope;
      if (!id || seen.has(id)) continue;
      seen.add(id);

      normalized.push({
        id,
        title: item?.ngrand || "Drama",
        cover: item?.pcoa,
        episodes: item?.eext ? `${item.eext}` : "Unknown",
      });
    }

    return normalized;
  }, []);

  const fetchPage = useCallback(
    async (pageNum) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://dramabos.asia/api/micro/api/v1/list?lang=id&page=${pageNum}&limit=${PAGE_SIZE}`,
          { headers: { accept: "application/json" } }
        );
        if (!res.ok) throw new Error("Failed to fetch drama");
        const json = await res.json();
        const newData = json?.dassi?.lspee || [];

        const normalized = normalizeData(newData);
        setDramaList(normalized);
        setHasMore(newData.length === PAGE_SIZE);
        setHasPrev(pageNum > 1);
        setPage(pageNum);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data drama");
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    },
    [normalizeData]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    setPage((prev) => {
      const next = prev + 1;
      fetchPage(next);
      requestAnimationFrame(scrollToTop);
      return next;
    });
  };

  const handlePrev = () => {
    setPage((prev) => {
      if (prev <= 1) return prev;
      const next = prev - 1;
      fetchPage(next);
      requestAnimationFrame(scrollToTop);
      return next;
    });
  };

  if (isInitialLoad && loading) {
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

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!loading && dramaList.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-center">
        <div>
          <p className="text-muted">Tidak ada drama tersedia</p>
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
          {dramaList.map((drama) => (
            <Link
              key={drama.id}
              href={`/drama/${drama.id}`}
              className="group overflow-hidden rounded-lg bg-surface shadow-sm ios-ring"
            >
              <div className="relative aspect-3/4 w-full overflow-hidden">
                {drama.cover ? (
                  <Image
                    src={drama.cover}
                    alt={drama.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700" />
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10" />
              </div>
              <div className="p-3">
                <div className="text-foreground text-sm font-semibold truncate">{drama.title}</div>
                <div className="text-muted text-xs mt-1 truncate">
                  {drama.episodes ? `${drama.episodes} Episode` : "Episode tersedia"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 sm:mt-8 flex w-full max-w-xl flex-col mx-auto items-center gap-3 sm:gap-4">
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
