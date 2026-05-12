// ===== 登录系统 =====
const LOGIN_KEY = 'materialLogin';

function getUsers() {
  const raw = localStorage.getItem('materialUsers');
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  // 默认用户
  const defaultUsers = [
    { username: 'admin', password: '123456', name: '系统管理员' },
    { username: 'user', password: '123456', name: '操作员' }
  ];
  localStorage.setItem('materialUsers', JSON.stringify(defaultUsers));
  return defaultUsers;
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const remember = document.getElementById('loginRemember').checked;
  const errorEl = document.getElementById('loginError');

  if (!username || !password) {
    errorEl.textContent = '请输入用户名和密码';
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    errorEl.textContent = '';
    // 保存登录状态
    const loginData = { username: user.username, name: user.name, time: Date.now() };
    if (remember) {
      localStorage.setItem(LOGIN_KEY, JSON.stringify(loginData));
    } else {
      sessionStorage.setItem(LOGIN_KEY, JSON.stringify(loginData));
    }
    // 更新侧边栏用户名
    document.getElementById('sidebarUserName').textContent = user.name;
    // 显示主系统
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appLayout').style.display = 'block';
    // 初始化系统
    init();
    showToast('欢迎回来，' + user.name + '！', 'success');
  } else {
    errorEl.textContent = '用户名或密码错误，请重试';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function handleLogout() {
  // 使用自定义确认弹窗
  showConfirmDialog(
    '🚪 退出登录',
    '确定要退出当前账号吗？',
    function() {
      localStorage.removeItem(LOGIN_KEY);
      sessionStorage.removeItem(LOGIN_KEY);
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('appLayout').style.display = 'none';
      document.getElementById('loginPass').value = '';
      document.getElementById('loginError').textContent = '';
      showToast('已安全退出登录', 'info');
    }
  );
}

// ===== 注册功能 =====
function showRegister() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = 'block';
  document.getElementById('forgotBox').style.display = 'none';
  document.getElementById('registerError').textContent = '';
}

function showLogin() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('registerBox').style.display = 'none';
  document.getElementById('forgotBox').style.display = 'none';
  document.getElementById('loginError').textContent = '';
}

function showForgotPassword() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = 'none';
  document.getElementById('forgotBox').style.display = 'block';
  document.getElementById('forgotError').textContent = '';
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUser').value.trim();
  const name = document.getElementById('regName').value.trim();
  const password = document.getElementById('regPass').value;
  const confirm = document.getElementById('regPassConfirm').value;
  const errorEl = document.getElementById('registerError');

  if (!username || !name || !password) {
    errorEl.textContent = '请填写所有字段';
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errorEl.textContent = '用户名只能包含字母、数字和下划线';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = '密码长度至少6位';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = '两次输入的密码不一致';
    return;
  }

  const users = getUsers();
  if (users.some(u => u.username === username)) {
    errorEl.textContent = '用户名已存在，请换一个';
    return;
  }

  users.push({ username, password, name });
  localStorage.setItem('materialUsers', JSON.stringify(users));
  errorEl.textContent = '';
  showToast('🎉 注册成功！请登录', 'success');
  // 自动填充登录框
  document.getElementById('loginUser').value = username;
  document.getElementById('loginPass').value = '';
  showLogin();
}

function handleForgotPassword(e) {
  e.preventDefault();
  const username = document.getElementById('forgotUser').value.trim();
  const password = document.getElementById('forgotPass').value;
  const confirm = document.getElementById('forgotPassConfirm').value;
  const errorEl = document.getElementById('forgotError');

  if (!username || !password) {
    errorEl.textContent = '请填写所有字段';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = '密码长度至少6位';
    return;
  }
  if (password !== confirm) {
    errorEl.textContent = '两次输入的密码不一致';
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    errorEl.textContent = '该用户名不存在';
    return;
  }

  user.password = password;
  localStorage.setItem('materialUsers', JSON.stringify(users));
  errorEl.textContent = '';
  showToast('🔑 密码已重置，请登录', 'success');
  document.getElementById('loginUser').value = username;
  document.getElementById('loginPass').value = password;
  showLogin();
}

