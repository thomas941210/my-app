import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getClickStats, getUser, listLinks } from "@/lib/store";
import { logout } from "@/app/actions/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const username = await requireUser();
  const user = await getUser(username);
  const links = await listLinks(username);
  const stats = await getClickStats(username);

  if (!user) {
    // 세션은 있는데 유저가 없다면(로컬 DB 초기화 등) 홈으로 유도
    return (
      <div className="flex flex-1 justify-center px-4 py-10">
        <main className="w-full max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/70">
            사용자 정보를 찾을 수 없어요. 다시 로그인해주세요.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              로그인으로 이동
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <main className="w-full max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
            <p className="mt-1 text-sm text-black/60 dark:text-white/70">
              내 공개 페이지:{" "}
              <Link
                className="font-mono text-black/80 underline decoration-black/20 underline-offset-4 dark:text-white/80 dark:decoration-white/20"
                href={`/${username}`}
              >
                /{username}
              </Link>
            </p>
            <div className="mt-3">
              <Link
                href="/me"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-4 py-2 text-sm text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
              >
                내 공개페이지 열기
              </Link>
            </div>
          </div>

          <form action={logout}>
            <button className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white">
              로그아웃
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="닉네임" value={user?.nickname ?? "-"} />
          <Card title="링크 개수" value={`${links.length}`} />
          <Card title="총 클릭" value={`${stats.total}`} />
        </div>

        <DashboardClient
          user={user}
          links={links}
          clicks={stats.perLink}
          totalClicks={stats.total}
        />
      </main>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
      <div className="text-xs font-medium text-black/50 dark:text-white/50">{title}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

