const floor = document.getElementById("floor");
const panel = document.getElementById("panel");
const clock = document.getElementById("clock");

/* ---------- DATA ---------- */
const FURNITURE = [
  "Bett","Sofa","Sessel","Couchtisch","Esstisch","Stuhl","Hocker","Schrank",
  "Kleiderschrank","Kommode","Nachttisch","Regal","Bücherregal","Sideboard",
  "Vitrine","Schreibtisch","Bürostuhl","TV-Board","Wohnwand","Bank",
  "Truhe","Spiegel","Garderobe","Schuhschrank","Küchenzeile",
  "Barhocker","Liege","Beistelltisch","Wickelkommode","Sekretär"
];

const TOTAL_OBJECTS = 15;

/* ---------- PHYSICS ---------- */
const objects = [];
const physics = {
  friction: 0.985,
  bounce: 0.85,
  maxSpeed: 2000
};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ---------- POSTS ---------- */
async function loadPosts() {
  const res = await fetch("./posts.json", { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

async function renderRoute() {
  const route = (location.hash || "#posts").replace("#", "");

  // визуальный “active” на кнопке Posts
  for (const o of objects) {
    if (o.el.tagName === "A" && o.el.href.includes("#posts")) {
      o.el.style.borderColor = route === "posts" ? "rgba(17,17,17,.35)" : "rgba(17,17,17,.12)";
    }
  }

  if (route !== "posts") {
    // если хэш любой другой — всё равно показываем posts (так ты “убираешь Start”)
    location.hash = "#posts";
    return;
  }

  const posts = await loadPosts();
  const items = posts
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(p => `
      <article style="border-top:1px solid rgba(17,17,17,.12); padding-top:10px; margin-top:10px;">
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:6px;">
          <span style="font-size:11px;color:rgba(17,17,17,.55);border:1px solid rgba(17,17,17,.12);padding:3px 7px;border-radius:999px;background:rgba(244,244,242,.6);">
            ${escapeHtml(p.date || "")}
          </span>
          ${(p.tags || []).slice(0,4).map(t => `
            <span style="font-size:11px;color:rgba(17,17,17,.55);border:1px solid rgba(17,17,17,.12);padding:3px 7px;border-radius:999px;background:rgba(244,244,242,.6);">
              #${escapeHtml(t)}
            </span>
          `).join("")}
        </div>
        <h2 style="margin:0 0 6px 0; font-size:14px;">${escapeHtml(p.title || "")}</h2>
        <p style="margin:0; font-size:12px; line-height:1.5; color:rgba(17,17,17,.82);">${escapeHtml(p.text || "")}</p>
      </article>
    `).join("");

  panel.innerHTML = `
    <h1 style="margin:0 0 8px 0; font-size:16px;">Posts</h1>
    <p style="margin:0 0 10px 0; font-size:11px; color:rgba(17,17,17,.55);">${posts.length} Einträge</p>
    <div>${items || "<p style='font-size:12px;'>Keine Beiträge gefunden.</p>"}</div>
  `;
}

/* ---------- OBJECT CREATION ---------- */
function makeObject({ title, sub, href = null }) {
  const el = document.createElement(href ? "a" : "div");
  el.className = "obj";
  if (href) {
    el.href = href;
    el.style.textDecoration = "none";
    el.style.color = "#111";
  }

  el.innerHTML = `
    <div class="obj__title">${escapeHtml(title)}</div>
    ${sub ? `<div class="obj__sub">${escapeHtml(sub)}</div>` : ""}
  `;

  floor.appendChild(el);

  const o = {
    el,
    x: 0, y: 0,
    vx: 0, vy: 0,
    w: 150, h: 86,
    drag: false,
    pid: null,
    offX: 0, offY: 0,
    lastX: 0, lastY: 0, lastT: 0
  };

  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture?.(e.pointerId);
    o.drag = true;
    o.pid = e.pointerId;

    const r = floor.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    o.offX = px - o.x;
    o.offY = py - o.y;

    o.vx = 0; o.vy = 0;

    o.lastX = px; o.lastY = py; o.lastT = performance.now();
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!o.drag || o.pid !== e.pointerId) return;

    const r = floor.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;

    const now = performance.now();
    const dt = Math.max(0.001, (now - o.lastT) / 1000);

    o.vx = clamp((px - o.lastX) / dt, -physics.maxSpeed, physics.maxSpeed);
    o.vy = clamp((py - o.lastY) / dt, -physics.maxSpeed, physics.maxSpeed);

    o.lastX = px; o.lastY = py; o.lastT = now;

    o.x = clamp(px - o.offX, 0, floor.clientWidth - o.w);
    o.y = clamp(py - o.offY, 0, floor.clientHeight - o.h);

    render(o);
  });

  window.addEventListener("pointerup", (e) => {
    if (o.pid !== e.pointerId) return;
    o.drag = false;
    o.pid = null;
  });

  objects.push(o);
  return o;
}

/* ---------- SPAWN ---------- */
function randomSpawn() {
  const W = floor.clientWidth;
  const H = floor.clientHeight;
  const pad = 10;

  for (const o of objects) {
    o.w = o.el.getBoundingClientRect().width;
    o.h = o.el.getBoundingClientRect().height;

    o.x = pad + Math.random() * (W - o.w - pad * 2);
    o.y = pad + Math.random() * (H - o.h - pad * 2);
    render(o);
  }
}

/* ---------- RENDER ---------- */
function render(o) {
  o.el.style.left = o.x + "px";
  o.el.style.top = o.y + "px";
}

/* ---------- LOOP ---------- */
let last = performance.now();
function step(ts) {
  const dt = Math.min(0.033, (ts - last) / 1000);
  last = ts;

  for (const o of objects) {
    if (o.drag) continue;

    o.vx *= Math.pow(physics.friction, dt * 60);
    o.vy *= Math.pow(physics.friction, dt * 60);

    o.x += o.vx * dt;
    o.y += o.vy * dt;

    if (o.x < 0 || o.x + o.w > floor.clientWidth) o.vx *= -physics.bounce;
    if (o.y < 0 || o.y + o.h > floor.clientHeight) o.vy *= -physics.bounce;

    o.x = clamp(o.x, 0, floor.clientWidth - o.w);
    o.y = clamp(o.y, 0, floor.clientHeight - o.h);

    render(o);
  }

  requestAnimationFrame(step);
}

/* ---------- INIT ---------- */
function init() {
  // clock
  clock.textContent = new Date().toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich" });
  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich" });
  }, 1000);

  // furniture
  for (let i = 0; i < TOTAL_OBJECTS; i++) {
    const name = FURNITURE[Math.floor(Math.random() * FURNITURE.length)];
    makeObject({ title: name, sub: `Objekt ${String(i + 1).padStart(2, "0")}` });
  }

  // navigation object
makeObject({ title: "Posts", href: "./posts.html" });

  randomSpawn();

  // blog routing
  window.addEventListener("hashchange", renderRoute);

  // start directly on posts
  if (!location.hash) location.hash = "#posts";
  renderRoute();

  requestAnimationFrame(step);
}

window.addEventListener("load", init);
