"use client";

import type { LinkType } from "@/lib/store";

function iconFor(type: LinkType) {
  // 미니멀한 텍스트 아이콘(이모지 대신)
  switch (type) {
    case "kakao":
      return "K";
    case "youtube":
      return "Y";
    case "threads":
      return "T";
    case "linkedin":
      return "in";
    default:
      return "↗";
  }
}

export function LinkButton({
  username,
  linkId,
  type,
  title,
  url,
}: {
  username: string;
  linkId: string;
  type: LinkType;
  title: string;
  url: string;
}) {
  const track = () => {
    try {
      const payload = JSON.stringify({ username, linkId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/click", payload);
        return;
      }
      fetch("/api/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      className={[
        "group w-full select-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]",
        "px-4 py-4 transition will-change-transform",
        "hover:scale-[1.01] active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl",
            "border border-[color:var(--border)] text-[13px] font-semibold",
            "text-black/70 dark:text-white/80",
          ].join(" ")}
          aria-hidden
        >
          {iconFor(type)}
        </div>
        <div className="flex-1 text-center text-[15px] font-medium tracking-tight">
          {title}
        </div>
        <div className="opacity-40 transition group-hover:opacity-70" aria-hidden>
          ↗
        </div>
      </div>
    </a>
  );
}

