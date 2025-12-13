const API = 'https://your-backend-service.onrender.com'; // Replace with your backend URL

document.addEventListener('DOMContentLoaded', () => {
  const name = sessionStorage.getItem('mpt_name');
  const role = sessionStorage.getItem('mpt_role');
  const username = sessionStorage.getItem('mpt_username');
  if (!name || !role) window.location.href = 'index.html';

  document.getElementById('userName').innerText = `Welcome, ${name}`;
  document.getElementById('userRole').innerText = `Role: ${role}`;

  // Sidebar tabs
  document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      document.getElementById(target).style.display = 'block';
    });
  });

  // Load notifications
  fetch(API + '/api/notifications')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('notificationsList');
      container.innerHTML = '';
      data.forEach(n => {
        const div = document.createElement('div');
        div.className = 'notification-card';
        div.innerText = `${n.date}: ${n.message}`;
        container.appendChild(div);
      });
    });

  // Load practice/errors/notes dynamically
  ['practice', 'errors', 'notes'].forEach(type => {
    fetch(`${API}/api/load/${type}/${username}`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById(type + 'Container');
        if (!container) return;
        container.value = JSON.stringify(data, null, 2); // example simple display
      });
  });
});