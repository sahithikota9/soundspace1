const tabButtons = document.querySelectorAll(".tab-btn");
const tabContent = document.getElementById("tab-content");

// Initialize tabs
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");

    if(tab === "practice"){
        loadPractice();
    } else if(tab === "errors"){
        loadErrors();
    } else if(tab === "notes"){
        loadNotes();
    } else {
        tabContent.innerHTML = `<p>${tab} tab content will appear here.</p>`;
    }
  });
});

// --- Practice tab ---
function loadPractice(){
    let html = '<h3>Practice Calendar</h3><table class="practice-calendar"><tr>';
    for(let i=1;i<=30;i++){
        html += `<td contenteditable="true" class="practice-cell" data-day="${i}">0</td>`;
        if(i%7===0) html += '</tr><tr>';
    }
    html += '</tr></table>';
    tabContent.innerHTML = html;
}

// --- Errors tab ---
function loadErrors(){
    let html = '<h3>Errors</h3>';
    for(let i=1;i<=30;i++){
        html += `<div class="card" contenteditable="true" data-day="${i}">Day ${i}: </div>`;
    }
    tabContent.innerHTML = html;
}

// --- Notes tab ---
function loadNotes(){
    let html = '<h3>Notes</h3>';
    for(let i=1;i<=30;i++){
        html += `<div class="card" contenteditable="true" data-day="${i}">Day ${i}: </div>`;
    }
    tabContent.innerHTML = html;
}