"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { createUser, getUser } from "@/lib/store";
import { hashPassword, verifyPassword } from "@/lib/crypto";

type ActionState = { error?: string } | undefined;

function normalizeUsername(raw: unknown) {
  const u = String(raw ?? "").trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return null;
  return u;
}

export async function signup(state: ActionState, formData: FormData): Promise<ActionState> {
  const username = normalizeUsername(formData.get("username"));
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username) return { error: "아이디는 영문/숫자/언더스코어 3~20자로 입력해주세요." };
  if (!nickname) return { error: "닉네임을 입력해주세요." };
  if (password.length < 6) return { error: "비밀번호는 6자 이상으로 입력해주세요." };

  try {
    const user = await createUser({
      username,
      passwordHash: hashPassword(password),
      nickname,
      bio: "",
    });
    await createSession(user.username);
  } catch (e: any) {
    if (String(e?.message) === "USER_EXISTS") {
      return { error: "이미 사용 중인 아이디예요." };
    }
    return { error: "회원가입에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  redirect(`/${username}`);
}

export async function login(state: ActionState, formData: FormData): Promise<ActionState> {
  const username = normalizeUsername(formData.get("username"));
  const password = String(formData.get("password") ?? "");
  if (!username) return { error: "아이디를 확인해주세요." };
  if (!password) return { error: "비밀번호를 입력해주세요." };

  const user = await getUser(username);
  if (!user) return { error: "아이디 또는 비밀번호가 올바르지 않아요." };
  if (!verifyPassword(password, user.passwordHash)) {
    return { error: "아이디 또는 비밀번호가 올바르지 않아요." };
  }

  await createSession(user.username);
  redirect(`/${username}`);
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

