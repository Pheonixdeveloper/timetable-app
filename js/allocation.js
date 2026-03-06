// ============================================================
//  Allocation Page Logic
// ============================================================
(function () {
    'use strict';
    DB.init();

    const semSelect = document.getElementById('sem-select');
    const btnRun = document.getElementById('btn-run');
    const btnSave = document.getElementById('btn-save');
    const output = document.getElementById('alloc-output');
    const emptyState = document.getElementById('empty-state');
    const statsRow = document.getElementById('stats-row');

    // in-page override state: divId → classroomId
    let overrides = {};
    let currentSem = 4;
    let lastResults = null;

    // ============================================================
    //  Run Allocation
    // ============================================================
    btnRun.addEventListener('click', () => {
        currentSem = parseInt(semSelect.value, 10);
        overrides = {};
        lastResults = DB.runAllocationForSem(currentSem);
        render();
        btnSave.style.display = 'inline-flex';
        emptyState.style.display = 'none';
    });

    // ============================================================
    //  Render
    // ============================================================
    function render() {
        if (!lastResults) return;

        const divisions = DB.getDivisionsBySem(currentSem);
        const classrooms = DB.getClassrooms();

        if (divisions.length === 0) {
            output.innerHTML = `<div class="empty-state"><div class="es-icon">👥</div><p>No divisions found for Semester ${currentSem}. Add them first in the Divisions page.</p></div>`;
            statsRow.style.display = 'none';
            return;
        }

        // Stats
        const totalStudents = divisions.reduce((s, d) => s + d.strength, 0);
        const fits = Object.values(lastResults).filter(r => r.type === 'individual').length;
        const overflows = Object.values(lastResults).filter(r => r.type === 'overflow').length;
        statsRow.style.display = 'grid';
        statsRow.innerHTML = `
      <div class="stat-card"><div class="sc-val">${divisions.length}</div><div class="sc-key">Total Divisions</div></div>
      <div class="stat-card"><div class="sc-val">${totalStudents}</div><div class="sc-key">Total Students</div></div>
      <div class="stat-card"><div class="sc-val" style="color:var(--success);">${fits}</div><div class="sc-key">✅ Individual Fit</div></div>
      <div class="stat-card"><div class="sc-val" style="color:var(--danger);">${overflows}</div><div class="sc-key">⚠️ Overflow / Combine</div></div>
    `;

        // Group into individual, combine-suggested, overflow
        const individual = divisions.filter(d => lastResults[d.id]?.type === 'individual' && !lastResults[d.id]?.combineSuggestion);
        const combinable = divisions.filter(d => lastResults[d.id]?.combineSuggestion);
        const overflow = divisions.filter(d => lastResults[d.id]?.type === 'overflow');

        let html = '';

        // ---- Individual Fits ----
        if (individual.length) {
            html += `<div class="scenario-section"><h3><span style="color:var(--success);">✅</span> Individual Assignment (${individual.length})</h3>`;
            individual.forEach(div => {
                const res = lastResults[div.id];
                const room = classrooms.find(r => r.id === (overrides[div.id] || res.classroom));
                html += buildCard(div, res, room, classrooms, 'individual');
            });
            html += '</div>';
        }

        // ---- Combine Suggestions ----
        if (combinable.length) {
            html += `<div class="scenario-section"><h3><span style="color:var(--info);">🔀</span> Combine Suggestions Available (${combinable.length})</h3>`;
            combinable.forEach(div => {
                const res = lastResults[div.id];
                const room = classrooms.find(r => r.id === (overrides[div.id] || res.classroom));
                html += buildCard(div, res, room, classrooms, 'combine');
            });
            html += '</div>';
        }

        // ---- Overflow ----
        if (overflow.length) {
            html += `<div class="scenario-section"><h3><span style="color:var(--danger);">⚠️</span> Overflow — Exceeds All Rooms (${overflow.length})</h3>`;
            overflow.forEach(div => {
                const res = lastResults[div.id];
                const room = classrooms.find(r => r.id === (overrides[div.id] || res.classroom));
                html += buildCard(div, res, room, classrooms, 'overflow');
            });
            html += '</div>';
        }

        output.innerHTML = html;
    }

    function buildCard(div, res, room, classrooms, type) {
        const colors = {
            individual: { border: 'var(--success)', tag_bg: 'var(--success-l)', tag_color: 'var(--success)', label: '✅ Individual' },
            combine: { border: 'var(--info)', tag_bg: 'var(--info-l)', tag_color: 'var(--info)', label: '🔀 Combinable' },
            overflow: { border: 'var(--danger)', tag_bg: 'var(--danger-l)', tag_color: 'var(--danger)', label: '⚠️ Overflow' },
        };
        const c = colors[type];
        const roomOpts = classrooms.map(r =>
            `<option value="${r.id}" ${(overrides[div.id] || res.classroom) === r.id ? 'selected' : ''}>${r.name} (cap: ${r.capacity})</option>`
        ).join('');
        const overflowNote = type === 'overflow' ? `<div style="margin-top:.5rem;font-size:.82rem;color:var(--danger);">⚠️ Division strength (${div.strength}) exceeds all available rooms. Consider adding a larger room or splitting.</div>` : '';

        const combineHint = res.combineSuggestion ? `
      <div class="combine-hint">
        💡 <span>Can be combined with <strong>${res.combineSuggestion.partnerName}</strong> (total: ${res.combineSuggestion.combined} students) → fits <strong>${res.combineSuggestion.classroomName}</strong></span>
      </div>` : '';

        const capPct = room ? Math.min(100, Math.round((div.strength / room.capacity) * 100)) : 100;
        const barColor = capPct > 95 ? 'var(--danger)' : capPct > 75 ? 'var(--warning)' : 'var(--success)';

        return `
      <div class="alloc-card" style="background:var(--surface);border:1.5px solid ${c.border};border-radius:var(--radius-lg);padding:1.25rem;margin-bottom:.85rem;">
        <span class="type-tag badge" style="background:${c.tag_bg};color:${c.tag_color};">${c.label}</span>
        <div class="ac-head">
          <span class="ac-name">📌 ${div.name}</span>
          <span class="stat-pill blue">👥 ${div.strength} students</span>
        </div>
        <div style="display:flex;align-items:center;gap:.4rem;font-size:.85rem;color:var(--text-2);flex-wrap:wrap;">
          ${room ? `🏫 Assigned: <strong>${room.name}</strong> (cap: ${room.capacity})` : '🏫 No room assigned'}
          ${room ? `· Utilization: <strong style="color:${barColor};">${capPct}%</strong>` : ''}
        </div>
        ${room ? `
        <div style="background:var(--surface2);border-radius:99px;height:6px;overflow:hidden;margin:.5rem 0;">
          <div style="width:${capPct}%;height:100%;border-radius:99px;background:${barColor};transition:width .4s;"></div>
        </div>` : ''}
        ${combineHint}
        ${overflowNote}
        <div class="alloc-room-select">
          <label>Override Room Assignment:</label>
          <select onchange="overrideRoom('${div.id}', this.value)">
            <option value="">— Use Suggested —</option>
            ${roomOpts}
          </select>
        </div>
      </div>
    `;
    }

    // ============================================================
    //  Override & Save
    // ============================================================
    window.overrideRoom = function (divId, roomId) {
        if (roomId) overrides[divId] = roomId;
        else delete overrides[divId];
        render();
    };

    btnSave.addEventListener('click', () => {
        if (!lastResults) return;
        const divisions = DB.getDivisionsBySem(currentSem);
        const classrooms = DB.getClassrooms();
        const saved = {};

        divisions.forEach(div => {
            const res = lastResults[div.id];
            const roomId = overrides[div.id] || (res ? res.classroom : null);
            const room = classrooms.find(r => r.id === roomId);
            saved[div.id] = {
                divisionName: div.name,
                strength: div.strength,
                classroom: roomId,
                classroomName: room ? room.name : 'Unassigned',
                type: res ? res.type : 'unknown',
                overridden: !!overrides[div.id],
            };
        });

        const all = DB.getAllocation();
        all[currentSem] = saved;
        DB.setAllocation(all);
        showToast('Allocation plan saved for Semester ' + currentSem, 'success');
    });

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

    // Auto-run for sem 4 if data exists
    if (DB.getDivisionsBySem(4).length) {
        btnRun.click();
    }
})();
