import { useState, useEffect, useCallback } from 'react'
import { getFaculty, setFaculty, uid, FACULTY_ROLES, FACULTY_DEPTS, getAllUniqueSubjects, getFacultyTimetable, PERIODS, updateTimetableSlotGlobal } from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const ROLE_COLORS = {
    Professor: ['var(--primary-l)', 'var(--primary)'],
    Doctor: ['var(--success-l)', 'var(--success)'],
    TA: ['var(--warning-l)', 'var(--warning)'],
    Visiting: ['var(--accent-l, #f3e8ff)', 'var(--accent, #7209b7)'],
    Expert: ['var(--danger-l, #fde8e2)', 'var(--danger-d, #e76f51)'],
}

const btn = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .75rem',
    borderRadius: 10, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
    border: `2px solid ${border}`, background: bg, color, fontFamily: 'inherit'
})

export default function Faculty() {
    const [faculty, setFacState] = useState([])
    const [allSubjects, setAllSubjects] = useState([])
    const [search, setSearch] = useState('')
    const [deptFilter, setDept] = useState('All')
    const [roleFilter, setRole] = useState('All')
    const [toast, setToast] = useState(null)
    const [modal, setModal] = useState({ open: false, editing: null })
    const [delModal, setDel] = useState({ open: false, id: null, name: '' })
    const [schedModal, setSched] = useState({ open: false, faculty: null, data: null })
    const [form, setForm] = useState({ name: '', code: '', dept: 'Computer Engineering/IT', role: 'Professor', assignedSubjects: [] })
    const [customSub, setCustomSub] = useState('')
    const [editSlot, setEditSlot] = useState(null)

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }
    const loadFac = useCallback(() => setFacState(getFaculty()), [])
    const loadSubs = useCallback(() => setAllSubjects(getAllUniqueSubjects()), [])

    useEffect(() => { loadFac(); loadSubs(); }, [loadFac, loadSubs])

    const openAdd = () => {
        setForm({ name: '', code: '', dept: 'Computer Engineering/IT', role: 'Professor', assignedSubjects: [] })
        setModal({ open: true, editing: null })
    }
    const openEdit = f => {
        setForm({ name: f.name, code: f.code, dept: f.dept, role: f.role, assignedSubjects: f.assignedSubjects || [] })
        setModal({ open: true, editing: f })
    }
    const closeModal = () => setModal({ open: false, editing: null })

    const handleSave = e => {
        e.preventDefault()
        const name = form.name.trim(), code = form.code.trim().toUpperCase()
        if (!name) return showToast('Name is required.', 'error')
        if (!code) return showToast('Short code is required.', 'error')
        const all = getFaculty()
        const facData = {
            name,
            code,
            dept: form.dept,
            role: form.role,
            assignedSubjects: form.assignedSubjects
        }

        if (modal.editing) {
            setFaculty(all.map(f => f.id === modal.editing.id ? { ...f, ...facData } : f))
            showToast(`${name} updated.`, 'success')
        } else {
            setFaculty([...all, { id: uid(), ...facData }])
            showToast(`${name} added.`, 'success')
        }
        loadFac(); closeModal()
    }

    const toggleSubject = (subId) => {
        setForm(f => {
            const current = f.assignedSubjects || []
            const next = current.includes(subId) ? current.filter(id => id !== subId) : [...current, subId]
            return { ...f, assignedSubjects: next }
        })
    }

    const addCustomSub = () => {
        const val = customSub.trim()
        if (!val) return
        setForm(f => {
            const current = f.assignedSubjects || []
            if (current.includes(val)) return f
            return { ...f, assignedSubjects: [...current, val] }
        })
        setCustomSub('')
    }

    const handleDelete = () => {
        setFaculty(getFaculty().filter(f => f.id !== delModal.id))
        showToast('Faculty deleted.', 'info'); setDel({ open: false, id: null, name: '' }); loadFac()
    }

    const viewSchedule = f => {
        const data = getFacultyTimetable(f.code)
        // If data is empty (no slots found), we still show the grid
        setSched({ open: true, faculty: f, data })
    }

    const handleSlotUpdate = e => {
        e.preventDefault()
        if (!editSlot) return
        const { day, period, division, semester, batch, subject, room, faculty } = editSlot
        const data = { subject, room, faculty }
        const isBatchEdit = !!batch
        const batchIndex = isBatchEdit ? parseInt(batch) - 1 : undefined

        const success = updateTimetableSlotGlobal(division, semester, day, period, { isBatchEdit, batchIndex, data })
        if (success) {
            showToast('Slot updated globally.', 'success')
            setEditSlot(null)
            if (schedModal.faculty) viewSchedule(schedModal.faculty)
        } else {
            showToast('Failed to update slot.', 'error')
        }
    }

    // Filters
    const allDepts = ['All', ...FACULTY_DEPTS]
    const allRoles = ['All', ...FACULTY_ROLES]
    const filtered = faculty
        .filter(f => deptFilter === 'All' || f.dept === deptFilter)
        .filter(f => roleFilter === 'All' || f.role === roleFilter)
        .filter(f => {
            const q = search.toLowerCase()
            return f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)
        })

    const roleCounts = {}
    faculty.forEach(f => { roleCounts[f.role] = (roleCounts[f.role] || 0) + 1 })

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface2)', outline: 'none' }

    return (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem 4rem' }} className="page-wrapper">

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'var(--info-l)', color: 'var(--info)', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>👨‍🏫 FACULTY</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Faculty Management</h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '.93rem', marginTop: '.2rem' }}>
                        All {faculty.length} faculty members across Computer Engineering/IT and supporting departments.
                    </p>
                </div>
                <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }}>
                    ➕ Add Faculty
                </button>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                    { label: 'Total Faculty', val: faculty.length, color: 'var(--primary)' },
                    { label: 'Professors', val: roleCounts['Professor'] || 0, color: 'var(--primary)' },
                    { label: 'Doctors', val: roleCounts['Doctor'] || 0, color: 'var(--success)' },
                    { label: 'Teaching Asst', val: roleCounts['TA'] || 0, color: 'var(--warning)' },
                    { label: 'Visiting', val: roleCounts['Visiting'] || 0, color: 'var(--accent, #7209b7)' },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem', transition: 'background .2s, border-color .2s' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '.1rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface)', transition: 'background .2s, border-color .2s' }}>
                    <span>🔍</span>
                    <input style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', width: 200, fontSize: '.9rem', color: 'var(--text)' }}
                        placeholder="Search name or code…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select style={{ padding: '.45rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--text)', transition: 'background .2s, border-color .2s' }}
                    value={deptFilter} onChange={e => setDept(e.target.value)}>
                    {allDepts.map(d => <option key={d} value={d}>{d === 'All' ? '🏛️ All Departments' : d}</option>)}
                </select>
                <select style={{ padding: '.45rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', background: 'var(--surface)', color: 'var(--text)', transition: 'background .2s, border-color .2s' }}
                    value={roleFilter} onChange={e => setRole(e.target.value)}>
                    {allRoles.map(r => <option key={r} value={r}>{r === 'All' ? '👤 All Roles' : r}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: '.85rem', color: 'var(--text-2)' }}>
                    {filtered.length} of {faculty.length} faculty
                </span>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
                    <p>No faculty found matching your search.</p>
                </div>
            ) : (
                <div className="table-container" style={{ borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
                        <thead>
                            <tr>
                                {['#', 'Name', 'Code', 'Department', 'Role', 'Assigned Subjects', 'Actions'].map(h => (
                                    <th key={h} style={{ background: 'var(--surface2)', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((f, i) => {
                                const [bg, color] = ROLE_COLORS[f.role] || ['var(--surface2)', 'var(--text-2)']
                                const subjects = f.assignedSubjects || []
                                return (
                                    <tr key={f.id} className="faculty-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
                                        <td style={{ padding: '.7rem 1rem', color: 'var(--text-3)', fontSize: '.8rem' }}>{i + 1}</td>
                                        <td style={{ padding: '.7rem 1rem', fontWeight: 600 }}>{f.name}</td>
                                        <td style={{ padding: '.7rem 1rem' }}>
                                            <code style={{ background: 'var(--surface2)', color: 'var(--primary)', padding: '.15rem .5rem', borderRadius: 6, fontSize: '.82rem', fontWeight: 700, fontFamily: 'monospace' }}>{f.code}</code>
                                        </td>
                                        <td style={{ padding: '.7rem 1rem', color: 'var(--text-2)', fontSize: '.85rem' }}>{f.dept}</td>
                                        <td style={{ padding: '.7rem 1rem' }}>
                                            <span style={{ background: bg, color, padding: '.2rem .6rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 600 }}>{f.role}</span>
                                        </td>
                                        <td style={{ padding: '.7rem 1rem', minWidth: 200 }}>
                                            <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>
                                                {subjects.length > 0 ? subjects.map(s => (
                                                    <span key={s} style={{ background: 'var(--surface2)', color: 'var(--text-2)', padding: '.15rem .45rem', borderRadius: 6, fontSize: '.7rem', fontWeight: 600 }}>{s}</span>
                                                )) : <span style={{ color: 'var(--text-3)', fontSize: '.75rem', fontStyle: 'italic' }}>None</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '.7rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '.4rem' }}>
                                                <button style={btn('transparent', 'var(--success)', 'var(--success)')} onClick={() => viewSchedule(f)}>📅 View</button>
                                                <button style={btn('transparent', 'var(--primary)', 'var(--primary)')} onClick={() => openEdit(f)}>✏️ Edit</button>
                                                <button style={btn('var(--danger-l)', 'var(--danger)', 'var(--danger-l)')} onClick={() => setDel({ open: true, id: f.id, name: f.name })}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal open={modal.open} title={modal.editing ? `Edit — ${modal.editing.name}` : 'Add Faculty'} onClose={closeModal} maxWidth={600}>
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Full Name *</label>
                            <input style={inp} placeholder="e.g. Prof. Hiten Sadani" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Short Code *</label>
                            <input style={inp} placeholder="e.g. HMS" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Role</label>
                            <select style={inp} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                {FACULTY_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Department</label>
                        <select style={inp} value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}>
                            {FACULTY_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.75rem', color: 'var(--text-2)' }}>Assign Subjects</label>

                        {/* Custom Subject Input */}
                        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.75rem' }}>
                            <input
                                style={{ ...inp, flex: 1, padding: '.45rem .75rem' }}
                                placeholder="Type subject name..."
                                value={customSub}
                                onChange={e => setCustomSub(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSub())}
                            />
                            <button
                                type="button"
                                onClick={addCustomSub}
                                style={{ padding: '.45rem 1rem', borderRadius: 10, background: 'var(--primary)', color: '#fff', border: 'none', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Add
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.5rem', maxHeight: 200, overflowY: 'auto', padding: '.75rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
                            {allSubjects.map(s => {
                                const subId = s.shortCode || s.name
                                const isSelected = (form.assignedSubjects || []).includes(subId)
                                return (
                                    <div key={subId} onClick={() => toggleSubject(subId)} style={{
                                        display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .6rem', borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                                        background: isSelected ? 'var(--primary)' : 'var(--surface2)',
                                        color: isSelected ? '#fff' : 'var(--text-2)',
                                        fontSize: '.75rem', fontWeight: 600, border: '1px solid', borderColor: isSelected ? 'var(--primary)' : 'var(--border)'
                                    }}>
                                        <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.name}>{subId}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'inherit' }} onClick={closeModal}>Cancel</button>
                        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }}>💾 Save</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal open={delModal.open} title="Delete Faculty?" onClose={() => setDel({ open: false, id: null, name: '' })} maxWidth={400}>
                <p style={{ color: 'var(--text-2)', fontSize: '.93rem' }}>Remove <strong style={{ color: 'var(--text)' }}>{delModal.name}</strong> permanently?</p>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setDel({ open: false, id: null, name: '' })}>Cancel</button>
                    <button style={btn('var(--danger)', '#fff', 'var(--danger)')} onClick={handleDelete}>🗑️ Delete</button>
                </div>
            </Modal>

            {/* Schedule Modal */}
            <Modal open={schedModal.open} title={`Weekly Schedule — ${schedModal.faculty?.name}`} onClose={() => setSched({ open: false, faculty: null, data: null })} maxWidth={1000}>
                {schedModal.data ? (
                    <div className="table-container" style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: 'var(--surface2)', padding: '.6rem', borderBottom: '2px solid var(--border)', borderRight: '1px solid var(--border)' }}>Time</th>
                                    {schedModal.data.days.map(d => (
                                        <th key={d} style={{ background: 'var(--surface2)', padding: '.6rem', borderBottom: '2px solid var(--border)', borderRight: '1px solid var(--border)', color: 'var(--primary)', fontWeight: 700 }}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    // Sort periods like in Timetable.jsx
                                    const allPeriods = [...schedModal.data.periods].sort((a, b) => {
                                        const toMin = t => {
                                            const part = t.split('-')[0] || '0:0'
                                            let [h, m] = part.split(':').map(Number)
                                            if (h < 9) h += 12
                                            return h * 60 + m
                                        }
                                        return toMin(a) - toMin(b)
                                    })
                                    return allPeriods.map(p => (
                                        <tr key={p} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '.6rem', fontWeight: 600, background: 'var(--surface2)', color: 'var(--text)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{p}</td>
                                            {schedModal.data.days.map(d => {
                                                const slot = schedModal.data.grid[d]?.[p]
                                                const isLab = slot?.type === 'lab'
                                                return (
                                                    <td key={d} style={{ padding: '.3rem', borderRight: '1px solid var(--border)', height: 60, minWidth: 120 }}>
                                                        {slot ? (
                                                            <div
                                                                onClick={() => setEditSlot({ ...slot, day: d, period: p, faculty: slot.faculty || schedModal.faculty?.code })}
                                                                style={{
                                                                    background: isLab ? 'var(--info-l)' : 'var(--primary-l)',
                                                                    color: isLab ? 'var(--info)' : 'var(--primary)',
                                                                    padding: '.4rem .5rem', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${isLab ? 'var(--info)' : 'var(--primary)'}`, cursor: 'pointer', transition: 'transform 0.1s'
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                                            >
                                                                <div style={{ fontWeight: 800 }}>{slot.subject}</div>
                                                                <div style={{ fontSize: '.68rem', fontWeight: 600, opacity: 0.9 }}>
                                                                    {slot.division} {slot.batch ? `(Batch ${slot.batch})` : ''}
                                                                </div>
                                                                <div style={{ fontSize: '.65rem', marginTop: '.1rem' }}>📍 {slot.room}</div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: 'var(--border)', textAlign: 'center' }}>—</div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))
                                })()}
                            </tbody>
                        </table>
                    </div>
                ) : <p>Generating schedule data...</p>}
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setSched({ open: false, faculty: null, data: null })}>Close</button>
                    <button style={{ ...btn('var(--primary)', '#fff', 'var(--primary)'), marginLeft: '.5rem' }} onClick={() => window.print()}>🖨️ Print Personal Schedule</button>
                </div>
            </Modal>

            {/* Edit Slot Modal */}
            <Modal open={!!editSlot} title="Edit Scheduled Slot" onClose={() => setEditSlot(null)} maxWidth={400}>
                {editSlot && (
                    <form onSubmit={handleSlotUpdate}>
                        <div style={{ marginBottom: '1.2rem', padding: '.75rem', background: 'var(--surface2)', borderRadius: 10 }}>
                            <p style={{ fontSize: '.85rem', color: 'var(--text-2)', marginBottom: '.25rem' }}><strong>Day:</strong> {editSlot.day} | <strong>Time:</strong> {editSlot.period}</p>
                            <p style={{ fontSize: '.85rem', color: 'var(--text-2)' }}><strong>Division:</strong> {editSlot.division} {editSlot.batch ? `(Batch ${editSlot.batch})` : ''} | <strong>Sem:</strong> {editSlot.semester}</p>
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Subject *</label>
                            <input style={inp} required value={editSlot.subject} onChange={e => setEditSlot({ ...editSlot, subject: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Room *</label>
                            <input style={inp} required value={editSlot.room} onChange={e => setEditSlot({ ...editSlot, room: e.target.value })} />
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Faculty Code *</label>
                            <input style={inp} required value={editSlot.faculty} onChange={e => setEditSlot({ ...editSlot, faculty: e.target.value })} />
                            {editSlot.faculty !== schedModal.faculty?.code && (
                                <p style={{ fontSize: '.75rem', color: 'var(--warning)', marginTop: '.35rem' }}>⚠️ Changing this will move the slot to the new faculty.</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            <button type="button" style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setEditSlot(null)}>Cancel</button>
                            <button type="submit" style={btn('var(--primary)', '#fff', 'var(--primary)')}>💾 Save Changes</button>
                        </div>
                    </form>
                )}
            </Modal>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    )
}
