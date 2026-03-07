import { useState, useEffect, useCallback } from 'react'
import { getClassrooms, setClassrooms, uid, getClassroomTimetable, PERIODS, updateTimetableSlotGlobal, getDepartments } from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const TYPE_OPTS = ['All', 'classroom', 'lab']
const TYPE_LABEL = { classroom: '🏫 Classroom', lab: '🧪 Lab' }
const TYPE_COLOR = { classroom: ['var(--primary-l)', 'var(--primary)'], lab: ['var(--info-l)', 'var(--info)'] }

const btn = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .75rem',
    borderRadius: 10, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer',
    border: `2px solid ${border}`, background: bg, color, fontFamily: 'inherit'
})

export default function Classrooms() {
    const [rooms, setRooms] = useState([])
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('All')
    const [toast, setToast] = useState(null)
    const [modal, setModal] = useState({ open: false, editing: null })
    const [delModal, setDel] = useState({ open: false, id: null, name: '' })
    const [schedModal, setSched] = useState({ open: false, room: null, data: null })
    const [form, setForm] = useState({ name: '', capacity: '', type: 'classroom', department: '' })
    const [editSlot, setEditSlot] = useState(null)
    const [printJob, setPrintJob] = useState(null)

    useEffect(() => {
        if (printJob) {
            const timer = setTimeout(() => {
                window.print()
                setTimeout(() => setPrintJob(null), 100)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [printJob])

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }
    const load = useCallback(() => setRooms(getClassrooms()), [])
    useEffect(() => load(), [load])

    const openAdd = () => {
        const depts = getDepartments()
        setForm({ name: '', capacity: '', type: 'classroom', department: depts[0] || '' });
        setModal({ open: true, editing: null })
    }
    const openEdit = r => {
        const depts = getDepartments()
        setForm({ name: r.name, capacity: r.capacity, type: r.type || 'classroom', department: r.department || depts[0] || '' });
        setModal({ open: true, editing: r })
    }
    const closeModal = () => setModal({ open: false, editing: null })

    const handleSave = e => {
        e.preventDefault()
        const name = form.name.trim().toUpperCase()
        const capacity = parseInt(form.capacity, 10)
        const department = form.department
        if (!name) return showToast('Room name required.', 'error')
        if (!department) return showToast('Department is required.', 'error')
        if (!capacity || capacity < 1) return showToast('Enter valid capacity.', 'error')
        const all = getClassrooms()
        if (modal.editing) {
            setClassrooms(all.map(r => r.id === modal.editing.id ? { ...r, name, capacity, type: form.type, department } : r))
            showToast(`${name} updated.`, 'success')
        } else {
            if (all.find(r => r.name.toLowerCase() === name.toLowerCase())) return showToast('Room already exists.', 'error')
            setClassrooms([...all, { id: uid(), name, capacity, type: form.type, department }])
            showToast(`${name} added.`, 'success')
        }
        load(); closeModal()
    }

    const handleDelete = () => {
        setClassrooms(getClassrooms().filter(r => r.id !== delModal.id))
        showToast('Room deleted.', 'info'); setDel({ open: false, id: null, name: '' }); load()
    }

    const viewSchedule = r => {
        const data = getClassroomTimetable(r.name)
        setSched({ open: true, room: r, data })
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
            if (schedModal.room) viewSchedule(schedModal.room)
        } else {
            showToast('Failed to update slot.', 'error')
        }
    }

    // Stats
    const allRooms = rooms
    const classroomRooms = rooms.filter(r => (r.type || 'classroom') === 'classroom')
    const labRooms = rooms.filter(r => r.type === 'lab')
    const totalCap = allRooms.reduce((s, r) => s + r.capacity, 0)
    const maxCap = allRooms.length ? Math.max(...allRooms.map(r => r.capacity)) : 0
    const avgCap = allRooms.length ? Math.round(totalCap / allRooms.length) : 0

    const filtered = rooms
        .filter(r => typeFilter === 'All' || (r.type || 'classroom') === typeFilter)
        .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

    const maxFiltered = filtered.length ? Math.max(...filtered.map(r => r.capacity)) : 1

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface2)', outline: 'none' }

    // --- SHARED TIMETABLE RENDERER FOR PRINT & UI ---
    const renderTimetableTable = (roomInfo, schedData, onEdit = null) => {
        if (!schedData) return <p>No data...</p>
        const allPeriods = [...schedData.periods].sort((a, b) => {
            const toMin = t => {
                const part = t.split('-')[0] || '0:0'
                let [h, m] = part.split(':').map(Number)
                if (h < 9) h += 12
                return h * 60 + m
            }
            return toMin(a) - toMin(b)
        })

        return (
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)', background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                    <thead>
                        <tr>
                            <th style={{ background: 'var(--surface2)', padding: '.6rem', borderBottom: '2px solid var(--border)', borderRight: '1px solid var(--border)' }}>Time</th>
                            {schedData.days.map(d => (
                                <th key={d} style={{ background: 'var(--surface2)', padding: '.6rem', borderBottom: '2px solid var(--border)', borderRight: '1px solid var(--border)', color: 'var(--primary)', fontWeight: 700 }}>{d}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allPeriods.map(p => (
                            <tr key={p} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '.6rem', fontWeight: 600, background: 'var(--surface2)', color: 'var(--text)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{p}</td>
                                {schedData.days.map(d => {
                                    const slot = schedData.grid[d]?.[p]
                                    const isLab = slot?.type === 'lab'
                                    return (
                                        <td key={d} style={{ padding: '.3rem', borderRight: '1px solid var(--border)', height: 60, minWidth: 120 }}>
                                            {slot ? (
                                                <div
                                                    onClick={() => onEdit ? onEdit({ ...slot, day: d, period: p, room: roomInfo.name, faculty: slot.faculty || slot.batches?.[0]?.faculty, batch: slot.batches?.[0]?.name }) : null}
                                                    className={onEdit ? '' : 'slot-card-print'}
                                                    style={{
                                                        background: isLab ? 'var(--info-l)' : 'var(--primary-l)',
                                                        color: isLab ? 'var(--info)' : 'var(--primary)',
                                                        padding: '.4rem .5rem', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                                                        border: onEdit ? `1px solid ${isLab ? 'var(--info)' : 'var(--primary)'}` : 'none',
                                                        cursor: onEdit ? 'pointer' : 'default', transition: 'transform 0.1s'
                                                    }}
                                                    onMouseEnter={e => onEdit && (e.currentTarget.style.transform = 'scale(0.98)')}
                                                    onMouseLeave={e => onEdit && (e.currentTarget.style.transform = 'none')}
                                                >
                                                    <div style={{ fontWeight: 800 }}>{slot.subject}</div>
                                                    <div style={{ fontSize: '.68rem', fontWeight: 600, opacity: 0.9 }}>
                                                        {slot.division}
                                                    </div>
                                                    {isLab && slot.batches ? (
                                                        <div style={{ fontSize: '.62rem', opacity: 0.8 }}>
                                                            {slot.batches.map(b => b.name).join(', ')}
                                                        </div>
                                                    ) : null}
                                                    <div style={{ fontSize: '.65rem', marginTop: '.1rem' }}>👨‍🏫 {slot.faculty || slot.batches?.map(b => b.faculty).join('/')}</div>
                                                </div>
                                            ) : (
                                                <div style={{ color: 'var(--border)', textAlign: 'center' }}>—</div>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // --- PRINT RENDER MODE ---
    if (printJob) {
        return (
            <div style={{ background: '#fff', minHeight: '100vh', width: '100%', padding: '0px' }}>
                {(printJob.mode === 'single' ? [printJob.data] : printJob.data).map((room, idx, arr) => {
                    const schedData = getClassroomTimetable(room.name)

                    const counts = {}
                    let total = 0
                    if (schedData) {
                        schedData.periods.forEach(p => {
                            schedData.days.forEach(d => {
                                const slot = schedData.grid[d]?.[p]
                                if (slot && slot.type !== 'break' && slot.type !== 'empty') {
                                    counts[slot.subject] = (counts[slot.subject] || 0) + 1
                                    total++
                                }
                            })
                        })
                    }

                    return (
                        <div key={room.id} className="print-container" style={{ margin: '0 auto', padding: '10px 20px', pageBreakAfter: idx === arr.length - 1 ? 'auto' : 'always' }}>
                            <div className="print-header show-print">
                                <img src="/logo.png" alt="Ganpat University" style={{ height: 65, objectFit: 'contain' }} />
                                <div className="print-header-center">
                                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Faculty of Engineering &amp; Technology</div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Computer Engineering/Information Technology (A.Y. 2025-2026 Even Sem)</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>
                                        Time table w.e.f. ____________
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '2px', letterSpacing: '0.05em' }}>
                                        {room.name}
                                    </div>
                                </div>
                                <div style={{ width: 240 }}></div>
                            </div>

                            <div className="print-layout">
                                <div className="print-main-table">
                                    {renderTimetableTable(room, schedData, null)}
                                </div>
                                <div className="print-summary-table-container">
                                    <table className="print-summary-table">
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(counts).map(([sub, count]) => (
                                                <tr key={sub}>
                                                    <td>{sub}</td>
                                                    <td style={{ textAlign: 'center' }}>{count}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td style={{ fontWeight: 'bold' }}>Total</td>
                                                <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{total}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="print-footer">
                                <div className="print-footer-sig">Sign of TimeTable Coordinator</div>
                                <div className="print-footer-sig">Sign of HOD</div>
                                <div className="print-footer-sig">Sign of Principal</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'var(--primary-l)', color: 'var(--primary)', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>🏫 STEP 0</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Classroom & Lab Management</h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '.93rem', marginTop: '.2rem' }}>Define room locations, capacities, and type. All data persists locally.</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setPrintJob({ mode: 'bulk', data: filtered })} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--text-2)', background: 'transparent', color: 'var(--text)', fontFamily: 'inherit' }}>
                        🖨️ Export All {filtered.length} (PDF)
                    </button>
                    <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }}>
                        ➕ Add Room
                    </button>
                </div>
            </div>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Rooms', val: allRooms.length, color: 'var(--primary)' },
                    { label: 'Classrooms', val: classroomRooms.length, color: 'var(--primary)' },
                    { label: 'Labs', val: labRooms.length, color: 'var(--info)' },
                    { label: 'Total Capacity', val: totalCap, color: 'var(--primary)' },
                    { label: 'Largest Room', val: maxCap, color: 'var(--success)' },
                    { label: 'Avg Capacity', val: avgCap, color: 'var(--text-2)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem', transition: 'background .2s, border-color .2s' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '.1rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface)', transition: 'background .2s, border-color .2s' }}>
                    <span>🔍</span>
                    <input style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', width: 160, fontSize: '.9rem', color: 'var(--text)' }}
                        placeholder="Search rooms…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {/* Type tab pills */}
                <div style={{ display: 'flex', gap: '.3rem', background: 'var(--surface2)', padding: '.3rem', borderRadius: 99, transition: 'background .2s' }}>
                    {TYPE_OPTS.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            style={{
                                padding: '.3rem .85rem', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 500, transition: 'all .15s',
                                background: typeFilter === t ? 'var(--primary)' : 'transparent', color: typeFilter === t ? '#fff' : 'var(--text-2)'
                            }}>
                            {t === 'All' ? 'All' : TYPE_LABEL[t]}
                        </button>
                    ))}
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '.85rem', color: 'var(--text-2)' }}>{filtered.length} room{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
                    <p>No rooms found. Click <strong style={{ color: 'var(--text)' }}>Add Room</strong>.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1.1rem' }}>
                    {filtered.map(r => {
                        const pct = Math.round((r.capacity / maxFiltered) * 100)
                        const rtype = r.type || 'classroom'
                        const [tagBg, tagColor] = TYPE_COLOR[rtype] || ['var(--primary-l)', 'var(--primary)']
                        return (
                            <div key={r.id}
                                style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '1.15rem', transition: 'all .18s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = tagColor; e.currentTarget.style.boxShadow = `var(--shadow)` }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: tagColor }}>{rtype === 'lab' ? '🧪' : '🏫'} {r.name}</div>
                                    <span style={{ background: tagBg, color: tagColor, padding: '.2rem .55rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 600 }}>
                                        {rtype === 'lab' ? 'Lab' : 'Classroom'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '.8rem', color: 'var(--text-3)', marginBottom: '.6rem', fontWeight: 600 }}>🏛️ {r.department || 'Computer Engineering'}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{r.capacity}</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: '.5rem' }}>Max Seating Capacity</div>
                                <div style={{ background: 'var(--surface2)', borderRadius: 99, height: 5, overflow: 'hidden', marginBottom: '.75rem' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: tagColor, transition: 'width .4s' }} />
                                </div>
                                <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: '.65rem' }}>
                                    {pct >= 80 ? '🔴 Large' : pct >= 50 ? '🟡 Medium' : '🟢 Small'} · {pct}% of max in view
                                </div>
                                <div style={{ display: 'flex', gap: '.5rem' }}>
                                    <button style={btn('transparent', tagColor, tagColor)} onClick={() => viewSchedule(r)}>📅 View</button>
                                    <button style={btn('transparent', tagColor, tagColor)} onClick={() => openEdit(r)}>✏️ Edit</button>
                                    <button style={btn('var(--danger-l)', 'var(--danger)', 'var(--danger-l)')} onClick={() => setDel({ open: true, id: r.id, name: r.name })}>🗑️ Delete</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal open={modal.open} title={modal.editing ? `Edit — ${modal.editing.name}` : 'Add Room'} onClose={closeModal}>
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Room Name *</label>
                            <input style={inp} placeholder="e.g. 1NB210" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Capacity *</label>
                            <input style={inp} type="number" placeholder="e.g. 80" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Department *</label>
                        <select style={inp} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                            {getDepartments().map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.5rem', color: 'var(--text-2)' }}>Room Type *</label>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            {['classroom', 'lab'].map(t => (
                                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                                    style={{
                                        flex: 1, padding: '.55rem .85rem', borderRadius: 10, fontSize: '.87rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                        border: `2px solid ${form.type === t ? TYPE_COLOR[t][1] : 'var(--border)'}`,
                                        background: form.type === t ? TYPE_COLOR[t][0] : 'transparent',
                                        color: form.type === t ? TYPE_COLOR[t][1] : 'var(--text-2)', transition: 'all .15s'
                                    }}>
                                    {TYPE_LABEL[t]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'inherit' }} onClick={closeModal}>Cancel</button>
                        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }}>💾 Save Room</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal open={delModal.open} title="Delete Room?" onClose={() => setDel({ open: false, id: null, name: '' })} maxWidth={400}>
                <p style={{ color: 'var(--text-2)', fontSize: '.93rem' }}>Remove <strong style={{ color: 'var(--text)' }}>{delModal.name}</strong> permanently?</p>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setDel({ open: false, id: null, name: '' })}>Cancel</button>
                    <button style={btn('var(--danger)', '#fff', 'var(--danger)')} onClick={handleDelete}>🗑️ Delete</button>
                </div>
            </Modal>

            {/* Schedule Modal */}
            <Modal open={schedModal.open} title={`Room Schedule — ${schedModal.room?.name}`} onClose={() => setSched({ open: false, room: null, data: null })} maxWidth={1000}>
                {schedModal.data ? renderTimetableTable(schedModal.room, schedModal.data, setEditSlot) : <p>Generating room schedule...</p>}
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setSched({ open: false, room: null, data: null })}>Close</button>
                    <button style={{ ...btn('var(--primary)', '#fff', 'var(--primary)'), marginLeft: '.5rem' }} onClick={() => { setSched({ open: false, room: null, data: null }); setPrintJob({ mode: 'single', data: schedModal.room }) }}>🖨️ Export PDF</button>
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
                            {editSlot.room !== schedModal.room?.name && (
                                <p style={{ fontSize: '.75rem', color: 'var(--warning)', marginTop: '.35rem' }}>⚠️ Changing this will move the slot to a different room.</p>
                            )}
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Faculty Code *</label>
                            <input style={inp} required value={editSlot.faculty} onChange={e => setEditSlot({ ...editSlot, faculty: e.target.value })} />
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
