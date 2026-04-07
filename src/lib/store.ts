import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin } from "./supabase-admin";

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
const emptyDb: Db = {
  users: {},
  links: {},
  clicks: {},
  contacts: [],
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readDb(): Promise<Db> {
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

function ensureWritableStore(supabase: ReturnType<typeof getSupabaseAdmin>) {
  if (!supabase && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_CONFIG_MISSING");
  }
}

function mapUserRow(row: Record<string, unknown>): UserProfile {
  return {
    username: String(row.username),
    passwordHash: String(row.password_hash),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    nickname: String(row.nickname),
    bio: row.bio ? String(row.bio) : "",
    theme: (row.theme ? String(row.theme) : "auto") as ThemeMode,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapLinkRow(row: Record<string, unknown>): UserLink {
  return {
    id: String(row.id),
    type: String(row.type) as LinkType,
    title: String(row.title),
    url: String(row.url),
    order: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function ensureSeedUser() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", "spider")
      .maybeSingle();
    if (existing) return;

    const ts = nowIso();
    await supabase.from("profiles").insert({
      username: "spider",
      password_hash: "demo:spider",
      image_url: "/avatar-demo.svg",
      nickname: "스파이더",
      bio: "누구나 만들 수 있다",
      theme: "auto",
      created_at: ts,
      updated_at: ts,
    });

    await supabase.from("links").insert([
      {
        id: randomId("link"),
        username: "spider",
        type: "kakao",
        title: "오픈 카카오톡",
        url: "https://open.kakao.com/",
        sort_order: 0,
        created_at: ts,
        updated_at: ts,
      },
      {
        id: randomId("link"),
        username: "spider",
        type: "youtube",
        title: "유튜브",
        url: "https://www.youtube.com/",
        sort_order: 1,
        created_at: ts,
        updated_at: ts,
      },
      {
        id: randomId("link"),
        username: "spider",
        type: "threads",
        title: "스레드",
        url: "https://www.threads.net/",
        sort_order: 2,
        created_at: ts,
        updated_at: ts,
      },
      {
        id: randomId("link"),
        username: "spider",
        type: "linkedin",
        title: "링크드인",
        url: "https://www.linkedin.com/",
        sort_order: 3,
        created_at: ts,
        updated_at: ts,
      },
    ]);
    return;
  }

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
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();
    return data ? mapUserRow(data) : null;
  }

  const db = await readDb();
  return db.users[username] ?? null;
}

export async function getUserByCredentials(input: {
  username: string;
}) {
  return getUser(input.username);
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  nickname: string;
  bio?: string;
}) {
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const ts = nowIso();
    const { data: existing } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", input.username)
      .maybeSingle();
    if (existing) throw new Error("USER_EXISTS");

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        username: input.username,
        password_hash: input.passwordHash,
        image_url: "/avatar-demo.svg",
        nickname: input.nickname,
        bio: input.bio ?? "",
        theme: "auto",
        created_at: ts,
        updated_at: ts,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapUserRow(data);
  }

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
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const payload: Record<string, unknown> = {
      updated_at: nowIso(),
    };
    if (patch.imageUrl !== undefined) payload.image_url = patch.imageUrl;
    if (patch.nickname !== undefined) payload.nickname = patch.nickname;
    if (patch.bio !== undefined) payload.bio = patch.bio;
    if (patch.theme !== undefined) payload.theme = patch.theme;

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("username", username)
      .select("*")
      .single();
    if (error) throw error;
    return mapUserRow(data);
  }

  const db = await readDb();
  const user = db.users[username];
  if (!user) throw new Error("NOT_FOUND");
  db.users[username] = { ...user, ...patch, updatedAt: nowIso() };
  await writeDb(db);
  return db.users[username];
}

export async function listLinks(username: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("username", username)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapLinkRow);
  }

  const db = await readDb();
  const links = db.links[username] ?? [];
  return [...links].sort((a, b) => a.order - b.order);
}

