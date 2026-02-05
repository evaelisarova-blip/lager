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
  const posts = await loadPosts();
  root.innerHTML = posts.map(p=>`
    <article class="post">
      <div class="post__meta">
        <span class="chip">${escapeHtml(p.date||"")}</span>
        ${(p.tags||[]).map(t=>`<span class="chip">#${escapeHtml(t)}</span>`).join("")}
      </div>
      <h2 class="post__title">${escapeHtml(p.title||"")}</h2>
      <p class="post__text">${escapeHtml(p.text||"")}</p>
    </article>
  `).join("") || "<p>Keine Beiträge.</p>";
}
render();
