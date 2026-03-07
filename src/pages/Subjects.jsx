import { useState, useEffect, useCallback } from 'react'
import { getAllUniqueSubjects, getSubjectTimetable, PERIODS, DAYS, updateTimetableSlotGlobal } from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const btn = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .85rem',
    borderRadius: 10, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer',
    border: `2px solid ${border}`, background: bg, color, fontFamily: 'inherit'
})

export default function Subjects() {
    const [subjects, setSubjects] = useState([])
    const [search, setSearch] = useState('')
    const [schedModal, setSched] = useState({ open: false, subject: null, data: null })
    const [editSlot, setEditSlot] = useState(null)
    const [toast, setToast] = useState(null)
    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }

    const load = useCallback(() => {
        setSubjects(getAllUniqueSubjects())
    }, [])

    useEffect(() => load(), [load])

    const filtered = subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.shortCode.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    )

    const viewSchedule = s => {
        const id = s.code || s.name
        const data = getSubjectTimetable(id)
        setSched({ open: true, subject: s, data })
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
            if (schedModal.subject) viewSchedule(schedModal.subject)
        } else {
            showToast('Failed to update slot.', 'error')
        }
    }

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface2)', outline: 'none' }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Subject-wise Timetables</h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '.93rem', marginTop: '.2rem' }}>View aggregated schedules across all divisions for each subject.</p>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .9rem', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--surface)' }}>
                    <span>🔍</span>
                    <input style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '.95rem', color: 'var(--text)' }}
                        placeholder="Search subjects by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface2)', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Subject Name</th>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Short Code</th>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Admin Code</th>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-3)' }}>No subjects found matching your search.</td></tr>
                        ) : filtered.map(s => (
                            <tr key={s.code || s.name} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
                                <td style={{ padding: '.8rem 1rem', fontWeight: 600 }}>{s.name}</td>
                                <td style={{ padding: '.8rem 1rem' }}>
                                    <span style={{ background: 'var(--primary-l)', color: 'var(--primary)', padding: '.2rem .6rem', borderRadius: 8, fontSize: '.78rem', fontWeight: 700 }}>{s.shortCode}</span>
                                </td>
                                <td style={{ padding: '.8rem 1rem', color: 'var(--text-2)', fontSize: '.85rem' }}>{s.code || '—'}</td>
                                <td style={{ padding: '.8rem 1rem' }}>
                                    <button style={btn('transparent', 'var(--primary)', 'var(--primary)')} onClick={() => viewSchedule(s)}>📅 View Schedule</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Schedule Modal */}
            <Modal open={schedModal.open} title={`Subject Schedule — ${schedModal.subject?.name}`} onClose={() => setSched({ open: false, subject: null, data: null })} maxWidth={1000}>
                {schedModal.data ? (
                    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
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
                                                    <td key={d} style={{ padding: '.3rem', borderRight: '1px solid var(--border)', height: 75, minWidth: 130 }}>
                                                        {slot ? (
                                                            <div
                                                                onClick={() => setEditSlot({ ...slot, day: d, period: p, subject: schedModal.subject?.shortCode || schedModal.subject?.name, room: slot.room || slot.batches?.[0]?.room, faculty: slot.faculty || slot.batches?.[0]?.faculty, batch: slot.batches?.[0]?.name })}
                                                                style={{
                                                                    background: isLab ? 'var(--info-l)' : 'var(--primary-l)',
                                                                    color: isLab ? 'var(--info)' : 'var(--primary)',
                                                                    padding: '.4rem .5rem', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${isLab ? 'var(--info)' : 'var(--primary)'}`, cursor: 'pointer', transition: 'transform 0.1s'
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                                            >
                                                                <div style={{ fontWeight: 800 }}>{slot.division}</div>
                                                                {isLab && slot.batches ? (
                                                                    <div style={{ fontSize: '.62rem', fontWeight: 600 }}>
                                                                        {slot.batches.map(b => `${b.name} (${b.room})`).join(', ')}
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ fontSize: '.68rem', fontWeight: 600 }}>📍 {slot.room}</div>
                                                                )}
                                                                <div style={{ fontSize: '.65rem', marginTop: '.1rem', opacity: 0.8 }}>👨‍🏫 {slot.faculty || slot.batches?.map(b => b.faculty).join('/')}</div>
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
                ) : <p>Loading subject schedule...</p>}
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={() => setSched({ open: false, subject: null, data: null })}>Close</button>
                    <button style={{ ...btn('var(--primary)', '#fff', 'var(--primary)'), marginLeft: '.5rem' }} onClick={() => window.print()}>🖨️ Print View</button>
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
                            {editSlot.subject !== (schedModal.subject?.shortCode || schedModal.subject?.name) && (
                                <p style={{ fontSize: '.75rem', color: 'var(--warning)', marginTop: '.35rem' }}>⚠️ Changing this will move the slot to a different subject.</p>
                            )}
                        </div>
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Room *</label>
                            <input style={inp} required value={editSlot.room} onChange={e => setEditSlot({ ...editSlot, room: e.target.value })} />
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
