"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <main className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/70">
          아이디는 공개 페이지 URL(<span className="font-mono">/{`{username}`}</span>)에 사용돼요.
        </p>

        <form action={action} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">아이디</span>
            <input
              name="username"
              placeholder="예: spider_02"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">닉네임</span>
            <input
              name="nickname"
              placeholder="표시 이름"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-black/70 dark:text-white/70">비밀번호</span>
            <input
              name="password"
              type="password"
              placeholder="6자 이상"
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
            {pending ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-6 text-sm text-black/60 dark:text-white/70">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-black dark:text-white">
            로그인
          </Link>
        </div>
      </main>
    </div>
  );
}

