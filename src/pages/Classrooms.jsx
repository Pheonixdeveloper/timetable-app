import { useState, useEffect, useCallback } from 'react'
import { getClassrooms, setClassrooms, uid, getClassroomTimetable, PERIODS } from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const TYPE_OPTS = ['All', 'classroom', 'lab']
const TYPE_LABEL = { classroom: '🏫 Classroom', lab: '🧪 Lab' }
const TYPE_COLOR = { classroom: ['#eef0fd', '#4361ee'], lab: ['#d0f0fb', '#0096c7'] }

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
    const [form, setForm] = useState({ name: '', capacity: '', type: 'classroom' })

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }
    const load = useCallback(() => setRooms(getClassrooms()), [])
    useEffect(() => load(), [load])

    const openAdd = () => { setForm({ name: '', capacity: '', type: 'classroom' }); setModal({ open: true, editing: null }) }
    const openEdit = r => { setForm({ name: r.name, capacity: r.capacity, type: r.type || 'classroom' }); setModal({ open: true, editing: r }) }
    const closeModal = () => setModal({ open: false, editing: null })

    const handleSave = e => {
        e.preventDefault()
        const name = form.name.trim().toUpperCase()
        const capacity = parseInt(form.capacity, 10)
        if (!name) return showToast('Room name required.', 'error')
        if (!capacity || capacity < 1) return showToast('Enter valid capacity.', 'error')
        const all = getClassrooms()
        if (modal.editing) {
            setClassrooms(all.map(r => r.id === modal.editing.id ? { ...r, name, capacity, type: form.type } : r))
            showToast(`${name} updated.`, 'success')
        } else {
            if (all.find(r => r.name.toLowerCase() === name.toLowerCase())) return showToast('Room already exists.', 'error')
            setClassrooms([...all, { id: uid(), name, capacity, type: form.type }])
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

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #dce1ec', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: '#1a1d2e', background: '#eef1f8', outline: 'none' }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: '#eef0fd', color: '#4361ee', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>🏫 STEP 0</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Classroom & Lab Management</h1>
                    <p style={{ color: '#4a4e6a', fontSize: '.93rem', marginTop: '.2rem' }}>Define room locations, capacities, and type. All data persists locally.</p>
                </div>
                <button onClick={openAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #4361ee', background: '#4361ee', color: '#fff', fontFamily: 'inherit' }}>➕ Add Room</button>
            </div>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Rooms', val: allRooms.length, color: '#4361ee' },
                    { label: 'Classrooms', val: classroomRooms.length, color: '#4361ee' },
                    { label: 'Labs', val: labRooms.length, color: '#0096c7' },
                    { label: 'Total Capacity', val: totalCap, color: '#4361ee' },
                    { label: 'Largest Room', val: maxCap, color: '#2b9348' },
                    { label: 'Avg Capacity', val: avgCap, color: '#4a4e6a' },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '.75rem', color: '#8a8fa8', marginTop: '.1rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.45rem .85rem', border: '1.5px solid #dce1ec', borderRadius: 10, background: '#fff' }}>
                    <span>🔍</span>
                    <input style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', width: 160, fontSize: '.9rem' }}
                        placeholder="Search rooms…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {/* Type tab pills */}
                <div style={{ display: 'flex', gap: '.3rem', background: '#eef1f8', padding: '.3rem', borderRadius: 99 }}>
                    {TYPE_OPTS.map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            style={{
                                padding: '.3rem .85rem', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 500, transition: 'all .15s',
                                background: typeFilter === t ? '#4361ee' : 'transparent', color: typeFilter === t ? '#fff' : '#4a4e6a'
                            }}>
                            {t === 'All' ? 'All' : TYPE_LABEL[t]}
                        </button>
                    ))}
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '.85rem', color: '#4a4e6a' }}>{filtered.length} room{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#8a8fa8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
                    <p>No rooms found. Click <strong>Add Room</strong>.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '1.1rem' }}>
                    {filtered.map(r => {
                        const pct = Math.round((r.capacity / maxFiltered) * 100)
                        const rtype = r.type || 'classroom'
                        const [tagBg, tagColor] = TYPE_COLOR[rtype] || ['#eef0fd', '#4361ee']
                        return (
                            <div key={r.id}
                                style={{ background: '#fff', border: '1.5px solid #dce1ec', borderRadius: 16, padding: '1.15rem', transition: 'all .18s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = tagColor; e.currentTarget.style.boxShadow = `0 8px 32px ${tagColor}22` }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#dce1ec'; e.currentTarget.style.boxShadow = 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: tagColor }}>{rtype === 'lab' ? '🧪' : '🏫'} {r.name}</div>
                                    <span style={{ background: tagBg, color: tagColor, padding: '.2rem .55rem', borderRadius: 99, fontSize: '.72rem', fontWeight: 600 }}>
                                        {rtype === 'lab' ? 'Lab' : 'Classroom'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{r.capacity}</div>
                                <div style={{ fontSize: '.75rem', color: '#8a8fa8', marginBottom: '.5rem' }}>Max Seating Capacity</div>
                                <div style={{ background: '#eef1f8', borderRadius: 99, height: 5, overflow: 'hidden', marginBottom: '.75rem' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: tagColor, transition: 'width .4s' }} />
                                </div>
                                <div style={{ fontSize: '.78rem', color: '#8a8fa8', marginBottom: '.65rem' }}>
                                    {pct >= 80 ? '🔴 Large' : pct >= 50 ? '🟡 Medium' : '🟢 Small'} · {pct}% of max in view
                                </div>
                                <div style={{ display: 'flex', gap: '.5rem' }}>
                                    <button style={btn('transparent', tagColor, tagColor)} onClick={() => viewSchedule(r)}>📅 View</button>
                                    <button style={btn('transparent', tagColor, tagColor)} onClick={() => openEdit(r)}>✏️ Edit</button>
                                    <button style={btn('#fde8e8', '#d62828', '#fde8e8')} onClick={() => setDel({ open: true, id: r.id, name: r.name })}>🗑️ Delete</button>
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
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: '#4a4e6a' }}>Room Name *</label>
                            <input style={inp} placeholder="e.g. 1NB210" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: '#4a4e6a' }}>Capacity *</label>
                            <input style={inp} type="number" placeholder="e.g. 80" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.5rem', color: '#4a4e6a' }}>Room Type *</label>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            {['classroom', 'lab'].map(t => (
                                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                                    style={{
                                        flex: 1, padding: '.55rem .85rem', borderRadius: 10, fontSize: '.87rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                        border: `2px solid ${form.type === t ? TYPE_COLOR[t][1] : '#dce1ec'}`,
                                        background: form.type === t ? TYPE_COLOR[t][0] : 'transparent',
                                        color: form.type === t ? TYPE_COLOR[t][1] : '#4a4e6a', transition: 'all .15s'
                                    }}>
                                    {TYPE_LABEL[t]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #dce1ec', background: 'transparent', color: '#4a4e6a', fontFamily: 'inherit' }} onClick={closeModal}>Cancel</button>
                        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #4361ee', background: '#4361ee', color: '#fff', fontFamily: 'inherit' }}>💾 Save Room</button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal open={delModal.open} title="Delete Room?" onClose={() => setDel({ open: false, id: null, name: '' })} maxWidth={400}>
                <p style={{ color: '#4a4e6a', fontSize: '.93rem' }}>Remove <strong>{delModal.name}</strong> permanently?</p>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button style={btn('transparent', '#4a4e6a', '#dce1ec')} onClick={() => setDel({ open: false, id: null, name: '' })}>Cancel</button>
                    <button style={btn('#d62828', '#fff', '#d62828')} onClick={handleDelete}>🗑️ Delete</button>
                </div>
            </Modal>

            {/* Schedule Modal */}
            <Modal open={schedModal.open} title={`Room Schedule — ${schedModal.room?.name}`} onClose={() => setSched({ open: false, room: null, data: null })} maxWidth={1000}>
                {schedModal.data ? (
                    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #dce1ec' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: '#eef1f8', padding: '.6rem', borderBottom: '2px solid #dce1ec', borderRight: '1px solid #dce1ec' }}>Time</th>
                                    {schedModal.data.days.map(d => (
                                        <th key={d} style={{ background: '#eef1f8', padding: '.6rem', borderBottom: '2px solid #dce1ec', borderRight: '1px solid #dce1ec', color: '#4361ee', fontWeight: 700 }}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
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
                                        <tr key={p} style={{ borderBottom: '1px solid #dce1ec' }}>
                                            <td style={{ padding: '.6rem', fontWeight: 600, background: '#f8f9fa', borderRight: '1px solid #dce1ec', whiteSpace: 'nowrap' }}>{p}</td>
                                            {schedModal.data.days.map(d => {
                                                const slot = schedModal.data.grid[d]?.[p]
                                                const isLab = slot?.type === 'lab'
                                                return (
                                                    <td key={d} style={{ padding: '.3rem', borderRight: '1px solid #dce1ec', height: 60, minWidth: 120 }}>
                                                        {slot ? (
                                                            <div style={{
                                                                background: isLab ? '#ede9fe' : '#dbeafe',
                                                                color: isLab ? '#5b21b6' : '#1e40af',
                                                                padding: '.4rem .5rem', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${isLab ? '#5b21b630' : '#1e40af30'}`
                                                            }}>
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
                                                            <div style={{ color: '#dce1ec', textAlign: 'center' }}>—</div>
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
                ) : <p>Generating room schedule...</p>}
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button style={btn('transparent', '#4a4e6a', '#dce1ec')} onClick={() => setSched({ open: false, room: null, data: null })}>Close</button>
                    <button style={{ ...btn('#4361ee', '#fff', '#4361ee'), marginLeft: '.5rem' }} onClick={() => window.print()}>🖨️ Print Room Schedule</button>
                </div>
            </Modal>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    )
}
