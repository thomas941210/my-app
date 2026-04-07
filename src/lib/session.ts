import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySessionToken } from "./crypto";

const COOKIE_NAME = "session";
const MAX_AGE_DAYS = 7;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  return secret || "dev-secret-change-me";
}

function getRequiredSecret() {
  const secret = process.env.SESSION_SECRET;
  // 운영(배포)에서는 기본값으로 돌아가면 보안 사고로 이어질 수 있어 강제합니다.
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("SESSION_SECRET_MISSING");
  }
  return getSecret();
}

export async function createSession(username: string) {
  const exp = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const token = signSession({ u: username, exp }, getRequiredSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(exp),
  });
}

export async function deleteSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionUsername(): Promise<string | null> {
  // 운영 환경에서 시크릿이 없으면 세션을 읽지 않고 비로그인 처리 (500 방지)
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    return null;
  }
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token, getSecret());
  return payload?.u ?? null;
}

export async function requireUser() {
  const u = await getSessionUsername();
  if (!u) redirect("/login");
  return u;
}