// ===== 自定义确认弹窗 =====
function showConfirmDialog(title, message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-icon">${title}</div>
      <div class="confirm-title">${title.replace(/^.{1,2}\s/, '')}</div>
      <div class="confirm-msg">${message}</div>
      <div class="confirm-actions">
        <button class="confirm-btn cancel" id="confirmCancel">取消</button>
        <button class="confirm-btn ok" id="confirmOk">确定</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  document.getElementById('confirmCancel').onclick = function() {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 200);
  };
  document.getElementById('confirmOk').onclick = function() {
    overlay.classList.remove('show');
    setTimeout(() => { overlay.remove(); onConfirm(); }, 200);
  };
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 200);
    }
  };
}

function checkLogin() {
  // 先检查 localStorage（记住密码），再检查 sessionStorage
  let loginData = localStorage.getItem(LOGIN_KEY);
  if (!loginData) loginData = sessionStorage.getItem(LOGIN_KEY);
  if (loginData) {
    try {
      const data = JSON.parse(loginData);
      const users = getUsers();
      const user = users.find(u => u.username === data.username);
      if (user) {
        document.getElementById('sidebarUserName').textContent = user.name;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appLayout').style.display = 'block';
        init();
        return true;
      }
    } catch(e) {}
  }
  // 未登录，显示登录界面
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appLayout').style.display = 'none';
  return false;
}

// ===== 数据层 =====
const DB_KEY = 'materialDB';
let db = loadDB();

function loadDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  return { materials: [], transactions: [], scraps: [], nextId: 1 };
}

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function genId() { return db.nextId++; }

