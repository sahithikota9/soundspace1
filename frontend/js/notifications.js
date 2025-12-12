// notifications.js
export async function loadNotifications(username, role, apiFetch){
  const pane = document.getElementById('notifications');
  pane.innerHTML = '<h2>Notifications</h2><p class="muted">Announcements from teachers (students can only view).</p>';

  // teacher post form
  if(role === 'teacher'){
    const form = document.createElement('form'); form.className = 'card';
    form.innerHTML = `<textarea id="notifText" placeholder="Write announcement..." style="width:100%;min-height:80px"></textarea><div style="margin-top:10px"><button class="btn primary">Post</button></div>`;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const txt = document.getElementById('notifText').value.trim();
      if(!txt) return;
      const r = await apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify({ text: txt }) });
      if(r.ok) { document.getElementById('notifText').value=''; loadNotifications(username, role, apiFetch); }
      else alert('Failed to post');
    });
    pane.appendChild(form);
  }

  const r = await apiFetch('/api/notifications');
  const list = r.ok ? r.data : {};
  const container = document.createElement('div'); container.style.marginTop = '12px';
  Object.values(list).sort((a,b)=> new Date(b.date) - new Date(a.date)).forEach(n => {
    const el = document.createElement('div'); el.className = 'notification-card';
    el.innerHTML = `<strong>${n.author}</strong> — ${new Date(n.date).toLocaleString()}<div style="margin-top:8px">${n.text}</div>`;
    pane.appendChild(el);
  });
}