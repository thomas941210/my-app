"use client";

import { useMemo, useState, useTransition } from "react";
import type { ThemeMode, UserLink, UserProfile } from "@/lib/store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  addLinkAction,
  deleteLinkAction,
  reorderLinksAction,
  updateLinkAction,
  updateProfile,
} from "@/app/actions/dashboard";
import { useActionState } from "react";

type TabKey = "profile" | "links" | "stats" | "theme";

export function DashboardClient({
  user,
  links,
  clicks,
  totalClicks,
}: {
  user: UserProfile;
  links: UserLink[];
  clicks: Record<string, number>;
  totalClicks: number;
}) {
  const [tab, setTab] = useState<TabKey>("profile");

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>
          프로필 설정
        </TabButton>
        <TabButton active={tab === "links"} onClick={() => setTab("links")}>
          링크 관리
        </TabButton>
        <TabButton active={tab === "stats"} onClick={() => setTab("stats")}>
          클릭 통계
        </TabButton>
        <TabButton active={tab === "theme"} onClick={() => setTab("theme")}>
          테마 설정
        </TabButton>
      </div>

      {tab === "profile" && <ProfilePanel user={user} />}
      {tab === "links" && <LinksPanel initialLinks={links} clicks={clicks} />}
      {tab === "stats" && <StatsPanel links={links} clicks={clicks} total={totalClicks} />}
      {tab === "theme" && <ThemePanel initial={user.theme} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm transition",
        active
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "border border-[color:var(--border)] text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
      <h2 className="text-sm font-semibold text-black/80 dark:text-white/80">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfilePanel({ user }: { user: UserProfile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <PanelShell title="프로필 설정">
      <form action={action} className="space-y-3">
        <Field label="프로필 이미지 URL" name="imageUrl" defaultValue={user.imageUrl ?? ""} />
        <Field label="닉네임" name="nickname" defaultValue={user.nickname} required />
        <TextArea label="한 줄 소개" name="bio" defaultValue={user.bio} />

        {state?.error && (
          <p className="text-sm text-red-600 dark:text-red-400" aria-live="polite">
            {state.error}
          </p>
        )}

        <SubmitButton pending={pending}>저장</SubmitButton>
      </form>
    </PanelShell>
  );
}

function LinksPanel({
  initialLinks,
  clicks,
}: {
  initialLinks: UserLink[];
  clicks: Record<string, number>;
}) {
  const [state, action, pending] = useActionState(addLinkAction, undefined);
  const [links, setLinks] = useState<UserLink[]>(initialLinks);
  const [isReordering, startReorder] = useTransition();

  const orderedIds = useMemo(() => links.map((l) => l.id), [links]);

  const onMove = (from: number, to: number) => {
    setLinks((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const persistOrder = () => {
    startReorder(async () => {
      await reorderLinksAction(orderedIds);
    });
  };

  return (
    <>
      <PanelShell title="링크 추가">
        <form action={action} className="grid gap-3 md:grid-cols-4">
          <label className="md:col-span-1">
            <span className="text-sm text-black/70 dark:text-white/70">유형</span>
            <select
              name="type"
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-3 py-3 text-[15px] outline-none"
              defaultValue="custom"
            >
              <option value="kakao">오픈 카카오톡</option>
              <option value="youtube">유튜브</option>
              <option value="threads">스레드</option>
              <option value="linkedin">링크드인</option>
              <option value="custom">기타</option>
            </select>
          </label>
          <div className="md:col-span-1">
            <Field label="제목" name="title" placeholder="표시 텍스트" required />
          </div>
          <div className="md:col-span-2">
            <Field label="URL" name="url" placeholder="https://..." required />
          </div>

          {state?.error && (
            <p className="md:col-span-4 text-sm text-red-600 dark:text-red-400" aria-live="polite">
              {state.error}
            </p>
          )}

          <div className="md:col-span-4">
            <SubmitButton pending={pending}>추가</SubmitButton>
          </div>
        </form>
      </PanelShell>

      <PanelShell title="링크 목록 (드래그로 순서 변경)">
        <div className="space-y-2">
          {links.length === 0 && (
            <p className="text-sm text-black/50 dark:text-white/50">아직 링크가 없어요.</p>
          )}
          {links.map((l, idx) => (
            <LinkRow
              key={l.id}
              link={l}
              index={idx}
              move={onMove}
              clicks={clicks[l.id] ?? 0}
              onAfterChange={() => {}}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-black/50 dark:text-white/50">
            순서를 바꿨다면 저장을 눌러주세요.
          </div>
          <button
            type="button"
            onClick={persistOrder}
            disabled={isReordering}
            className={[
              "rounded-full px-4 py-2 text-sm transition",
              isReordering
                ? "bg-black/10 text-black/40 dark:bg-white/10 dark:text-white/40"
                : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
            ].join(" ")}
          >
            {isReordering ? "저장 중..." : "순서 저장"}
          </button>
        </div>
      </PanelShell>
    </>
  );
}

function LinkRow({
  link,
  index,
  move,
  clicks,
}: {
  link: UserLink;
  index: number;
  move: (from: number, to: number) => void;
  clicks: number;
  onAfterChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateLinkAction.bind(null, link.id), undefined);
  const [isDeleting, startDel] = useTransition();

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (!Number.isFinite(from)) return;
    if (from === index) return;
    move(from, index);
  };

  return (
    <div
      className="rounded-2xl border border-[color:var(--border)] p-4"
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{link.title}</span>
            <span className="text-xs text-black/40 dark:text-white/40">({clicks} 클릭)</span>
          </div>
          <div className="mt-1 truncate text-xs text-black/50 dark:text-white/50">{link.url}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
          >
            {editing ? "닫기" : "수정"}
          </button>
          <button
            type="button"
            onClick={() =>
              startDel(async () => {
                await deleteLinkAction(link.id);
              })
            }
            disabled={isDeleting}
            className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>

      {editing && (
        <form action={action} className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="md:col-span-1">
            <span className="text-sm text-black/70 dark:text-white/70">유형</span>
            <select
              name="type"
              defaultValue={link.type}
              className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-3 py-3 text-[15px] outline-none"
            >
              <option value="kakao">오픈 카카오톡</option>
              <option value="youtube">유튜브</option>
              <option value="threads">스레드</option>
              <option value="linkedin">링크드인</option>
              <option value="custom">기타</option>
            </select>
          </label>
          <div className="md:col-span-1">
            <Field label="제목" name="title" defaultValue={link.title} required />
          </div>
          <div className="md:col-span-2">
            <Field label="URL" name="url" defaultValue={link.url} required />
          </div>

          {state?.error && (
            <p className="md:col-span-4 text-sm text-red-600 dark:text-red-400" aria-live="polite">
              {state.error}
            </p>
          )}

          <div className="md:col-span-4">
            <SubmitButton pending={pending}>저장</SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

function StatsPanel({
  links,
  clicks,
  total,
}: {
  links: UserLink[];
  clicks: Record<string, number>;
  total: number;
}) {
  const rows = useMemo(() => {
    return links
      .map((l) => ({ id: l.id, title: l.title, clicks: clicks[l.id] ?? 0 }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [links, clicks]);

  return (
    <PanelShell title="클릭 통계">
      <div className="flex items-baseline justify-between">
        <div className="text-sm text-black/60 dark:text-white/70">총 클릭</div>
        <div className="text-2xl font-semibold tracking-tight">{total}</div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[color:var(--border)]">
        <div className="grid grid-cols-[1fr_auto] gap-2 bg-black/[.03] px-4 py-2 text-xs text-black/60 dark:bg-white/10 dark:text-white/70">
          <div>링크</div>
          <div>클릭</div>
        </div>
        <div className="divide-y divide-[color:var(--border)]">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_auto] gap-2 px-4 py-3 text-sm">
              <div className="truncate">{r.title}</div>
              <div className="font-mono">{r.clicks}</div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="px-4 py-4 text-sm text-black/50 dark:text-white/50">
              아직 링크가 없어요.
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function ThemePanel({ initial }: { initial: ThemeMode }) {
  return (
    <PanelShell title="테마 설정">
      <p className="text-sm text-black/60 dark:text-white/70">
        공개 페이지 상단의 토글과 동일하게 동작해요. (현재:{" "}
        <span className="font-mono">{initial}</span>)
      </p>
      <div className="mt-4">
        <ThemeToggle />
      </div>
    </PanelShell>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-black/70 dark:text-white/70">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-black/70 dark:text-white/70">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="mt-1 w-full resize-none rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15"
      />
    </label>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      disabled={pending}
      className={[
        "w-full rounded-2xl px-4 py-3 text-[15px] font-medium transition",
        pending
          ? "bg-black/10 text-black/40 dark:bg-white/10 dark:text-white/40"
          : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
      ].join(" ")}
    >
      {pending ? "처리 중..." : children}
    </button>
  );
}

