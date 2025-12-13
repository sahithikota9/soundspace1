const API = "https://soundspace-5lgd.onrender.com";

const username = sessionStorage.getItem("mpt_username");
const role = sessionStorage.getItem("mpt_role");
const name = sessionStorage.getItem("mpt_name");

if (!username) location.href = "index.html";

document.getElementById("welcome").innerText = `Welcome, ${name}`;
document.getElementById("role").innerText = role;

/* -------- TAB SWITCHING -------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.getElementById(btn.dataset.tab).style.display = "block";
  };
});

/* -------- SAVE FUNCTION -------- */
function save(type, date, text) {
  fetch(`${API}/api/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, date, text })
  });
}

/* -------- LOAD FUNCTION -------- */
function load(type, container) {
  fetch(`${API}/api/${type}/${username}`)
    .then(r => r.json())
    .then(data => {
      container.innerHTML = "";
      Object.keys(data).forEach(d => {
        const div = document.createElement("div");
        div.innerText = `${d}: ${data[d]}`;
        container.appendChild(div);
      });
    });
}

/* -------- PRACTICE -------- */
document.getElementById("practiceSave").onclick = () => {
  save("practice", practiceDate.value, practiceText.value);
};

load("practice", practiceList);

/* -------- NOTES -------- */
document.getElementById("notesSave").onclick = () => {
  save("notes", notesDate.value, notesText.value);
};

load("notes", notesList);

/* -------- ERRORS -------- */
document.getElementById("errorsSave").onclick = () => {
  save("errors", errorsDate.value, errorsText.value);
};

load("errors", errorsList);

/* -------- NOTIFICATIONS -------- */
fetch(`${API}/api/notifications`)
  .then(r => r.json())
  .then(list => {
    notifications.innerHTML = "";
    list.forEach(n => {
      const p = document.createElement("p");
      p.innerText = n.message;
      notifications.appendChild(p);
    });
  });

if (role === "teacher") {
  sendNotice.onclick = () => {
    fetch(`${API}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: noticeText.value })
    });
  };
}

/* -------- PUBLIC LIBRARY -------- */
fetch(`${API}/api/public-library`)
  .then(r => r.json())
  .then(files => {
    publicFiles.innerHTML = "";
    files.forEach(f => {
      const a = document.createElement("a");
      a.href = `${API}/public_library/${f}`;
      a.innerText = f;
      a.target = "_blank";
      publicFiles.appendChild(a);
    });
  });

if (role === "teacher") {
  publicUpload.onchange = () => {
    const fd = new FormData();
    fd.append("file", publicUpload.files[0]);
    fetch(`${API}/api/public-library`, { method: "POST", body: fd });
  };
}

/* -------- LOGOUT -------- */
logoutBtn.onclick = () => {
  sessionStorage.clear();
  location.href = "index.html";
};