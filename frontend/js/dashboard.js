const API = "https://soundspace-5lgd.onrender.com";

// Auth check using sessionStorage only
const token = sessionStorage.getItem("mpt_token");
const username = sessionStorage.getItem("mpt_username");
const role = sessionStorage.getItem("mpt_role");
const name = sessionStorage.getItem("mpt_name");

// Redirect to login if missing info
if (!token || !username || !role || !name) {
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("userName");
    const roleEl = document.getElementById("userRole");

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role.toUpperCase();
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "index.html";
    });
}