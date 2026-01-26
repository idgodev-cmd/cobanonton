"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "../ui/Skeleton";

export default function ExploreContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "Semua" },
    { id: "anime", label: "Anime" },
    { id: "drama", label: "Drama" },
    { id: "movie", label: "Movie" },
  ];

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const results = [];

      if (activeCategory === "all" || activeCategory === "anime") {
        try {
          const res = await fetch(
            `https://dramabos.asia/api/tensei/home?page=1`,
            { headers: { accept: "application/json" } }
          );
          if (res.ok) {
            const json = await res.json();
            const anime = (json?.data || []).slice(0, 10).map((item) => ({
              id: item.slug,
              title: item.title,
              cover: item.img,
              type: "anime",
              episode: item.episode,
            }));
            results.push(...anime);
          }
        } catch (e) {
          console.error("Anime fetch error:", e);
        }
      }

      if (activeCategory === "all" || activeCategory === "drama") {
        try {
          const res = await fetch(
            `https://dramabos.asia/api/micro/api/v1/list?lang=id&page=1&limit=10`,
            { headers: { accept: "application/json" } }
          );
          if (res.ok) {
            const json = await res.json();
            const drama = (json?.dassi?.lspee || []).slice(0, 10).map((item) => ({
              id: item.dope,
              title: item.ngrand,
              cover: item.pcoa,
              type: "drama",
            }));
            results.push(...drama);
          }
        } catch (e) {
          console.error("Drama fetch error:", e);
        }
      }

      if (activeCategory === "all" || activeCategory === "movie") {
        try {
          const res = await fetch(
            `https://dramabos.asia/api/moviebox/v1/popular?p=0`,
            { headers: { accept: "application/json" } }
          );
          if (res.ok) {
            const json = await res.json();
            const movie = (json?.subjectList || []).slice(0, 10).map((item) => ({
              id: item.subjectId,
              title: item.title,
              cover: item.cover?.url,
              type: "movie",
              rating: item.imdbRatingValue,
            }));
            results.push(...movie);
          }
        } catch (e) {
          console.error("Movie fetch error:", e);
        }
      }

      setContent(results);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getLink = (item) => {
    if (item.type === "anime") return `/anime/${item.id}`;
    if (item.type === "drama") return `/drama/${item.id}`;
    if (item.type === "movie") return `/movie/${item.id}`;
    return "/";
  };

  const renderSkeleton = () => (
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

  return (
    <>
      {/* Category Filter */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat.id
              ? "bg-primary text-primary-foreground"
              : "bg-black/10 text-foreground hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        renderSkeleton()
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {content.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={getLink(item)}
              className="group overflow-hidden rounded-lg"
            >
              <div className="relative w-full bg-black overflow-hidden rounded-lg">
                {item.cover && (
                  <div className="relative w-full aspect-2/3">
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-end p-4">
                  <div className="text-white text-sm font-semibold line-clamp-2 mb-2 w-full">
                    {item.title}
                  </div>
                  <div className="flex gap-2 w-full">
                    {item.rating && (
                      <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-semibold">
                        ⭐ {item.rating}
                      </span>
                    )}
                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                      {item.type === "anime" ? "Anime" : item.type === "drama" ? "Drama" : "Movie"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && content.length === 0 && (
        <div className="flex min-h-100 items-center justify-center text-center">
          <div>
            <p className="text-muted">Tidak ada konten tersedia</p>
          </div>
        </div>
      )}
    </>
  );
}
