import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySessionToken } from "./crypto";

const COOKIE_NAME = "session";
const MAX_AGE_DAYS = 7;

function getSecret() {
  // 로컬 개발 UX를 위해 기본값 제공 (운영에서는 반드시 환경변수로 지정)
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

export async function createSession(username: string) {
  const exp = Date.now() + MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const token = signSession({ u: username, exp }, getSecret());

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

