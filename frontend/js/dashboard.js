const API = "https://soundspace-5lgd.onrender.com"; // replace with your deployed backend
const username = sessionStorage.getItem('mpt_username');
const role = sessionStorage.getItem('mpt_role');
const name = sessionStorage.getItem('mpt_name');

document.getElementById('welcomeName').innerText = `Welcome, ${name} (${role})`;

// Load tab content
async function loadTab(tab) {
  const content = document.getElementById('tabContent');
  content.innerHTML = 'Loading...';
  try {
    let data;
    if (['practice','errors','notes'].includes(tab)) {
      const res = await fetch(`${API}/${tab}/${username}`);
      data = await res.json();
    } else if (tab === 'private') {
      const res = await fetch(`${API}/private/${username}`);
      data = await res.json();
    } else if (tab === 'public') {
      const res = await fetch(`${API}/public`);
      data = await res.json();
    } else if (tab === 'notifications') {
      const res = await fetch(`${API}/notifications`);
      data = await res.json();
    }
    content.innerHTML = JSON.stringify(data, null, 2); // replace with UI cards later
  } catch(e) {
    content.innerHTML = 'Error loading tab';
    console.error(e);
  }
}

// Sidebar tab clicks
document.querySelectorAll('.sidebar-tab').forEach(el => {
  el.addEventListener('click', () => loadTab(el.dataset.tab));
});

// Load default tab
loadTab(role === 'teacher' ? 'notifications' : 'practice');

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'index.html';
});