function now() {
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function today() {
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// ===== 导航 =====
function switchNav(el, section) {
  document.querySelectorAll('.sidebar .nav-item, .mobile-bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('section-' + section).classList.add('active');
  const titles = {
    home: ['高铁智能制造与数字化设计产教融合', '动车段物料全生命周期跟踪管理系统 · 实时监控物料流转'],
    category: ['分类管理', '按物料分类查看和管理所有物料'],
    inventory: ['库存管理', '查看和管理所有物料库存信息'],
    inbound: ['物料入库', '登记物料入库操作'],
    outbound: ['物料出库', '登记物料出库操作'],
    tracking: ['物料追踪', '追踪物料全生命周期流转记录'],
    scrap: ['物料报废', '管理已报废的物料'],
    io: ['数据导入导出', '导入导出物料数据']
  };
  const t = titles[section] || ['',''];
  document.getElementById('pageTitle').textContent = t[0];
  document.getElementById('pageSubtitle').textContent = t[1];
  if (section === 'home') updateStats();
  else if (section === 'category') renderCategory();
  else if (section === 'inventory') renderInventory();
  else if (section === 'inbound') { populateMaterialSelect('inboundMaterial'); renderInboundRecords(); }
  else if (section === 'outbound') { populateMaterialSelect('outboundMaterial'); renderOutboundRecords(); }
  else if (section === 'tracking') renderTracking();
  else if (section === 'scrap') renderScrap();
  // 切换页面时自动关闭侧边栏
  closeSidebar();
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

// 点击页面其他区域关闭侧边栏
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuBtn = document.querySelector('.menu-toggle');
  // 如果侧边栏是打开状态，且点击的不是侧边栏内部、不是菜单按钮、也不是遮罩层
  if (sidebar.classList.contains('open')) {
    const isSidebar = sidebar.contains(e.target);
    const isMenuBtn = menuBtn && menuBtn.contains(e.target);
    const isOverlay = overlay && overlay.contains(e.target);
    if (!isSidebar && !isMenuBtn) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }
  }
});

// ===== Toast =====
function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = 'toast ' + (type||'info');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

// ===== 统计 =====
function updateStats() {
  const mats = db.materials;
  const total = mats.length;
  const inStock = mats.filter(m => m.status === '在库').reduce((s,m) => s + (m.quantity||0), 0);
  const cats = new Set(mats.map(m => m.category)).size;
  const warning = mats.filter(m => m.status === '在库' && m.quantity <= (m.minQuantity||0)).length;
  const outCount = mats.filter(m => m.status === '出库').length;
  const repairCount = mats.filter(m => m.status === '维修').length;
  const scrapCount = mats.filter(m => m.status === '报废').length;
  const totalValue = mats.filter(m => m.status === '在库').reduce((s,m) => s + (m.quantity||0) * (m.price||0), 0);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statInStock').textContent = inStock;
  document.getElementById('statCategories').textContent = cats;
  document.getElementById('statWarning').textContent = warning;
  document.getElementById('homeTotal').textContent = total;
  document.getElementById('homeInStock').textContent = inStock;
  document.getElementById('homeOut').textContent = outCount;
  document.getElementById('homeRepair').textContent = repairCount;
  document.getElementById('homeScrap').textContent = scrapCount;
  document.getElementById('homeValue').textContent = '¥' + totalValue.toFixed(2);
  document.getElementById('navCatCount').textContent = cats;
  document.getElementById('navInvCount').textContent = total;
  document.getElementById('navScrapCount').textContent = scrapCount;
}

// ===== 分类管理 =====
function renderCategory() {
  const search = (document.getElementById('catSearch').value || '').toLowerCase();
  const mats = db.materials;
  const groups = {};
  mats.forEach(m => {
    const cat = m.category || '未分类';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(m);
  });
  const sorted = Object.entries(groups).sort((a,b) => a[0].localeCompare(b[0]));
  let html = '';
  sorted.forEach(([cat, items]) => {
    if (search && !cat.toLowerCase().includes(search)) return;
    const inStock = items.filter(m => m.status === '在库').reduce((s,m) => s + (m.quantity||0), 0);
    const totalVal = items.filter(m => m.status === '在库').reduce((s,m) => s + (m.quantity||0) * (m.price||0), 0);
    html += `<div class="home-card" style="margin-bottom:14px">
      <h3><span class="home-icon">📁</span>${cat} <span style="font-size:12px;color:#94a3b8;font-weight:400">(${items.length}种物料)</span></h3>
      <div class="info-row"><span class="info-label">在库数量</span><span class="info-value">${inStock}</span></div>
      <div class="info-row"><span class="info-label">库存价值</span><span class="info-value">¥${totalVal.toFixed(2)}</span></div>
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
        ${items.map(m => `<span style="padding:3px 10px;background:#f1f5f9;border-radius:6px;font-size:12px;color:#334155">${m.name}</span>`).join('')}
      </div>
    </div>`;
  });
  if (!html) html = '<div class="home-card"><p style="color:#94a3b8;text-align:center;padding:20px">暂无物料数据</p></div>';
  document.getElementById('categoryContent').innerHTML = html;
}

// ===== 库存管理 =====
function renderInventory() {
  const search = (document.getElementById('invSearch').value || '').toLowerCase();
  const statusFilter = document.getElementById('invStatusFilter').value;
  const catFilter = document.getElementById('invCatFilter').value;
  let mats = db.materials;
  if (search) mats = mats.filter(m => m.name.toLowerCase().includes(search) || m.code.toLowerCase().includes(search));
  if (statusFilter) mats = mats.filter(m => m.status === statusFilter);
  if (catFilter) mats = mats.filter(m => (m.category||'') === catFilter);
  if (!mats.length) {
    document.getElementById('inventoryContent').innerHTML = '<div class="home-card"><p style="color:#94a3b8;text-align:center;padding:20px">暂无匹配物料</p></div>';
    return;
  }
  let html = `<table class="data-table"><thead><tr>
    <th>物料编号</th><th>物料名称</th><th>分类</th><th>数量</th><th>单价</th><th>库存价值</th><th>状态</th><th>操作</th>
  </tr></thead><tbody>`;
  mats.forEach(m => {
    const statusClass = { '在库':'green', '出库':'orange', '维修':'blue', '报废':'red' }[m.status] || 'green';
    const warning = m.status === '在库' && m.quantity <= (m.minQuantity||0);
    html += `<tr>
      <td>${m.code}</td>
      <td><strong>${m.name}</strong></td>
      <td>${m.category||'未分类'}</td>
      <td style="${warning?'color:#ef4444;font-weight:700':''}">${m.quantity||0} ${m.unit||'个'}</td>
      <td>¥${(m.price||0).toFixed(2)}</td>
      <td>¥${((m.quantity||0)*(m.price||0)).toFixed(2)}</td>
      <td><span class="status-tag ${statusClass}">${m.status||'在库'}</span></td>
      <td>
        <button class="action-btn edit" onclick="editMaterial(${m.id})">✏️ 编辑</button>
        <button class="action-btn delete" onclick="deleteMaterial(${m.id})">🗑️ 删除</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('inventoryContent').innerHTML = html;
}

// ===== 新增/编辑物料 =====
function openAddModal() {
  document.getElementById('modalTitle').textContent = '📝 新增物料';
  document.getElementById('materialId').value = '';
  document.getElementById('materialForm').reset();
  document.getElementById('formModal').classList.add('active');
}

function editMaterial(id) {
  const m = db.materials.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modalTitle').textContent = '✏️ 编辑物料';
  document.getElementById('materialId').value = m.id;
  document.getElementById('materialName').value = m.name;
  document.getElementById('materialCode').value = m.code;
  document.getElementById('materialCategory').value = m.category||'';
  document.getElementById('materialUnit').value = m.unit||'个';
  document.getElementById('materialPrice').value = m.price||'';
  document.getElementById('materialQuantity').value = m.quantity||0;
  document.getElementById('materialMinQuantity').value = m.minQuantity||0;
  document.getElementById('materialLocation').value = m.location||'';
  document.getElementById('materialSupplier').value = m.supplier||'';
  document.getElementById('materialDesc').value = m.description||'';
  document.getElementById('materialStatus').value = m.status||'在库';
  document.getElementById('formModal').classList.add('active');
}

function closeModal() {
  document.getElementById('formModal').classList.remove('active');
}

function saveMaterial(e) {
  e.preventDefault();
  const id = document.getElementById('materialId').value;
  const data = {
    name: document.getElementById('materialName').value.trim(),
    code: document.getElementById('materialCode').value.trim(),
    category: document.getElementById('materialCategory').value,
    unit: document.getElementById('materialUnit').value,
    price: parseFloat(document.getElementById('materialPrice').value) || 0,
    quantity: parseInt(document.getElementById('materialQuantity').value) || 0,
    minQuantity: parseInt(document.getElementById('materialMinQuantity').value) || 0,
    location: document.getElementById('materialLocation').value.trim(),
    supplier: document.getElementById('materialSupplier').value.trim(),
    description: document.getElementById('materialDesc').value.trim(),
    status: document.getElementById('materialStatus').value
  };
  if (!data.name || !data.code) { showToast('请填写物料名称和编号', 'error'); return; }
  if (id) {
    const idx = db.materials.findIndex(x => x.id === parseInt(id));
    if (idx >= 0) { db.materials[idx] = { ...db.materials[idx], ...data }; }
    showToast('物料已更新', 'success');
  } else {
    if (db.materials.some(m => m.code === data.code)) { showToast('物料编号已存在', 'error'); return; }
    data.id = genId();
    data.createdAt = now();
    data.status = data.status || '在库';
    db.materials.push(data);
    addActivity('新增物料：' + data.name + '（' + data.code + '）', 'green');
    showToast('物料已添加', 'success');
  }
  saveDB();
  closeModal();
  updateStats();
  renderInventory();
  renderCategory();
}

function deleteMaterial(id) {
  if (!confirm('确定要删除该物料吗？')) return;
  db.materials = db.materials.filter(m => m.id !== id);
  saveDB();
  updateStats();
  renderInventory();
  renderCategory();
  showToast('物料已删除', 'info');
}

// ===== 入库 =====
function populateMaterialSelect(elId) {
  const sel = document.getElementById(elId);
  sel.innerHTML = '<option value="">请选择物料</option>';
  db.materials.filter(m => m.status === '在库' || m.status === '维修').forEach(m => {
    sel.innerHTML += `<option value="${m.id}">${m.name} (${m.code}) - 库存:${m.quantity||0}${m.unit||'个'}</option>`;
  });
}

function handleInbound(e) {
  e.preventDefault();
  const matId = parseInt(document.getElementById('inboundMaterial').value);
  const qty = parseInt(document.getElementById('inboundQty').value);
  const type = document.getElementById('inboundType').value;
  const supplier = document.getElementById('inboundSupplier').value.trim();
  const note = document.getElementById('inboundNote').value.trim();
  if (!matId || !qty) { showToast('请选择物料并填写数量', 'error'); return; }
  const mat = db.materials.find(m => m.id === matId);
  if (!mat) { showToast('物料不存在', 'error'); return; }
  mat.quantity = (mat.quantity||0) + qty;
  mat.status = '在库';
  if (supplier) mat.supplier = supplier;
  const t = {
    id: genId(),
    type: '入库',
    materialId: matId,
    materialName: mat.name,
    materialCode: mat.code,
    qty: qty,
    detail: type,
    supplier: supplier,
    note: note,
    time: now()
  };
  db.transactions.push(t);
  saveDB();
  addActivity(`入库：${mat.name} x${qty}${mat.unit||'个'}（${type}）`, 'green');
  showToast(`入库成功！${mat.name} +${qty}`, 'success');
  document.getElementById('inboundForm').reset();
  populateMaterialSelect('inboundMaterial');
  renderInboundRecords();
  updateStats();
}

function renderInboundRecords() {
  const records = db.transactions.filter(t => t.type === '入库').reverse().slice(0, 20);
  if (!records.length) {
    document.getElementById('inboundRecords').innerHTML = '<p style="color:#94a3b8;font-size:13px">暂无入库记录</p>';
    return;
  }
  let html = `<table class="data-table"><thead><tr><th>时间</th><th>物料</th><th>数量</th><th>类型</th><th>供应商</th><th>备注</th></tr></thead><tbody>`;
  records.forEach(r => {
    html += `<tr><td>${r.time}</td><td>${r.materialName} (${r.materialCode})</td><td style="color:#16a34a;font-weight:700">+${r.qty}</td><td>${r.detail||'-'}</td><td>${r.supplier||'-'}</td><td>${r.note||'-'}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('inboundRecords').innerHTML = html;
}

// ===== 出库 =====
function handleOutbound(e) {
  e.preventDefault();
  const matId = parseInt(document.getElementById('outboundMaterial').value);
  const qty = parseInt(document.getElementById('outboundQty').value);
  const type = document.getElementById('outboundType').value;
  const user = document.getElementById('outboundUser').value.trim();
  const note = document.getElementById('outboundNote').value.trim();
  if (!matId || !qty) { showToast('请选择物料并填写数量', 'error'); return; }
  const mat = db.materials.find(m => m.id === matId);
  if (!mat) { showToast('物料不存在', 'error'); return; }
  if ((mat.quantity||0) < qty) { showToast(`库存不足！当前库存: ${mat.quantity||0}`, 'error'); return; }
  mat.quantity = (mat.quantity||0) - qty;
  if (mat.quantity === 0) mat.status = '出库';
  const t = {
    id: genId(),
    type: '出库',
    materialId: matId,
    materialName: mat.name,
    materialCode: mat.code,
    qty: qty,
    detail: type,
    user: user,
    note: note,
    time: now()
  };
  db.transactions.push(t);
  saveDB();
  addActivity(`出库：${mat.name} x${qty}${mat.unit||'个'}（${type}）`, 'orange');
  showToast(`出库成功！${mat.name} -${qty}`, 'success');
  document.getElementById('outboundForm').reset();
  populateMaterialSelect('outboundMaterial');
  renderOutboundRecords();
  updateStats();
}

function renderOutboundRecords() {
  const records = db.transactions.filter(t => t.type === '出库').reverse().slice(0, 20);
  if (!records.length) {
    document.getElementById('outboundRecords').innerHTML = '<p style="color:#94a3b8;font-size:13px">暂无出库记录</p>';
    return;
  }
  let html = `<table class="data-table"><thead><tr><th>时间</th><th>物料</th><th>数量</th><th>类型</th><th>领用人</th><th>备注</th></tr></thead><tbody>`;
  records.forEach(r => {
    html += `<tr><td>${r.time}</td><td>${r.materialName} (${r.materialCode})</td><td style="color:#f59e0b;font-weight:700">-${r.qty}</td><td>${r.detail||'-'}</td><td>${r.user||'-'}</td><td>${r.note||'-'}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('outboundRecords').innerHTML = html;
}

// ===== 物料追踪 =====
function renderTracking() {
  const search = (document.getElementById('trackSearch').value || '').toLowerCase();
  let trans = [...db.transactions].reverse();
  if (search) trans = trans.filter(t => t.materialName.toLowerCase().includes(search) || t.materialCode.toLowerCase().includes(search));
  if (!trans.length) {
    document.getElementById('trackingContent').innerHTML = '<div class="home-card"><p style="color:#94a3b8;text-align:center;padding:20px">暂无流转记录</p></div>';
    return;
  }
  let html = '<div class="timeline">';
  trans.slice(0, 50).forEach(t => {
    const cls = t.type === '入库' ? 'in' : t.type === '出库' ? 'out' : t.type === '维修' ? 'repair' : 'scrap';
    const icon = t.type === '入库' ? '📥' : t.type === '出库' ? '📤' : t.type === '维修' ? '🔧' : '🗑️';
    const qtyStr = t.type === '入库' ? `+${t.qty}` : `-${t.qty}`;
    html += `<div class="timeline-item ${cls}">
      <div class="tl-title">${icon} ${t.materialName} (${t.materialCode}) <span style="font-weight:400;font-size:12px;color:#64748b">${qtyStr}</span></div>
      <div class="tl-desc">${t.detail||''} ${t.user ? '· 经办人：'+t.user : ''} ${t.supplier ? '· 供应商：'+t.supplier : ''}</div>
      <div class="tl-time">${t.time} ${t.note ? '· '+t.note : ''}</div>
    </div>`;
  });
  html += '</div>';
  document.getElementById('trackingContent').innerHTML = html;
}

// ===== 报废管理 =====
function renderScrap() {
  const search = (document.getElementById('scrapSearch').value || '').toLowerCase();
  let scraps = db.scraps || [];
  if (search) scraps = scraps.filter(s => s.name.toLowerCase().includes(search) || s.code.toLowerCase().includes(search));
  if (!scraps.length) {
    const inStockMats = db.materials.filter(m => m.status === '在库' || m.status === '维修');
    if (inStockMats.length) {
      let html = '<div class="home-card"><p style="color:#94a3b8;margin-bottom:12px">选择要报废的物料：</p>';
      html += '<select id="scrapSelect" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;margin-bottom:10px">';
      html += '<option value="">请选择物料</option>';
      inStockMats.forEach(m => {
        html += `<option value="${m.id}">${m.name} (${m.code}) - 库存:${m.quantity||0}${m.unit||'个'}</option>`;
      });
      html += '</select>';
      html += '<input type="number" id="scrapQty" min="1" placeholder="报废数量" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;margin-bottom:10px">';
      html += '<input type="text" id="scrapReason" placeholder="报废原因" style="padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;font-size:13px;width:100%;margin-bottom:10px">';
      html += '<button onclick="handleScrap()" style="padding:8px 20px;border:none;border-radius:8px;font-size:13px;cursor:pointer;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;font-weight:600">🗑️ 确认报废</button>';
      html += '</div>';
      document.getElementById('scrapContent').innerHTML = html;
    } else {
      document.getElementById('scrapContent').innerHTML = '<div class="home-card"><p style="color:#94a3b8;text-align:center;padding:20px">暂无报废物料</p></div>';
    }
    return;
  }
  let html = '<div class="scrap-grid">';
  scraps.forEach(s => {
    html += `<div class="scrap-card">
      <h4>${s.name} (${s.code})</h4>
      <div class="scrap-meta">报废数量：${s.qty} ${s.unit||'个'}</div>
      <div class="scrap-meta">报废时间：${s.time}</div>
      <div class="scrap-reason">📌 报废原因：${s.reason||'未填写'}</div>
    </div>`;
  });
  html += '</div>';
  document.getElementById('scrapContent').innerHTML = html;
}

function handleScrap() {
  const matId = parseInt(document.getElementById('scrapSelect').value);
  const qty = parseInt(document.getElementById('scrapQty').value);
  const reason = document.getElementById('scrapReason').value.trim();
  if (!matId || !qty) { showToast('请选择物料并填写报废数量', 'error'); return; }
  const mat = db.materials.find(m => m.id === matId);
  if (!mat) { showToast('物料不存在', 'error'); return; }
  if ((mat.quantity||0) < qty) { showToast(`库存不足！当前库存: ${mat.quantity||0}`, 'error'); return; }
  mat.quantity = (mat.quantity||0) - qty;
  if (mat.quantity === 0) mat.status = '报废';
  if (!db.scraps) db.scraps = [];
  db.scraps.push({
    id: genId(),
    materialId: mat.id,
    name: mat.name,
    code: mat.code,
    qty: qty,
    unit: mat.unit,
    reason: reason,
    time: now()
  });
  const t = {
    id: genId(),
    type: '报废',
    materialId: mat.id,
    materialName: mat.name,
    materialCode: mat.code,
    qty: qty,
    detail: '物料报废',
    note: reason,
    time: now()
  };
  db.transactions.push(t);
  saveDB();
  addActivity(`报废：${mat.name} x${qty}${mat.unit||'个'}（${reason||'未填原因'}）`, 'red');
  showToast(`已报废 ${mat.name} x${qty}`, 'info');
  renderScrap();
  updateStats();
}

// ===== 数据导入导出 =====
function exportData() {
  const mats = db.materials;
  if (!mats.length) { showToast('暂无数据可导出', 'error'); return; }
  const headers = ['物料编号','物料名称','分类','单位','单价','数量','最低库存','位置','供应商','状态','描述'];
  const rows = mats.map(m => [
    m.code, m.name, m.category||'', m.unit||'个', m.price||0, m.quantity||0,
    m.minQuantity||0, m.location||'', m.supplier||'', m.status||'在库', m.description||''
  ]);
  let csv = '\uFEFF' + headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(v => '"'+String(v).replace(/"/g,'""')+'"').join(',') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '物料数据_' + today() + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('数据导出成功', 'success');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const text = ev.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { showToast('CSV文件格式错误', 'error'); return; }
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.replace(/"/g,'').trim());
        const code = vals[0] || '';
        if (!code) continue;
        if (db.materials.some(m => m.code === code)) continue;
        db.materials.push({
          id: genId(),
          code: code,
          name: vals[1] || '',
          category: vals[2] || '',
          unit: vals[3] || '个',
          price: parseFloat(vals[4]) || 0,
          quantity: parseInt(vals[5]) || 0,
          minQuantity: parseInt(vals[6]) || 0,
          location: vals[7] || '',
          supplier: vals[8] || '',
          status: vals[9] || '在库',
          description: vals[10] || '',
          createdAt: now()
        });
        count++;
      }
      saveDB();
      addActivity(`导入数据：成功导入 ${count} 条物料记录`, 'green');
      showToast(`成功导入 ${count} 条物料数据`, 'success');
      updateStats();
      renderInventory();
      renderCategory();
    } catch(err) {
      showToast('导入失败：' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function clearAllData() {
  if (!confirm('⚠️ 确定要清空所有数据吗？此操作不可恢复！')) return;
  if (!confirm('再次确认：所有物料数据和操作记录将被永久删除！')) return;
  db = { materials: [], transactions: [], scraps: [], nextId: 1 };
  saveDB();
  addActivity('系统数据已清空', 'red');
  showToast('所有数据已清空', 'info');
  updateStats();
  renderInventory();
  renderCategory();
  renderInboundRecords();
  renderOutboundRecords();
  renderTracking();
  renderScrap();
}

function generateReport() {
  const mats = db.materials;
  if (!mats.length) { showToast('暂无数据生成报告', 'error'); return; }
  const cats = {};
  mats.forEach(m => {
    const cat = m.category || '未分类';
    if (!cats[cat]) cats[cat] = { count: 0, inStock: 0, value: 0 };
    cats[cat].count++;
    if (m.status === '在库') {
      cats[cat].inStock += m.quantity||0;
      cats[cat].value += (m.quantity||0) * (m.price||0);
    }
  });
  let report = '═══════════════════════════════════════\n';
  report += '  动车段物料管理统计报告\n';
  report += '  生成时间：' + now() + '\n';
  report += '═══════════════════════════════════════\n\n';
  report += `物料总数：${mats.length}\n`;
  report += `在库数量：${mats.filter(m=>m.status==='在库').reduce((s,m)=>s+(m.quantity||0),0)}\n`;
  report += `出库数量：${mats.filter(m=>m.status==='出库').length}\n`;
  report += `维修数量：${mats.filter(m=>m.status==='维修').length}\n`;
  report += `报废数量：${mats.filter(m=>m.status==='报废').length}\n\n`;
  report += '--- 分类统计 ---\n';
  Object.entries(cats).forEach(([cat, data]) => {
    report += `${cat}: ${data.count}种物料, 在库${data.inStock}, 价值¥${data.value.toFixed(2)}\n`;
  });
  report += '\n--- 库存预警 ---\n';
  const warnings = mats.filter(m => m.status === '在库' && m.quantity <= (m.minQuantity||0));
  if (warnings.length) {
    warnings.forEach(m => { report += `${m.name}(${m.code}): 库存${m.quantity||0}/${m.minQuantity||0}\n`; });
  } else {
    report += '暂无库存预警\n';
  }
  report += '\n═══════════════════════════════════════\n';
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '物料统计报告_' + today() + '.txt';
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('统计报告已生成', 'success');
}

// ===== 活动记录 =====
function addActivity(text, color) {
  const container = document.getElementById('homeActivities');
  const item = document.createElement('div');
  item.className = 'activity-item';
  item.innerHTML = `<div class="activity-dot ${color||'green'}"></div><span class="activity-text">${text}</span><span class="activity-time">刚刚</span>`;
  container.insertBefore(item, container.firstChild);
  while (container.children.length > 20) container.removeChild(container.lastChild);
}

// ===== 初始化 =====
function init() {
  if (!db.materials.length) {
    const demo = [
      { id: genId(), code: 'ELEC-001', name: '高铁信号处理器', category: '电子产品', unit: '个', price: 8500, quantity: 12, minQuantity: 5, location: 'A1-01', supplier: '中车电子', status: '在库', description: '动车组信号处理核心模块', createdAt: now() },
      { id: genId(), code: 'ELEC-002', name: '传感器模组', category: '电子产品', unit: '个', price: 1200, quantity: 45, minQuantity: 20, location: 'A1-02', supplier: '华为技术', status: '在库', description: '温度/振动传感器', createdAt: now() },
      { id: genId(), code: 'ELEC-003', name: '控制电路板', category: '电子产品', unit: '块', price: 3200, quantity: 8, minQuantity: 10, location: 'A1-03', supplier: '中兴通讯', status: '在库', description: '动车组控制系统电路板', createdAt: now() },
      { id: genId(), code: 'MECH-001', name: '制动闸片', category: '机械设备', unit: '套', price: 5600, quantity: 20, minQuantity: 8, location: 'B2-01', supplier: '中车制动', status: '在库', description: '动车组制动系统闸片', createdAt: now() },
      { id: genId(), code: 'MECH-002', name: '轴承组件', category: '机械设备', unit: '套', price: 2800, quantity: 15, minQuantity: 10, location: 'B2-02', supplier: 'SKF', status: '在库', description: '高速轴承组件', createdAt: now() },
      { id: genId(), code: 'MECH-003', name: '减震器', category: '机械设备', unit: '个', price: 4500, quantity: 6, minQuantity: 5, location: 'B2-03', supplier: '中车减震', status: '在库', description: '动车组减震装置', createdAt: now() },
      { id: genId(), code: 'BUILD-001', name: '铝合金型材', category: '建筑材料', unit: '根', price: 1800, quantity: 30, minQuantity: 15, location: 'C3-01', supplier: '南山铝业', status: '在库', description: '车体铝合金结构型材', createdAt: now() },
      { id: genId(), code: 'BUILD-002', name: '隔音材料', category: '建筑材料', unit: '卷', price: 650, quantity: 25, minQuantity: 10, location: 'C3-02', supplier: '中车材料', status: '在库', description: '动车组隔音材料', createdAt: now() },
      { id: genId(), code: 'PACK-001', name: '标准包装箱', category: '包装材料', unit: '个', price: 85, quantity: 200, minQuantity: 50, location: 'D4-01', supplier: '中车包装', status: '在库', description: '物料运输标准包装箱', createdAt: now() },
      { id: genId(), code: 'CHEM-001', name: '润滑剂', category: '化工原料', unit: '桶', price: 450, quantity: 18, minQuantity: 5, location: 'E5-01', supplier: '中石化', status: '在库', description: '动车组轴承润滑剂', createdAt: now() },
      { id: genId(), code: 'CHEM-002', name: '清洁剂', category: '化工原料', unit: '桶', price: 120, quantity: 30, minQuantity: 10, location: 'E5-02', supplier: '蓝月亮', status: '在库', description: '动车组表面清洁剂', createdAt: now() }
    ];
    db.materials = demo;
    addActivity('系统初始化：已加载示例物料数据', 'green');
    saveDB();
  }
  updateStats();
  renderCategory();
  renderInventory();
  populateMaterialSelect('inboundMaterial');
  populateMaterialSelect('outboundMaterial');
  renderInboundRecords();
  renderOutboundRecords();
  renderTracking();
  renderScrap();
}

document.addEventListener('DOMContentLoaded', function() {
  checkLogin();
});
