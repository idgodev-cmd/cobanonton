"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BADGES } from "../../lib/Badges";

export default function LibraryContent() {
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    // Load from localStorage with a slight delay to avoid cascading render warning
    const timer = setTimeout(() => {
      const savedFavorites = localStorage.getItem("favorites");
      const savedWatchlist = localStorage.getItem("watchlist");
      const savedBadges = localStorage.getItem("cobanonton_badges");

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      if (savedBadges) setEarnedBadges(JSON.parse(savedBadges));
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const removeFavorite = (id) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const removeWatchlist = (id) => {
    const updated = watchlist.filter((item) => item.id !== id);
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  const getLink = (item) => {
    if (item.type === "anime") return `/anime/${item.id}`;
    if (item.type === "drama") return `/drama/${item.id}`;
    return "/";
  };

  const items = activeTab === "favorites" ? favorites : watchlist;

  return (
    <>
      {/* Tabs */}
      <div className="mb-8 flex gap-8 border-b border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: "favorites", label: `Favorit (${favorites.length})` },
          { id: "watchlist", label: `Watchlist (${watchlist.length})` },
          { id: "badges", label: `Pencapaian (${earnedBadges.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
              ? "text-primary scale-105"
              : "text-muted hover:text-white"
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_#e50914]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {activeTab === "badges" ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-6 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center gap-3 group overflow-hidden relative ${isUnlocked
                  ? "bg-zinc-900 border-primary/30 shadow-[0_0_20px_rgba(229,9,20,0.1)]"
                  : "bg-zinc-900/30 border-white/5 opacity-50 grayscale"
                  }`}
              >
                {isUnlocked && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                )}

                <div className={`text-4xl mb-2 transition-transform duration-500 ${isUnlocked ? "group-hover:scale-125" : ""}`}>
                  {badge.icon}
                </div>

                <div>
                  <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${isUnlocked ? "text-white" : "text-zinc-600"}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-muted font-medium leading-relaxed">
                    {badge.desc}
                  </p>
                </div>

                <div className={`mt-2 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${isUnlocked
                  ? "bg-primary/20 text-primary border-primary/20"
                  : "bg-zinc-800 text-zinc-600 border-zinc-700"
                  }`}>
                  {isUnlocked ? "Unlocked" : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[40vh] items-center justify-center text-center">
          <div className="max-w-md p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm">
            <div className="mb-6 text-6xl opacity-20">🎞️</div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              {activeTab === "favorites" ? "Belum ada favorit" : "Belum ada watchlist"}
            </h2>
            <p className="text-muted mb-8 text-sm">
              {activeTab === "favorites"
                ? "Simpan anime dan drama favorit kamu untuk akses cepat kapan saja."
                : "Tambahkan judul ke watchlist agar kamu tidak ketinggalan update terbaru."}
            </p>
            <Link href="/" className="inline-block bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-md transition-all">
              Jelajahi Konten
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="group relative">
              <div className="relative aspect-2/3 overflow-hidden rounded-md bg-zinc-900 shadow-lg">
                {item.cover ? (
                  <div className="relative w-full aspect-2/3">
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-zinc-800 font-black text-2xl uppercase tracking-tighter">COBANONTON</span>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="text-white text-sm font-black line-clamp-2 mb-3 uppercase tracking-tight leading-tight">
                    {item.title}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={getLink(item)} className="w-full text-center py-2 bg-white text-black font-bold text-[10px] rounded uppercase tracking-widest hover:bg-white/90 transition-colors">
                      Tonton Sekarang
                    </Link>
                    <button
                      onClick={() => {
                        if (activeTab === "favorites") {
                          removeFavorite(item.id);
                        } else {
                          removeWatchlist(item.id);
                        }
                      }}
                      className="w-full text-center py-2 bg-zinc-800/80 text-white font-bold text-[10px] rounded uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 truncate text-xs font-bold text-muted group-hover:text-white transition-colors uppercase tracking-widest">{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
