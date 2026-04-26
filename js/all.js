
const container = document.getElementById("user-container");
const statusDiv = document.getElementById("status");
const draftedPlayers = [];

const roleOptions = [
  { value: "1", label: "Point Guard" },
  { value: "2", label: "Shooting Guard" },
  { value: "3", label: "Small Forward" },
  { value: "4", label: "Power Forward" },
  { value: "5", label: "Center" },
];


// DRAFT PANEL

function createDraftPanel() {
  const overlay = document.createElement("div");
  overlay.id = "draft-overlay";

  const panel = document.createElement("div");
  panel.id = "draft-panel";

  const header = document.createElement("div");
  header.className = "draft-panel-header";

  const title = document.createElement("div");
  title.classList.add("draft-header");
  title.innerHTML = `
    <div class="draft-panel-title">My Draft</div>
    <div class="draft-panel-subtitle">Selected Roster</div>
  `;

  const closeBtn = document.createElement("button");
  closeBtn.id = "draft-close-btn";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", closeDraftPanel);

  header.append(title, closeBtn);

  const listEl = document.createElement("div");
  listEl.id = "draft-list";

  panel.append(header, listEl);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDraftPanel();
  });
}

function renderDraftList() {
  const listEl = document.getElementById("draft-list");
  listEl.innerHTML = "";

  if (draftedPlayers.length === 0) {
    listEl.innerHTML = `
      <div class="empty-draft">
        No players drafted yet.<br>
        Hit <strong>Draft</strong> on a player card to add them.
      </div>
    `;
    return;
  }

  draftedPlayers.forEach((player, i) => {
    const row = document.createElement("div");
    row.className = "draft-row";
    row.style.animationDelay = `${i * 0.05}s`;

    let roleCell = player.role
      ? `<div class="draft-role-tag tag-drafted">${player.role}</div>`
      : `<select class="role-select" data-index="${i}">
          <option value="">-- Choose Role --</option>
          ${roleOptions.map(r => `<option value="${r.value}">${r.label}</option>`).join("")}
        </select>`;

    row.innerHTML = `
      <img class="draft-avatar" src="${player.photo}" alt="${player.name}">
      <div class="draft-info">
        <div class="draft-name">${player.name}</div>
        <div class="draft-meta">${player.country} · ${player.email}</div>
      </div>
      ${roleCell}
      <button class="undraft-btn" title="Remove from draft">✕</button>
    `;

    const select = row.querySelector(".role-select");
    if (select) {
      select.addEventListener("change", () => {
        const chosen = roleOptions.find(r => r.value === select.value);
        if (!chosen) return;
        draftedPlayers[i].role = chosen.label;
        draftedPlayers[i].cardEl.classList.add("drafted");
        renderDraftList();
      });
    }

    row.querySelector(".undraft-btn").addEventListener("click", () => {
      undraftPlayer(i);
    });

    listEl.appendChild(row);
  });
}

function undraftPlayer(index) {
  const player = draftedPlayers[index];
  player.cardEl.classList.remove("drafted");
  player.btnEl.disabled = false;
  player.btnEl.textContent = "Draft";
  draftedPlayers.splice(index, 1);
  renderDraftList();
  updateDraftBadge();
}

function openDraftPanel() {
  renderDraftList();
  document.getElementById("draft-overlay").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeDraftPanel() {
  document.getElementById("draft-overlay").style.display = "none";
  document.body.style.overflow = "";
}


// FLOATING BUTTON + BADGE

function createViewDraftButton() {
  const btn = document.createElement("button");
  btn.id = "view-draft-btn";

  const badge = document.createElement("span");
  badge.id = "draft-count-badge";
  badge.textContent = "0";

  btn.append(badge, document.createTextNode(" View Draft"));
  btn.addEventListener("click", openDraftPanel);
  document.body.appendChild(btn);
}

function updateDraftBadge() {
  const badge = document.getElementById("draft-count-badge");
  if (!badge) return;
  badge.textContent = draftedPlayers.length;
  badge.style.display = draftedPlayers.length > 0 ? "flex" : "none";
}


// FETCH ALL PLAYERS

async function fetchUsers() {
  container.innerHTML = "";
 statusDiv.innerHTML = `
  <div class="loader">
    <div class="spinner"></div>
    <p>Loading players...</p>
  </div>
`;

  try {
    const response = await fetch("https://randomuser.me/api/?results=10");
    if (!response.ok) throw new Error("Could not fetch resource");

    const data = await response.json();
    statusDiv.innerHTML = "";

    const positions = [
      { row: 1, col: 1 }, { row: 1, col: 2 },
      { row: 2, col: 1 }, { row: 2, col: 2 },
      { row: 3, col: 1, span: 2 },
      { row: 1, col: 4 }, { row: 1, col: 5 },
      { row: 2, col: 4 }, { row: 2, col: 5 },
      { row: 3, col: 4, span: 2 },
    ];

    data.results.forEach((user, index) => {
      const card = document.createElement("div");
      card.classList.add("card");

      const img = document.createElement("img");
      img.src = user.picture.large;

      const name = document.createElement("h3");
      name.textContent = `${user.name.first} ${user.name.last}`;

      const email = document.createElement("p");
      email.textContent = user.email;
      email.classList.add("email");

      const country = document.createElement("p");
      country.textContent = user.location.country;

      const button = document.createElement("button");
      button.textContent = "Draft";
      button.classList.add("draft-btn");

      button.addEventListener("click", () => {
        button.disabled = true;
        button.textContent = "Drafted";
        draftedPlayers.push({
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          country: user.location.country,
          photo: user.picture.large,
          role: "",
          cardEl: card,
          btnEl: button,
        });
        updateDraftBadge();
      });

      const pos = positions[index];
      card.style.gridRow = pos.row;
      card.style.gridColumn = pos.span ? `${pos.col} / span ${pos.span}` : pos.col;

      card.append(img, name, email, country, button);
      container.appendChild(card);
    });

  } catch (error) {
   statusDiv.innerHTML = `
  <div class="error">
    ⚠️ Failed to load players.<br>
    Please try again.
  </div>
`;
    console.error(error);
  }
}


// INIT

createDraftPanel();
createViewDraftButton();
document.getElementById("reload-btn").addEventListener("click", fetchUsers);
fetchUsers();