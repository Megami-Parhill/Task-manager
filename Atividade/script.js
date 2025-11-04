// ChessTasks script (uses localStorage)
// Mobile task manager app with chess theme
(() => {
  'use strict';
  
  // Constants
  const pieceMap = {
    'Prioridade': '♔',   // King
    'Secundária': '♕', // Queen
    'Menor': '♗',     // Bishop
    'Mundo': '♘'      // Knight
  };
  const classList = Object.keys(pieceMap);
  const KEY = { 
    USER: 'cht_user', 
    TASKS: 'cht_tasks', 
    THEME: 'cht_theme', 
    ACCENT: 'cht_accent' 
  };
  
  // Helper functions
  const el = id => document.getElementById(id);
  const qsa = s => Array.from(document.querySelectorAll(s));
  
  // Auth functions
  function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    // Valida formato básico de email (tem @ e domínio)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
  
  function login(email, password) {
    if (!email || !password) return false;
    const emailTrimmed = email.trim().toLowerCase();
    // Aceita qualquer email válido com qualquer senha
    if (isValidEmail(emailTrimmed)) {
      localStorage.setItem(KEY.USER, emailTrimmed);
      return true;
    }
    return false;
  }
  
  function isLoggedIn() {
    return !!localStorage.getItem(KEY.USER);
  }
  
  function logout() {
    localStorage.removeItem(KEY.USER);
  }

  function genId(){ return 't'+Math.random().toString(36).slice(2,9) }

  function seedTasks(){
    if(!localStorage.getItem(KEY.TASKS)){
      const sample = [
        {id:genId(), title:'Tarefa 1', cls:'Prioridade', desc:'Derrotar o monstro na Ilha Norte', done:false, deadline:null, created:Date.now()},
        {id:genId(), title:'Tarefa 2', cls:'Secundária', desc:'Coletar ervas', done:true, deadline:null, created:Date.now()},
        {id:genId(), title:'Tarefa 3', cls:'Menor', desc:'Visitar o ferreiro', done:false, deadline:null, created:Date.now()},
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
    toggleFab(name);
    if(name !== 'login') {
      updateActiveNav(name);
      closeSidebar();
    }
  }

  // Theme management
  function initTheme(){
    const savedTheme = localStorage.getItem(KEY.THEME) || 'light';
    const savedAccent = localStorage.getItem(KEY.ACCENT) || 'gold';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-accent', savedAccent);
    // Set checkbox after DOM is ready
    setTimeout(() => {
      if(el('darkModeToggle')) el('darkModeToggle').checked = savedTheme === 'dark';
      updateColorPalette(savedAccent);
    }, 100);
  }
  
  function updateColorPalette(color){
    qsa('.color-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === color);
    });
  }
  
  // Sidebar management
  function openSidebar(){
    el('sidebar').classList.add('active');
    el('sidebarOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeSidebar(){
    el('sidebar').classList.remove('active');
    el('sidebarOverlay').classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function updateActiveNav(view){
    qsa('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === view);
    });
  }

  // Initialize login handlers
  function initLogin() {
    const loginBtn = el('loginBtn');
    const emailInput = el('email');
    const passwordInput = el('password');
    
    if (!loginBtn || !emailInput || !passwordInput) {
      console.error('Login elements not found');
      return;
    }
    
    const handleLogin = () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      if (!email || !password) {
        alert('♟ Por favor, preencha email e senha');
        return;
      }
      
      if (login(email, password)) {
        showView('main');
        emailInput.value = '';
        passwordInput.value = '';
      } else {
        alert('♟ Email inválido.\n\nPor favor, insira um email válido com qualquer senha.');
      }
    };
    
    loginBtn.addEventListener('click', handleLogin);
    
    // Allow login with Enter key
    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogin();
        }
      });
    });
  }
  // Initialize sidebar
  function initSidebar() {
    const menuBtn = el('menuBtn');
    const sidebarClose = el('sidebarClose');
    const sidebarOverlay = el('sidebarOverlay');
    
    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Sidebar navigation
    qsa('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const nav = item.dataset.nav;
        if (nav === 'main') showView('main');
        if (nav === 'details') showView('details');
        if (nav === 'prod') showView('prod');
      });
    });
  }
  
  // Initialize theme controls
  function initThemeControls() {
    const darkModeToggle = el('darkModeToggle');
    
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(KEY.THEME, theme);
      });
    }
    
    qsa('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        document.documentElement.setAttribute('data-accent', color);
        localStorage.setItem(KEY.ACCENT, color);
        updateColorPalette(color);
      });
    });
  }
  
  // Initialize logout handlers
  function initLogout() {
    const logoutBtn = el('logoutBtn');
    const sidebarLogoutBtn = el('sidebarLogoutBtn');
    
    const handleLogout = () => {
      logout();
      showView('login');
      closeSidebar();
    };
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener('click', handleLogout);
    }
  }

  // Tabs
  const tabsWrap = el('classTabs');
  let activeClass = 'Prioridade';
  function renderTabs(){
    if (!tabsWrap) return;
    tabsWrap.innerHTML = '';
    classList.forEach(c=>{
      const d = document.createElement('div');
      d.className = 'tab ' + (c===activeClass ? 'active':'');
      d.innerHTML = `<span style="margin-right:4px">${pieceMap[c] || ''}</span>${c}`;
      d.addEventListener('click', ()=> { 
        activeClass=c; 
        renderTabs(); 
        renderTaskList(); 
      });
      tabsWrap.appendChild(d);
    });
  }

  // Task list
  const taskListEl = el('taskList');
  function renderTaskList(){
    const tasks = loadTasks();
    taskListEl.innerHTML = '';
    const filtered = tasks.filter(t => t.cls === activeClass);
    if(filtered.length === 0){
      taskListEl.innerHTML = `<div style="padding:18px;color:var(--muted);text-align:center">
        <div style="font-size:32px;margin-bottom:8px">♟</div>
        <div>Nenhuma tarefa nesta classe. Crie uma nova!</div>
      </div>`;
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
          <label><input type="checkbox" data-id="${t.id}" ${t.done ? 'checked':''}> Concluída</label>
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

  function openCreateModal(){
    openModal({
      title:'Criar tarefa',
      content: modalFormHtml(),
      onOpen: ()=> {
        populateModalClasses();
        el('modalSave').onclick = () => {
          const t = { id: genId(), title: el('mTitle').value.trim() || 'Sem título', cls: el('mClass').value, desc: el('mDesc').value, done:false, deadline: el('mDeadline').value || null, created:Date.now() };
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
        <label>♟ Classe</label>
        <select id="mClass">${classList.map(c=>`<option value="${c}">${pieceMap[c] || ''} ${c}</option>`).join('')}</select>
        <label>♔ Título</label>
        <input id="mTitle" type="text" placeholder="Adicione o título da tarefa"/>
        <label>♕ Descrição</label>
        <textarea id="mDesc" placeholder="Adicione uma descrição"></textarea>
        <label>♗ Prazo</label>
        <input id="mDeadline" type="text" placeholder="Ex: Hoje, Amanhã, 15/12/2024"/>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px">
          <button class="btn ghost" id="modalCancel">Cancelar</button>
          <button class="btn" id="modalSave">Salvar</button>
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
          <h3 style="margin-top:0;color:var(--gold)">♟ ${title}</h3>
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
      const opt = document.createElement('option'); 
      opt.value = t.id; 
      opt.textContent = `${pieceMap[t.cls] || '♟'} ${t.title}`;
      select.appendChild(opt);
    });
    const radios = el('detailClassRadios');
    radios.innerHTML = classList.map(c => `<div><label><input type="radio" name="detailClass" value="${c}"> <span style="font-size:18px;margin-right:6px">${pieceMap[c]||''}</span> ${c}</label></div>`).join('');
    if(tasks.length) fillDetailForm(tasks[0].id);
    select.onchange = e => fillDetailForm(e.target.value);
    el('saveDetailBtn').onclick = saveDetail;
    el('deleteBtn').onclick = () => {
      if(confirm('♟ Excluir tarefa?')) {
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
    alert('♟ Detalhes salvos!');
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

  // Helper functions
  function escapeHtml(s){ 
    return (s||'').toString().replace(/[&<>"']/g, m=> ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[m])); 
  }

  // FAB (Floating Action Button) handlers
  const fabMain = el('fabAddTask');
  const fabGlobal = el('fabAddTaskGlobal');
  
  function setupFab(){
    if(fabMain) fabMain.addEventListener('click', openCreateModal);
    if(fabGlobal) fabGlobal.addEventListener('click', openCreateModal);
  }
  
  function toggleFab(viewName){
    if(viewName === 'main'){
      if(fabMain) fabMain.style.display = 'flex';
      if(fabGlobal) fabGlobal.style.display = 'none';
    } else if(viewName !== 'login'){
      if(fabMain) fabMain.style.display = 'none';
      if(fabGlobal) fabGlobal.style.display = 'flex';
    } else {
      if(fabMain) fabMain.style.display = 'none';
      if(fabGlobal) fabGlobal.style.display = 'none';
    }
  }
  
  // Main initialization
  function init() {
    // Initialize data
    seedTasks();
    initTheme();
    
    // Initialize UI components
    initLogin();
    initSidebar();
    initThemeControls();
    initLogout();
    setupFab();
    renderTabs();
    
    // Initialize views
    if (isLoggedIn()) {
      showView('main');
      renderTaskList();
      drawCharts();
    } else {
      showView('login');
    }
  }
  
  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
