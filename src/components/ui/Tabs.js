"use client";
import { useState } from "react";

export default function Tabs({ tabs = [], initial = 0, onChange, className = "" }) {
  const [active, setActive] = useState(initial);

  const handle = (idx) => {
    setActive(idx);
    onChange?.(idx);
  };

  return (
    <div className={`ios-segmented ios-ring inline-flex p-1 ${className}`}>
      {tabs.map((t, idx) => (
        <button
          key={t.value ?? t}
          onClick={() => handle(idx)}
          className={`rounded-sm px-3 py-2 text-sm transition-colors ${
            active === idx
                ? "bg-white text-black dark:bg-white/10 dark:text-white"
              : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          {t.label ?? t}
        </button>
      ))}
    </div>
  );
}
