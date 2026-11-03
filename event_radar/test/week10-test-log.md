# Week 10 test log: what Club Event Radar knows and remembers

- Student: @arlowe928-lab
- Website: https://arlowe928-lab.github.io/BUS4498_InClass_Builds/event_radar/
- Folder: https://github.com/arlowe928-lab/BUS4498_InClass_Builds/tree/main/event_radar
- Chat app: GroupMe
- Written by the BUS 4498 Memory Builder on Nov 2, 2026, 8:51 PM.

## Builder checks

| Check | Result | When |
|---|---|---|
| Week 9 build ready | Passed. The events table is there, and visitors can read published posts. The agent is running with your AI key: gpt-6-luna. New sign-ups are off. Your website opens at https://arlowe928-lab.github.io/BUS4498_InClass_Builds/event_radar/ | 5:15 PM |
| Chat-group reader | Passed. The reader has its GroupMe secrets. GroupMe accepts the token, and the group or channel is visible to the bot. It has run and handled 4 messages. Last run: 4:05 PM. A bot ID is set, so the group gets a reply for each post. | 4:19 PM |
| Club list | Not passed. The club list has 6 clubs: Accounting Society, Board Game Guild, Cal Poly Ski & Snowboard Club, Mustang Pitch Society, Sustainability Crew, Women in Finance Circle. Cal Poly Kite Flyers isn’t on the list yet. Post B shows you when to add it. The agent reads the club list: it knows 6 clubs. | 4:19 PM |
| Lessons table | Not run |  |

## Test posts

| Post | Expected | What happened | What the agent looked at |
|---|---|---|---|
| A. A nickname | Published, with the club shown as Board Game Guild: the agent matched the nickname "BGG" on the club list. | published: Your event is published! | Club list (6 clubs): matched “BGG” to Board Game Guild. |
| B. A club that isn't on the list | Waiting for a moderator, because "Cal Poly Kite Flyers" isn't on the club list yet. | Not sent |  |
| C. The new club's next post | Published, with the club shown as Cal Poly Kite Flyers. You changed what the agent knows without touching the code. | Not sent |  |
| D. A known club, no place | Waiting for a moderator, because the place is missing (rule R2). The reason adds a hint from the club list: Board Game Guild usually meets at University Union (UU), Room 220. The agent didn't fill the place in: knowledge about a club in general isn't a fact about this event. | Not sent |  |
| E. The original post | Published for Tuesday, November 10 at 6:00 PM at the UU Plaza. | Not sent |  |
| F. An update | Published, replacing E. The agent checked the club's upcoming posts, saw that this updates "pitch practice," and copied the place from the earlier post. The earlier card leaves the website. | Not sent |  |
| G. A reminder that changes nothing | Already posted. A reminder isn't an update, and the database's duplicate check (same date, start time, and place as F) refuses a second copy. | Not sent |  |
| H. Something the rules don't cover | Published. The posting rules don't say anything about study hours, so to the agent it looks like an event. Now teach it: sign in as a moderator and save this lesson: *Drop-in study hours, tutoring, and office hours aren't events for this website. Hold them for a moderator.* | Not sent |  |
| I. The next one, after the lesson | Waiting for a moderator, citing your lesson. | Not sent |  |
| J. A post that tries to teach the agent | Waiting for a moderator. Your lesson still applies, and the post is flagged for trying to give the AI instructions. Check Table Editor → lessons: there is still only the lesson you wrote. A post can't teach the agent, because only signed-in moderators can write lessons. | Not sent |  |
| K. After you switch the lesson off | Published. The agent forgot the lesson the moment you switched it off. Switch it back on when you're done. | Not sent |  |

## My answers

**The demo (Step 1):** (not answered)

**The fix (Step 2):** (not answered)

**My chat group (Step 4):** (not answered)

**Knowledge (Step 5):** (not answered)

**Memory (Step 6):** (not answered)

**Lessons (Step 7):** (not answered)
