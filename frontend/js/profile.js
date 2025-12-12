async function loadProfile(){ /* profile values loaded by dashboard.js */ }

document.getElementById('saveNameBtn')?.addEventListener('click', async ()=>{
  const name = document.getElementById('editDisplayName').value.trim();
  if (!name) return alert('Enter name');
  await fetch(API + '/api/me/name', { method:'POST', headers, body: JSON.stringify({ name }) });
  document.getElementById('profileDisplayName').innerText = name;
  document.getElementById('profileName').innerText = name;
  document.getElementById('welcomeText').innerText = 'Welcome, ' + name;
});
document.getElementById('changePassBtn')?.addEventListener('click', async ()=>{
  const curr = document.getElementById('currentPassword').value;
  const next = document.getElementById('newPassword').value;
  const r = await fetch(API + '/api/me/password', { method:'POST', headers, body: JSON.stringify({ current: curr, next }) });
  const j = await r.json();
  if (!r.ok) return alert(j.error || 'Failed');
  alert('Password changed. Please login again.');
  sessionStorage.clear(); location.href='index.html';
});