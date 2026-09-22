import { getStore } from "@netlify/blobs";

// The whole top 10 lives under this one key.
const BOARD_KEY = "top10";
const MAX_ENTRIES = 10;
const MAX_PROFIT = 1_000_000; // ignore silly numbers from people poking the console

export default async (req) => {
  // Same gate as the chat: the page sends the password it signed in with.
  const password = req.headers.get("x-room-password");
  if (!password || password !== process.env.ROOM_PASSWORD) {
    return json({ error: "Wrong password" }, 401);
  }

  const store = getStore({ name: "leaderboard", consistency: "strong" });
  const top = (await store.get(BOARD_KEY, { type: "json" })) || [];

  // GET = "give me the current top 10"
  if (req.method === "GET") {
    return json({ top });
  }

  // POST = "here's a win, add it if it's good enough"
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Bad request body" }, 400);
    }

    const name = String(body.name || "anon").trim().slice(0, 40) || "anon";
    const game = body.game === "Upgrader" ? "Upgrader" : "Slots";
    const profit = Math.round(Number(body.profit) * 100) / 100;

    if (!Number.isFinite(profit) || profit <= 0 || profit > MAX_PROFIT) {
      return json({ error: "Profit must be a positive number" }, 400);
    }

    const result = insertScore(top, { name, game, profit, ts: Date.now() });
    if (result.added) await store.setJSON(BOARD_KEY, result.top);

    return json({ top: result.top, added: result.added });
  }

  return json({ error: "Use GET or POST" }, 405);
};

// Puts the entry in if the board isn't full or it beats the lowest score.
// Kept separate so it's easy to read (and test) on its own.
export function insertScore(top, entry) {
  const lowest = top.length ? top[top.length - 1].profit : 0;
  if (top.length >= MAX_ENTRIES && entry.profit <= lowest) {
    return { top, added: false };
  }
  const next = [...top, entry]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, MAX_ENTRIES);
  return { top: next, added: true };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const config = { path: "/api/leaderboard" };
