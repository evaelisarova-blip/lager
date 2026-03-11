const floor = document.getElementById("floor");
const clockEl = document.getElementById("clock");

const lightbox = document.getElementById("lightbox");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxImage = document.getElementById("lightboxImage");

const tvOverlay = document.getElementById("tvOverlay");
const tvOverlayBackdrop = document.getElementById("tvOverlayBackdrop");
const tvOverlayClose = document.getElementById("tvOverlayClose");
const tvGuideBody = document.getElementById("tvGuideBody");

const FURNITURE = [
  "Bett","Sofa","Sessel","Couchtisch","Esstisch","Stuhl","Hocker","Schrank",
  "Kleiderschrank","Kommode","Nachttisch","Regal","Sideboard",
  "Vitrine","Schreibtisch","Bürostuhl","Wohnwand","Bank",
  "Truhe","Spiegel","Garderobe","Schuhschrank","Küchenzeile",
  "Barhocker","Liege","Beistelltisch","Wickelkommode","Sekretär"
];

const TOTAL_OBJECTS = 13;
const objects = [];

const BOOKS = [
  "./books/book1.jpg",
  "./books/book2.jpg",
  "./books/book3.jpg",
  "./books/book4.jpg",
  "./books/book5.jpg",
  "./books/book6.jpg",
  "./books/book7.jpg",
  "./books/book8.jpg",
  "./books/book9.jpg",
  "./books/book10.jpg",
  "./books/book11.jpg",
  "./books/book12.jpg",
  "./books/book13.jpg",
  "./books/book14.jpg",
  "./books/book15.jpg"
];

const TV_GUIDE_ROWS = [
  {
    channel: "MTV USA",
    country: "USA",
    slots: [
      ["TRL", "Music / Live"],
      ["Pimp My Ride", "Reality"],
      ["Punk’d", "Comedy"],
      ["The Hills", "Reality"]
    ]
  },
  {
    channel: "FOX",
    country: "USA",
    slots: [
      ["The O.C.", "Teen Drama"],
      ["Malcolm in the Middle", "Sitcom"],
      ["House", "Drama"],
      ["Cops", "Reality"]
    ]
  },
  {
    channel: "The WB / CW",
    country: "USA",
    slots: [
      ["One Tree Hill", "Teen Drama"],
      ["Gilmore Girls", "Drama"],
      ["America’s Next Top Model", "Reality"],
      ["Gossip Girl", "Drama"]
    ]
  },
  {
    channel: "ProSieben",
    country: "Deutschland",
    slots: [
      ["TV total", "Late Comedy"],
      ["Popstars", "Casting"],
      ["Galileo", "Magazine"],
      ["Desperate Housewives", "Dubbed Drama"]
    ]
  },
  {
    channel: "RTL",
    country: "Deutschland",
    slots: [
      ["Gute Zeiten, schlechte Zeiten", "Soap"],
      ["DSDS", "Casting"],
      ["Wer wird Millionär?", "Quiz"],
      ["Alarm für Cobra 11", "Action"]
    ]
  },
  {
    channel: "SAT.1",
    country: "Deutschland",
    slots: [
      ["Richterin Barbara Salesch", "Court Show"],
      ["Lenßen & Partner", "Scripted Reality"],
      ["Niedrig und Kuhnt", "Crime"],
      ["Das perfekte Dinner", "Lifestyle"]
    ]
  },
  {
    channel: "ТНТ",
    country: "Россия",
    slots: [
      ["Дом-2", "Reality"],
      ["Счастливы вместе", "Sitcom"],
      ["Универ", "Sitcom"],
      ["Comedy Club", "Comedy"]
    ]
  },
  {
    channel: "СТС",
    country: "Россия",
    slots: [
      ["Папины дочки", "Sitcom"],
      ["Кадетство", "Drama"],
      ["Моя прекрасная няня", "Sitcom"],
      ["Не родись красивой", "Telenovela"]
    ]
  },
  {
    channel: "Первый канал",
    country: "Россия",
    slots: [
      ["Фабрика звёзд", "Music Reality"],
      ["Пусть говорят", "Talk Show"],
      ["Кто хочет стать миллионером?", "Quiz"],
      ["Что? Где? Когда?", "Intellectual Game"]
    ]
  }
];

const physics = {
  friction: 0.985,
  bounce: 0.85,
  maxSpeed: 2000
};

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString("de-CH", {
    timeZone: "Europe/Zurich"
  }) + " Zürich";
}

/* ---------- BOOK OVERLAY ---------- */

