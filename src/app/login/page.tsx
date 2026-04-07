"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/70">
          데모 계정: <span className="font-mono">spider</span> /{" "}
          <span className="font-mono">spider</span>
        </p>

        <form action={action} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">아이디</span>
            <input
              name="username"
              placeholder="username"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">비밀번호</span>
            <input
              name="password"
              type="password"
              placeholder="password"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
              required
            />
          </label>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400" aria-live="polite">
              {state.error}
            </p>
          )}

          <button
            disabled={pending}
            className={[
              "w-full rounded-2xl px-4 py-3 text-[15px] font-medium transition",
              pending
                ? "bg-black/10 text-black/40 dark:bg-white/10 dark:text-white/40"
                : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
            ].join(" ")}
          >
            {pending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 text-sm text-black/60 dark:text-white/70">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-black dark:text-white">
            회원가입
          </Link>
        </div>
      </main>
    </div>
  );
}

