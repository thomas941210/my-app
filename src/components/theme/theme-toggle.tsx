"use client";

import type { ThemeMode } from "@/lib/store";
import { useTheme } from "./theme-context";

const items: { key: ThemeMode; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "auto", label: "Auto" },
];

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border border-black/10 bg-white/70 p-1 text-sm backdrop-blur",
        "dark:border-white/10 dark:bg-black/40",
      ].join(" ")}
      role="group"
      aria-label="Theme"
    >
      {items.map((it) => {
        const active = theme === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => setTheme(it.key)}
            className={[
              "rounded-full px-3 py-1.5 transition",
              active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white",
              compact ? "px-2 py-1 text-xs" : "",
            ].join(" ")}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

