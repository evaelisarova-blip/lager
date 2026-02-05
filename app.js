const floor = document.getElementById("floor");
const panel = document.getElementById("panel");
const clock = document.getElementById("clock");

panel.innerHTML =
  '<h1>Start</h1><p>15 Objekte, zufällige Positionen, klare Grenzen (nichts fällt raus). Ziehe Möbel: Trägheit bleibt.</p>';

const FURNITURE = [
  "Bett","Sofa","Sessel","Couchtisch","Esstisch","Stuhl","Hocker","Schrank","Kleiderschrank",
  "Kommode","Nachttisch","Regal","Bücherregal","Sideboard","Vitrine","Schreibtisch","Bürostuhl",
  "TV-Board","Wohnwand","Bank","Truhe","Spiegel","Garderobe","Schuhschrank","Küchenzeile",
  "Barhocker","Liege / Chaiselongue","Beistelltisch","Wickelkommode","Sekretär"
];

const TOTAL_OBJECTS = 15;

const objects = [];
const physics = {
  friction: 0.985,
  bounce: 0.85,
  maxSpeed: 2000
};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function createObj(title, sub) {
  const el = document.createElement("div");
  el.className = "obj";
  el.innerHTML = `<div class="obj__title">${title}</div><div class="obj__sub">${sub}</div>`;
  floor.appendChild(el);

  const o = {
    el,
    x: 0, y: 0,
    vx: (Math.random() * 600 - 300),
    vy: (Math.random() * 600 - 300),
    w: 150, h: 86,
    drag: false,
    pointerId: null,
    offX: 0, offY: 0,
    lastX: 0, lastY: 0, lastT: 0
  };

  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture?.(e.pointerId);
    o.drag = true;
    o.pointerId = e.pointerId;

    const fr = floor.getBoundingClientRect();
    const px = e.clientX - fr.left;
    const py = e.clientY - fr.top;

    o.offX = px - o.x;
    o.offY = py - o.y;

    o.vx = 0; o.vy = 0;
    o.lastX = px; o.lastY = py; o.lastT = performance.now();
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!o.drag || o.pointerId !== e.pointerId) return;

    const fr = floor.getBoundingClientRect();
    const px = e.clientX - fr.left;
    const py = e.clientY - fr.top;

    const now = performance.now();
    const dt = Math.max(0.001, (now - o.lastT) / 1000);
    const dx = px - o.lastX;
    const dy = py - o.lastY;

    o.vx = clamp(dx / dt, -physics.maxSpeed, physics.maxSpeed);
    o.vy = clamp(dy / dt, -physics.maxSpeed, physics.maxSpeed);

    o.lastX = px; o.lastY = py; o.lastT = now;

    o.x = px - o.offX;
    o.y = py - o.offY;

    // жесткие границы при перетаскивании
    const W = floor.clientWidth;
    const H = floor.clientHeight;
    o.x = clamp(o.x, 0, W - o.w);
    o.y = clamp(o.y, 0, H - o.h);

    render(o);
    e.preventDefault();
  });

  function endDrag(e) {
    if (!o.drag || o.pointerId !== e.pointerId) return;
    o.drag = false;
    o.pointerId = null;
  }

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  objects.push(o);
  return o;
}

function measureAll() {
  for (const o of objects) {
    const r = o.el.getBoundingClientRect();
    o.w = r.width;
    o.h = r.height;
  }
}

function randomSpawn() {
  const W = floor.clientWidth;
  const H = floor.clientHeight;
  const pad = 10;

  for (const o of objects) {
    o.x = pad + Math.random() * Math.max(1, (W - o.w - pad * 2));
    o.y = pad + Math.random() * Math.max(1, (H - o.h - pad * 2));
    render(o);
  }
}

function resolveWalls(o) {
  const W = floor.clientWidth;
  const H = floor.clientHeight;

  if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx) * physics.bounce; }
  if (o.y < 0) { o.y = 0; o.vy = Math.abs(o.vy) * physics.bounce; }
  if (o.x + o.w > W) { o.x = W - o.w; o.vx = -Math.abs(o.vx) * physics.bounce; }
  if (o.y + o.h > H) { o.y = H - o.h; o.vy = -Math.abs(o.vy) * physics.bounce; }
}

function render(o) {
  o.el.style.left = `${o.x}px`;
  o.el.style.top = `${o.y}px`;
}

let last = 0;
function step(ts) {
  const dt = Math.min(0.033, Math.max(0.001, (ts - last) / 1000));
  last = ts;

  for (const o of objects) {
    if (o.drag) continue;

    // трение/инерция (без гравитации, чтобы не “падали”)
    o.vx *= Math.pow(physics.friction, dt * 60);
    o.vy *= Math.pow(physics.friction, dt * 60);

    o.x += o.vx * dt;
    o.y += o.vy * dt;

    resolveWalls(o);
    render(o);
  }

  requestAnimationFrame(step);
}

function init() {
  clock.textContent = new Date().toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich" });
  setInterval(() => {
    clock.textContent = new Date().toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich" });
  }, 1000);

  // создать ровно 15 объектов мебели
  for (let i = 0; i < TOTAL_OBJECTS; i++) {
    const name = FURNITURE[Math.floor(Math.random() * FURNITURE.length)];
    createObj(name, `Objekt ${String(i + 1).padStart(2, "0")}`);
  }

  requestAnimationFrame(() => {
    measureAll();
    randomSpawn();
    last = performance.now();
    requestAnimationFrame(step);
  });

  window.addEventListener("resize", () => {
    measureAll();
    // при ресайзе просто аккуратно в границы
    const W = floor.clientWidth, H = floor.clientHeight;
    for (const o of objects) {
      o.x = clamp(o.x, 0, W - o.w);
      o.y = clamp(o.y, 0, H - o.h);
      render(o);
    }
  });
}

window.addEventListener("load", init);
