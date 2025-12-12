// library.js
export async function loadLibrary(username, role, apiFetch){
  const pane = document.getElementById('music-library');
  pane.innerHTML = '<h2>Music Library</h2><p class="muted">Public resources (teachers upload) and your private files.</p>';

  // Public list
  const pubTitle = document.createElement('h3'); pubTitle.innerText = 'Public Library';
  const pubList = document.createElement('div'); pubList.className = 'card';
  pane.appendChild(pubTitle); pane.appendChild(pubList);

  const rPub = await apiFetch('/api/public_library');
  if(rPub.ok){
    const files = rPub.data || [];
    if(files.length === 0) pubList.innerText = 'No public files yet';
    else files.forEach(f => {
      const row = document.createElement('div'); row.className = 'file-card';
      row.innerHTML = `<div>${f.name}</div><div><a href="${`/api/public_file/${encodeURIComponent(f.name)}`}" target="_blank" rel="noopener">View</a></div>`;
      pubList.appendChild(row);
    });
  }

  // Teacher upload for public lib
  if(role === 'teacher'){
    const upForm = document.createElement('form'); upForm.className = 'card';
    upForm.innerHTML = `<label>Upload public file</label><input type="file" id="uploadPublic"/><div style="margin-top:8px"><button class="btn primary">Upload</button></div>`;
    upForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = document.getElementById('uploadPublic').files[0];
      if(!f) return alert('Select a file');
      const fd = new FormData(); fd.append('file', f);
      const r = await fetch(`https://soundspace-5lgd.onrender.com/api/library/public`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${sessionStorage.getItem('mpt_token')}` }});
      if(!r.ok) alert('Upload failed'); else { alert('Uploaded'); loadLibrary(username, role, apiFetch); }
    });
    pane.appendChild(upForm);
  }

  // Private list (user-only)
  const privTitle = document.createElement('h3'); privTitle.innerText = 'Your Private Library';
  const privList = document.createElement('div'); privList.className = 'card';
  pane.appendChild(privTitle); pane.appendChild(privList);

  const rPriv = await apiFetch(`/api/private_library/${username}`);
  if(rPriv.ok){
    const files = rPriv.data || [];
    if(files.length === 0) privList.innerText = 'No private files';
    else files.forEach(f => {
      const row = document.createElement('div'); row.className = 'file-card';
      row.innerHTML = `<div>${f.name}</div><div><a href="${`/api/private_file/${encodeURIComponent(username)}/${encodeURIComponent(f.name)}`}" target="_blank" rel="noopener">View</a></div>`;
      privList.appendChild(row);
    });
  }

  // private upload (user-only)
  const privForm = document.createElement('form'); privForm.className = 'card';
  privForm.innerHTML = `<label>Upload to your private library</label><input type="file" id="uploadPrivate"/><div style="margin-top:8px"><button class="btn primary">Upload</button></div>`;
  privForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = document.getElementById('uploadPrivate').files[0];
    if(!f) return alert('Select a file');
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch(`https://soundspace-5lgd.onrender.com/api/library/private/${username}`, { method: 'POST', body: fd, headers: { 'Authorization': `Bearer ${sessionStorage.getItem('mpt_token')}` }});
    if(!r.ok) alert('Upload failed'); else { alert('Uploaded'); loadLibrary(username, role, apiFetch); }
  });
  pane.appendChild(privForm);
}