"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "../ui/Skeleton";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 0.8; // Load when 80% scrolled

export default function MovieList() {
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const abortControllerRef = useRef(null);

  const normalizeAndMerge = useCallback((incoming, replace = false) => {
    setMovieList((prev) => {
      const base = replace ? [] : prev;
      const seen = new Set(base.map((item) => item.id));
      const merged = [...base];

      for (const item of incoming) {
        const id = item?.subjectId;
        if (!id || seen.has(id)) continue;
        seen.add(id);

        merged.push({
          id,
          title: item?.title || "Film",
          cover: item?.cover?.url,
          rating: item?.imdbRatingValue || "N/A",
          genre: item?.genre,
          detailPath: item?.detailPath,
          subjectId: item?.subjectId,
        });
      }

      return merged;
    });
  }, []);

  const fetchPage = useCallback(
    async (pageNum, { replace = false, initial = false } = {}) => {
      if (initial) setLoading(true);
      else setLoadingMore(true);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch(
          `https://dramabos.asia/api/moviebox/v1/popular?p=${pageNum - 1}`,
          {
            headers: { accept: "application/json" },
            signal: abortControllerRef.current.signal,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch movies");
        const json = await res.json();
        const newData = json?.subjectList || [];

        normalizeAndMerge(newData, replace);
        setHasMore(json?.pager?.hasMore || false);
        setPage(pageNum);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError("Gagal memuat data film");
        setHasMore(false);
      } finally {
        if (initial) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [normalizeAndMerge]
  );

  useEffect(() => {
    fetchPage(1, { replace: true, initial: true });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchPage(page + 1, { replace: false });
        }
      },
      { threshold: SCROLL_THRESHOLD }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, page, fetchPage]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 20 }).map((_, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg">
            <Skeleton className="aspect-2/3 w-full" />
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
      <div className="flex min-h-100 items-center justify-center text-center">
        <div>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movieList.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.subjectId}`}
            className="ios-surface ios-ring group overflow-hidden rounded-lg transition-opacity hover:opacity-80"
          >
            <div className="relative w-full bg-linear-to-br from-zinc-800 to-zinc-900">
              {movie.cover && (
                <div className="relative w-full aspect-2/3">
                  <Image
                    src={movie.cover}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <div className="text-white text-sm font-semibold line-clamp-2">
                  {movie.title}
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-yellow-400 font-semibold">
                ⭐ {movie.rating}
              </div>
            </div>
          </Link>
        ))}

        {loadingMore &&
          Array.from({ length: 10 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="overflow-hidden rounded-lg">
              <Skeleton className="aspect-2/3 w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </div>
            </div>
          ))}
      </div>

      {hasMore && !loadingMore && (
        <div
          ref={observerTarget}
          className="mt-8 flex justify-center text-sm text-muted"
        >
          Gulir ke bawah untuk memuat lebih banyak film...
        </div>
      )}

      {!hasMore && movieList.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted">
          Semua {movieList.length} film sudah ditampilkan
        </div>
      )}
    </>
  );
}
