// practice.js
export async function loadPractice(username, apiFetch){
  const pane = document.getElementById('practice');
  pane.innerHTML = '<h2>Practice</h2><p class="muted">Enter hours practiced per day (0–24).</p>';

  const resp = await apiFetch(`/api/practice/${username}`);
  const saved = resp.ok ? resp.data : {};

  // calendar (1..31)
  const table = document.createElement('table'); table.className = 'calendar';
  let row = table.insertRow();
  for(let d=1; d<=31; d++){
    const cell = row.insertCell();
    const dayLabel = document.createElement('div'); dayLabel.innerHTML = `<strong>${d}</strong>`;
    const input = document.createElement('input');
    input.type = 'number'; input.min = 0; input.max = 24; input.className = 'practice-input';
    input.value = saved && saved[d] !== undefined ? saved[d] : 0;
    input.dataset.day = d;
    cell.appendChild(dayLabel);
    cell.appendChild(input);

    if(d % 7 === 0 && d < 31) row = table.insertRow();

    let t;
    input.addEventListener('input', ()=>{
      clearTimeout(t);
      t = setTimeout(async () => {
        const hours = Number(input.value) || 0;
        await apiFetch(`/api/practice/${username}`, { method: 'POST', body: JSON.stringify({ day: d, hours }) });
      }, 600);
    });
  }
  pane.appendChild(table);
}