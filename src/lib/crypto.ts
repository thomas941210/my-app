import crypto from "node:crypto";

const PBKDF2_ITERS = 120_000;
const KEYLEN = 32;
const DIGEST = "sha256";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERS, KEYLEN, DIGEST)
    .toString("hex");
  return `pbkdf2$${PBKDF2_ITERS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("demo:")) {
    return stored === `demo:${password}`;
  }

  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [, itersRaw, salt, hash] = parts;
  const iters = Number(itersRaw);
  if (!Number.isFinite(iters) || iters <= 0) return false;

  const computed = crypto.pbkdf2Sync(password, salt, iters, KEYLEN, DIGEST).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64urlToBuffer(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return Buffer.from(b64, "base64");
}

export type SessionPayload = { u: string; exp: number };

export function signSession(payload: SessionPayload, secret: string) {
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(body).digest();
  return `${body}.${base64url(sig)}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", secret).update(body).digest();
  const got = base64urlToBuffer(sig);
  if (got.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(got, expected)) return null;

  const payload = JSON.parse(base64urlToBuffer(body).toString("utf8")) as SessionPayload;
  if (!payload?.u || !payload?.exp) return null;
  if (Date.now() > payload.exp) return null;
  return payload;
}

