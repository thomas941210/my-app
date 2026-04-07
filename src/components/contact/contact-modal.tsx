"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactModal({
  username,
  open,
  onClose,
}: {
  username?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    return status !== "submitting";
  }, [name, email, status]);

  const submit = async () => {
    setStatus("submitting");
    setMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, email }),
      });
      if (!res.ok) throw new Error("FAILED");
      setStatus("success");
      setMessage("전송이 완료됐어요. 곧 연락드릴게요.");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setMessage(null);
        setName("");
        setEmail("");
      }, 900);
    } catch {
      setStatus("error");
      setMessage("전송에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="문의하기"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">문의하기</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-black/60 hover:text-black dark:text-white/70 dark:hover:text-white"
          >
            닫기
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">이메일</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
              required
            />
          </label>

          {message && (
            <p
              className={[
                "text-sm",
                status === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : status === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-black/60 dark:text-white/60",
              ].join(" ")}
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={[
              "mt-2 w-full rounded-2xl px-4 py-3 text-[15px] font-medium transition",
              canSubmit
                ? "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                : "bg-black/10 text-black/40 dark:bg-white/10 dark:text-white/40",
            ].join(" ")}
          >
            {status === "submitting" ? "보내는 중..." : "보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}

