# Club Event Radar — handoff for Nicole

Prepared October 23, 2026.

## What works now

[Open the website](https://arlowe928-lab.github.io/BUS4498_InClass_Builds/event_radar/). Published events appear soonest first, with a Free food filter. The AI agent reads announcements and optional JPG/PNG flyers up to 5 MB, checks rules, and catches duplicates. Photo posts always wait for review. Moderator sign-in, Approve, Reject, and Sign out are deployed. The live flyer test passed; moderator controls passed local tests, but a real account approval still needs checking.

## Where things live

- **GitHub repository:** [arlowe928-lab/BUS4498_InClass_Builds](https://github.com/arlowe928-lab/BUS4498_InClass_Builds), branch `main`; GitHub Pages hosts the website.
- **Supabase project:** `event-radar`; Project URL: https://sybducqavyxvbqnimrbk.supabase.co. Database table `public.events` stores posts; storage bucket `flyers` holds photos; Edge Function `submit-event` runs the AI agent.
- **Files inside `event_radar/`:** `index.html`, `app.js`, and `style.css` are the website; `config.js` contains public connection settings. `supabase/functions/submit-event/index.ts` is the agent; `supabase/migrations/` records applied database changes. Rules and places live in `context/` and are copied into the agent. Samples live in `test/`. Read `AGENTS.md` before changes.

## Secrets

The deployed agent uses `OPENAI_API_KEY`, configured in **Supabase → Edge Functions → Secrets**. Backend access reads `SUPABASE_SECRET_KEYS`, with `SUPABASE_SERVICE_ROLE_KEY` as a fallback. Nicole does not need these values; never copy them into chat, code, or GitHub. `HOLD_ALL_POSTS` is an optional setting that makes every post wait. The publishable key in `config.js` is public, not a secret.

## How to test

1. Paste: “Board Game Guild: Game Night, October 29, 2026, 7–10 pm, University Union Room 220. Free entry and free pizza.” Expect **Published** and Free food; submitting it again gives **Already posted**. An existing matching post also gives Already posted.
2. Paste: “Women in Finance Circle: resume workshop next week! More details soon.” Expect **Waiting**, asking for date, time, and place.
3. Attach `test/sample-flyer.png` with “All the clothing swap details are on the flyer.” Expect **Waiting**, with November 4, 11 AM–2 PM, Dexter Lawn, Free. A matching flyer already exists from testing; review that post if you get Already posted. Open **Moderator sign-in** near the page bottom, sign in, and approve it: the public board should show its photo. Sign out afterward; reloading also signs you out.

Use future dates within 60 days when these samples become outdated. The builder’s **Check sign-ups** should pass.

## What’s next

Keep new sign-ups disabled: all provisioned accounts have moderator access. Create Nicole’s own account through **Authentication → Users → Add user** if needed. Complete the real-account approval check above. Supabase reported leaked-password protection disabled; review that Auth setting. Optional future work: nightly archiving of past events; it is not implemented.

## How we take turns

Tell each other before editing. In GitHub Desktop, **Fetch origin / Pull origin** before starting and **Commit / Push origin** when finished. This Desktop working folder is not a Git checkout: copy changed files into the repository shown by **Repository → Show in Finder** before committing. Wait for GitHub Pages deployment before checking website edits. Database migrations and Edge Function deployments happen separately in Supabase; pushing files alone does not apply them. This handoff is saved locally and has not been committed or pushed.
