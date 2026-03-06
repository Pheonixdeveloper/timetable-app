// ============================================================
//  Classrooms Page Logic
// ============================================================
(function () {
    'use strict';
    DB.init();

    const grid = document.getElementById('rooms-grid');
    const emptyState = document.getElementById('empty-state');
    const summaryBar = document.getElementById('summary-bar');
    const roomCount = document.getElementById('room-count');
    const searchInput = document.getElementById('search-input');

    // ---- Modal elements ----
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('room-form');
    const editId = document.getElementById('edit-id');
    const nameInput = document.getElementById('room-name');
    const capInput = document.getElementById('room-capacity');
    const modalTitle = document.getElementById('modal-title');

    const delOverlay = document.getElementById('delete-overlay');
    const delName = document.getElementById('del-room-name');
    let deleteTarget = null;

    // ============================================================
    //  Render
    // ============================================================
    function render(filter = '') {
        const rooms = DB.getClassrooms().filter(r =>
            r.name.toLowerCase().includes(filter.toLowerCase())
        );

        roomCount.textContent = `${rooms.length} room${rooms.length !== 1 ? 's' : ''}`;

        // Summary
        const total = DB.getClassrooms().length;
        const maxCap = DB.getClassrooms().reduce((m, r) => Math.max(m, r.capacity), 0);
        const totalCap = DB.getClassrooms().reduce((s, r) => s + r.capacity, 0);
        summaryBar.innerHTML = `
      <div class="sb-item"><div class="sb-val">${total}</div><div class="sb-key">Total Rooms</div></div>
      <div class="sb-item"><div class="sb-val">${totalCap}</div><div class="sb-key">Total Capacity</div></div>
      <div class="sb-item"><div class="sb-val">${maxCap}</div><div class="sb-key">Largest Room</div></div>
      <div class="sb-item"><div class="sb-val">${total ? Math.round(totalCap / total) : 0}</div><div class="sb-key">Avg Capacity</div></div>
    `;

        if (rooms.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        const maxCapAll = Math.max(...rooms.map(r => r.capacity));

        grid.innerHTML = rooms.map(r => {
            const pct = Math.round((r.capacity / maxCapAll) * 100);
            const dot = r.capacity >= 100 ? 'large' : r.capacity >= 60 ? 'medium' : 'small';
            const label = r.capacity >= 100 ? 'Large Room' : r.capacity >= 60 ? 'Medium Room' : 'Small Room';
            return `
        <div class="room-card">
          <div class="room-name">🏫 ${r.name}</div>
          <div class="room-cap">${r.capacity}</div>
          <div class="room-cap-label">Maximum Seating Capacity</div>
          <div class="room-bar-wrap"><div class="room-bar" style="width:${pct}%"></div></div>
          <div class="capacity-indicator">
            <div class="cap-dot ${dot}"></div>
            <span style="font-size:.78rem;color:var(--text-2);">${label}</span>
          </div>
          <div class="room-actions">
            <button class="btn btn-outline btn-sm" onclick="openEdit('${r.id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="openDelete('${r.id}','${r.name}')">🗑️ Delete</button>
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
        nameInput.value = '';
        capInput.value = '';
        modalTitle.textContent = 'Add Classroom';
        overlay.classList.add('open');
        nameInput.focus();
    }

    window.openEdit = function (id) {
        const room = DB.getClassrooms().find(r => r.id === id);
        if (!room) return;
        editId.value = room.id;
        nameInput.value = room.name;
        capInput.value = room.capacity;
        modalTitle.textContent = `Edit — ${room.name}`;
        overlay.classList.add('open');
        nameInput.focus();
    };

    function closeModal() { overlay.classList.remove('open'); }

    window.openDelete = function (id, name) {
        deleteTarget = id;
        delName.textContent = name;
        delOverlay.classList.add('open');
    };
    function closeDelete() { delOverlay.classList.remove('open'); deleteTarget = null; }

    // ============================================================
    //  CRUD
    // ============================================================
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const capacity = parseInt(capInput.value, 10);

        if (!name) { return showToast('Room name is required.', 'error'); }
        if (!capacity || capacity < 1) { return showToast('Enter a valid capacity.', 'error'); }

        const rooms = DB.getClassrooms();
        const id = editId.value;

        if (id) {
            const idx = rooms.findIndex(r => r.id === id);
            if (idx > -1) { rooms[idx].name = name; rooms[idx].capacity = capacity; }
            showToast(`${name} updated.`, 'success');
        } else {
            const dup = rooms.find(r => r.name.toLowerCase() === name.toLowerCase());
            if (dup) return showToast('A room with this name already exists.', 'error');
            rooms.push({ id: DB.uid(), name, capacity });
            showToast(`${name} added.`, 'success');
        }

        DB.setClassrooms(rooms);
        closeModal();
        render(searchInput.value);
    });

    document.getElementById('del-confirm').addEventListener('click', () => {
        if (!deleteTarget) return;
        const rooms = DB.getClassrooms().filter(r => r.id !== deleteTarget);
        DB.setClassrooms(rooms);
        showToast('Classroom deleted.', 'info');
        closeDelete();
        render(searchInput.value);
    });

    // ============================================================
    //  Event wiring
    // ============================================================
    document.getElementById('btn-add-room').addEventListener('click', openAdd);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('del-close').addEventListener('click', closeDelete);
    document.getElementById('del-cancel').addEventListener('click', closeDelete);

    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    delOverlay.addEventListener('click', e => { if (e.target === delOverlay) closeDelete(); });

    searchInput.addEventListener('input', () => render(searchInput.value));

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
    render();
})();
