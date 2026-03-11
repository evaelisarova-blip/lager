function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function loadPosts(){
  const res = await fetch("./posts.json",{cache:"no-store"});
  if(!res.ok) return [];
  return await res.json();
}

async function render(){
  const root = document.getElementById("posts");
  let posts = [];
  try {
    posts = await loadPosts();
  } catch (e) {
    root.innerHTML = "<p>posts.json ist ungültig (JSON-Fehler).</p>";
    return;
  }

  root.innerHTML = posts.map(p => {
    const raw = (p.text || "");
    const htmlText = escapeHtml(raw).replaceAll("\\n", "<br>").replaceAll("\n", "<br>");

    return `
      <article class="post">
        <div class="post__meta">
          <span class="chip">${escapeHtml(p.date||"")}</span>
          ${(p.tags||[]).map(t=>`<span class="chip">#${escapeHtml(t)}</span>`).join("")}
        </div>

        ${p.video ? `
          <div style="margin:0 0 16px 0;">
            <iframe src="${p.video}" width="100%" height="400" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>
          </div>
        ` : ""}

        <h2 class="post__title">${escapeHtml(p.title||"")}</h2>
        <p class="post__text">${htmlText}</p>
      </article>
    `;
  }).join("") || "<p>Keine Beiträge.</p>";
}
render();
