async function loadPractice(){
  const container = document.getElementById('tab-practice');
  container.innerHTML = '';
  const username = sessionStorage.getItem('mpt_username');
  const now = new Date(); const year = now.getFullYear(); const mon = now.getMonth();
  const first = new Date(year, mon,1); const start = first.getDay(); const days = new Date(year,mon+1,0).getDate();
  const grid = document.createElement('div'); grid.className='calendar';
  for (let i=0;i<start;i++){ const e=document.createElement('div'); e.className='day'; grid.appendChild(e); }
  for (let d=1; d<=days; d++){
    const dt = new Date(year,mon,d); const iso = dt.toISOString().slice(0,10);
    const day = document.createElement('div'); day.className='day clickable';
    day.innerHTML = `<div class="date">${d} ${dt.toLocaleString(undefined,{month:'short'})}</div><div class="hours mono" id="h-${iso}">—</div>`;
    day.addEventListener('click', async ()=> {
      const val = prompt('Hours practiced (e.g. 1.5). Leave blank to delete:');
      if (val === null) return;
      if (val.trim()===''){
        await fetch(API+`/api/practice/${username}/${iso}`,{ method:'DELETE', headers });
        document.getElementById('h-'+iso).innerText='—'; return;
      }
      const hrs = parseFloat(val);
      if (isNaN(hrs)) return alert('Enter number');
      await fetch(API+`/api/practice/${username}`, { method:'POST', headers, body: JSON.stringify({ date:iso, hours:hrs })});
      document.getElementById('h-'+iso).innerText = `${hrs} hrs`;
    });
    grid.appendChild(day);
  }
  container.appendChild(grid);
  const res = await fetch(API + '/api/practice/' + username, { headers });
  if (res.ok){
    const arr = await res.json();
    arr.forEach(e=>{ const el = document.getElementById('h-'+e.date); if (el) el.innerText = `${e.hours} hrs`; });
  }
}