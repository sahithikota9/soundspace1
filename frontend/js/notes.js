async function loadNotes(){
  const container = document.getElementById('notesContainer');
  container.innerHTML = '';
  const username = sessionStorage.getItem('mpt_username');
  const res = await fetch(API + '/api/notes/' + username, { headers });
  const arr = await res.json();
  arr.forEach(item=>{
    const card = document.createElement('div'); card.className='card-day';
    card.innerHTML = `<div class="meta"><div class="date">${item.date}</div></div><div class="body">${item.text}</div>
      <div class="card-actions"><button class="btn ghost" onclick='editNote("${item.date}")'>Edit</button><button class="btn ghost" onclick='deleteNote("${item.date}")'>Delete</button></div>`;
    container.appendChild(card);
  });
}
window.editNote = async (date) => {
  const username = sessionStorage.getItem('mpt_username');
  const txt = prompt('Edit note for ' + date);
  if (txt===null) return;
  await fetch(API + '/api/notes/' + username, { method:'POST', headers, body: JSON.stringify({ date, text: txt })});
  loadNotes();
}
window.deleteNote = async (date) => {
  if (!confirm('Delete?')) return;
  const username = sessionStorage.getItem('mpt_username');
  await fetch(API + `/api/notes/${username}/${date}`, { method:'DELETE', headers });
  loadNotes();
}
document.getElementById('addNoteBtn')?.addEventListener('click', async ()=>{
  const username = sessionStorage.getItem('mpt_username');
  const date = new Date().toISOString().slice(0,10);
  const txt = prompt('Enter note for ' + date);
  if (!txt) return;
  await fetch(API + '/api/notes/' + username, { method:'POST', headers, body: JSON.stringify({ date, text: txt })});
  loadNotes();
});