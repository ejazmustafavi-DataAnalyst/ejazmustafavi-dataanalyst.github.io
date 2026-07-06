/* ============================================
   CONFIG
   ============================================ */
const GITHUB_USERNAME = "ejazmustafavi-DataAnalyst";
const GITHUB_REPO_BASE = "ejazmustafavi-dataanalyst.github.io";
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO_BASE}/main`;
const THUMB_BASE = `${RAW_BASE}/thumbnail/`;
const THUMB_FALLBACK = `${THUMB_BASE}thumTemp.png`;

const EXCLUDED_REPOS = [
  "ejazmustafavi-dataanalyst.github.io",
  "ejazmustafavi-DataAnalyst"
];

const PINNED = [
  "Nexus_AI_internship_projects",
  "Decodelabs_internship_projects",
  "BankDataAnalysisPBI",
  "CreditCardFinancialReportPBI",
  "CarSaleAnalysis",
  "Adventure_Work_Sale",
  "HR_DataAnalyticsDashboard",
  "SaleProfitExcel"
];

const CERTIFICATES = [
  { name: "Google Data Analytics",            file: "Google DataAnalytics_certificate.pdf",        issuer: "Google",      icon: "🎓" },
  { name: "Google Business Intelligence",     file: "google business intelligence.pdf",             issuer: "Google",      icon: "📊" },
  { name: "Google Batch Certificate",         file: "google batch.pdf",                             issuer: "Google",      icon: "📋" },
  { name: "Data Analytics by DigiSkill",      file: "DataAnalytics_Certificate_by_DigiSkill.pdf",  issuer: "DigiSkill",   icon: "💡" },
  { name: "Decode Data Analyst",              file: "Decode Data Analyst_Certificate.pdf",          issuer: "Decodelabs",  icon: "🔍" },
  { name: "Nexus Data Analyst",               file: "Nexus Data Analyst Certificate.pdf",           issuer: "Nexus AI",    icon: "🤖" },
  { name: "Power BI with AI",                 file: "PowerBI with AI certificate.pdf",              issuer: "Microsoft",   icon: "📈" },
  { name: "Power BI Certificate",             file: "powerBI certificate.pdf",                      issuer: "Microsoft",   icon: "📉" },
  { name: "Advanced MS Excel",                file: "advance ms excel Certificate .pdf",            issuer: "Microsoft",   icon: "📗" },
  { name: "Certified Data Analytics & BI",    file: "Certified in Data Analytics.pdf",              issuer: "Coursera",    icon: "🏅" },
];

const TAG_META = {
  powerbi: { label: "Power BI", color: "#E8A020", bg: "#FEF3DC" },
  tableau: { label: "Tableau",  color: "#E05252", bg: "#FDE8E8" },
  python:  { label: "Python",   color: "#4C5FD5", bg: "#EEF0FC" },
  sql:     { label: "SQL",      color: "#0E9F8E", bg: "#E0F5F2" },
  excel:   { label: "Excel",    color: "#5E8A3E", bg: "#E8F4E1" },
  other:   { label: "Other",    color: "#718096", bg: "#F0F2F5" }
};

/* ============================================
   HELPERS
   ============================================ */
const $ = id => document.getElementById(id);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let allRepos = [];
let activeFilter = "all";

function getTags(repo) {
  const hay = `${repo.name} ${repo.description || ""} ${repo.language || ""} ${(repo.topics || []).join(" ")}`.toLowerCase();
  const tags = [];
  if (/power\s*bi|\bpbi\b/.test(hay))    tags.push("powerbi");
  if (/tableau/.test(hay))               tags.push("tableau");
  if (/excel/.test(hay))                 tags.push("excel");
  if (/\bsql\b|plpgsql/.test(hay) || /^sql$/i.test(repo.language || "")) tags.push("sql");
  if (/python|pandas|numpy|\beda\b/.test(hay) || repo.language === "Python" || repo.language === "Jupyter Notebook") tags.push("python");
  if (tags.length === 0) tags.push("other");
  return tags;
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1)  return "today";
  if (d === 1) return "yesterday";
  if (d < 30)  return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12)  return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

function escHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

/* ============================================
   CERTIFICATES
   ============================================ */
function buildCertificates() {
  const grid = $("certGrid");
  if (!grid) return;
  grid.innerHTML = "";

  CERTIFICATES.forEach(cert => {
    const pdfUrl = `${RAW_BASE}/certificates/${encodeURIComponent(cert.file)}`;
    const pngName = cert.file.replace(/\.pdf$/i, ".png");
    const imgUrl  = `${RAW_BASE}/certificates/${encodeURIComponent(pngName)}`;

    // card
    const card = document.createElement("div");
    card.className = "cert-card";

    // thumb
    const thumb = document.createElement("div");
    thumb.className = "cert-thumb cert-thumb-img";

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = cert.name;
    img.loading = "lazy";
    img.addEventListener("error", function() {
      // image failed — fall back to emoji icon
      thumb.classList.remove("cert-thumb-img");
      thumb.innerHTML = cert.icon;
    });
    thumb.appendChild(img);

    // body
    const body = document.createElement("div");
    body.className = "cert-body";

    const name = document.createElement("p");
    name.className = "cert-name";
    name.textContent = cert.name;

    const issuer = document.createElement("p");
    issuer.className = "cert-issuer";
    issuer.textContent = cert.issuer;

    const actions = document.createElement("div");
    actions.className = "cert-actions";

    const viewLink = document.createElement("a");
    viewLink.className = "cert-link";
    viewLink.href = pdfUrl;
    viewLink.target = "_blank";
    viewLink.rel = "noopener";
    viewLink.textContent = "View ↗";

    const dlLink = document.createElement("a");
    dlLink.className = "cert-link cert-download";
    dlLink.href = pdfUrl;
    dlLink.download = "";
    dlLink.textContent = "Download PDF ↓";

    actions.appendChild(viewLink);
    actions.appendChild(dlLink);
    body.appendChild(name);
    body.appendChild(issuer);
    body.appendChild(actions);

    card.appendChild(thumb);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

/* ============================================
   FILTERS
   ============================================ */
function buildFilters(repos) {
  const bar = $("filterBar");
  if (!bar) return;
  const present = new Set();
  repos.forEach(r => getTags(r).forEach(t => present.add(t)));
  const order = ["powerbi", "tableau", "python", "sql", "excel", "other"];
  const chips = [{ key: "all", label: "All" }, ...order.filter(t => present.has(t)).map(t => ({ key: t, label: TAG_META[t].label }))];
  bar.innerHTML = "";
  chips.forEach(chip => {
    const btn = document.createElement("button");
    btn.className = "chip" + (chip.key === activeFilter ? " active" : "");
    btn.textContent = chip.label;
    btn.type = "button";
    btn.addEventListener("click", () => {
      activeFilter = chip.key;
      bar.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      renderCards(allRepos);
    });
    bar.appendChild(btn);
  });
}

/* ============================================
   PROJECT CARDS
   ============================================ */
function renderCards(repos) {
  const grid = $("cardGrid");
  const empty = $("emptyState");
  if (!grid) return;

  const filtered = activeFilter === "all"
    ? repos
    : repos.filter(r => getTags(r).includes(activeFilter));

  grid.innerHTML = "";
  if (empty) empty.hidden = filtered.length !== 0;

  filtered.forEach((repo, i) => {
    const tags = getTags(repo);
    const tag = tags[0];
    const meta = TAG_META[tag];
    const isPinned = PINNED.includes(repo.name);

    const thumbSrc = `${THUMB_BASE}${encodeURIComponent(repo.name)}.png`;

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-thumb">
        <img
          src="${thumbSrc}"
          alt="${escHtml(repo.name)} preview"
          loading="lazy"
          onerror="if(this.src !== '${THUMB_FALLBACK}'){this.src='${THUMB_FALLBACK}';}else{this.closest('.card-thumb').style.display='none';}"
        >
      </div>
      <div class="card-accent" style="background:${meta.color}"></div>
      <div class="card-body">
        <div class="card-top">
          <h3>${escHtml(repo.name.replace(/_/g, " "))}</h3>
          ${isPinned ? '<span class="featured-badge">Featured</span>' : ""}
        </div>
        <p class="card-desc">${repo.description ? escHtml(repo.description) : "No description provided."}</p>
        <div class="card-meta">
          <span class="tag-dot" style="color:${meta.color}">
            <span class="dot-sm" style="background:${meta.color}"></span>${meta.label}
          </span>
          ${repo.language ? `<span>${escHtml(repo.language)}</span>` : ""}
          <span>★ ${repo.stargazers_count}</span>
          <span>${relativeTime(repo.pushed_at)}</span>
        </div>
        <a class="card-link" href="${repo.html_url}" target="_blank" rel="noopener">View on GitHub ↗</a>
      </div>`;

    grid.appendChild(card);
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add("in"), prefersReducedMotion ? 0 : i * 40);
    });
  });
}

