const todoItemsContainer = document.getElementById('todoItemsContainer');
const addTodoButton = document.getElementById('addTodoButton');
const saveTodoButton = document.getElementById('saveTodoButton');
const inputEl = document.getElementById('todoUserInput');
const itemsLeft = document.getElementById('itemsLeft');
const clearCompleted = document.getElementById('clearCompleted');
const floatingWrap = document.getElementById('floatingWrap');
const clearBtn = document.getElementById('clearBtn');

const LOCAL_KEY = 'eye-feast-todos-refined';

function getTodoListFromLocalStorage(){ try{ const raw = localStorage.getItem(LOCAL_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed)? parsed:[]; }catch(e){return []} }

let todoList = getTodoListFromLocalStorage();
let nextId = todoList.reduce((m,t)=>Math.max(m,t.id||0),0)+1;
let currentFilter = 'all';

function save(){ localStorage.setItem(LOCAL_KEY, JSON.stringify(todoList)); }

function render(){ todoItemsContainer.innerHTML=''; const filtered = todoList.filter(t=>{ if(currentFilter==='all') return true; if(currentFilter==='active') return !t.isChecked; return t.isChecked; }); for(const t of filtered) createAndAppendTodo(t); updateCount(); }

function updateCount(){ const left = todoList.filter(t=>!t.isChecked).length; itemsLeft.textContent = left; }

function createAndAppendTodo(todo){
  const li = document.createElement('li'); li.className='todo-item'; li.dataset.id = todo.id;
  const cb = document.createElement('div'); cb.className = 'checkbox' + (todo.isChecked? ' checked':''); cb.setAttribute('role','checkbox'); cb.setAttribute('aria-checked', String(!!todo.isChecked)); cb.tabIndex = 0;
  const text = document.createElement('div'); text.className = 'todo-text' + (todo.isChecked? ' completed':''); text.textContent = todo.text; text.tabIndex = 0;
  const actions = document.createElement('div'); actions.className = 'actions';
  const del = document.createElement('button'); del.className='small-btn'; del.title='Delete'; del.textContent='🗑️';

  cb.addEventListener('click', ()=>toggleCheck(todo.id, cb, text, li));
  cb.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); toggleCheck(todo.id, cb, text, li); } });
  del.addEventListener('click', ()=>deleteTodo(todo.id, li));

  actions.append(del); li.append(cb, text, actions); todoItemsContainer.appendChild(li);
}

function toggleCheck(id, cbEl, textEl, listItem){ const idx = todoList.findIndex(t=>t.id===id); if(idx<0) return; todoList[idx].isChecked = !todoList[idx].isChecked; const now = todoList[idx].isChecked; cbEl.classList.toggle('checked'); if(now){ textEl.classList.add('completed'); celebrate(listItem); } else { textEl.classList.remove('completed'); } updateCount(); save(); }

function celebrate(listItem){ // small confetti + subtle bounce
  const rect = listItem.getBoundingClientRect(); const originX = rect.left + rect.width/2; const originY = rect.top + rect.height/2;
  const colors = ['#ffd166','#06d6a0','#118ab2','#ef476f','#b388ff'];
  for(let i=0;i<14;i++){ const piece = document.createElement('div'); piece.className='confetti-piece'; piece.style.background = colors[Math.floor(Math.random()*colors.length)]; const w = 4 + Math.random()*10; piece.style.width = w + 'px'; piece.style.height = Math.max(3, Math.round(w*0.55)) + 'px'; document.body.appendChild(piece); piece.style.left = originX + 'px'; piece.style.top = originY + 'px'; const dx = (Math.random()-0.5)*300; const dy = - (80 + Math.random()*260); const rot = (Math.random()-0.5)*720; piece.animate([{transform:`translate(0px,0px) rotate(0deg) scale(1)`, opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(.6)`, opacity:0}],{duration:800+Math.random()*900,easing:'cubic-bezier(.2,.9,.3,1)'}).onfinish = ()=> piece.remove(); }
  // small bounce on the item
  listItem.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.9,.3,1)'});
}

function deleteTodo(id, listItem){ const idx = todoList.findIndex(t=>t.id===id); if(idx>-1) todoList.splice(idx,1); save(); render(); }

function onAddTodo(){ const val = inputEl.value.trim(); if(!val){ inputEl.classList.add('shake'); setTimeout(()=>inputEl.classList.remove('shake'),300); return; } const todo = {id: nextId++, text: val, isChecked:false}; todoList.unshift(todo); inputEl.value=''; save(); render(); inputEl.focus(); }

addTodoButton.addEventListener('click', onAddTodo); inputEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ onAddTodo(); } }); saveTodoButton.addEventListener('click', save); clearCompleted.addEventListener('click', ()=>{ todoList = todoList.filter(t=>!t.isChecked); save(); render(); });

// Floating label interactions & subtle placeholder
function updateFloating(){ if(inputEl.value.trim() !== ''){ floatingWrap.classList.add('has-value'); } else { floatingWrap.classList.remove('has-value'); } }
inputEl.addEventListener('input', ()=>{ updateFloating(); const q = inputEl.value.trim().toLowerCase(); if(q===''){ render(); return; } const filtered = todoList.filter(t=> t.text.toLowerCase().includes(q)); todoItemsContainer.innerHTML=''; for(const t of filtered) createAndAppendTodo(t); });
inputEl.addEventListener('focus', ()=>floatingWrap.classList.add('focused')); inputEl.addEventListener('blur', ()=>floatingWrap.classList.remove('focused'));

// clear button behavior
clearBtn.addEventListener('click', ()=>{ inputEl.value=''; updateFloating(); render(); inputEl.focus(); });

// initial render
render(); updateFloating();

// dynamic buttons: ripple & actions
document.querySelectorAll('.dynamic-btn').forEach(btn=>{
  btn.addEventListener('click', function(e){
    // ripple
    const circle = document.createElement('span'); circle.className = 'ripple';
    const d = Math.max(btn.clientWidth, btn.clientHeight) * 1.2;
    circle.style.width = circle.style.height = d + 'px';
    const rect = btn.getBoundingClientRect();
    circle.style.left = (e.clientX - rect.left - d/2) + 'px';
    circle.style.top = (e.clientY - rect.top - d/2) + 'px';
    btn.appendChild(circle);
    circle.animate([{transform:'scale(0)',opacity:0.9},{transform:'scale(1)',opacity:0}],{duration:600}).onfinish = ()=> circle.remove();

    // specific actions
    if(btn.id === 'saveTodoButton'){
      btn.animate([{transform:'scale(1)'},{transform:'scale(0.96)'},{transform:'scale(1)'}],{duration:260});
      // small feedback text (temporary)
      const original = btn.querySelector('.label');
      const prev = original.textContent;
      original.textContent = 'Saved!';
      setTimeout(()=> original.textContent = prev,800);
    }
    if(btn.id === 'clearCompleted'){
      btn.animate([{transform:'scale(1)'},{transform:'scale(0.96)'},{transform:'scale(1)'}],{duration:260});
      setTimeout(()=>{ todoList = todoList.filter(t=>!t.isChecked); save(); render(); },160);
    }
  });
});
