// ============================================================
//  Divisions Page Logic
// ============================================================
(function () {
    'use strict';
    DB.init();

    const grid = document.getElementById('div-grid');
    const emptyState = document.getElementById('empty-state');
    const semTabs = document.getElementById('sem-tabs');
    const infoBar = document.getElementById('sem-info-bar');
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('div-form');
    const editId = document.getElementById('edit-id');
    const semSelect = document.getElementById('div-sem');
    const nameInput = document.getElementById('div-name');
    const strengthInput = document.getElementById('div-strength');
    const modalTitle = document.getElementById('modal-title');
    const delOverlay = document.getElementById('delete-overlay');
    const delDivName = document.getElementById('del-div-name');

    let activeSem = 4;
    let deleteTarget = null;

    // ============================================================
    //  Semester Tabs
    // ============================================================
    function buildTabs() {
        semTabs.innerHTML = '';
        for (let s = 1; s <= 8; s++) {
            const btn = document.createElement('button');
            btn.className = 'pill-tab' + (s === activeSem ? ' active' : '');
            btn.textContent = `Sem ${s}`;
            btn.addEventListener('click', () => { activeSem = s; buildTabs(); render(); });
            semTabs.appendChild(btn);
        }
    }

    // ============================================================
    //  Render
    // ============================================================
    function render() {
        const divisions = DB.getDivisionsBySem(activeSem);
        const isCore = activeSem <= 4;

        // Info bar
        infoBar.innerHTML = `
      <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;">
        <span class="badge ${isCore ? 'badge-core' : 'badge-elective'}">${isCore ? '📚 Core Subjects Only' : '📚 Core + 🎯 Electives'}</span>
        <span style="font-size:.85rem;color:var(--text-2);">${divisions.length} division${divisions.length !== 1 ? 's' : ''} · Total students: <strong>${divisions.reduce((s, d) => s + d.strength, 0)}</strong></span>
      </div>
    `;

        if (divisions.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        const maxStr = Math.max(...divisions.map(d => d.strength));
        const classrooms = DB.getClassrooms().slice().sort((a, b) => a.capacity - b.capacity);

        grid.innerHTML = divisions.map(div => {
            const pct = Math.round((div.strength / Math.max(maxStr, 1)) * 100);
            const fit = classrooms.find(r => r.capacity >= div.strength);
            const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#22c55e';
            const fitText = fit
                ? `<span class="badge badge-green">✅ Fits ${fit.name}</span>`
                : `<span class="badge badge-red">⚠️ Exceeds all rooms</span>`;
            return `
        <div class="div-card">
          <div class="div-head">
            <div class="div-name">📌 ${div.name}</div>
            ${fitText}
          </div>
          <div class="div-strength">${div.strength}</div>
          <div class="div-strength-label">Students</div>
          <div class="div-bar-wrap">
            <div class="div-bar" style="width:${pct}%;background:${color};"></div>
          </div>
          <div class="stat-row">
            <span class="stat-pill blue">📅 Sem ${div.semester}</span>
            <span class="stat-pill ${div.strength > 60 ? 'orange' : 'green'}">${div.strength > 80 ? '🔴 Large' : div.strength > 50 ? '🟡 Medium' : '🟢 Small'}</span>
          </div>
          <div class="div-actions">
            <button class="btn btn-outline btn-sm" onclick="openEdit('${div.id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="openDelete('${div.id}','${div.name}')">🗑️ Delete</button>
          </div>
        </div>
      `;
        }).join('');
    }

    // ============================================================
    //  Modal helpers
    // ============================================================
    function openAdd() {
        editId.value = '';
        semSelect.value = activeSem;
        nameInput.value = '';
        strengthInput.value = '';
        modalTitle.textContent = 'Add Division';
        overlay.classList.add('open');
        nameInput.focus();
    }

    window.openEdit = function (id) {
        const div = DB.getDivisions().find(d => d.id === id);
        if (!div) return;
        editId.value = div.id;
        semSelect.value = div.semester;
        nameInput.value = div.name;
        strengthInput.value = div.strength;
        modalTitle.textContent = `Edit — ${div.name}`;
        overlay.classList.add('open');
        nameInput.focus();
    };

    function closeModal() { overlay.classList.remove('open'); }

    window.openDelete = function (id, name) {
        deleteTarget = id;
        delDivName.textContent = name;
        delOverlay.classList.add('open');
    };
    function closeDelete() { delOverlay.classList.remove('open'); deleteTarget = null; }

    // ============================================================
    //  CRUD
    // ============================================================
    form.addEventListener('submit', e => {
        e.preventDefault();
        const sem = parseInt(semSelect.value, 10);
        const name = nameInput.value.trim().toUpperCase();
        const strength = parseInt(strengthInput.value, 10);

        if (!sem) return showToast('Select a semester.', 'error');
        if (!name) return showToast('Division name is required.', 'error');
        if (!strength || strength < 1) return showToast('Enter valid student strength.', 'error');

        const all = DB.getDivisions();
        const id = editId.value;

        if (id) {
            const idx = all.findIndex(d => d.id === id);
            if (idx > -1) { all[idx].semester = sem; all[idx].name = name; all[idx].strength = strength; }
            showToast(`${name} updated.`, 'success');
        } else {
            if (all.find(d => d.name.toLowerCase() === name.toLowerCase())) {
                return showToast('A division with this name already exists.', 'error');
            }
            all.push({ id: DB.uid(), semester: sem, name, strength });
            showToast(`${name} added.`, 'success');
        }

        DB.setDivisions(all);
        activeSem = sem;
        closeModal();
        buildTabs();
        render();
    });

    document.getElementById('del-confirm').addEventListener('click', () => {
        if (!deleteTarget) return;
        DB.setDivisions(DB.getDivisions().filter(d => d.id !== deleteTarget));
        showToast('Division deleted.', 'info');
        closeDelete();
        render();
    });

    // ---- events ----
    document.getElementById('btn-add-div').addEventListener('click', openAdd);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('del-close').addEventListener('click', closeDelete);
    document.getElementById('del-cancel').addEventListener('click', closeDelete);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    delOverlay.addEventListener('click', e => { if (e.target === delOverlay) closeDelete(); });

    // ============================================================
    //  Toast
    // ============================================================
    function showToast(msg, type = 'info') {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
        document.getElementById('toast-container').appendChild(el);
        setTimeout(() => el.remove(), 2800);
    }

    // ---- boot ----
    buildTabs();
    render();
})();
