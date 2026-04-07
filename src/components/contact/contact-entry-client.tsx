"use client";

import { useState } from "react";
import { ContactModal } from "./contact-modal";

export function ContactEntryClient({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
      >
        문의하기
      </button>
      <ContactModal username={username} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

