import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const SOURCE = "groupme";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type, authorization, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
type Message = { id: string; created_at: number; user_id: string; sender_type?: string; system?: boolean; text?: string; name?: string };
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function dictionary(name: string): Record<string, string> {
  try { return JSON.parse(Deno.env.get(name) || "{}"); } catch { return {}; }
}
function human(message: Message) {
  return !message.system && message.sender_type !== "bot" && message.sender_type !== "system" && typeof message.text === "string" && Boolean(message.text.trim());
}
export function contextFrom(messages: Message[], current: Message) {
  return messages.filter(m => human(m) && m.user_id === current.user_id && m.id !== current.id && m.created_at <= current.created_at && m.created_at >= current.created_at - 600)
    .sort((a, b) => a.created_at - b.created_at || (BigInt(a.id) < BigInt(b.id) ? -1 : 1))
    .slice(-4).map(m => Array.from(m.text!).slice(0, 500).join(""));
}
export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (!["GET", "POST"].includes(req.method)) return json({ ok: false, message: "Use GET to check or POST to read new messages." }, 405);
  const token = Deno.env.get("GROUPME_TOKEN") || "";
  const group = Deno.env.get("GROUPME_GROUP_ID") || "";
  const bot = Deno.env.get("GROUPME_BOT_ID") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const key = dictionary("SUPABASE_SECRET_KEYS").default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const publishable = dictionary("SUPABASE_PUBLISHABLE_KEYS").default || "";
  const ready = Boolean(token && group && url && key && publishable);
  if (!ready) return json({ ok: true, ready: false, bot: Boolean(bot), last_message_id: null, read_count: 0, message: "The reader needs its GroupMe and Supabase settings in Secrets." }, req.method === "GET" ? 200 : 503);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const deadline = Date.now() + 130000;
  function timeout(maximum: number) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error("The reader reached its time limit; the bookmark was kept for retry.");
    return AbortSignal.timeout(Math.min(maximum, remaining));
  }
  const groupPath = `/groups/${encodeURIComponent(group)}`;
  // Errors never echo URLs, tokens, group identifiers, or GroupMe response bodies.
  async function groupGet(path: string) {
    const response = await fetch("https://api.groupme.com/v3" + path, { headers: { "X-Access-Token": token }, signal: timeout(15000) });
    if (response.status === 304) return null;
    if (!response.ok) throw new Error("GroupMe could not be reached. Check the saved token and group access.");
    return (await response.json()).response;
  }
  async function messages(params: Record<string, string>): Promise<Message[]> {
    const response = await groupGet(groupPath + "/messages?" + new URLSearchParams(params));
    if (response === null) return [];
    if (!Array.isArray(response?.messages)) throw new Error("GroupMe returned an unreadable message list.");
    return response.messages;
  }
  let lease = "";
  try {
    if (req.method === "GET") {
      const { data, error } = await db.from("channel_cursor").select("last_id,read_count").eq("source", SOURCE).maybeSingle();
      if (error) throw new Error("Run the Stage 14 SQL before checking the reader.");
      let checked: boolean | undefined;
      if (new URL(req.url).searchParams.get("check") === "groupme") {
        await groupGet(groupPath);
        checked = true;
      }
      return json({ ok: true, ready, bot: Boolean(bot), last_message_id: data?.last_id || null, read_count: data?.read_count || 0, ...(checked ? { groupme: true, message: "The token and group access work." } : {}) });
    }
    // The callback body is never trusted or forwarded. A callback only wakes
    // this reader, which reads the configured group through GroupMe's API.
    const { error: initError } = await db.from("channel_cursor").upsert({ source: SOURCE }, { onConflict: "source", ignoreDuplicates: true });
    if (initError) throw new Error("Run the Stage 14 SQL before starting the reader.");
    lease = crypto.randomUUID();
    const { data: cursor, error: lockError } = await db.from("channel_cursor")
      .update({ lease_id: lease, lease_until: new Date(Date.now() + 180000).toISOString() })
      .eq("source", SOURCE).lt("lease_until", new Date().toISOString()).select("last_id,read_count,updated_at").maybeSingle();
    if (lockError) throw new Error("The reader could not lock its bookmark.");
    if (!cursor) { lease = ""; return json({ ok: true, busy: true, message: "Another reader is already running." }); }
    async function bookmark(id: string, count: number) {
      const { data, error } = await db.from("channel_cursor").update({ last_id: id, read_count: count, updated_at: new Date().toISOString() }).eq("source", SOURCE).eq("lease_id", lease).select("source").maybeSingle();
      if (error || !data) throw new Error("The reader could not save its bookmark.");
    }
    if (cursor.last_id === null) {
      const newest = await messages({ limit: "1" });
      await bookmark(newest[0]?.id || "", cursor.read_count);
      return json({ ok: true, initialized: true, message: "Bookmark set. Only new messages will be read." });
    }
    const batch = await messages(cursor.last_id ? { after_id: cursor.last_id, limit: "20" } : { limit: "20" });
    // GroupMe after_id is already ascending; explicit ordering also handles
    // the default (descending) page used when the group started empty.
    batch.sort((a, b) => a.created_at - b.created_at || (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
    let readCount = Number(cursor.read_count), processed = 0;
    const started = Date.now();
    for (const message of batch) {
      // Keep each run bounded. The next scheduled run resumes at the bookmark.
      if (Date.now() - started > 65000) break;
      if (human(message)) {
        let decision: any;
        if (Array.from(message.text!).length > 2000) {
          decision = { ok: false, message: "Please shorten the announcement to 2,000 characters and send it again." };
        } else {
          // Page backwards until four sender messages or the ten-minute window.
          const history: Message[] = [];
          let before = message.id;
          for (let page = 0; page < 10; page++) {
            const older = await messages({ before_id: before, limit: "100" });
            if (!older.length) break;
            history.push(...older);
            if (contextFrom(history, message).length >= 4 || older[older.length - 1].created_at < message.created_at - 600) break;
            const next = older[older.length - 1].id;
            if (next === before) break;
            before = next;
            if (page === 9) throw new Error("Chat history is too busy to read safely; the bookmark was kept for retry.");
          }
          const response = await fetch(url + "/functions/v1/submit-event", {
            method: "POST", headers: { apikey: publishable, "Content-Type": "application/json" }, signal: timeout(60000),
            body: JSON.stringify({ announcement: message.text, source: SOURCE, source_id: message.id, source_name: message.name || "GroupMe member", thread: contextFrom(history, message) }),
          });
          decision = await response.json();
          // Do not consume messages on AI failures, daily limits, or outages.
          if (!response.ok || !decision.ok) throw new Error("The agent could not finish a message; the bookmark was kept for retry.");
        }
        if (bot && !decision.already_read) {
          const reply = ["Club Event Radar", decision.message, ...(Array.isArray(decision.reasons) ? decision.reasons : [])].filter(v => typeof v === "string").join("\n");
          const response = await fetch("https://api.groupme.com/v3/bots/post", {
            method: "POST", headers: { "Content-Type": "application/json", "X-Access-Token": token }, signal: timeout(15000),
            body: JSON.stringify({ bot_id: bot, text: Array.from(reply).slice(0, 1000).join("") }),
          });
          if (!response.ok) throw new Error("The event decision was saved, but the bot reply failed. Check the bot secret and function logs.");
        }
      }
      await bookmark(message.id, ++readCount);
      processed++;
    }
    return json({ ok: true, ready: true, processed, read_count: readCount, bot: Boolean(bot) });
  } catch (error) {
    // Only our own fixed messages are returned, not upstream exception details.
    const safe = error instanceof Error && /^(GroupMe |Run the Stage |The reader |The agent |The event decision |Chat history )/.test(error.message) ? error.message : "The reader could not finish. Check the function logs and saved settings.";
    console.error("read-channel failed", safe);
    return json({ ok: false, message: safe }, 503);
  } finally {
    if (lease) await db.from("channel_cursor").update({ lease_id: null, lease_until: new Date(0).toISOString() }).eq("source", SOURCE).eq("lease_id", lease);
  }
}
if (import.meta.main) Deno.serve(handler);
