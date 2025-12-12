// ================================
// CONFIG — CONNECT TO BACKEND
// ================================
const API = "https://soundspace-5lgd.onrender.com";   // <-- YOUR backend URL (no slash)
console.log("Dashboard using API:", API);

// ================================
// AUTH CHECK
// ================================
const token = sessionStorage.getItem("mpt_token");
const username = sessionStorage.getItem("mpt_username");
const role = sessionStorage.getItem("mpt_role");
const name = sessionStorage.getItem("mpt_name");

// If any required data is missing → send back to login
if (!token || !username || !role || !name) {
    console.warn("Missing session data. Redirecting...");
    window.location.href = "index.html";
}

// ================================
// DISPLAY USER INFO
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const nameEl = document.getElementById("userName");
    const roleEl = document.getElementById("userRole");

    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = role.toUpperCase();
});

// ================================
// VERIFY TOKEN WITH BACKEND
// (Prevents invalid tokens from showing dashboard)
// ================================
async function verifyToken() {
    try {
        const res = await fetch(`${API}/api/verify`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            console.error("Token check failed.");
            window.location.href = "index.html";
            return;
        }

        console.log("Token OK.");
    } 
    catch (err) {
        console.error("Could not connect to backend:", err);
        alert("Unable to connect to the server. Try again later.");
    }
}

verifyToken();

// ================================
// LOGOUT BUTTON
// ================================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "index.html";
    });
}