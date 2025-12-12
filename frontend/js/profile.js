// profile.js
export function loadProfile(username, apiFetch){
  const pane = document.getElementById('profile');
  pane.innerHTML = `<h2>Profile</h2>
    <div class="card">
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Name:</strong> ${sessionStorage.getItem('mpt_name')}</p>
      <p><strong>Role:</strong> ${sessionStorage.getItem('mpt_role')}</p>
      <label class="label">Change password</label>
      <input id="newPass" type="password" placeholder="New 5-digit password" class="input"/>
      <div style="margin-top:10px"><button id="changePassBtn" class="btn primary">Change password</button></div>
      <p id="passMsg" class="muted"></p>
    </div>`;
  document.getElementById('changePassBtn').addEventListener('click', async () => {
    const newP = document.getElementById('newPass').value.trim();
    if(!newP) return alert('Enter a new password');
    const res = await fetch(`https://soundspace-5lgd.onrender.com/api/change_password/${username}`, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('mpt_token')}`}, body: JSON.stringify({ password: newP }) });
    const data = await res.json();
    if(res.ok) document.getElementById('passMsg').innerText = data.message || 'Password updated';
    else document.getElementById('passMsg').innerText = data.error || 'Error';
  });
}