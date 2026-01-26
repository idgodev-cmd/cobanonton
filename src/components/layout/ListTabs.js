"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ListTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Anime", href: "/anime/list" },
    { label: "Drama", href: "/drama/list" },
    { label: "Movie", href: "/movie/list" },
  ];

  const isActive = (href) => pathname === href;

  return (
    <div className="mb-8 flex gap-4 border-b border-black/5 dark:border-white/10">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            isActive(tab.href)
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {tab.label}
          {isActive(tab.href) && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </Link>
      ))}
    </div>
  );
}
