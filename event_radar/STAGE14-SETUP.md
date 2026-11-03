# Stage 14: GroupMe setup

Deployment status (November 2, 2026): applied the Stage 14 SQL through the Supabase connection and deployed both `submit-event` and `read-channel` with JWT verification off. Applied the previously prepared Stage 11 SQL as a prerequisite for the current agent. Read-only checks confirmed six active clubs, GroupMe token acceptance and group access, a configured bot, an existing bookmark, and an active `read-chat-channel` job every minute; a scheduled reader run returned HTTP 200. No test posts were sent, and no commit or push was made. Keep your existing GroupMe secrets in Supabase; do not paste their values into files or chat. The steps below are retained for future manual setup.

## 1. Apply the SQL

Open your [Supabase project](https://supabase.com/dashboard/project/sybducqavyxvbqnimrbk), then **SQL Editor → New query**. Open `supabase/migrations/20261030001400_chat_channel.sql` in this folder, copy the entire file, paste it into the SQL Editor, and click **Run**.

The file already contains your Project URL and publishable key and calls `read-channel` every minute. It adds the chat-source fields and unique message index to `events`, creates the private `channel_cursor` table, and creates or updates the named `read-chat-channel` job. Rerunning it preserves the existing bookmark; do not delete or reset that bookmark.

## 2. Update the existing AI agent

Open **Edge Functions → submit-event → Code**. Open `supabase/functions/submit-event/index.ts` in this folder, copy the entire file, and replace the complete contents of the function's `index.ts` editor. Click **Deploy** (or **Deploy updates**). Open its **Details** and turn **Verify JWT** off; save the setting if prompted.

This update accepts the sender and message ID and refuses to make a second decision for the same chat message. Deploy this file as well as the reader; deploying only the reader is not enough.

## 3. Deploy the GroupMe reader

Open **Edge Functions → Deploy a new function → Via Editor**, name the function exactly **read-channel**, and replace all the example code in `index.ts` with the entire contents of `supabase/functions/read-channel/index.ts` from this folder. Click **Deploy function**. If `read-channel` already exists, open **read-channel → Code**, replace its `index.ts`, and deploy the update instead.

Open **read-channel → Details**, turn **Verify JWT** off, and save if prompted. The local `supabase/config.toml` already sets `verify_jwt = false` for both functions, but a manual dashboard deployment also needs this dashboard setting checked.

Your `GROUPME_TOKEN`, `GROUPME_GROUP_ID`, and `GROUPME_BOT_ID` are already saved in **Edge Functions → Secrets**; leave them there. Supabase supplies the reader's backend settings, including `SUPABASE_URL`, `SUPABASE_SECRET_KEYS`, and `SUPABASE_PUBLISHABLE_KEYS`. The reader reports missing setting names without revealing their values.

## 4. Check it

1. Open [the reader check](https://sybducqavyxvbqnimrbk.supabase.co/functions/v1/read-channel?check=groupme), or click **Check the reader** in the Week 10 builder. Expect `ready: true`, `bot: true`, and `groupme` containing `token_works: true` and `group_found: true`. This check only reads; it sends no chat message and does not call the AI. The reader now returns the named fields the builder expects, fixing its misleading token-rejected warning.
2. Open **Integrations → Cron** and confirm **read-chat-channel** is active with schedule `* * * * *`. Wait about a minute and open the reader check again. Expect a nonempty `last_message_id` once the group has a message. On a new installation, the first run bookmarks the newest existing message and deliberately skips old history; an existing installation continues from its saved bookmark.
3. When you are ready, send a new event announcement in the configured GroupMe group. Within about a minute, expect a GroupMe reply with the decision. A published event appears on the website; a waiting event appears in the moderator queue. The same chat message must never produce two saved decisions. No test posts were sent during preparation.
4. If the check fails, open **Edge Functions → read-channel → Logs**. `token_works: false` points to the token check; `token_works: true` with `group_found: false` points to group access or the group ID. Missing bot ID permits reading but prevents chat replies. HTTP 401 from Supabase usually means **Verify JWT** is still on. SQL/table errors mean Step 1 needs checking.

Optional: for faster reading, set the GroupMe bot's callback URL to `https://sybducqavyxvbqnimrbk.supabase.co/functions/v1/read-channel` in the GroupMe developer site. Cron still runs every minute. Never put token or ID values in the repository.

## What the reader does

The reader checks up to 20 new messages, oldest first, skips bots, system messages, and empty messages, and sends each person's text to `submit-event`. It includes up to four earlier messages from that sender within ten minutes, each limited to 500 characters; the agent uses that context only after Stage 12 is implemented. The current agent accepts it but does not yet use it to interpret follow-ups. The private `channel_cursor` table saves its position, and `events` saves the message source and ID to prevent a second decision. A short lease prevents overlapping Cron and callback runs; a failed agent call leaves the message available for retry.

Offline verification: from the repository root, run `node event_radar/test/stage14-offline.mjs` with Node 26 (or another version supporting `stripTypeScriptTypes`). This uses mocks and never contacts GroupMe, Supabase, or the AI.

References: [Supabase dashboard deployment](https://supabase.com/docs/guides/functions/quickstart-dashboard), [function configuration](https://supabase.com/docs/guides/functions/function-configuration), and [GroupMe API](https://dev.groupme.com/docs/v3).
