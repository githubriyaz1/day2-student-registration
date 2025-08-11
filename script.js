/* Interactive form + localStorage handling */
const form = document.getElementById('registrationForm');
const submissionsList = document.getElementById('submissionsList');
const toast = document.getElementById('toast');
const clearBtn = document.getElementById('clearBtn');

const STORAGE_KEY = 'day2_submissions_v1';

/* util: email check */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function loadSubs(){
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.warn('corrupt localStorage, resetting');
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveSubs(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* render list */
function render(){
  const subs = loadSubs();
  submissionsList.innerHTML = '';
  subs.slice().reverse().forEach((s, idx) => {
    // idx is reversed index; we'll store real index on dataset
    const el = document.createElement('article');
    el.className = 'sub-card';
    el.dataset.index = subs.length - 1 - idx;

    el.innerHTML = `
      <div class="sub-actions">
        <button class="icon-btn" title="Copy email" data-action="copy">📋</button>
        <button class="icon-btn" title="Delete" data-action="delete">🗑️</button>
      </div>
      <h3>${escapeHtml(s.name)}</h3>
      <div class="meta">${escapeHtml(s.department)} • ${escapeHtml(s.year)}</div>
      <div class="project">${escapeHtml(s.project)}</div>
      <div class="meta" style="margin-top:8px;color:var(--muted)">${escapeHtml(s.email)}</div>
    `;

    // action handlers
    el.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteSubmission(parseInt(el.dataset.index,10));
    });
    el.querySelector('[data-action="copy"]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(s.email);
        showToast('Email copied to clipboard');
      } catch(e) {
        showToast('Could not copy — your browser blocked it');
      }
    });

    submissionsList.appendChild(el);
  });
}

/* helper: escape HTML to avoid injection on local pages */
function escapeHtml(unsafe){
  return String(unsafe||'').replace(/[&<>"'`=/]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','/':'&#x2F;','=':'&#61;'
  })[c]);
}

/* delete by index */
function deleteSubmission(index){
  const arr = loadSubs();
  if(index >= 0 && index < arr.length){
    arr.splice(index,1);
    saveSubs(arr);
    render();
    showToast('Submission deleted');
  }
}

/* clear all */
clearBtn.addEventListener('click', () => {
  if(confirm('Clear all saved submissions from this browser? This cannot be undone.')){
    localStorage.removeItem(STORAGE_KEY);
    render();
    showToast('All cleared');
  }
});

/* toast */
let toastTimer = null;
function showToast(txt='Saved'){
  clearTimeout(toastTimer);
  toast.textContent = txt;
  toast.classList.add('show');
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 2500);
}

/* submit handler with validation */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const department = form.department.value || '';
  const year = form.year.value.trim();
  const project = form.project.value.trim();

  if(!name || !email || !department || !year || !project){
    return showToast('Please fill all fields');
  }
  if(!emailPattern.test(email)){
    return showToast('Enter a valid email');
  }

  // read existing, append
  const arr = loadSubs();
  arr.push({
    name, email, department, year, project, created: new Date().toISOString()
  });
  saveSubs(arr);

  // animation: brief reset + render
  form.reset();
  // trick to reset floating labels (inputs are :placeholder-shown logic) — not needed here because we use labels transform on :not(:placeholder-shown)
  render();
  showToast('Registration saved locally ✅');
});

/* initial render */
render();
