import { promises as fs } from "node:fs";
import path from "node:path";

export type ThemeMode = "light" | "dark" | "auto";

export type LinkType = "kakao" | "youtube" | "threads" | "linkedin" | "custom";

export type UserProfile = {
  username: string;
  passwordHash: string;
  imageUrl?: string;
  nickname: string;
  bio: string;
  theme: ThemeMode;
  createdAt: string;
  updatedAt: string;
};

export type UserLink = {
  id: string;
  type: LinkType;
  title: string;
  url: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactRequest = {
  id: string;
  username?: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Db = {
  users: Record<string, UserProfile>;
  links: Record<string, UserLink[]>;
  clicks: Record<string, Record<string, number>>; // username -> linkId -> count
  contacts: ContactRequest[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const KV_KEY = "linkinbio:db:v1";

const emptyDb: Db = {
  users: {},
  links: {},
  clicks: {},
  contacts: [],
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function getKv() {
  // Vercel Redis/KV 환경변수가 있으면 그쪽을 사용 (서버리스에서 파일쓰기 문제 회피)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  const mod = await import("@vercel/kv");
  return mod.kv;
}

export async function readDb(): Promise<Db> {
  const kv = await getKv();
  if (kv) {
    const parsed = (await kv.get<Db>(KV_KEY)) ?? emptyDb;
    return {
      ...emptyDb,
      ...parsed,
      users: parsed.users ?? {},
      links: parsed.links ?? {},
      clicks: parsed.clicks ?? {},
      contacts: parsed.contacts ?? [],
    };
  }

  await ensureDataDir();
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Db;
    return {
      ...emptyDb,
      ...parsed,
      users: parsed.users ?? {},
      links: parsed.links ?? {},
      clicks: parsed.clicks ?? {},
      contacts: parsed.contacts ?? [],
    };
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") return emptyDb;
    throw err;
  }
}

async function writeDb(db: Db) {
  const kv = await getKv();
  if (kv) {
    await kv.set(KV_KEY, db);
    return;
  }

  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  const r = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${r}`;
}

export async function ensureSeedUser() {
  const db = await readDb();
  if (db.users["spider"]) return;

  const createdAt = nowIso();
  db.users["spider"] = {
    username: "spider",
    passwordHash:
      "demo:spider", // 데모용. 실제 서비스에서는 절대 이렇게 저장하면 안 됨.
    imageUrl: "/avatar-demo.svg",
    nickname: "스파이더",
    bio: "누구나 만들 수 있다",
    theme: "auto",
    createdAt,
    updatedAt: createdAt,
  };

  db.links["spider"] = [
    {
      id: randomId("link"),
      type: "kakao",
      title: "오픈 카카오톡",
      url: "https://open.kakao.com/",
      order: 0,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: randomId("link"),
      type: "youtube",
      title: "유튜브",
      url: "https://www.youtube.com/",
      order: 1,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: randomId("link"),
      type: "threads",
      title: "스레드",
      url: "https://www.threads.net/",
      order: 2,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: randomId("link"),
      type: "linkedin",
      title: "링크드인",
      url: "https://www.linkedin.com/",
      order: 3,
      createdAt,
      updatedAt: createdAt,
    },
  ];
  db.clicks["spider"] = {};

  await writeDb(db);
}

export async function getUser(username: string) {
  const db = await readDb();
  return db.users[username] ?? null;
}

export async function getUserByCredentials(input: {
  username: string;
}) {
  const db = await readDb();
  return db.users[input.username] ?? null;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  nickname: string;
  bio?: string;
}) {
  const db = await readDb();
  if (db.users[input.username]) {
    throw new Error("USER_EXISTS");
  }
  const ts = nowIso();
  db.users[input.username] = {
    username: input.username,
    passwordHash: input.passwordHash,
    imageUrl: "/avatar-demo.svg",
    nickname: input.nickname,
    bio: input.bio ?? "",
    theme: "auto",
    createdAt: ts,
    updatedAt: ts,
  };
  db.links[input.username] = [];
  db.clicks[input.username] = {};
  await writeDb(db);
  return db.users[input.username];
}

export async function updateUserProfile(
  username: string,
  patch: Partial<Pick<UserProfile, "imageUrl" | "nickname" | "bio" | "theme">>,
) {
  const db = await readDb();
  const user = db.users[username];
  if (!user) throw new Error("NOT_FOUND");
  db.users[username] = { ...user, ...patch, updatedAt: nowIso() };
  await writeDb(db);
  return db.users[username];
}

export async function listLinks(username: string) {
  const db = await readDb();
  const links = db.links[username] ?? [];
  return [...links].sort((a, b) => a.order - b.order);
}

export async function addLink(
  username: string,
  input: Pick<UserLink, "type" | "title" | "url">,
) {
  const db = await readDb();
  if (!db.users[username]) throw new Error("NOT_FOUND");
  const ts = nowIso();
  const existing = db.links[username] ?? [];
  const order = existing.length ? Math.max(...existing.map((l) => l.order)) + 1 : 0;
  const link: UserLink = {
    id: randomId("link"),
    type: input.type,
    title: input.title,
    url: input.url,
    order,
    createdAt: ts,
    updatedAt: ts,
  };
  db.links[username] = [...existing, link];
  await writeDb(db);
  return link;
}

export async function updateLink(
  username: string,
  linkId: string,
  patch: Partial<Pick<UserLink, "type" | "title" | "url">>,
) {
  const db = await readDb();
  const links = db.links[username] ?? [];
  const idx = links.findIndex((l) => l.id === linkId);
  if (idx < 0) throw new Error("NOT_FOUND");
  links[idx] = { ...links[idx], ...patch, updatedAt: nowIso() };
  db.links[username] = links;
  await writeDb(db);
  return links[idx];
}

export async function deleteLink(username: string, linkId: string) {
  const db = await readDb();
  const links = db.links[username] ?? [];
  db.links[username] = links.filter((l) => l.id !== linkId);
  await writeDb(db);
}

export async function reorderLinks(username: string, orderedIds: string[]) {
  const db = await readDb();
  const links = db.links[username] ?? [];
  const map = new Map(links.map((l) => [l.id, l]));
  const next: UserLink[] = [];
  orderedIds.forEach((id, i) => {
    const link = map.get(id);
    if (!link) return;
    next.push({ ...link, order: i, updatedAt: nowIso() });
    map.delete(id);
  });
  // 누락된 링크는 마지막에 붙임
  Array.from(map.values())
    .sort((a, b) => a.order - b.order)
    .forEach((l) => next.push({ ...l, order: next.length, updatedAt: nowIso() }));
  db.links[username] = next;
  await writeDb(db);
  return next;
}

export async function incrementClick(username: string, linkId: string) {
  const db = await readDb();
  db.clicks[username] ??= {};
  db.clicks[username][linkId] = (db.clicks[username][linkId] ?? 0) + 1;
  await writeDb(db);
  return db.clicks[username][linkId];
}

export async function getClickStats(username: string) {
  const db = await readDb();
  const clicks = db.clicks[username] ?? {};
  const total = Object.values(clicks).reduce((a, b) => a + b, 0);
  return { total, perLink: clicks };
}

export async function addContactRequest(input: {
  username?: string;
  name: string;
  email: string;
}) {
  const db = await readDb();
  const req: ContactRequest = {
    id: randomId("contact"),
    username: input.username,
    name: input.name,
    email: input.email,
    createdAt: nowIso(),
  };
  db.contacts = [req, ...(db.contacts ?? [])];
  await writeDb(db);
  return req;
}

