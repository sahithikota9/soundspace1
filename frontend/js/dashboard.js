const API = "https://soundspace-5lgd.onrender.com";

/* ===== SESSION CHECK ===== */
const username = sessionStorage.getItem("mpt_username");
const role = sessionStorage.getItem("mpt_role");
const name = sessionStorage.getItem("mpt_name");

if (!username || !role) {
  window.location.href = "index.html";
}

/* ===== UI ===== */
document.getElementById("welcome").innerText =
  `Welcome, ${name} (${role})`;

/* ===== TAB HANDLER ===== */
async function loadTab(tab) {
  const content = document.getElementById("content");
  content.innerHTML = "<p>Loading…</p>";

  try {
    let url = "";

    if (tab === "practice") url = `${API}/api/practice/${username}`;
    if (tab === "errors") url = `${API}/api/errors/${username}`;
    if (tab === "notes") url = `${API}/api/notes/${username}`;
    if (tab === "notifications") url = `${API}/api/notifications`;
    if (tab === "library") url =
      role === "teacher"
        ? `${API}/api/public-library`
        : `${API}/api/private-library/${username}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();

    content.innerHTML =
      `<pre>${JSON.stringify(data, null, 2)}</pre>`;

  } catch (err) {
    console.error(err);
    content.innerHTML =
      "<p style='color:red'>Error loading tab</p>";
  }
}

/* ===== SIDEBAR BUTTONS ===== */
document.querySelectorAll("[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    loadTab(btn.dataset.tab);
  });
});

/* ===== DEFAULT TAB ===== */
loadTab(role === "teacher" ? "notifications" : "practice");

/* ===== LOGOUT ===== */
document.getElementById("logoutBtn").onclick = () => {
  sessionStorage.clear();
  window.location.href = "index.html";
};