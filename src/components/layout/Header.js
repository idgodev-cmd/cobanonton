"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Input from "../ui/Input";
import { useTheme } from "../../lib/ThemeContext";

export default function Header() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 safe-top ${isScrolled ? "bg-background/90 backdrop-blur-md shadow-md" : "bg-linear-to-b from-black/70 to-transparent"
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 group"
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 3L3 6v15h18V6l-3-3H6zM6 3v3h12V3M3 6h18v15H3V6z" />
                </svg>
                <span className="text-2xl font-black tracking-tighter text-primary uppercase md:text-3xl">
                  COBANONTON
                </span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button onClick={() => router.push("/")} className={`hover:text-primary transition-colors ${pathname === "/" ? "text-primary" : ""}`}>Home</button>
              <button onClick={() => router.push("/dracin")} className={`hover:text-primary transition-colors ${pathname === "/dracin" ? "text-primary font-bold" : ""}`}>Dracin</button>
              <button onClick={() => router.push("/anime")} className={`hover:text-primary transition-colors ${pathname === "/anime" ? "text-primary" : ""}`}>Anime</button>
              <button onClick={() => router.push("/drama")} className={`hover:text-primary transition-colors ${pathname === "/drama" ? "text-primary" : ""}`}>Drama</button>
              <button onClick={() => router.push("/library")} className={`hover:text-primary transition-colors ${pathname === "/library" ? "text-primary" : ""}`}>Library</button>
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-5 flex-1 justify-end">
            <form onSubmit={handleSearch} className="relative w-full max-w-[180px] md:max-w-xs group">
              <Input
                type="search"
                placeholder="Cari anime, drama..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isPending}
                className={`bg-black/20 border-white/10 text-white placeholder:text-white/50 focus:bg-black/40 transition-all rounded-full px-4 py-1.5 text-sm ${isPending ? "opacity-50" : ""
                  }`}
              />
            </form>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
