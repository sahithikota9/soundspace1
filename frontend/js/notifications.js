async function loadNotifications(){
  const list = document.getElementById('notificationsList'); list.innerHTML = '';
  const res = await fetch(API + '/api/notifications', { headers });
  const arr = await res.json();
  arr.forEach(n=>{
    const el = document.createElement('div'); el.className='card';
    el.innerHTML = `<div><strong>${n.title||'Announcement'}</strong> <div class="muted small">${new Date(n.date_posted).toLocaleString()}</div></div><p class="muted">${n.message}</p>${n.posted_by===sessionStorage.getItem('mpt_username')?`<div><button class="btn ghost" onclick="editNotif(${n.id})">Edit</button><button class="btn ghost" onclick="deleteNotif(${n.id})">Delete</button></div>`:''}`;
    list.appendChild(el);
  });
  const editor = document.getElementById('notificationEditor');
  if (sessionStorage.getItem('mpt_role')==='teacher'){
    editor.classList.remove('hidden');
    editor.innerHTML = `<input id="notifTitle" placeholder="Title" /><textarea id="notifMessage" placeholder="Message"></textarea><button id="sendNotif" class="btn primary">Post</button>`;
    document.getElementById('sendNotif').onclick = async ()=>{
      const t = document.getElementById('notifTitle').value; const m = document.getElementById('notifMessage').value;
      await fetch(API + '/api/notifications', { method:'POST', headers, body: JSON.stringify({ title:t, message:m }) }); loadNotifications();
    }
  } else editor.classList.add('hidden');
}
window.editNotif = async (id)=>{ const msg = prompt('Edit message'); if(msg===null) return; await fetch(API+'/api/notifications/'+id,{ method:'PUT', headers, body: JSON.stringify({ message: msg }) }); loadNotifications(); }
window.deleteNotif = async (id)=>{ if(!confirm('Delete?')) return; await fetch(API+'/api/notifications/'+id,{ method:'DELETE', headers }); loadNotifications(); }