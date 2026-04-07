import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ensureSeedUser } from "@/lib/store";

export default async function Home() {
  await ensureSeedUser();
  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <main className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-black/50 dark:text-white/50">Link-in-Bio</div>
          <ThemeToggle compact />
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">
          링크를 한 페이지에,
          <br />
          깔끔하게 모아 공유하세요.
        </h1>
        <p className="mt-4 text-base leading-7 text-black/60 dark:text-white/70">
          <span className="font-mono text-black/70 dark:text-white/70">/{`{username}`}</span>{" "}
          형태의 공개 프로필 페이지와, 링크 관리/통계를 볼 수 있는 마이페이지를 제공합니다.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/spider"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            데모 보기
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--border)] px-5 py-3 text-sm font-medium text-black/80 transition hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--border)] px-5 py-3 text-sm font-medium text-black/80 transition hover:text-black dark:text-white/80 dark:hover:text-white"
          >
            회원가입
          </Link>
        </div>

        <div className="mt-10 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <h2 className="text-sm font-semibold text-black/80 dark:text-white/80">포함 기능</h2>
          <ul className="mt-3 space-y-2 text-sm text-black/60 dark:text-white/70">
            <li>- 공개 프로필: 프로필 이미지 / 닉네임 / 한 줄 소개 / 링크 버튼 리스트</li>
            <li>- 테마: Light / Dark / Auto (OS 연동)</li>
            <li>- 문의하기: 모달 입력 → 서버 저장 (+ Notion 연동 가능)</li>
            <li>- 대시보드: 프로필/링크 CRUD, 드래그 정렬, 클릭 통계</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
