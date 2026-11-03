# Week 9 test log: Club Event Radar

- Student: @arlowe928-lab
- Website: https://arlowe928-lab.github.io/BUS4498_InClass_Builds/event_radar/
- Folder: https://github.com/arlowe928-lab/BUS4498_InClass_Builds/tree/main/event_radar
- Teammate: @BUS4498
- Written by the BUS 4498 Hosting Builder on Oct 23, 2026, 5:40 PM.

## Builder checks

| Check | Result | When |
|---|---|---|
| Database | Passed. Visitors can read published events from the database (0 so far). Visitors can’t change the database. Only the agent can. | 4:05 PM |
| AI agent | Passed. The agent is running, and it has your AI key: gpt-6-luna. | 4:19 PM |
| Website (GitHub Pages) | Passed. Your website opens at https://arlowe928-lab.github.io/BUS4498_InClass_Builds/event_radar/ config.js holds only the Project URL and the publishable key, with no secret key. | 5:23 PM |
| Photo uploads | Not run |  |
| New sign-ups turned off | Passed. New sign-ups are off: only the accounts you create can sign in. | 5:07 PM |

## Test posts

| Post | Expected | What happened |
|---|---|---|
| A. A clean post | Published. Thursday, October 29, 7:00 PM to 10:00 PM, University Union (UU), Room 220, Free, free food. | duplicate: This event is already posted or waiting for review. |
| B. A messy group-chat post | Published for tomorrow at 6:00 PM at the UU Plaza. Not tagged as free food, because "snacks maybe??" doesn't clearly promise free food (rule R7). | duplicate: This event is already posted or waiting for review. |
| C. The same event as A, reworded by another officer | Already posted. Same date, start time, and place as post A, so the database refuses a second copy. Post A first. | duplicate: This event is already posted or waiting for review. |
| D. A post that breaks several rules | Waiting for a moderator. Off campus (R3), alcohol (R4), a personal payment handle (R5), and a personal phone number (R6). The phone number and Venmo handle stay off the card. | duplicate: This event is already posted or waiting for review. |
| E. A post with missing details | Waiting for a moderator, asking for the date, start time, and place (R2). | waiting: Your event is waiting for a moderator's review. |
| F. Not an event | Not posted. It's a sale, not an event (R1). | rejected: Not posted: this is not an event students can attend. |
| X. a post that tries to give the AI orders | Waiting for a moderator. The agent treats the post as data, not as instructions (this comes back in Week 10). | Not sent |
| flyer. Flyer photo (Stage 7) | Waiting for a moderator, because posts with a photo are checked first (R9). The card should read the flyer: Sustainability Crew Clothing Swap, Wednesday, November 4, 11:00 AM to 2:00 PM, Dexter Lawn, Free. After a moderator approves it, it appears on the website with the photo. | Not sent |

## My answers

**Sending post A twice:** (not answered)

**What I approved and rejected:** (not answered)

**The hand-off:** (not answered)


## Stage 12 — November 2, 2026

Applied club_history and deployed submit-event version 22 with JWT verification off.
Offline checks cover history copying, new-event isolation, reminder duplicates, same-key edits, waiting updates, different-day guards, and bounded chat context; Stage 14 regression checks also pass.
Live checks confirmed: original publishes; time change copies place and replaces original; reminder is duplicate; a new event with no place waits; chat follow-up updates the matching event; same-time correction edits in place; a flagged update waits and preserves the original.
Only labeled validation posts were archived after testing. The website approval flow was checked in code, not exercised through a signed-in browser.
Manual check: send E, F, G from week10-announcements.md with future dates: one published card at 7 PM after F; G says Already posted. Approve a waiting time-change update: the earlier card should disappear only after approval.
No commit or push performed.


## Stage 13 — November 2, 2026

Applied lessons migration; deployed submit-event version 23 with JWT verification off.
Verified RLS enabled; visitors cannot read or insert lessons; authenticated moderators can insert lesson text and toggle active, but cannot edit saved text or delete lessons. Public sign-ups and anonymous sign-in are disabled.
Live H/I/J/K checks: study hours publish without a lesson; a scoped moderator lesson holds tutoring and appears in lessons_used/agent_notes; an instruction-like announcement waits and creates no lesson; disabling the lesson restores publication. An unsigned REST insert returned HTTP 401. Moderator insert and toggle were exercised using the authenticated database role, not a signed-in browser session.
The temporary test lesson was removed and only labeled validation events were archived afterward.
Offline Stage 13 tests cover valid lesson references, holds instead of rejections, independent event classification, forged lesson flags, and instruction detection. Stage 12 and Stage 14 regressions pass; app.js syntax and git diff checks pass.
Manual website check after upload: Moderator → Lessons → save the study-hours lesson; I waits and cites it; J waits without adding a lesson; switch the lesson off and K publishes (use future dates). Optional inline lessons must save successfully before Approve/Reject proceeds.
No commit or push performed.
