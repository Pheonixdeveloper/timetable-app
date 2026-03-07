import { useState, useEffect, useCallback } from 'react'
import { getDivisions, setDivisions, getDivisionsBySem, getClassrooms, uid } from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const SEM_INFO = {
    1: 'Core only', 2: 'Core only', 3: 'Core only', 4: 'Core only',
    5: 'Core + Electives', 6: 'Core + Electives', 7: 'Core + Electives', 8: 'Core + Electives'
}

const btn = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .75rem', borderRadius: 10,
    fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', border: `2px solid ${border}`,
    background: bg, color, fontFamily: 'inherit'
})

export default function Divisions() {
    const [activeSem, setActiveSem] = useState(4)
    const [divisions, setDivState] = useState([])
    const [toast, setToast] = useState(null)
    const [modal, setModal] = useState({ open: false, editing: null })
    const [delModal, setDel] = useState({ open: false, id: null, name: '' })
    const [form, setForm] = useState({ semester: 4, name: '', strength: '', shift: 'evening' })

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }
    const load = useCallback(() => setDivState(getDivisionsBySem(activeSem)), [activeSem])
    useEffect(() => load(), [load])

    const totalStr = divisions.reduce((s, d) => s + d.strength, 0)
    const classrooms = getClassrooms().sort((a, b) => a.capacity - b.capacity)
    const isCore = activeSem <= 4

    const openAdd = () => { setForm({ semester: activeSem, name: '', strength: '', shift: 'evening' }); setModal({ open: true, editing: null }) }
    const openEdit = d => { setForm({ semester: d.semester, name: d.name, strength: d.strength, shift: d.shift || 'evening' }); setModal({ open: true, editing: d }) }
    const closeModal = () => setModal({ open: false, editing: null })

    const handleSave = e => {
        e.preventDefault()
        const sem = parseInt(form.semester, 10), name = form.name.trim().toUpperCase(), strength = parseInt(form.strength, 10), shift = form.shift || 'evening'
        if (!sem) return showToast('Select a semester.', 'error')
        if (!name) return showToast('Division name is required.', 'error')
        if (!strength || strength < 1) return showToast('Enter valid strength.', 'error')
        const all = getDivisions()
        if (modal.editing) {
            setDivisions(all.map(d => d.id === modal.editing.id ? { ...d, semester: sem, name, strength, shift } : d))
            showToast(`${name} updated.`, 'success')
        } else {
            if (all.find(d => d.name.toLowerCase() === name.toLowerCase())) return showToast('Division already exists.', 'error')
            setDivisions([...all, { id: uid(), semester: sem, name, strength, shift }])
            showToast(`${name} added.`, 'success')
        }
        setActiveSem(sem); load(); closeModal()
    }

    const handleDelete = () => {
        setDivisions(getDivisions().filter(d => d.id !== delModal.id))
        showToast('Division deleted.', 'info'); setDel({ open: false, id: null, name: '' }); load()
    }

    const wrap = { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }
    const hdr = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }
    const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }
    const card = { background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '1.25rem', transition: 'all .18s' }
    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface2)', outline: 'none' }

    return (
        <div style={wrap}>
            {/* Header */}
            <div style={hdr}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'var(--success-l)', color: 'var(--success)', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>👥 STEP 1</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Class Divisions</h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '.93rem', marginTop: '.2rem' }}>CE semester-wise divisions with student strength. Sem 1–4 core only; 5–8 adds electives.</p>
                </div>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }} onClick={openAdd}>➕ Add Division</button>
            </div>

            {/* Semester Tabs */}
            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', background: 'var(--surface2)', padding: '.35rem', borderRadius: 99, width: 'fit-content', marginBottom: '1.25rem', transition: 'background .2s' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <button key={s} onClick={() => setActiveSem(s)}
                        style={{
                            padding: '.38rem .95rem', borderRadius: 99, fontSize: '.85rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                            background: s === activeSem ? 'var(--primary)' : 'transparent', color: s === activeSem ? '#fff' : 'var(--text-2)', fontFamily: 'inherit', transition: 'all .18s'
                        }}>
                        Sem {s}
                    </button>
                ))}
            </div>

            {/* Info bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.25rem', padding: '.2rem .6rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 600,
                    background: isCore ? 'var(--info-l)' : 'var(--accent-l, #f3e8ff)', color: isCore ? 'var(--info)' : 'var(--accent)'
                }}>
                    {isCore ? '📚 Core Subjects Only' : '📚 Core + 🎯 Electives'}
                </span>
                <span style={{ fontSize: '.85rem', color: 'var(--text-2)' }}>{divisions.length} division{divisions.length !== 1 ? 's' : ''} · Total students: <strong style={{ color: 'var(--text)' }}>{totalStr}</strong></span>
            </div>

            {/* Grid */}
            {divisions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <p>No divisions for Sem {activeSem}. Click <strong style={{ color: 'var(--text)' }}>Add Division</strong>.</p>
                </div>
            ) : (
                <div style={grid}>
                    {divisions.map(d => {
                        const maxStr = Math.max(...divisions.map(x => x.strength), 1)
                        const pct = Math.round((d.strength / maxStr) * 100)
                        const barColor = pct > 80 ? 'var(--danger)' : pct > 50 ? 'var(--warning)' : 'var(--success)'
                        const fit = classrooms.find(r => r.capacity >= d.strength)
                        return (
                            <div key={d.id} style={card}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>📌 {d.name}</div>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '.25rem', padding: '.2rem .6rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 600,
                                        background: fit ? 'var(--success-l)' : 'var(--danger-l)', color: fit ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {fit ? `✅ Fits ${fit.name}` : '⚠️ Exceeds rooms'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{d.strength}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Students</div>
                                <div style={{ background: 'var(--surface2)', borderRadius: 99, height: 6, overflow: 'hidden', margin: '.6rem 0' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: barColor, transition: 'width .4s' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                                    <span style={{ background: 'var(--primary-l)', color: 'var(--primary)', padding: '.3rem .75rem', borderRadius: 99, fontSize: '.82rem', fontWeight: 500 }}>📅 Sem {d.semester}</span>
                                    <span style={{ background: d.shift === 'morning' ? 'var(--info-l)' : 'var(--accent-l, #f3e8ff)', color: d.shift === 'morning' ? 'var(--info)' : 'var(--accent, #7209b7)', padding: '.3rem .75rem', borderRadius: 99, fontSize: '.82rem', fontWeight: 500 }}>
                                        {d.shift === 'morning' ? '🌅 Morning' : '🌆 Evening'}
                                    </span>
                                    <span style={{ background: d.strength > 80 ? 'var(--warning-l)' : 'var(--success-l)', color: d.strength > 80 ? 'var(--warning)' : 'var(--success)', padding: '.3rem .75rem', borderRadius: 99, fontSize: '.82rem', fontWeight: 500 }}>
                                        {d.strength > 80 ? '🔴 Large' : d.strength > 50 ? '🟡 Medium' : '🟢 Small'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '.5rem' }}>
                                    <button style={btn('transparent', 'var(--primary)', 'var(--primary)')} onClick={() => openEdit(d)}>✏️ Edit</button>
                                    <button style={btn('var(--danger-l)', 'var(--danger)', 'var(--danger-l)')} onClick={() => setDel({ open: true, id: d.id, name: d.name })}>🗑️ Delete</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal open={modal.open} title={modal.editing ? `Edit — ${modal.editing.name}` : 'Add Division'} onClose={closeModal}>
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Semester *</label>
                            <select style={inp} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Division Name *</label>
                            <input style={inp} placeholder="e.g. 4CE-A" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Student Strength *</label>
                            <input style={inp} type="number" placeholder="e.g. 60" min={1} value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Shift</label>
                            <select style={inp} value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                                <option value="morning">Morning (8:30 AM - 2:30 PM)</option>
                                <option value="evening">Evening (11:40 AM - 5:30 PM)</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={closeModal}>Cancel</button>
                        <button type="submit" style={{ ...btn('var(--primary)', '#fff', 'var(--primary)'), padding: '.5rem 1.1rem' }}>💾 Save Division</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal open={delModal.open} title="Delete Division?" onClose={() => setDel({ open: false, id: null, name: '' })} maxWidth={400}>
                <p style={{ color: 'var(--text-2)', fontSize: '.93rem' }}>Remove <strong style={{ color: 'var(--text)' }}>{delModal.name}</strong> permanently?</p>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setDel({ open: false, id: null, name: '' })}>Cancel</button>
                    <button style={btn('var(--danger)', '#fff', 'var(--danger)')} onClick={handleDelete}>🗑️ Delete</button>
                </div>
            </Modal>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    )
}
