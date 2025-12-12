async function loadLibrary(){
  document.getElementById('publicLibrary').innerHTML = 'Loading...';
  document.getElementById('privateLibrary').innerHTML = 'Loading...';
  const resPublic = await fetch(API + '/api/library/public', { headers });
  const pub = await resPublic.json();
  const pubEl = document.getElementById('publicLibrary'); pubEl.innerHTML='';
  pub.forEach(f=>{
    const div = document.createElement('div'); div.className='file-item';
    div.innerHTML = `<div><strong>${f.name}</strong><div class="muted small">${f.type}</div></div><div class="row"><a class="btn ghost" href="${f.url}" target="_blank">View</a>${f.uploader===sessionStorage.getItem('mpt_username')?`<button class="btn ghost" onclick="deletePublic(${f.id})">Delete</button>`:''}</div>`;
    pubEl.appendChild(div);
  });

  const username = sessionStorage.getItem('mpt_username');
  const resPriv = await fetch(API + '/api/library/private/' + username, { headers });
  const priv = await resPriv.json();
  const privEl = document.getElementById('privateLibrary'); privEl.innerHTML='';
  priv.forEach(f=>{
    const div = document.createElement('div'); div.className='file-item';
    div.innerHTML = `<div><strong>${f.name}</strong><div class="muted small">${f.type}</div></div><div class="row"><a class="btn ghost" href="${f.url}" target="_blank">View</a><button class="btn ghost" onclick="deletePrivate(${f.id})">Delete</button></div>`;
    privEl.appendChild(div);
  });

  const uploader = document.getElementById('libraryUploader');
  uploader.innerHTML = '';
  const nameIn = document.createElement('input'); nameIn.placeholder='File name (e.g. lesson.pdf)';
  const urlIn = document.createElement('input'); urlIn.placeholder='File URL (paste an external link)';
  const typeIn = document.createElement('input'); typeIn.placeholder='Type (pdf/mp3/mp4/img)';
  const upPriv = document.createElement('button'); upPriv.className='btn primary'; upPriv.innerText='Upload to Private (metadata)';
  uploader.appendChild(nameIn); uploader.appendChild(urlIn); uploader.appendChild(typeIn); uploader.appendChild(upPriv);
  upPriv.addEventListener('click', async ()=>{
    if (!nameIn.value||!urlIn.value) return alert('fill name+url');
    await fetch(API + '/api/library/private/' + username, { method:'POST', headers, body: JSON.stringify({ name:nameIn.value, url: urlIn.value, type:typeIn.value })});
    loadLibrary();
  });
  if (sessionStorage.getItem('mpt_role')==='teacher'){
    const upPub = document.createElement('button'); upPub.className='btn ghost'; upPub.innerText='Upload to Public (metadata)';
    uploader.appendChild(upPub);
    upPub.addEventListener('click', async ()=>{
      if (!nameIn.value||!urlIn.value) return alert('fill name+url');
      await fetch(API + '/api/library/public', { method:'POST', headers, body: JSON.stringify({ name:nameIn.value, url: urlIn.value, type:typeIn.value })});
      loadLibrary();
    })
  }
}
window.deletePublic = async (id)=>{ if(!confirm('Delete?')) return; await fetch(API+'/api/library/public/'+id,{ method:'DELETE', headers }); loadLibrary(); }
window.deletePrivate = async (id)=>{ if(!confirm('Delete?')) return; const username=sessionStorage.getItem('mpt_username'); await fetch(API+`/api/library/private/${username}/${id}`,{ method:'DELETE', headers }); loadLibrary(); }