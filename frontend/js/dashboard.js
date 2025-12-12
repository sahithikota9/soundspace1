const API = (location.hostname === 'localhost') ? 'http://localhost:8787' : location.origin;
const token = sessionStorage.getItem('mpt_token');
if (!token) location.href = 'index.html';
const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type':'application/json' };

async function loadMe(){
  const r = await fetch(API + '/api/me', { headers });
  if (!r.ok){ sessionStorage.clear(); location.href='index.html'; return; }
  const me = await r.json();
  document.getElementById('welcomeText').innerText = `Welcome, ${me.name}`;
  document.getElementById('roleText').innerText = `Role: ${me.role.toUpperCase()}`;
  document.getElementById('profileName').innerText = me.name;
  document.getElementById('profileRole').innerText = me.role.toUpperCase();
  document.getElementById('profileUsername').innerText = sessionStorage.getItem('mpt_username');
  document.getElementById('profileDisplayName').innerText = me.name;
  if (me.role === 'teacher'){
    document.querySelector('[data-tab="practice"]').style.display='none';
    document.querySelector('[data-tab="errors"]').style.display='none';
    document.querySelector('[data-tab="notes"]').style.display='none';
  }
}
loadMe();

const navItems = document.querySelectorAll('.nav-item');
const panes = document.querySelectorAll('.tab-pane');
function hideAll(){ panes.forEach(p=>p.classList.add('hidden')); }
function show(name){ hideAll(); document.getElementById('tab-'+name).classList.remove('hidden'); }
navItems.forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const t = btn.dataset.tab;
    show(t);
    if (t==='practice') loadPractice();
    if (t==='errors') loadErrors();
    if (t==='notes') loadNotes();
    if (t==='library') loadLibrary();
    if (t==='notifications') loadNotifications();
    if (t==='profile') loadProfile();
  });
});
if (sessionStorage.getItem('mpt_role')==='teacher') show('notifications'); else show('practice');

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  sessionStorage.clear();
  location.href='index.html';
});