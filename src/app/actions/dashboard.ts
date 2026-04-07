"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import {
  addLink,
  deleteLink,
  type LinkType,
  reorderLinks,
  updateLink,
  updateUserProfile,
} from "@/lib/store";

type ActionState = { error?: string } | undefined;

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function safeUrl(v: unknown) {
  const s = safeText(v);
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function parseLinkType(v: unknown): LinkType {
  const t = safeText(v);
  if (t === "kakao" || t === "youtube" || t === "threads" || t === "linkedin" || t === "custom") {
    return t;
  }
  return "custom";
}

export async function updateProfile(state: ActionState, formData: FormData): Promise<ActionState> {
  const username = await requireUser();
  const nickname = safeText(formData.get("nickname"));
  const bio = safeText(formData.get("bio"));
  const imageUrl = safeText(formData.get("imageUrl"));

  if (!nickname) return { error: "닉네임을 입력해주세요." };
  if (bio.length > 120) return { error: "한 줄 소개는 120자 이하로 입력해주세요." };

  await updateUserProfile(username, {
    nickname,
    bio,
    imageUrl: imageUrl || undefined,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/${username}`);
}

export async function addLinkAction(state: ActionState, formData: FormData): Promise<ActionState> {
  const username = await requireUser();
  const type = parseLinkType(formData.get("type"));
  const title = safeText(formData.get("title"));
  const url = safeUrl(formData.get("url"));

  if (!title) return { error: "링크 제목을 입력해주세요." };
  if (!url) return { error: "유효한 URL(https://...)을 입력해주세요." };

  await addLink(username, { type, title, url });
  revalidatePath("/dashboard");
  revalidatePath(`/${username}`);
}

export async function updateLinkAction(
  linkId: string,
  state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = await requireUser();
  const type = parseLinkType(formData.get("type"));
  const title = safeText(formData.get("title"));
  const url = safeUrl(formData.get("url"));
  if (!title) return { error: "링크 제목을 입력해주세요." };
  if (!url) return { error: "유효한 URL(https://...)을 입력해주세요." };

  await updateLink(username, linkId, { type, title, url });
  revalidatePath("/dashboard");
  revalidatePath(`/${username}`);
}

export async function deleteLinkAction(linkId: string) {
  const username = await requireUser();
  await deleteLink(username, linkId);
  revalidatePath("/dashboard");
  revalidatePath(`/${username}`);
}

export async function reorderLinksAction(orderedIds: string[]) {
  const username = await requireUser();
  await reorderLinks(username, orderedIds);
  revalidatePath("/dashboard");
  revalidatePath(`/${username}`);
}

