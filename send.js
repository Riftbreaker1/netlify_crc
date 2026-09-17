import { getStore } from "@netlify/blobs";

const ROOM_KEY = "room:main";
const MAX_MESSAGES = 200; // how many recent messages we keep
const MAX_LEN = 2000; // longest a single message can be

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }

  const password = req.headers.get("x-room-password");
  if (!password || password !== process.env.ROOM_PASSWORD) {
    return json({ error: "Wrong password" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request body" }, 400);
  }

  const name = String(body.name || "anon").trim().slice(0, 40) || "anon";
  const text = String(body.text || "").trim().slice(0, MAX_LEN);
  const clientId = String(body.clientId || "").slice(0, 64);

  if (!text) {
    return json({ error: "Message is empty" }, 400);
  }

  const store = getStore({ name: "chat", consistency: "strong" });
  const room = (await store.get(ROOM_KEY, { type: "json" })) || { messages: [] };

  room.messages.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    text,
    clientId,
    ts: Date.now(),
  });

  // Keep only the most recent messages so the store stays small.
  if (room.messages.length > MAX_MESSAGES) {
    room.messages = room.messages.slice(-MAX_MESSAGES);
  }

  await store.setJSON(ROOM_KEY, room);

  return json({ ok: true });
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const config = { path: "/api/send" };
