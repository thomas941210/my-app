import Link from "next/link";

export default function UserNotFound() {
  return (
    <div className="flex flex-1 justify-center px-4 py-16">
      <main className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">사용자를 찾을 수 없어요</h1>
        <p className="mt-3 text-sm text-black/60 dark:text-white/70">
          입력한 주소의 유저네임이 존재하지 않거나, 아직 프로필이 생성되지 않았을 수 있어요.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/me"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            내 공개페이지로 이동
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--border)] px-5 py-3 text-sm font-medium text-black/80 transition hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            대시보드로 이동
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--border)] px-5 py-3 text-sm font-medium text-black/80 transition hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            홈으로 이동
          </Link>
        </div>
      </main>
    </div>
  );
}

