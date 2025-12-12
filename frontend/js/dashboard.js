const API = 'https://soundspace-5lgd.onrender.com';

// Check login
const token = sessionStorage.getItem('mpt_token');
if(!token){
    window.location.href = 'index.html';
}

// Welcome & role
document.getElementById('welcomeName').innerText = `Welcome, ${sessionStorage.getItem('mpt_name')}`;
document.getElementById('userRole').innerText = `Role: ${sessionStorage.getItem('mpt_role')}`;

// Logout
document.getElementById('logoutBtn').addEventListener('click', ()=>{
    sessionStorage.clear();
    location.href='index.html';
});

// Tab switching
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
        const target = tab.dataset.tab;
        contents.forEach(c=>c.style.display='none');
        document.getElementById(target).style.display='block';
    });
});

// Show first tab by default
document.getElementById('practice').style.display='block';

const username = sessionStorage.getItem('mpt_username');
const role = sessionStorage.getItem('mpt_role');

// ------------------ Practice Tab ------------------
async function loadPractice(){
    try{
        const res = await fetch(`${API}/api/practice/${username}`);
        const data = await res.json();
        const container = document.getElementById('practice');
        container.innerHTML = '';
        let html = '<table class="calendar"><tr>';
        for(let i=1;i<=31;i++){
            const hours = data[i] || 0;
            html += `<td>
                        <strong>${i}</strong><br/>
                        <input type="number" min="0" max="24" value="${hours}" data-day="${i}" class="practice-input"/>
                     </td>`;
            if(i%7===0) html+='</tr><tr>';
        }
        html += '</tr></table>';
        container.innerHTML = html;

        document.querySelectorAll('.practice-input').forEach(input=>{
            input.addEventListener('change', async ()=>{
                const day = input.dataset.day;
                const hours = parseFloat(input.value)||0;
                await fetch(`${API}/api/practice/${username}`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({day,hours})
                });
            });
        });
    }catch(err){ console.error(err); }
}
if(role==='student') loadPractice();

// ------------------ Errors Tab ------------------
async function loadErrors(){
    try{
        const res = await fetch(`${API}/api/errors/${username}`);
        const data = await res.json();
        const container = document.getElementById('errors');
        container.innerHTML = '';
        Object.keys(data).forEach(day=>{
            const div = document.createElement('div');
            div.className='card';
            div.innerHTML = `<strong>Day ${day}</strong><br/>
                             <textarea data-day="${day}" class="errors-textarea">${data[day]}</textarea>`;
            container.appendChild(div);
            div.querySelector('textarea').addEventListener('change', async e=>{
                const text = e.target.value;
                await fetch(`${API}/api/errors/${username}`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({day,text})
                });
            });
        });
    }catch(err){ console.error(err); }
}
if(role==='student') loadErrors();

// ------------------ Notes Tab ------------------
async function loadNotes(){
    try{
        const res = await fetch(`${API}/api/notes/${username}`);
        const data = await res.json();
        const container = document.getElementById('notes');
        container.innerHTML = '';
        Object.keys(data).forEach(day=>{
            const div = document.createElement('div');
            div.className='card';
            div.innerHTML = `<strong>Day ${day}</strong><br/>
                             <textarea data-day="${day}" class="notes-textarea">${data[day]}</textarea>`;
            container.appendChild(div);
            div.querySelector('textarea').addEventListener('change', async e=>{
                const text = e.target.value;
                await fetch(`${API}/api/notes/${username}`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({day,text})
                });
            });
        });
    }catch(err){ console.error(err); }
}
if(role==='student') loadNotes();

// ------------------ Notifications Tab ------------------
async function loadNotifications(){
    try{
        const res = await fetch(`${API}/api/notifications`);
        const data = await res.json();
        const container = document.getElementById('notifications');
        container.innerHTML = '';

        Object.values(data).forEach(n=>{
            const div = document.createElement('div');
            div.className='notification-card';
            div.innerHTML = `<strong>${n.author}</strong>: ${n.text} <small>${new Date(n.date).toLocaleString()}</small>`;
            container.appendChild(div);
        });

        if(role==='teacher'){
            const form = document.createElement('form');
            form.innerHTML = `<textarea id="notifText" placeholder="Write notification"></textarea>
                              <button type="submit" class="btn primary">Post</button>`;
            container.prepend(form);

            form.addEventListener('submit', async e=>{
                e.preventDefault();
                const text = document.getElementById('notifText').value.trim();
                if(!text) return;
                await fetch(`${API}/api/notifications`, {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({author:sessionStorage.getItem('mpt_name'),text})
                });
                loadNotifications();
            });
        }

    }catch(err){ console.error(err); }
}
loadNotifications();

// ------------------ Library Tab ------------------
async function loadLibrary(){
    const container = document.getElementById('library');
    container.innerHTML='<h3>Public Library</h3><div id="publicLib"></div><h3>Private Library</h3><div id="privateLib"></div>';

    try{
        const resPub = await fetch(`${API}/api/public_library`);
        const pubData = await resPub.json();
        const pubContainer = document.getElementById('publicLib');
        pubContainer.innerHTML='';
        pubData.forEach(f=>{
            const div = document.createElement('div');
            div.className='file-card';
            div.innerHTML=`${f.name}`;
            pubContainer.appendChild(div);
        });

        const resPriv = await fetch(`${API}/api/private_library/${username}`);
        const privData = await resPriv.json();
        const privContainer = document.getElementById('privateLib');
        privContainer.innerHTML='';
        privData.forEach(f=>{
            const div = document.createElement('div');
            div.className='file-card';
            div.innerHTML=`${f.name}`;
            privContainer.appendChild(div);
        });
    }catch(err){ console.error(err); }
}
loadLibrary();

// ------------------ Profile Tab ------------------
function loadProfile(){
    const container = document.getElementById('profile');
    container.innerHTML=`
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p><strong>Name:</strong> ${sessionStorage.getItem('mpt_name')}</p>
      <label>Change Password:</label>
      <input type="password" id="newPass"/>
      <button id="changePassBtn" class="btn primary">Change</button>
      <p id="passMsg" style="color:#b33"></p>
    `;

    document.getElementById('changePassBtn').addEventListener('click', async ()=>{
        const newPass = document.getElementById('newPass').value.trim();
        if(!newPass) return;
        const res = await fetch(`${API}/api/change_password/${username}`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({password:newPass})
        });
        const data = await res.json();
        document.getElementById('passMsg').innerText = data.message || 'Password changed';
    });
}
loadProfile();