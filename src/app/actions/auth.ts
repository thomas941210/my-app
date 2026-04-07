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

function friendlySignupError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "USER_EXISTS") return "이미 사용 중인 아이디예요.";
    if (e.message === "SESSION_SECRET_MISSING") {
      return "서버 설정 오류: SESSION_SECRET이 설정되지 않았어요. 관리자에게 문의해주세요.";
    }
    if (e.message === "SUPABASE_CONFIG_MISSING") {
      return "서버 설정 오류: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 Production에 설정되지 않았어요.";
    }
  }
  return "회원가입에 실패했어요. 잠시 후 다시 시도해주세요.";
}

function friendlyLoginError(e: unknown) {
  if (e instanceof Error && e.message === "SESSION_SECRET_MISSING") {
    return "서버 설정 오류: SESSION_SECRET이 설정되지 않았어요. 관리자에게 문의해주세요.";
  }
  return "로그인에 실패했어요. 잠시 후 다시 시도해주세요.";
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
  } catch (e: unknown) {
    return { error: friendlySignupError(e) };
  }

  redirect(`/${username}`);
}

export async function login(state: ActionState, formData: FormData): Promise<ActionState> {
  const username = normalizeUsername(formData.get("username"));
  const password = String(formData.get("password") ?? "");
  if (!username) return { error: "아이디를 확인해주세요." };
  if (!password) return { error: "비밀번호를 입력해주세요." };

  try {
    const user = await getUser(username);
    if (!user) return { error: "아이디 또는 비밀번호가 올바르지 않아요." };
    if (!verifyPassword(password, user.passwordHash)) {
      return { error: "아이디 또는 비밀번호가 올바르지 않아요." };
    }

    await createSession(user.username);
    redirect(`/${username}`);
  } catch (e: unknown) {
    return { error: friendlyLoginError(e) };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

