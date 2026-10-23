(function () {
  "use strict";
  const config = window.EVENT_RADAR_CONFIG;
  const form = document.getElementById("event-form");
  const announcement = document.getElementById("announcement");
  const submitButton = document.getElementById("submit-button");
  const refreshButton = document.getElementById("refresh-button");
  const board = document.getElementById("board");
  const boardStatus = document.getElementById("board-status");
  const result = document.getElementById("result");
  const allFilter = document.getElementById("all-filter");
  const foodFilter = document.getElementById("food-filter");
  const columns = "id,created_at,status,title,club,event_date,start_time,end_time,place_name,place_detail,cost,free_food,summary";
  const labels = { published: "Published", waiting: "Waiting for review", rejected: "Not posted", duplicate: "Already posted", error: "Couldn’t submit" };
  let events = [];
  let foodOnly = false;
  let loaded = false;
  let loading = false;
  let submitting = false;
  let db;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function showResult(status, message, reasons) {
    result.className = "result " + status;
    result.replaceChildren(element("p", "result-label", labels[status] || "Checking your event"), element("p", "", message));
    if (Array.isArray(reasons) && reasons.length) {
      const list = element("ul", "reasons");
      reasons.filter(reason => typeof reason === "string").forEach(reason => list.append(element("li", "", reason)));
      result.append(list);
    }
    result.hidden = false;
  }
  function timeLabel(value) {
    if (!value) return "";
    const parts = value.split(":");
    const hour = Number(parts[0]);
    return `${hour % 12 || 12}:${parts[1]} ${hour >= 12 ? "PM" : "AM"}`;
  }
  function eventCard(event) {
    const item = element("li", "event");
    const date = event.event_date ? new Date(event.event_date + "T12:00:00Z") : null;
    const validDate = date && !Number.isNaN(date.getTime());
    const badge = element("div", validDate ? "date" : "date tba");
    if (validDate) {
      badge.append(element("span", "mon", date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })), element("span", "day", String(date.getUTCDate())));
    } else badge.append(element("span", "day", "TBA"));
    const body = element("div", "event-body");
    const day = validDate ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) : "Date to be announced";
    const time = event.start_time ? timeLabel(event.start_time) + (event.end_time ? " to " + timeLabel(event.end_time) : "") : "Time to be announced";
    body.append(element("p", "when", day + " · " + time), element("h3", "", event.title || "Club event"));
    body.append(element("p", "meta", [event.club, event.place_name, event.place_detail].filter(Boolean).join(" · ")));
    if (event.summary) body.append(element("p", "summary", event.summary));
    const tags = element("p", "tags");
    if (event.cost) tags.append(element("span", "tag", event.cost));
    if (event.free_food) tags.append(element("span", "tag food", "🍕 Free food"));
    if (tags.childNodes.length) body.append(tags);
    item.append(badge, body);
    return item;
  }
  function renderEvents() {
    const visible = foodOnly ? events.filter(event => event.free_food) : events;
    board.replaceChildren();
    if (!visible.length) board.append(element("li", "empty", foodOnly && events.length ? "No free-food events right now. Try All events." : "No events yet. Post the first one!"));
    else visible.forEach(event => board.append(eventCard(event)));
    boardStatus.textContent = `${visible.length} ${visible.length === 1 ? "event" : "events"}${foodOnly ? " with free food" : ""}`;
  }
  async function loadEvents() {
    if (!db || loading) return;
    loading = true;
    refreshButton.disabled = true;
    board.setAttribute("aria-busy", "true");
    boardStatus.textContent = "Loading events…";
    try {
      const { data, error } = await db.from("events").select(columns).eq("status", "published")
        .order("event_date", { ascending: true, nullsFirst: false }).order("start_time", { ascending: true, nullsFirst: false });
      if (error) throw error;
      events = data || [];
      loaded = true;
      renderEvents();
    } catch {
      boardStatus.textContent = loaded ? "Couldn’t refresh. Showing the last loaded events; try Refresh again." : "Couldn’t load events. Check your connection and try Refresh.";
      if (!loaded) board.replaceChildren(element("li", "empty", "Events are temporarily unavailable."));
    } finally {
      loading = false;
      refreshButton.disabled = false;
      board.setAttribute("aria-busy", "false");
    }
  }
  function filterEvents(value) {
    foodOnly = value;
    allFilter.setAttribute("aria-pressed", String(!value));
    foodFilter.setAttribute("aria-pressed", String(value));
    if (loaded) renderEvents();
  }
  allFilter.addEventListener("click", () => filterEvents(false));
  foodFilter.addEventListener("click", () => filterEvents(true));
  refreshButton.addEventListener("click", loadEvents);
  announcement.addEventListener("input", () => {
    const length = Array.from(announcement.value).length;
    document.getElementById("character-count").textContent = `${length.toLocaleString()} / 2,000 characters`;
    announcement.setCustomValidity(length > 2000 ? "Please shorten your announcement to 2,000 characters." : "");
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting || !db) return;
    const text = announcement.value;
    if (!text.trim() || Array.from(text).length > 2000) {
      showResult("error", "Please enter an announcement between 1 and 2,000 characters.");
      announcement.focus();
      return;
    }
    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Checking your event…";
    form.setAttribute("aria-busy", "true");
    showResult("pending", "Reading your announcement and checking the posting rules. This can take a moment.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const body = new FormData();
      body.append("announcement", text);
      const response = await fetch(config.supabaseUrl.replace(/\/$/, "") + "/functions/v1/submit-event", {
        method: "POST", headers: { apikey: config.publishableKey }, body, signal: controller.signal
      });
      const answer = await response.json();
      if (!response.ok || !answer.ok) throw new Error(typeof answer.message === "string" ? answer.message : "The agent couldn’t process this post. Please try again.");
      if (!["published", "waiting", "rejected", "duplicate"].includes(answer.status)) throw new Error("The agent returned an unexpected answer. Please refresh before trying again.");
      showResult(answer.status, answer.message, answer.reasons);
      if (answer.status === "published" || answer.status === "duplicate") await loadEvents();
    } catch (error) {
      const message = error.name === "AbortError" ? "The check took too long. Refresh the event list before resubmitting; your post may have been saved." : error instanceof TypeError ? "Couldn’t reach the agent. Check your connection and refresh before trying again." : error.message;
      showResult("error", message);
    } finally {
      clearTimeout(timeout);
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Submit event";
      form.setAttribute("aria-busy", "false");
    }
  });
  try {
    if (!config || !config.supabaseUrl || !config.publishableKey || !window.supabase) throw new Error("Missing connection settings or library.");
    db = window.supabase.createClient(config.supabaseUrl, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    loadEvents();
  } catch {
    submitButton.disabled = true;
    refreshButton.disabled = true;
    board.replaceChildren(element("li", "empty", "The website couldn’t connect. Check your internet connection and reload the page."));
    showResult("error", "The connection library or settings could not load. Please reload the page.");
  }
})();