export async function addLink(
  username: string,
  input: Pick<UserLink, "type" | "title" | "url">,
) {
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const { data: user } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();
    if (!user) throw new Error("NOT_FOUND");

    const { data: last } = await supabase
      .from("links")
      .select("sort_order")
      .eq("username", username)
      .order("sort_order", { ascending: false })
      .limit(1);
    const order = last?.[0]?.sort_order != null ? Number(last[0].sort_order) + 1 : 0;
    const ts = nowIso();
    const payload = {
      id: randomId("link"),
      username,
      type: input.type,
      title: input.title,
      url: input.url,
      sort_order: order,
      created_at: ts,
      updated_at: ts,
    };
    const { data, error } = await supabase.from("links").insert(payload).select("*").single();
    if (error) throw error;
    return mapLinkRow(data);
  }

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
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const payload: Record<string, unknown> = { updated_at: nowIso() };
    if (patch.type !== undefined) payload.type = patch.type;
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.url !== undefined) payload.url = patch.url;
    const { data, error } = await supabase
      .from("links")
      .update(payload)
      .eq("username", username)
      .eq("id", linkId)
      .select("*")
      .single();
    if (error) throw error;
    return mapLinkRow(data);
  }

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
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const { error } = await supabase.from("links").delete().eq("username", username).eq("id", linkId);
    if (error) throw error;
    return;
  }

  const db = await readDb();
  const links = db.links[username] ?? [];
  db.links[username] = links.filter((l) => l.id !== linkId);
  await writeDb(db);
}

export async function reorderLinks(username: string, orderedIds: string[]) {
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("username", username);
    if (error) throw error;
    const links = (data ?? []).map(mapLinkRow);
    const map = new Map(links.map((l) => [l.id, l]));
    const next: UserLink[] = [];
    orderedIds.forEach((id, i) => {
      const link = map.get(id);
      if (!link) return;
      next.push({ ...link, order: i, updatedAt: nowIso() });
      map.delete(id);
    });
    Array.from(map.values())
      .sort((a, b) => a.order - b.order)
      .forEach((l) => next.push({ ...l, order: next.length, updatedAt: nowIso() }));

    for (const link of next) {
      await supabase
        .from("links")
        .update({ sort_order: link.order, updated_at: link.updatedAt })
        .eq("username", username)
        .eq("id", link.id);
    }
    return next;
  }

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
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const { data } = await supabase
      .from("link_clicks")
      .select("clicks")
      .eq("username", username)
      .eq("link_id", linkId)
      .maybeSingle();
    const next = Number(data?.clicks ?? 0) + 1;
    const { error } = await supabase.from("link_clicks").upsert(
      {
        username,
        link_id: linkId,
        clicks: next,
      },
      { onConflict: "username,link_id" },
    );
    if (error) throw error;
    return next;
  }

  const db = await readDb();
  db.clicks[username] ??= {};
  db.clicks[username][linkId] = (db.clicks[username][linkId] ?? 0) + 1;
  await writeDb(db);
  return db.clicks[username][linkId];
}

export async function getClickStats(username: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("link_clicks")
      .select("link_id, clicks")
      .eq("username", username);
    if (error) throw error;
    const perLink: Record<string, number> = {};
    for (const row of data ?? []) {
      perLink[row.link_id] = Number(row.clicks ?? 0);
    }
    const total = Object.values(perLink).reduce((a, b) => a + b, 0);
    return { total, perLink };
  }

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
  const supabase = getSupabaseAdmin();
  ensureWritableStore(supabase);
  if (supabase) {
    const payload = {
      id: randomId("contact"),
      username: input.username ?? null,
      name: input.name,
      email: input.email,
      created_at: nowIso(),
    };
    const { data, error } = await supabase.from("contacts").insert(payload).select("*").single();
    if (error) throw error;
    return {
      id: data.id,
      username: data.username ?? undefined,
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
    };
  }

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

