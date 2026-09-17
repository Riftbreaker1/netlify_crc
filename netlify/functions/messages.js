import { getStore } from "@netlify/blobs";

// All messages for the room live under this one key.
const ROOM_KEY = "room:main";

export default async (req) => {
  // The password never ships to the browser — the client sends whatever the
  // user typed, and we compare it here against the ROOM_PASSWORD env var.
  const password = req.headers.get("x-room-password");
  if (!password || password !== process.env.ROOM_PASSWORD) {
    return json({ error: "Wrong password" }, 401);
  }

  const store = getStore({ name: "chat", consistency: "strong" });
  const room = (await store.get(ROOM_KEY, { type: "json" })) || { messages: [] };

  return json({ messages: room.messages });
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const config = { path: "/api/messages" };
