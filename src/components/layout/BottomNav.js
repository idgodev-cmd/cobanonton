"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    key: "home",
    label: "Home",
    href: "/",
    icon: (active) => (
      <svg className={`w-6 h-6 transition-colors ${active ? "text-primary" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    key: "search",
    label: "Cari",
    href: "/search",
    icon: (active) => (
      <svg className={`w-6 h-6 transition-colors ${active ? "text-primary" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    key: "top",
    label: "Top",
    href: "/rank",
    icon: (active) => (
      <svg className={`w-6 h-6 transition-colors ${active ? "text-primary" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  {
    key: "library",
    label: "Pustaka",
    href: "/library",
    icon: (active) => (
      <svg className={`w-6 h-6 transition-colors ${active ? "text-primary" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom bg-background/80 backdrop-blur-lg border-t border-white/10 md:hidden">
      <div className="mx-auto max-w-lg px-6 pb-2 pt-3">
        <div className="flex items-center justify-between">
          {items.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.key}
                href={it.href}
                className="flex flex-col items-center gap-1 group"
                aria-current={active ? "page" : undefined}
              >
                <div className={`p-1 rounded-xl transition-all ${active ? "bg-primary/10" : "group-hover:bg-white/5"}`}>
                  {it.icon(active)}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted"}`}>
                  {it.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
