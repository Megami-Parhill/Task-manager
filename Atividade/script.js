// ChessTasks script (uses localStorage)
// Simple mobile-like web app with white & gold chess theme
(() => {
  const defaultUser = {email:'user@exemplo', pass:'senha123'};
  const pieceMap = {
    'Priority': '♔',   // King
    'Secondary': '♕', // Queen
    'Minor': '♗',     // Bishop
    'World': '♘'      // Knight
  };
  const classList = Object.keys(pieceMap);
  const KEY = { USER:'cht_user', TASKS:'cht_tasks' };
  const el = id => document.getElementById(id);
  const qsa = s => Array.from(document.querySelectorAll(s));

  function genId(){ return 't'+Math.random().toString(36).slice(2,9) }

  function seedTasks(){
    if(!localStorage.getItem(KEY.TASKS)){
      const sample = [
        {id:genId(), title:'Task 1', cls:'Priority', desc:'Derrotar o monstro na Ilha Norte', done:false, deadline:null, created:Date.now()},
        {id:genId(), title:'Task 2', cls:'Secondary', desc:'Coletar ervas', done:true, deadline:null, created:Date.now()},
        {id:genId(), title:'Task 3', cls:'Minor', desc:'Visitar o ferreiro', done:false, deadline:null, created:Date.now()},
      ];
      localStorage.setItem(KEY.TASKS, JSON.stringify(sample));
    }
  }
  function loadTasks(){ return JSON.parse(localStorage.getItem(KEY.TASKS) || '[]'); }
  function saveTasks(tasks){ localStorage.setItem(KEY.TASKS, JSON.stringify(tasks)); }

  const views = {
    login: el('view-login'),
    main: el('view-main'),
    details: el('view-details'),
    prod: el('view-prod')
  };
  function showView(name){
    Object.values(views).forEach(v=>v.style.display='none');
    if(name==='login') views.login.style.display='';
    else if(name==='main') views.main.style.display='';
    else if(name==='details') views.details.style.display='';
    else if(name==='prod') views.prod.style.display='';
    if(name==='main') renderTaskList();
    if(name==='details') populateDetails();
    if(name==='prod') drawCharts();
  }

  // initial
  seedTasks();
  if(localStorage.getItem(KEY.USER)) showView('main');
  else showView('login');

  // Login
  el('loginBtn').addEventListener('click', ()=>{
    const em = el('email').value.trim();
    const pw = el('password').value;
    if(em === defaultUser.email && pw === defaultUser.pass){
      localStorage.setItem(KEY.USER, em);
      showView('main');
    } else {
      alert('Credenciais incorretas. Usuário de teste: user@exemplo / senha123');
    }
  });
  el('logoutBtn').addEventListener('click', ()=> {
    localStorage.removeItem(KEY.USER);
    showView('login');
  });

  // Tabs
  const tabsWrap = document.getElementById('classTabs');
  let activeClass = 'Priority';
  function renderTabs(){
    tabsWrap.innerHTML = '';
    classList.forEach(c=>{
      const d = document.createElement('div');
      d.className = 'tab ' + (c===activeClass ? 'active':'');
      d.textContent = c;
      d.addEventListener('click', ()=> { activeClass=c; renderTabs(); renderTaskList(); });
      tabsWrap.appendChild(d);
    });
  }
  renderTabs();

  // Task list
  const taskListEl = el('taskList');
  function renderTaskList(){
    const tasks = loadTasks();
    taskListEl.innerHTML = '';
    const filtered = tasks.filter(t => t.cls === activeClass);
    if(filtered.length === 0){
      taskListEl.innerHTML = '<div style="padding:18px;color:var(--muted)">Nenhuma tarefa nesta classe. Crie uma nova!</div>';
      return;
    }
    filtered.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `
        <div class="piece" aria-hidden>${pieceMap[t.cls] || '♟'}</div>
        <div class="task-content">
          <div class="task-title">${escapeHtml(t.title)} ${t.deadline ? '<span class="muted" style="font-weight:400;margin-left:8px;font-size:13px">• '+escapeHtml(t.deadline)+'</span>' : ''}</div>
          <div class="task-meta">${t.desc ? escapeHtml(t.desc) : '<span class="muted">sem descrição</span>'}</div>
        </div>
        <div class="task-actions">
          <label><input type="checkbox" data-id="${t.id}" ${t.done ? 'checked':''}> OK</label>
          <button class="small" data-edit="${t.id}">Editar</button>
        </div>
      `;
      li.querySelector('input[type="checkbox"]').addEventListener('change', (ev)=>{
        const tasks = loadTasks();
        const item = tasks.find(x=>x.id===t.id);
        if(item){ item.done = ev.target.checked; saveTasks(tasks); renderTaskList(); }
      });
      li.querySelector('[data-edit]').addEventListener('click', ()=> openEditModal(t.id));
      taskListEl.appendChild(li);
    });
  }

  // Modals
  const modalWrap = el('modalWrap');
  el('addTaskBtn').addEventListener('click', openCreateModal);

  function openCreateModal(){
    openModal({
      title:'Criar tarefa',
      content: modalFormHtml(),
      onOpen: ()=> {
        populateModalClasses();
        el('modalSave').onclick = () => {
          const t = { id: genId(), title: el('mTitle').value.trim() || 'Untitled', cls: el('mClass').value, desc: el('mDesc').value, done:false, deadline: el('mDeadline').value || null, created:Date.now() };
          const tasks = loadTasks(); tasks.push(t); saveTasks(tasks);
          closeModal(); renderTaskList(); drawCharts();
        };
        el('modalCancel').onclick = closeModal;
      }
    });
  }

  function openEditModal(id){
    const tasks = loadTasks();
    const t = tasks.find(x=>x.id===id);
    if(!t) return;
    openModal({
      title:'Editar tarefa',
      content: modalFormHtml(),
      onOpen: ()=> {
        populateModalClasses(t.cls);
        el('mTitle').value = t.title;
        el('mDesc').value = t.desc;
        el('mDeadline').value = t.deadline || '';
        el('modalSave').textContent = 'Salvar';
        el('modalSave').onclick = () => {
          t.title = el('mTitle').value.trim() || t.title;
          t.desc = el('mDesc').value;
          t.cls = el('mClass').value;
          t.deadline = el('mDeadline').value || null;
          saveTasks(tasks);
          closeModal(); renderTaskList(); drawCharts();
        };
        el('modalCancel').onclick = closeModal;
      }
    });
  }

  function modalFormHtml(){
    return `
      <div style="display:flex;flex-direction:column;gap:8px">
        <label>Class</label>
        <select id="mClass">${classList.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
        <label>Title</label>
        <input id="mTitle" type="text" placeholder="Add title"/>
        <label>Description</label>
        <textarea id="mDesc" placeholder="Add description"></textarea>
        <label>Deadline</label>
        <input id="mDeadline" type="text" placeholder="Add deadline"/>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
          <button class="btn ghost" id="modalCancel">Cancel</button>
          <button class="btn" id="modalSave">Save</button>
        </div>
      </div>
    `;
  }

  function populateModalClasses(selected){
    const select = el('mClass');
    if(!select) return;
    select.innerHTML = classList.map(c=>`<option value="${c}" ${c===selected ? 'selected':''}>${pieceMap[c] || ''} ${c}</option>`).join('');
  }

  function openModal({title,content,onOpen}){
    modalWrap.innerHTML = `
      <div class="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <h3 style="margin-top:0;color:var(--gold)">${title}</h3>
          <div>${content}</div>
        </div>
      </div>
    `;
    modalWrap.style.display = '';
    if(onOpen) setTimeout(onOpen,20);
  }
  function closeModal(){ modalWrap.innerHTML=''; modalWrap.style.display='none'; }

  // Details
  function populateDetails(){
    const select = el('detailSelect'); select.innerHTML='';
    const tasks = loadTasks();
    tasks.forEach(t => {
      const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.title;
      select.appendChild(opt);
    });
    const radios = el('detailClassRadios');
    radios.innerHTML = classList.map(c => `<div><label><input type="radio" name="detailClass" value="${c}"> ${pieceMap[c]||''} ${c}</label></div>`).join('');
    if(tasks.length) fillDetailForm(tasks[0].id);
    select.onchange = e => fillDetailForm(e.target.value);
    el('saveDetailBtn').onclick = saveDetail;
    el('deleteBtn').onclick = () => {
      if(confirm('Excluir tarefa?')) {
        const id = el('detailSelect').value;
        let tasks = loadTasks(); tasks = tasks.filter(t=>t.id!==id); saveTasks(tasks);
        populateDetails(); renderTaskList(); drawCharts();
      }
    };
  }

  function fillDetailForm(id){
    const tasks = loadTasks(); const t = tasks.find(x=>x.id===id); if(!t) return;
    el('detailComplete').checked = !!t.done;
    el('detailDesc').value = t.desc || '';
    const radios = document.getElementsByName('detailClass');
    radios.forEach(r => r.checked = (r.value === t.cls));
  }
  function saveDetail(){
    const id = el('detailSelect').value;
    const tasks = loadTasks();
    const t = tasks.find(x=>x.id===id);
    if(!t) return;
    t.done = el('detailComplete').checked;
    t.desc = el('detailDesc').value;
    const cls = Array.from(document.getElementsByName('detailClass')).find(r=>r.checked);
    if(cls) t.cls = cls.value;
    saveTasks(tasks);
    populateDetails(); renderTaskList(); drawCharts();
    alert('Detalhes salvos');
  }

  // Charts
  function drawCharts(){
    const tasks = loadTasks();
    const completed = tasks.filter(t=>t.done).length;
    const pending = tasks.length - completed;
    drawPie('pieChart', ['Concluído','Pendente'], [completed, pending]);
    const counts = classList.map(c => tasks.filter(t=>t.cls===c).length);
    drawBar('barChart', classList, counts);
  }

  function drawPie(id, labels, values){
    const c = el(id); if(!c) return;
    const ctx = c.getContext('2d'); const w=c.width, h=c.height, cx=w/2, cy=h/2, r=Math.min(w,h)/3;
    ctx.clearRect(0,0,w,h);
    const total = values.reduce((a,b)=>a+b,0) || 1;
    let angle = -Math.PI/2;
    const colors = ['#b8860b','#e0b14a','#f3e6c2','#c8b7ff'];
    for(let i=0;i<values.length;i++){
      const slice = values[i]/total * Math.PI*2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,angle,angle+slice); ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      angle += slice;
    }
    ctx.font = '12px sans-serif'; ctx.fillStyle='#333';
    let lx = 10, ly = 12;
    labels.forEach((lab,i)=> ctx.fillText(lab + ' ('+values[i]+')', lx, ly + i*16));
  }

  function drawBar(id, labels, values){
    const c = el(id); if(!c) return;
    const ctx = c.getContext('2d'); const w=c.width, h=c.height; ctx.clearRect(0,0,w,h);
    const margin = 20; const gw = w - margin*2; const gh = h - margin*2; const max = Math.max(...values,1);
    const barW = gw / values.length * 0.6;
    labels.forEach((lab,i)=>{
      const x = margin + i*(gw/values.length) + (gw/values.length - barW)/2;
      const barH = (values[i]/max) * (gh - 30);
      ctx.fillStyle = '#c88b2a'; ctx.fillRect(x, margin + (gh - barH), barW, barH);
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#333'; ctx.fillText(lab, x, h - 6);
      ctx.fillText(values[i], x, margin + (gh - barH) - 6);
    });
  }

  // helpers
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) }

  // init draw
  renderTaskList();
  drawCharts();

  // nav buttons
  qsa('[data-nav]').forEach(b => b.addEventListener('click', e=> {
    const nav = b.dataset.nav;
    if(nav === 'main') showView('main');
    if(nav === 'details') showView('details');
    if(nav === 'prod') showView('prod');
  }));

  // menu quick nav
  el('menuBtn').addEventListener('click', ()=> {
    const opt = prompt('Ir para: (1) Tarefas, (2) Detalhes, (3) Produtividade', '1');
    if(!opt) return;
    if(opt.startsWith('1')) showView('main');
    if(opt.startsWith('2')) showView('details');
    if(opt.startsWith('3')) showView('prod');
  });

})();
