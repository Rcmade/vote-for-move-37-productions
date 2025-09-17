// Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const showToast = (msg, timeout = 2500) => {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), timeout);
};

// App state
let socket = null;
let polls = [];
const apiBase = `${location.origin}/api`; // assumes same origin; adjust if server on different host

// init userId from localStorage
const userInput = $("#userId");
const savedUser = localStorage.getItem("mv_userId") || "";
userInput.value = savedUser;

$("#saveUser").addEventListener("click", () => {
  const val = userInput.value.trim();
  if (!val) {
    localStorage.removeItem("mv_userId");
    showToast("Cleared userId");
    return;
  }
  localStorage.setItem("mv_userId", val);
  showToast("Saved userId");
});

// fetch polls and render
async function fetchPolls() {
  try {
    $("#serverStatus").innerText = "loading...";
    const res = await fetch(apiBase + "/polls");
    if (!res.ok) throw new Error("Failed to fetch polls: " + res.status);
    const data = await res.json();
    polls = data.polls || data; // depending on your API shape
    renderPolls();
    $("#serverStatus").innerText = "ok";
  } catch (err) {
    console.error(err);
    $("#serverStatus").innerText = "error";
    showToast("Could not load polls");
  }
}

function renderPolls() {
  const grid = $("#pollsGrid");
  grid.innerHTML = "";
  if (!polls || polls.length === 0) {
    grid.innerHTML = '<div style="color:var(--muted)">No polls found</div>';
    return;
  }

  polls.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
          <div class="question">${escapeHtml(p.question)}</div>
          <div class="meta">Created: ${new Date(
            p.createdAt
          ).toLocaleString()}</div>
          <div class="options" data-poll="${p.id}"></div>
          <div class="action-row">
            <button class="join-btn" data-join="${p.id}">Join Poll</button>
            <div class="status" style="margin-left:auto">Published: ${
              p.isPublished ? "Yes" : "No"
            }</div>
          </div>
        `;
    grid.appendChild(card);

    const optsRoot = card.querySelector(".options");
    p.options.forEach((opt) => {
      const optEl = document.createElement("div");
      optEl.className = "opt";
      optEl.innerHTML = `
            <div style="flex:1">${escapeHtml(opt.text)}</div>
            <div style="display:flex;gap:8px;align-items:center">
              <div class="count" data-oid="${opt.id}">${opt.votes}</div>
              <button data-vote="${opt.id}">Vote</button>
            </div>
          `;
      optsRoot.appendChild(optEl);
    });
  });

  // attach events
  $$(".join-btn").forEach((b) => b.addEventListener("click", onJoinPoll));
  $$("[data-vote]").forEach((b) => b.addEventListener("click", onVote));
}

// simple html escape
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[ch])
  );
}

// join poll
function onJoinPoll(e) {
  const pollId = e.currentTarget.getAttribute("data-join");
  if (!socket) {
    showToast("Socket not connected yet");
    return;
  }
  socket.emit("join_poll", { pollId }, (ack) => {
    if (ack && ack.error) {
      showToast("Join error: " + (ack.error.message || JSON.stringify(ack)));
      return;
    }
    showToast("Joined poll " + pollId);
  });
}

// vote
async function onVote(e) {
  const optionId = e.currentTarget.getAttribute("data-vote");
  const userId = localStorage.getItem("mv_userId");
  if (!userId) {
    showToast("Set a userId above before voting");
    return;
  }
  e.currentTarget.disabled = true;
  const spinner = document.createElement("span");
  spinner.className = "spinner";
  e.currentTarget.parentElement.appendChild(spinner);

  try {
    const res = await fetch(apiBase + "/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId, userId }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.error?.message || JSON.stringify(body));
    }
    showToast("Vote recorded");
    // server will broadcast updated counts; but optionally update UI optimistically:
    // find count element and increment
    const countEl = document.querySelector(`[data-oid="${optionId}"]`);
    if (countEl)
      countEl.textContent = String(Number(countEl.textContent || 0) + 1);
  } catch (err) {
    console.error(err);
    showToast("Vote failed: " + (err.message || err));
  } finally {
    e.currentTarget.disabled = false;
    spinner.remove();
  }
}

// connect socket and listen for updates
function setupSocket() {
  try {
    socket = io(); // uses same origin -> /socket.io/socket.io.js must be served
  } catch (err) {
    console.error("socket init err", err);
    return;
  }

  updateSocketState("connecting");

  socket.on("connect", () => {
    updateSocketState("connected");
    showToast("Socket connected");
  });

  socket.on("disconnect", () => {
    updateSocketState("disconnected");
    showToast("Socket disconnected", 1200);
  });

  // server emits join_poll ack event (serverToClient)
  socket.on("join_poll", (payload) => {
    showToast("Server: " + (payload.message || "joined " + payload.pollId));
  });

  // vote updates
  socket.on("vote_update", (payload) => {
    // payload: { pollId, options: [{id,text,votes}] }
    // update counts on UI for that poll
    payload.options.forEach((opt) => {
      const el = document.querySelector(`[data-oid="${opt.id}"]`);
      if (el) el.textContent = String(opt.votes);
    });
  });

  socket.on("socket_error", (err) => {
    showToast(
      "Socket error: " + (err?.message || err?.code || JSON.stringify(err))
    );
  });
}

function updateSocketState(s) {
  $("#socketState").innerText = s;
}

// wire refresh button
$("#refreshBtn").addEventListener("click", fetchPolls);

// boot
(async function () {
  await fetchPolls();
  setupSocket();
})();
