"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function MovieSection({ movies }) {
  const [visibleMovies, setVisibleMovies] = useState(movies.slice(0, 5));
  const containerRef = useRef(null);

  useEffect(() => {
    // Lazy load or update when movies prop changes
    const timer = setTimeout(() => {
      setVisibleMovies(movies);
    }, 50);

    return () => clearTimeout(timer);
  }, [movies]);

  return (
    <div ref={containerRef}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Film Populer</h2>
        <Link href="/movie" className="text-sm text-primary hover:underline">
          Lihat Semua
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleMovies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.detailPath}?id=${movie.subjectId}`}
            className="ios-surface ios-ring group overflow-hidden rounded-lg transition-opacity hover:opacity-80"
          >
            <div className="relative w-full aspect-2/3 bg-linear-to-br from-zinc-800 to-zinc-900">
              {movie.cover && (
                <Image
                  src={movie.cover}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
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
      </div>
    </div>
  );
}