function showSkeletons(n = 6) {
  const grid = $("cardGrid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const s = document.createElement("div");
    s.className = "skeleton";
    grid.appendChild(s);
  }
}

/* ============================================
   NAV — scroll spy + mobile toggle
   ============================================ */
function initNav() {
  const hamburger = $("hamburger");
  const navLinks  = $("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
      });
    });
  }

  const sections = document.querySelectorAll("section[id]");
  const links    = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(s => observer.observe(s));
}

/* ============================================
   INIT
   ============================================ */
async function init() {
  document.getElementById("footerYear").textContent = new Date().getFullYear();

  buildCertificates();
  initNav();
  showSkeletons(6);

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();

    allRepos = data
      .filter(r => !r.fork)
      .filter(r => !EXCLUDED_REPOS.map(e => e.toLowerCase()).includes(r.name.toLowerCase()))
      .sort((a, b) => {
        const aPin = PINNED.includes(a.name) ? 0 : 1;
        const bPin = PINNED.includes(b.name) ? 0 : 1;
        if (aPin !== bPin) return aPin - bPin;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });

    buildFilters(allRepos);
    renderCards(allRepos);
  } catch (err) {
    console.error(err);
    const grid = $("cardGrid");
    if (grid) grid.innerHTML = "";
    const errEl = $("errorState");
    if (errEl) errEl.hidden = false;
  }
}

init();
