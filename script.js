/* ============================================
   CONFIG — change this if you ever rename your account
   ============================================ */
const GITHUB_USERNAME = "ejazmustafavi-DataAnalyst";

// Repos you've pinned on your GitHub profile get a "Featured" badge here too.
// Edit this list any time you change your pins.
const PINNED_REPOS = [
  "BankDataAnalysisPBI",
  "CreditCardFinancialReportPBI",
  "EDA_For_TitanicDataset",
  "HR_DataAnalyticsDashboard",
  "NexusDataScience",
  "StoreDashboardExcel"
];

const TAG_META = {
  powerbi: { label: "Power BI", color: "var(--amber)" },
  tableau: { label: "Tableau", color: "var(--coral)" },
  python:  { label: "Python",  color: "var(--indigo)" },
  sql:     { label: "SQL",     color: "var(--teal)" },
  excel:   { label: "Excel",   color: "var(--sage)" },
  other:   { label: "Other",   color: "var(--ink-soft)" }
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const els = {
  filterBar: document.getElementById("filterBar"),
  cardGrid: document.getElementById("cardGrid"),
  emptyState: document.getElementById("emptyState"),
  errorState: document.getElementById("errorState"),
  year: document.getElementById("year")
};

els.year.textContent = new Date().getFullYear();

let allRepos = [];
let activeFilter = "all";

/* ---------- helpers ---------- */

function getTags(repo) {
  const haystack = `${repo.name} ${repo.description || ""} ${repo.language || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  const tags = [];
  if (/power\s*bi|\bpbi\b/.test(haystack)) tags.push("powerbi");
  if (/tableau/.test(haystack)) tags.push("tableau");
  if (/excel/.test(haystack)) tags.push("excel");
  if (/\bsql\b/.test(haystack) || repo.language === "SQL" || repo.language === "PLpgSQL") tags.push("sql");
  if (repo.language === "Python" || repo.language === "Jupyter Notebook" || /python|pandas|numpy|\beda\b/.test(haystack)) tags.push("python");
  if (tags.length === 0) tags.push("other");
  return tags;
}

function formatRelative(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const day = 86400000;
  const days = Math.floor(diffMs / day);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/* ---------- rendering ---------- */

function renderFilters(repos) {
  const present = new Set();
  repos.forEach(r => getTags(r).forEach(t => present.add(t)));

  const order = ["powerbi", "tableau", "python", "sql", "excel", "other"];
  const tagsToShow = order.filter(t => present.has(t));

  const chips = [{ key: "all", label: "All" }, ...tagsToShow.map(t => ({ key: t, label: TAG_META[t].label }))];

  els.filterBar.innerHTML = "";
  chips.forEach(chip => {
    const btn = document.createElement("button");
    btn.className = "chip" + (chip.key === activeFilter ? " active" : "");
    btn.textContent = chip.label;
    btn.type = "button";
    btn.addEventListener("click", () => {
      activeFilter = chip.key;
      els.filterBar.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      renderCards(allRepos);
    });
    els.filterBar.appendChild(btn);
  });
}

function renderCards(repos) {
  const filtered = activeFilter === "all"
    ? repos
    : repos.filter(r => getTags(r).includes(activeFilter));

  els.cardGrid.innerHTML = "";
  els.emptyState.hidden = filtered.length !== 0;

  filtered.forEach((repo, i) => {
    const tags = getTags(repo);
    const primaryTag = tags[0];
    const color = TAG_META[primaryTag].color;
    const isFeatured = PINNED_REPOS.includes(repo.name);

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card-thumb">
        <img src="https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}" alt="" loading="lazy"
             onerror="this.closest('.card-thumb').style.display='none'">
      </div>
      <div class="card-bar" style="background:${color}"></div>
      <div class="card-body">
        <div class="card-top">
          <h3>${repo.name}</h3>
          ${isFeatured ? '<span class="featured-badge">Featured</span>' : ""}
        </div>
        <p class="card-desc">${repo.description ? escapeHtml(repo.description) : "No description provided."}</p>
        <div class="card-meta">
          <span class="tag" style="color:${color}"><span class="dot" style="background:${color}"></span>${TAG_META[primaryTag].label}</span>
          ${repo.language ? `<span class="lang">${repo.language}</span>` : ""}
          <span class="stars">★ ${repo.stargazers_count}</span>
          <span class="updated">${formatRelative(repo.pushed_at)}</span>
        </div>
        <a class="card-link" href="${repo.html_url}" target="_blank" rel="noopener">View repo ↗</a>
      </div>
    `;

    els.cardGrid.appendChild(card);

    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add("in"), prefersReducedMotion ? 0 : i * 35);
    });
  });
}

function renderSkeletons(count) {
  els.cardGrid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "skeleton-card";
    els.cardGrid.appendChild(sk);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showError() {
  els.errorState.hidden = false;
  els.cardGrid.innerHTML = "";
}

/* ---------- init ---------- */

async function init() {
  renderSkeletons(6);
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const data = await res.json();

    allRepos = data
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    renderFilters(allRepos);
    renderCards(allRepos);
  } catch (err) {
    console.error(err);
    showError();
  }
}

init();
