import { useState, useCallback } from 'react'
import { getDivisionsBySem, getClassrooms, getAllocation, setAllocation, runAllocationForSem } from '../data'
import Toast from '../components/Toast'

const btn = (bg, color, border, extra = {}) => ({
    display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.45rem 1rem', borderRadius: 10,
    fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: `2px solid ${border}`, background: bg,
    color, fontFamily: 'inherit', ...extra
})

export default function Allocation() {
    const [sem, setSem] = useState(4)
    const [results, setResults] = useState(null)
    const [overrides, setOv] = useState({})
    const [toast, setToast] = useState(null)
    const [ran, setRan] = useState(false)

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }

    const runAlloc = useCallback(() => {
        const res = runAllocationForSem(sem)
        setResults(res); setOv({}); setRan(true)
    }, [sem])

    const saveAlloc = () => {
        if (!results) return
        const divisions = getDivisionsBySem(sem)
        const classrooms = getClassrooms()
        const saved = {}
        divisions.forEach(div => {
            const res = results[div.id]
            const roomId = overrides[div.id] || (res?.classroom ?? null)
            const room = classrooms.find(r => r.id === roomId)
            saved[div.id] = { divisionName: div.name, strength: div.strength, classroom: roomId, classroomName: room?.name ?? 'Unassigned', type: res?.type ?? 'unknown', overridden: !!overrides[div.id] }
        })
        const all = getAllocation(); all[sem] = saved; setAllocation(all)
        showToast(`Allocation plan saved for Semester ${sem}`, 'success')
    }

    const divisions = getDivisionsBySem(sem)
    const classrooms = getClassrooms().sort((a, b) => a.capacity - b.capacity)

    const individual = divisions.filter(d => results?.[d.id]?.type === 'individual' && !results?.[d.id]?.combineSuggestion)
    const combinable = divisions.filter(d => results?.[d.id]?.combineSuggestion)
    const overflow = divisions.filter(d => results?.[d.id]?.type === 'overflow')

    const totalStudents = divisions.reduce((s, d) => s + d.strength, 0)

    const cardSection = (title, icon, color, divs, type) => {
        if (!divs.length) return null
        return (
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#4a4e6a', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ color }}>{icon}</span> {title} ({divs.length})
                </h3>
                {divs.map(div => {
                    const res = results?.[div.id]
                    const roomId = overrides[div.id] || res?.classroom
                    const room = classrooms.find(r => r.id === roomId)
                    const capPct = room ? Math.min(100, Math.round((div.strength / room.capacity) * 100)) : 100
                    const barColor = capPct > 95 ? '#d62828' : capPct > 75 ? '#e76f51' : '#2b9348'
                    const borderColor = type === 'individual' ? '#2b9348' : type === 'combine' ? '#0096c7' : '#d62828'
                    const tagBg = type === 'individual' ? '#d8f3dc' : type === 'combine' ? '#d0f0fb' : '#fde8e8'
                    const tagColor = type === 'individual' ? '#2b9348' : type === 'combine' ? '#0096c7' : '#d62828'
                    const tagLabel = type === 'individual' ? '✅ Individual' : type === 'combine' ? '🔀 Combinable' : '⚠️ Overflow'
                    return (
                        <div key={div.id} style={{ background: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: 16, padding: '1.25rem', marginBottom: '.85rem', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '.85rem', right: '.85rem', background: tagBg, color: tagColor, padding: '.2rem .6rem', borderRadius: 99, fontSize: '.75rem', fontWeight: 600 }}>{tagLabel}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.6rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>📌 {div.name}</span>
                                <span style={{ background: '#eef0fd', color: '#4361ee', padding: '.3rem .75rem', borderRadius: 99, fontSize: '.82rem', fontWeight: 500 }}>👥 {div.strength} students</span>
                            </div>
                            <div style={{ fontSize: '.85rem', color: '#4a4e6a', marginBottom: '.4rem' }}>
                                {room ? <>🏫 <strong>{room.name}</strong> (cap: {room.capacity}) · Utilization: <strong style={{ color: barColor }}>{capPct}%</strong></> : '🏫 No room assigned'}
                            </div>
                            {room && (
                                <div style={{ background: '#eef1f8', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: '.6rem' }}>
                                    <div style={{ width: `${capPct}%`, height: '100%', borderRadius: 99, background: barColor, transition: 'width .4s' }} />
                                </div>
                            )}
                            {res?.combineSuggestion && (
                                <div style={{ background: '#d0f0fb', borderRadius: 8, padding: '.5rem .75rem', fontSize: '.82rem', color: '#0096c7', marginBottom: '.5rem' }}>
                                    💡 Can combine with <strong>{res.combineSuggestion.partnerName}</strong> (total: {res.combineSuggestion.combined}) → fits <strong>{res.combineSuggestion.classroomName}</strong>
                                </div>
                            )}
                            {type === 'overflow' && (
                                <div style={{ fontSize: '.82rem', color: '#d62828', marginBottom: '.5rem' }}>
                                    ⚠️ Strength ({div.strength}) exceeds all rooms. Consider adding a larger room.
                                </div>
                            )}
                            <div style={{ marginTop: '.5rem' }}>
                                <label style={{ fontSize: '.8rem', fontWeight: 600, color: '#4a4e6a', display: 'block', marginBottom: '.25rem' }}>Override Room:</label>
                                <select style={{ width: '100%', padding: '.35rem .65rem', border: '1.5px solid #dce1ec', borderRadius: 7, fontSize: '.85rem', background: '#eef1f8', fontFamily: 'inherit', outline: 'none' }}
                                    value={overrides[div.id] || roomId || ''} onChange={e => setOv(ov => ({ ...ov, [div.id]: e.target.value }))}>
                                    <option value="">— Use Suggested —</option>
                                    {classrooms.map(r => <option key={r.id} value={r.id}>{r.name} (cap: {r.capacity})</option>)}
                                </select>
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: '#fde8e2', color: '#e76f51', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>📐 STEP 2</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Smart Classroom Allocation</h1>
                    <p style={{ color: '#4a4e6a', fontSize: '.93rem', marginTop: '.2rem' }}>Auto-match CE divisions to rooms. Review suggestions & override as needed.</p>
                </div>
            </div>

            {/* Controls */}
            <div style={{ background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ fontSize: '.85rem', fontWeight: 600, color: '#4a4e6a', display: 'block', marginBottom: '.3rem' }}>Select Semester</label>
                    <select style={{ width: '100%', padding: '.6rem .85rem', border: '1.5px solid #dce1ec', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', outline: 'none', background: '#eef1f8' }}
                        value={sem} onChange={e => { setSem(Number(e.target.value)); setRan(false); setResults(null) }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button style={btn('#4361ee', '#fff', '#4361ee')} onClick={runAlloc}>▶️ Run Allocation</button>
                    {ran && <button style={btn('#2b9348', '#fff', '#2b9348')} onClick={saveAlloc}>💾 Save Plan</button>}
                </div>
            </div>

            {/* Stats */}
            {ran && divisions.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { val: divisions.length, key: 'Total Divisions', color: '#4361ee' },
                        { val: totalStudents, key: 'Total Students', color: '#4361ee' },
                        { val: individual.length, key: '✅ Individual Fit', color: '#2b9348' },
                        { val: overflow.length, key: '⚠️ Overflow', color: '#d62828' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: '.75rem', color: '#8a8fa8', marginTop: '.1rem' }}>{s.key}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[['#2b9348', 'Individual (fits a room)'], ['#0096c7', 'Combine suggestion available'], ['#d62828', 'Overflow (exceeds all rooms)']].map(([c, l], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: '#4a4e6a' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} /> {l}
                    </div>
                ))}
            </div>

            {/* Scenarios */}
            {!ran ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#8a8fa8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📐</div>
                    <p>Select a semester and click <strong>Run Allocation</strong>.</p>
                </div>
            ) : divisions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#8a8fa8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <p>No divisions for Semester {sem}. Add them in the Divisions page first.</p>
                </div>
            ) : (
                <>
                    {cardSection('Individual Assignment', '✅', '#2b9348', individual, 'individual')}
                    {cardSection('Combine Suggestions', '🔀', '#0096c7', combinable, 'combine')}
                    {cardSection('Overflow — Exceeds All Rooms', '⚠️', '#d62828', overflow, 'overflow')}
                </>
            )}

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    )
}
