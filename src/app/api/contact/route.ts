import { addContactRequest } from "@/lib/store";

async function sendToNotion(input: { name: string; email: string }) {
  const key = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!key || !databaseId) return { ok: false, skipped: true as const };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: input.name } }],
        },
        Email: {
          rich_text: [{ text: { content: input.email } }],
        },
        "Created At": {
          date: { start: new Date().toISOString() },
        },
      },
    }),
  });

  if (!res.ok) throw new Error("NOTION_FAILED");
  return { ok: true as const };
}

export async function POST(req: Request) {
  try {
    const { username, name, email } = (await req.json()) as {
      username?: string;
      name?: string;
      email?: string;
    };
    const safeName = String(name ?? "").trim();
    const safeEmail = String(email ?? "").trim();
    const safeUsername = username ? String(username) : undefined;
    if (!safeName || !safeEmail) return new Response(null, { status: 400 });

    const saved = await addContactRequest({
      username: safeUsername,
      name: safeName,
      email: safeEmail,
    });

    await sendToNotion({ name: safeName, email: safeEmail });
    return Response.json({ ok: true, id: saved.id });
  } catch {
    // Notion이 실패해도, 로컬 저장은 됐을 수 있으니 200 대신 500으로 명확히 처리
    return new Response(null, { status: 500 });
  }
}

