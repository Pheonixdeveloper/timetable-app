import { useState, useEffect, useCallback } from 'react'
import { getAllUniqueSubjects, getSubjectTimetable, PERIODS, DAYS } from '../data'
import Modal from '../components/Modal'

const btn = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .85rem',
    borderRadius: 10, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer',
    border: `2px solid ${border}`, background: bg, color, fontFamily: 'inherit'
})

export default function Subjects() {
    const [subjects, setSubjects] = useState([])
    const [search, setSearch] = useState('')
    const [schedModal, setSched] = useState({ open: false, subject: null, data: null })

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

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #dce1ec', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: '#1a1d2e', background: '#f8f9fa', outline: 'none' }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Subject-wise Timetables</h1>
                    <p style={{ color: '#4a4e6a', fontSize: '.93rem', marginTop: '.2rem' }}>View aggregated schedules across all divisions for each subject.</p>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', maxWidth: 400 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .9rem', border: '1.5px solid #dce1ec', borderRadius: 12, background: '#fff' }}>
                    <span>🔍</span>
                    <input style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '.95rem' }}
                        placeholder="Search subjects by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fbb', textAlign: 'left', borderBottom: '2px solid #dce1ec' }}>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: '#8a8fa8', textTransform: 'uppercase' }}>Subject Name</th>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: '#8a8fa8', textTransform: 'uppercase' }}>Short Code</th>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: '#8a8fa8', textTransform: 'uppercase' }}>Admin Code</th>
                            <th style={{ padding: '1rem', fontSize: '.75rem', fontWeight: 700, color: '#8a8fa8', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: '#8a8fa8' }}>No subjects found matching your search.</td></tr>
                        ) : filtered.map(s => (
                            <tr key={s.code || s.name} style={{ borderBottom: '1px solid #dce1ec', transition: 'background .15s' }}>
                                <td style={{ padding: '.8rem 1rem', fontWeight: 600 }}>{s.name}</td>
                                <td style={{ padding: '.8rem 1rem' }}>
                                    <span style={{ background: '#eef0fd', color: '#4361ee', padding: '.2rem .6rem', borderRadius: 8, fontSize: '.78rem', fontWeight: 700 }}>{s.shortCode}</span>
                                </td>
                                <td style={{ padding: '.8rem 1rem', color: '#4a4e6a', fontSize: '.85rem' }}>{s.code || '—'}</td>
                                <td style={{ padding: '.8rem 1rem' }}>
                                    <button style={btn('transparent', '#4361ee', '#4361ee')} onClick={() => viewSchedule(s)}>📅 View Schedule</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Schedule Modal */}
            <Modal open={schedModal.open} title={`Subject Schedule — ${schedModal.subject?.name}`} onClose={() => setSched({ open: false, subject: null, data: null })} maxWidth={1000}>
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
                                                    <td key={d} style={{ padding: '.3rem', borderRight: '1px solid #dce1ec', height: 75, minWidth: 130 }}>
                                                        {slot ? (
                                                            <div style={{
                                                                background: isLab ? '#fef2f2' : '#f0fdf4',
                                                                color: isLab ? '#991b1b' : '#166534',
                                                                padding: '.4rem .5rem', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `1px solid ${isLab ? '#991b1b30' : '#16653430'}`
                                                            }}>
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
                ) : <p>Loading subject schedule...</p>}
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button style={btn('transparent', '#4a4e6a', '#dce1ec')} onClick={() => setSched({ open: false, subject: null, data: null })}>Close</button>
                    <button style={{ ...btn('#4361ee', '#fff', '#4361ee'), marginLeft: '.5rem' }} onClick={() => window.print()}>🖨️ Print View</button>
                </div>
            </Modal>
        </div>
    )
}
