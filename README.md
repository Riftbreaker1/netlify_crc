# lil chat room (disguised as a calculator)

At `/calc` visitors see a working calculator. Enter a username and the password
in the sign-in box under it, and you drop into the chat room. One page, two
functions, messages stored in Netlify Blobs.

## Setup

1. **Drop these files in your repo**, keeping the folder layout:

   ```
   calc.html
   netlify.toml
   package.json
   netlify/functions/messages.js
   netlify/functions/send.js
   ```

2. **Set the password.** In Netlify: Site configuration -> Environment variables ->
   add a variable named `ROOM_PASSWORD` with whatever password you want. This is
   what the sign-in box checks. (Until you set it, nobody can get in.)

3. **Deploy**, then open `yoursite.com/calc`.

## How the disguise works

- The page is a real 4-function calculator (+ - x /), so it holds up to a glance.
- Under it is a sign-in box. The **username is just your display name** (any name
  works, it's what shows on your messages). The **password** is the real gate,
  checked by the backend against `ROOM_PASSWORD`.
- A wrong password just says "Incorrect username or password" like any login.
- Correct password -> the calculator is replaced by the chat. "Leave" puts the
  calculator back (and the browser tab title flips back to "Calculator" too).
- The site root `/` is a 404 — nothing there hints anything exists.

## Tweaks

- Rename the room: change `ROOM_NAME` near the top of the `<script>` in `calc.html`.
- Change the path: rename `calc.html` and update `from`/`to` in `netlify.toml`.
- Keep more/fewer messages: `MAX_MESSAGES` in `netlify/functions/send.js` (default 200).
- Change refresh rate: `POLL_MS` in `calc.html` (default 2s).

## Good to know

- The password is checked inside the functions using the env var, so it never
  ships to the browser — viewing source won't reveal it.
- Messages are plain text in Netlify Blobs (not encrypted), one shared feed.
- Refresh happens by polling every couple seconds. Fine for a small room.
- Messages are stored in one record, trimmed to the most recent 200. If two
  people send at the exact same instant, one could get clobbered — rare for a
  handful of friends, but switchable to one-record-per-message if you want.