function openBookLightbox() {
  const src = BOOKS[Math.floor(Math.random() * BOOKS.length)];
  lightboxImage.src = src;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeBookLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ---------- TV OVERLAY ---------- */

function buildTvRows() {
  const duplicated = [...TV_GUIDE_ROWS, ...TV_GUIDE_ROWS];

  tvGuideBody.innerHTML = `
    <div class="tv-guide__track">
      ${duplicated.map(row => `
        <div class="tv-row">
          <div class="tv-row__channel">
            <strong>${row.channel}</strong>
            <span class="tv-row__country">${row.country}</span>
          </div>

          ${row.slots.map(slot => `
            <div class="tv-slot">
              <div class="tv-program">
                <div class="tv-program__title">${slot[0]}</div>
                <div class="tv-program__meta">${slot[1]}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function openTvOverlay() {
  buildTvRows();
  tvOverlay.classList.add("is-open");
  tvOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeTvOverlay() {
  tvOverlay.classList.remove("is-open");
  tvOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ---------- OVERLAY EVENTS ---------- */

lightboxBackdrop.addEventListener("click", closeBookLightbox);
lightboxClose.addEventListener("click", closeBookLightbox);

tvOverlayBackdrop.addEventListener("click", closeTvOverlay);
tvOverlayClose.addEventListener("click", closeTvOverlay);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBookLightbox();
    closeTvOverlay();
  }
});

/* ---------- OBJECTS ---------- */

function render(o) {
  o.el.style.left = `${o.x}px`;
  o.el.style.top = `${o.y}px`;
}

function makeObject({ title, sub = "", href = null, onClick = null, className = "" }) {
  const el = document.createElement(href ? "a" : "div");
  el.className = `obj ${className}`.trim();

  if (href) {
    el.href = href;
  }

  el.innerHTML = `
    <div class="obj__title">${title}</div>
    ${sub ? `<div class="obj__sub">${sub}</div>` : ""}
  `;

  floor.appendChild(el);

  const o = {
    el,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    w: 176,
    h: 104,
    drag: false,
    moved: false,
    pid: null,
    offX: 0,
    offY: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    onClick,
    href
  };

  el.addEventListener("pointerdown", (e) => {
    if (lightbox.classList.contains("is-open") || tvOverlay.classList.contains("is-open")) return;

    el.setPointerCapture?.(e.pointerId);
    o.drag = true;
    o.moved = false;
    o.pid = e.pointerId;

    const rect = floor.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    o.offX = px - o.x;
    o.offY = py - o.y;
    o.vx = 0;
    o.vy = 0;
    o.lastX = px;
    o.lastY = py;
    o.lastT = performance.now();

    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!o.drag || o.pid !== e.pointerId) return;

    const rect = floor.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const now = performance.now();
    const dt = Math.max(0.001, (now - o.lastT) / 1000);

    const dx = px - o.lastX;
    const dy = py - o.lastY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      o.moved = true;
    }

    o.vx = clamp(dx / dt, -physics.maxSpeed, physics.maxSpeed);
    o.vy = clamp(dy / dt, -physics.maxSpeed, physics.maxSpeed);
    o.lastX = px;
    o.lastY = py;
    o.lastT = now;

    o.x = clamp(px - o.offX, 0, floor.clientWidth - o.w);
    o.y = clamp(py - o.offY, 0, floor.clientHeight - o.h);

    render(o);
    e.preventDefault();
  });

  window.addEventListener("pointerup", (e) => {
    if (o.pid !== e.pointerId) return;

    const wasMoved = o.moved;
    const clickHandler = o.onClick;
    const link = o.href;

    o.drag = false;
    o.pid = null;

    if (!wasMoved) {
      if (clickHandler) {
        e.preventDefault();
        clickHandler();
      } else if (link) {
        window.location.href = link;
      }
    }
  });

  objects.push(o);
  return o;
}

function randomSpawn() {
  const W = floor.clientWidth;
  const H = floor.clientHeight;
  const pad = 12;

  for (const o of objects) {
    const rect = o.el.getBoundingClientRect();
    o.w = rect.width || o.w;
    o.h = rect.height || o.h;

    o.x = pad + Math.random() * Math.max(1, W - o.w - pad * 2);
    o.y = pad + Math.random() * Math.max(1, H - o.h - pad * 2);
    render(o);
  }
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
  updateClock();
  setInterval(updateClock, 1000);

  for (let i = 0; i < TOTAL_OBJECTS; i++) {
    const name = FURNITURE[Math.floor(Math.random() * FURNITURE.length)];
    makeObject({
      title: name,
      sub: `Objekt ${String(i + 1).padStart(2, "0")}`
    });
  }

  makeObject({
    title: "Posts",
    sub: "Blog",
    href: "./posts.html",
    className: "obj--nav"
  });

  makeObject({
    title: "Bücherregal",
    sub: "Objekt Buch",
    onClick: openBookLightbox,
    className: "obj--shelf"
  });

  makeObject({
    title: "TV-Board",
    sub: "Objekt TV",
    onClick: openTvOverlay,
    className: "obj--tv"
  });

  randomSpawn();
  requestAnimationFrame(step);
}

window.addEventListener("load", init);
