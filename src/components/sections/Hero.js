"use client";

import { useRouter, usePathname } from "next/navigation";
import Tabs from "../ui/Tabs";
import Button from "../ui/Button";

export default function Hero() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/dracin") return 1;
    if (pathname === "/drama") return 2;
    if (pathname === "/anime") return 3;
    if (pathname === "/movie") return 4;
    return 0;
  };

  const handleTabChange = (index) => {
    const routes = ["/", "/dracin", "/drama", "/anime", "/movie"];
    router.push(routes[index]);
  };

  return (
    <section className="relative -mx-4 mb-8 h-[60vh] min-h-[400px] overflow-hidden md:-mx-8 md:h-[80vh] lg:rounded-3xl lg:mx-0">
      {/* Background with cinematic overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517604401157-538a966b6c2b?q=80&w=2070&auto=format&fit=crop")',
          backgroundColor: '#000'
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-transparent hidden md:block" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-end p-6 md:p-12 lg:p-16">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-primary font-black uppercase tracking-widest text-xs">Trending Now</span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <span className="text-xs text-muted font-medium">New Episodes Weekly</span>
          </div>

          <h1 className="text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl mb-6 leading-none uppercase">
            Nonton Seru di <br />
            <span className="text-primary italic drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">COBANONTON</span>
          </h1>

          <p className="mt-6 text-base text-white/80 md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
            Streaming drama Korea, anime, dan film terbaru subtitle Indonesia dengan kualitas <span className="text-white font-bold">Ultra HD</span> secara gratis.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => router.push("/dracin")} className="px-10 py-4 text-lg font-black rounded-lg bg-primary text-white hover:bg-primary/90 shadow-[0_10px_20px_rgba(229,9,20,0.3)] transform transition-transform hover:scale-105">
              <span className="flex items-center gap-2 uppercase tracking-widest">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Tonton Sekarang
              </span>
            </Button>
            <Button variant="outline" className="px-10 py-4 text-lg font-black rounded-lg bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-xl text-white transform transition-transform hover:scale-105">
              <span className="flex items-center gap-2 uppercase tracking-widest">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Informasi
              </span>
            </Button>
          </div>
        </div>

        {/* Tab switcher integrated at bottom */}
        <div className="mt-12 overflow-x-auto no-scrollbar">
          <Tabs
            tabs={[
              { label: "Home", value: "all" },
              { label: "Dracin", value: "dracin" },
              { label: "Drama", value: "drama" },
              { label: "Anime", value: "anime" },
              { label: "Movie", value: "movie" },
            ]}
            initial={getActiveTab()}
            onChange={handleTabChange}
          />
        </div>
      </div>
    </section>
  );
}
