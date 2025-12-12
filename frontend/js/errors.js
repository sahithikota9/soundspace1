// errors.js
export async function loadErrors(username, apiFetch){
  const pane = document.getElementById('errors');
  pane.innerHTML = '<h2>Errors</h2><p class="muted">Record mistakes/errors per day.</p>';
  const resp = await apiFetch(`/api/errors/${username}`);
  const saved = resp.ok ? resp.data : {};

  for(let d=1; d<=31; d++){
    const card = document.createElement('div'); card.className = 'card';
    const label = document.createElement('strong'); label.textContent = `Day ${d}`;
    const ta = document.createElement('textarea'); ta.style.width = '100%'; ta.style.minHeight = '64px';
    ta.value = saved && saved[d] ? saved[d] : '';
    ta.addEventListener('change', async (e) => {
      await apiFetch(`/api/errors/${username}`, { method: 'POST', body: JSON.stringify({ day: d, text: e.target.value }) });
    });
    card.appendChild(label); card.appendChild(document.createElement('br')); card.appendChild(ta);
    pane.appendChild(card);
  }
}