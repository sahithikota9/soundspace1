async function loadErrors(){
  const container = document.getElementById('errorsContainer');
  container.innerHTML = '';
  const username = sessionStorage.getItem('mpt_username');
  const res = await fetch(API + '/api/errors/' + username, { headers });
  const arr = await res.json();
  arr.forEach(item=>{
    const card = document.createElement('div'); card.className='card-day';
    card.innerHTML = `<div class="meta"><div class="date">${item.date}</div></div><div class="body">${item.text}</div>
      <div class="card-actions"><button class="btn ghost" onclick='editError("${item.date}")'>Edit</button><button class="btn ghost" onclick='deleteError("${item.date}")'>Delete</button></div>`;
    container.appendChild(card);
  });
}
window.editError = async (date) => {
  const username = sessionStorage.getItem('mpt_username');
  const txt = prompt('Edit error for ' + date);
  if (txt===null) return;
  await fetch(API + '/api/errors/' + username, { method:'POST', headers, body: JSON.stringify({ date, text: txt })});
  loadErrors();
}
window.deleteError = async (date) => {
  if (!confirm('Delete?')) return;
  const username = sessionStorage.getItem('mpt_username');
  await fetch(API + `/api/errors/${username}/${date}`, { method:'DELETE', headers });
  loadErrors();
}
document.getElementById('addErrorBtn')?.addEventListener('click', async ()=>{
  const username = sessionStorage.getItem('mpt_username');
  const date = new Date().toISOString().slice(0,10);
  const txt = prompt('Enter error for ' + date);
  if (!txt) return;
  await fetch(API + '/api/errors/' + username, { method:'POST', headers, body: JSON.stringify({ date, text: txt })});
  loadErrors();
});