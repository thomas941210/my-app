import { incrementClick } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    const username = String(body.username || "");
    const linkId = String(body.linkId || "");
    if (!username || !linkId) return new Response(null, { status: 400 });
    const count = await incrementClick(username, linkId);
    return Response.json({ ok: true, count });
  } catch {
    return new Response(null, { status: 400 });
  }
}

