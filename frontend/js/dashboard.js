const API = location.origin;

// Check login
const token = sessionStorage.getItem('mpt_token');
const username = sessionStorage.getItem('mpt_username');
const role = sessionStorage.getItem('mpt_role');
const name = sessionStorage.getItem('mpt_name');

if (!token || !username) location.href = 'index.html';

document.getElementById('usernameLabel').innerText = `${name} (${role})`;

// ----------------------
// TAB SWITCHING
// ----------------------
function openTab(tabId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(tabId);
  if (section) section.classList.add('active');
}

// ----------------------
// LOGOUT
// ----------------------
function logout() {
  sessionStorage.clear();
  location.href = 'index.html';
}

// ----------------------
// PRACTICE
// ----------------------
async function savePractice() {
  const val = document.getElementById('practiceInput').value.trim();
  await fetch(`${API}/api/practice`, {
    method:'POST', headers:{
      'content-type':'application/json',
      username, token
    }, body: JSON.stringify({ text: val })
  });
  alert('Saved practice log!');
  loadPractice();
}

async function loadPractice() {
  const res = await fetch(`${API}/api/practice`, {
    headers: { username, token }
  });
  const data = await res.json();
  document.getElementById('practiceInput').value = data.text || '';
}
loadPractice();

// ----------------------
// NOTES
// ----------------------
async function saveNotes() {
  const val = document.getElementById('notesInput').value.trim();
  await fetch(`${API}/api/notes`, {
    method:'POST', headers:{
      'content-type':'application/json',
      username, token
    }, body: JSON.stringify({ text: val })
  });
  alert('Saved notes!');
  loadNotes();
}

async function loadNotes() {
  const res = await fetch(`${API}/api/notes`, {
    headers: { username, token }
  });
  const data = await res.json();
  document.getElementById('notesInput').value = data.text || '';
}
loadNotes();

// ----------------------
// ERRORS
// ----------------------
async function saveErrors() {
  const val = document.getElementById('errorsInput').value.trim();
  await fetch(`${API}/api/errors`, {
    method:'POST', headers:{
      'content-type':'application/json',
      username, token
    }, body: JSON.stringify({ text: val })
  });
  alert('Saved errors!');
  loadErrors();
}

async function loadErrors() {
  const res = await fetch(`${API}/api/errors`, { headers:{ username, token } });
  const data = await res.json();
  document.getElementById('errorsInput').value = data.text || '';
}
loadErrors();

// ----------------------
// PRIVATE LIBRARY
// ----------------------
async function uploadPrivateFile() {
  const fileInput = document.getElementById('privateFile');
  if (!fileInput.files.length) return alert('Select a file!');
  const form = new FormData();
  form.append('file', fileInput.files[0]);

  await fetch(`${API}/api/private_library`, {
    method:'POST', headers:{ username, token }, body: form
  });
  alert('File uploaded!');
  fileInput.value = '';
  loadPrivateLib();
}

async function loadPrivateLib() {
  const res = await fetch(`${API}/api/private_library`, {
    headers: { username, token }
  });
  const files = await res.json();
  const ul = document.getElementById('privateList');
  ul.innerHTML = '';
  files.forEach(f=>{
    const li = document.createElement('li');
    li.innerHTML = `<a href="${API}/data/private_libraries/${username}/${f}" target="_blank">${f}</a>`;
    ul.appendChild(li);
  });
}
loadPrivateLib();

// ----------------------
// PUBLIC LIBRARY
// ----------------------
async function loadPublicLib() {
  const res = await fetch(`${API}/api/public_library`, { headers:{ username, token } });
  const files = await res.json();
  const ul = document.getElementById('publicList');
  ul.innerHTML = '';
  files.forEach(f=>{
    const li = document.createElement('li');
    li.innerHTML = `<a href="${API}/data/public_library/${f}" target="_blank">${f}</a>`;
    ul.appendChild(li);
  });
}
loadPublicLib();

// Teacher upload to public library
async function uploadPublicFile() {
  const fileInput = document.getElementById('publicFile');
  if (!fileInput.files.length) return alert('Select a file!');
  const form = new FormData();
  form.append('file', fileInput.files[0]);

  await fetch(`${API}/api/public_library`, {
    method:'POST', headers:{ username, token }, body: form
  });
  alert('File uploaded!');
  fileInput.value='';
  loadPublicLib();
}

// ----------------------
// NOTIFICATIONS
// ----------------------
const teacherTools = document.getElementById('teacherNotifTools');
if (role === 'teacher') teacherTools.style.display = 'block';

async function sendNotification() {
  const msg = document.getElementById('notifMsg').value.trim();
  const fileInput = document.getElementById('notifFile');
  const form = new FormData();
  form.append('message', msg);
  if (fileInput.files.length) form.append('file', fileInput.files[0]);

  await fetch(`${API}/api/notifications`, {
    method:'POST', headers:{ username, token }, body: form
  });
  alert('Notification sent!');
  document.getElementById('notifMsg').value='';
  fileInput.value='';
  loadNotifications();
}

async function loadNotifications() {
  const res = await fetch(`${API}/api/notifications`, { headers:{ username, token } });
  const notifs = await res.json();
  const ul = document.getElementById('notifList');
  ul.innerHTML = '';
  notifs.forEach(n=>{
    const li = document.createElement('li');
    let content = `${new Date(n.timestamp).toLocaleString()}: ${n.message}`;
    if (n.file) content += ` - <a href="${API}${n.file}" target="_blank">View</a>`;
    li.innerHTML = content;
    ul.appendChild(li);
  });
}
loadNotifications();