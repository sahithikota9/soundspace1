document.addEventListener('DOMContentLoaded', () => {

  const API = location.origin; // replace with your backend URL if needed

  // --- TAB FUNCTIONALITY ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function hideAllTabs() { tabContents.forEach(tab => tab.style.display = 'none'); }
  function deactivateAllButtons() { tabButtons.forEach(btn => btn.classList.remove('active')); }

  hideAllTabs();
  document.getElementById('practice').style.display = 'block';
  tabButtons[0].classList.add('active');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      hideAllTabs();
      deactivateAllButtons();
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).style.display = 'block';
      btn.classList.add('active');
    });
  });

  // --- USER DATA ---
  const username = sessionStorage.getItem('mpt_username');
  const role = sessionStorage.getItem('mpt_role');
  const name = sessionStorage.getItem('mpt_name');

  if (!username) window.location.href = 'index.html';
  document.getElementById('roleDisplay').innerText = `Name: ${name} | Role: ${role}`;

  // --- LOGOUT ---
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  });

  // --- PRACTICE TAB ---
  const practiceCalendar = document.getElementById('practiceCalendar');

  async function loadPractice() {
    const res = await fetch(`${API}/api/practice/${username}`);
    const data = await res.json();
    for (let i=1; i<=30; i++) {
      const cell = document.createElement('div');
      cell.classList.add('calendar-cell');
      const hours = data[i] || 0;
      cell.innerHTML = `<strong>${i}</strong><br>
                        <input type="number" min="0" max="24" style="width:50px;" data-day="${i}" value="${hours}"> hrs`;
      practiceCalendar.appendChild(cell);
    }

    // Save changes on input
    practiceCalendar.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', async () => {
        const day = input.getAttribute('data-day');
        const val = input.value;
        await fetch(`${API}/api/practice/${username}`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ day, hours: val })
        });
      });
    });
  }

  loadPractice();

  // --- ERRORS & NOTES ---
  const errorsContainer = document.getElementById('errorsContainer');
  const notesContainer = document.getElementById('notesContainer');

  async function loadCards(type) {
    const res = await fetch(`${API}/api/${type}/${username}`);
    const data = await res.json();
    const container = type === 'errors' ? errorsContainer : notesContainer;
    data.forEach(text => addCard(container, type, text));
  }

  function addCard(container, type, text='') {
    const card = document.createElement('div');
    card.classList.add('card');
    const textarea = document.createElement('textarea');
    textarea.placeholder = `Type your ${type} here...`;
    textarea.value = text;
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.addEventListener('click', async ()=>{
      await fetch(`${API}/api/${type}/${username}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: textarea.value })
      });
      alert('Saved!');
    });
    const delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.addEventListener('click', async () => {
      await fetch(`${API}/api/${type}/${username}`, {
        method:'DELETE', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: textarea.value })
      });
      card.remove();
    });
    card.appendChild(textarea);
    card.appendChild(saveBtn);
    card.appendChild(delBtn);
    container.appendChild(card);
  }

  document.getElementById('addErrorBtn').addEventListener('click', ()=>addCard(errorsContainer,'error'));
  document.getElementById('addNoteBtn').addEventListener('click', ()=>addCard(notesContainer,'note'));

  loadCards('errors');
  loadCards('notes');

  // --- LIBRARY ---
  const publicBtn = document.getElementById('uploadPublicBtn');
  const privateBtn = document.getElementById('uploadPrivateBtn');
  const publicFilesDiv = document.getElementById('publicFiles');
  const privateFilesDiv = document.getElementById('privateFiles');

  async function loadLibrary() {
    const publicRes = await fetch(`${API}/api/library/public`);
    const publicFiles = await publicRes.json();
    publicFilesDiv.innerHTML = publicFiles.map(f=>`<div>${f}</div>`).join('');

    const privateRes = await fetch(`${API}/api/library/private/${username}`);
    const privateFiles = await privateRes.json();
    privateFilesDiv.innerHTML = privateFiles.map(f=>`<div>${f}</div>`).join('');
  }

  if(role==='teacher') publicBtn.style.display='inline-block';
  publicBtn?.addEventListener('click', ()=>alert('Upload public file (teacher only)'));
  privateBtn.addEventListener('click', ()=>alert('Upload private file'));
  loadLibrary();

  // --- NOTIFICATIONS ---
  const addNotifBtn = document.getElementById('addNotificationBtn');
  if(role==='teacher') addNotifBtn.style.display='inline-block';
  async function loadNotifications() {
    const res = await fetch(`${API}/api/notifications`);
    const data = await res.json();
    document.getElementById('notificationList').innerHTML = data.map(n=>`<div class="card">${n}</div>`).join('');
  }
  addNotifBtn?.addEventListener('click', ()=>alert('Add notification (teacher only)'));
  loadNotifications();

  // --- CHANGE PASSWORD ---
  document.getElementById('changePasswordBtn').addEventListener('click', async ()=>{
    const newPass = document.getElementById('newPassword').value.trim();
    if(newPass.length!==5){ alert('Password must be 5 digits'); return; }
    await fetch(`${API}/api/change-password/${username}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ password: newPass })
    });
    alert('Password changed!');
    document.getElementById('newPassword').value='';
  });

});