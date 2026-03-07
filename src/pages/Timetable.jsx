import { useState, useCallback } from 'react'
import {
    getDivisionsBySem, getSubjectsBySem, getTimetables, setTimetables,
    generateTimetable, getSubjects, setSubjects, uid,
    subjectName, subjectDisplay, subjectFullCode
} from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const SLOT_COLORS = [
    '#dbeafe|#1e40af', '#fce7f3|#9d174d', '#d7f0de|#166534',
    '#fef3c7|#92400e', '#ede9fe|#5b21b6', '#fee2e2|#991b1b',
    '#e0f2fe|#075985', '#fdf2f8|#be185d',
]

// Normalize subject to plain string name for timetable generation
const sName = (s) => subjectName(s)

export default function Timetable() {
    const [sem, setSem] = useState(4)
    const [divId, setDivId] = useState('')
    const [ttData, setTtData] = useState(null)
    const [toast, setToast] = useState(null)
    const [editSlot, setEditSlot] = useState(null)
    const [slotForm, setSlotForm] = useState({ subject: '', type: 'theory' })
    const [subModal, setSubModal] = useState(false)
    const [subForm, setSubForm] = useState([])

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }

    const divs = getDivisionsBySem(sem)

    const generate = useCallback(() => {
        const d = divs.find(x => x.id === divId)
        if (!d) { showToast('Select a division first.', 'error'); return }
        const tt = generateTimetable(sem, d.name, d.strength)
        setTtData(tt)
        const key = `${sem}_${d.name}`
        const all = getTimetables(); all[key] = tt; setTimetables(all)
        showToast('Timetable generated!', 'success')
    }, [sem, divId, divs])

    const loadSaved = useCallback(() => {
        const d = divs.find(x => x.id === divId)
        if (!d) return
        const key = `${sem}_${d.name}`
        const tt = getTimetables()[key]
        if (tt) { setTtData(tt); showToast('Loaded saved timetable.', 'info') }
        else showToast('No saved timetable. Click Generate.', 'error')
    }, [sem, divId, divs])

    const openSubjectEditor = () => {
        const s = getSubjectsBySem(sem)
        // For editor, flatten to name strings for editing simplicity
        setSubForm(s.core.map(c => ({ id: uid(), name: sName(c), code: subjectFullCode(c) || '' })))
        setSubModal(true)
    }

    const saveSubjects = () => {
        const all = getSubjects()
        const existing = all[sem] || { core: [], electives: [] }
        // Save back — if code present keep as object else as string
        existing.core = subForm.map(s => s.code ? { code: s.code, shortCode: s.code.split(/[()]/).pop() || s.code, name: s.name } : s.name).filter(x => typeof x === 'string' ? x : x.name)
        all[sem] = existing; setSubjects(all)
        setSubModal(false); showToast('Subjects updated.', 'success')
    }

    const allPeriods = ttData
        ? [...new Set([...Object.values(ttData.grid).flatMap(d => Object.keys(d))])].sort((a, b) => {
            // Times are 11:40-5:20 range. Hours < 9 must be PM (1:xx=13:xx, 2:xx=14:xx … 5:xx=17:xx)
            const toMin = t => {
                const part = t.split('-')[0] || '0:0'
                let [h, m] = part.split(':').map(Number)
                if (h < 9) h += 12   // 1:20 → 13:20, 3:40 → 15:40, 4:35 → 16:35, 5:20 → 17:20
                return h * 60 + m
            }
            return toMin(a) - toMin(b)
        })
        : []

    const subjectColorMap = {}
    let ci = 0
    if (ttData) {
        ttData.days.forEach(day => {
            allPeriods.forEach(p => {
                const slot = ttData.grid[day]?.[p]
                if (slot && slot.subject && slot.type !== 'break' && slot.type !== 'empty' && !subjectColorMap[slot.subject]) {
                    subjectColorMap[slot.subject] = SLOT_COLORS[ci++ % SLOT_COLORS.length]
                }
            })
        })
    }

    const saveSlot = e => {
        e.preventDefault()
        if (!editSlot || !ttData) return
        const updated = { ...ttData, grid: { ...ttData.grid } }
        updated.grid[editSlot.day] = { ...updated.grid[editSlot.day] }
        updated.grid[editSlot.day][editSlot.period] = { subject: slotForm.subject, type: slotForm.type }
        setTtData(updated)
        const key = `${sem}_${ttData.divName}`
        const all = getTimetables(); all[key] = updated; setTimetables(all)
        setEditSlot(null); showToast('Slot updated.', 'success')
    }

    const openEdit = (day, period) => {
        if (!ttData) return
        const slot = ttData.grid[day]?.[period]
        if (slot?.type === 'break') return
        setSlotForm({ subject: slot?.subject || '', type: slot?.type || 'theory' })
        setEditSlot({ day, period })
    }

    const subjects = getSubjectsBySem(sem)
    // Flat subject name list for slot dropdown in edit modal
    const allSubjectNames = [
        ...subjects.core.map(sName),
        ...subjects.electives.flatMap(g => g.options.map(sName)),
    ]

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #dce1ec', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: '#1a1d2e', background: '#eef1f8', outline: 'none' }

    return (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: '#f3e8ff', color: '#7209b7', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>📅 STEP 3</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Timetable Generator</h1>
                    <p style={{ color: '#4a4e6a', fontSize: '.93rem', marginTop: '.2rem' }}>Auto-generate weekly timetables. Click any slot to edit. Sem 1–4: core only; 5–8: core + electives.</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <button onClick={openSubjectEditor} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #dce1ec', background: 'transparent', color: '#4a4e6a', fontFamily: 'inherit' }}>✏️ Edit Subjects</button>
                    <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #dce1ec', background: 'transparent', color: '#4a4e6a', fontFamily: 'inherit' }}>🖨️ Print</button>
                </div>
            </div>

            {/* Controls */}
            <div style={{ background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div style={{ flex: '1', minWidth: 160 }}>
                    <label style={{ fontSize: '.85rem', fontWeight: 600, color: '#4a4e6a', display: 'block', marginBottom: '.3rem' }}>Semester</label>
                    <select style={inp} value={sem} onChange={e => { setSem(Number(e.target.value)); setDivId(''); setTtData(null) }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div style={{ flex: '1', minWidth: 160 }}>
                    <label style={{ fontSize: '.85rem', fontWeight: 600, color: '#4a4e6a', display: 'block', marginBottom: '.3rem' }}>Division</label>
                    <select style={inp} value={divId} onChange={e => setDivId(e.target.value)}>
                        <option value="">— Select Division —</option>
                        {divs.map(d => <option key={d.id} value={d.id}>{d.name} ({d.strength} students)</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #4361ee', background: '#4361ee', color: '#fff', fontFamily: 'inherit' }} onClick={generate}>⚡ Generate</button>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #dce1ec', background: 'transparent', color: '#4a4e6a', fontFamily: 'inherit' }} onClick={loadSaved}>📂 Load Saved</button>
                </div>
            </div>

            {/* Subject preview — shows course code chips for object-type subjects */}
            {subjects.core.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a8fa8', marginBottom: '.6rem' }}>
                        Subjects — Sem {sem}
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                        {subjects.core.map((s, i) => {
                            const isObj = typeof s === 'object' && s !== null
                            return (
                                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: '#eef0fd', borderRadius: 8, padding: '.3rem .65rem' }}>
                                    {isObj && (
                                        <code style={{ background: '#4361ee', color: '#fff', borderRadius: 4, padding: '.1rem .4rem', fontSize: '.72rem', fontWeight: 700 }}>{s.shortCode}</code>
                                    )}
                                    <span style={{ color: '#4361ee', fontSize: '.8rem', fontWeight: 500 }}>
                                        {isObj ? s.name : s}
                                    </span>
                                    {isObj && s.code && (
                                        <span style={{ color: '#8a8fa8', fontSize: '.7rem' }}>({s.code})</span>
                                    )}
                                </div>
                            )
                        })}
                        {subjects.electives.flatMap(g => g.options.slice(0, 1)).map((e, i) => (
                            <span key={i} style={{ background: '#f3e8ff', color: '#7209b7', padding: '.25rem .65rem', borderRadius: 99, fontSize: '.8rem', fontWeight: 500 }}>🎯 {sName(e)}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Timetable Grid */}
            {!ttData ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#8a8fa8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <p>Select a semester &amp; division, then click <strong>Generate</strong>.</p>
                </div>
            ) : (
                <>
                    <div style={{ fontSize: '.85rem', color: '#4a4e6a', marginBottom: '.75rem' }}>
                        📌 <strong>{ttData.divName}</strong> · Semester {ttData.sem} · Click any slot to edit
                    </div>
                    <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #dce1ec', boxShadow: '0 2px 12px rgba(67,97,238,.10)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                            <thead>
                                <tr>
                                    <th style={{ background: '#eef1f8', padding: '.65rem .75rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 600, color: '#4a4e6a', borderBottom: '2px solid #dce1ec', width: 90 }}>Period</th>
                                    {ttData.days.map(day => (
                                        <th key={day} style={{ background: '#4361ee', color: '#fff', padding: '.65rem .5rem', textAlign: 'center', fontSize: '.8rem', borderBottom: 'none', minWidth: 120 }}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const skippedCells = new Set();
                                    return allPeriods.map((period, pIdx) => (
                                        <tr key={period} style={{ borderBottom: '1px solid #dce1ec' }}>
                                            <td style={{ padding: '.5rem .75rem', fontWeight: 600, fontSize: '.78rem', color: '#4a4e6a', background: '#eef1f8', borderRight: '1px solid #dce1ec', whiteSpace: 'nowrap' }}>{period}</td>
                                            {ttData.days.map(day => {
                                                const slotKey = `${day}-${period}`;
                                                if (skippedCells.has(slotKey)) return null;

                                                const slot = ttData.grid[day]?.[period]
                                                if (!slot) return <td key={day} style={{ padding: '.4rem .3rem', borderRight: '1px solid #dce1ec' }} />
                                                if (slot.type === 'break') {
                                                    return (
                                                        <td key={day} colSpan={ttData.days.length} style={{ textAlign: 'center', fontSize: '.78rem', color: '#8a8fa8', fontStyle: 'italic', background: '#f4f6fb', padding: '.4rem', borderRight: '1px solid #dce1ec' }}>
                                                            🍽️ {slot.subject}
                                                        </td>
                                                    )
                                                }

                                                let rowSpan = 1;
                                                const isLab = slot.type === 'lab';

                                                if (isLab) {
                                                    const nextPeriod = allPeriods[pIdx + 1];
                                                    const nextSlot = ttData.grid[day]?.[nextPeriod];
                                                    if (nextSlot && nextSlot.type === 'lab' && nextSlot.subject === slot.subject) {
                                                        rowSpan = 2;
                                                        skippedCells.add(`${day}-${nextPeriod}`);
                                                    }
                                                }

                                                const colors = subjectColorMap[slot.subject] || '#eef1f8|#4a4e6a';
                                                const [bg, fg] = colors.split('|');

                                                return (
                                                    <td key={day} rowSpan={rowSpan} style={{ padding: '.4rem .3rem', borderRight: '1px solid #dce1ec', verticalAlign: 'top' }}>
                                                        <div onClick={() => openEdit(day, period)}
                                                            style={{
                                                                padding: '.35rem .4rem',
                                                                borderRadius: 6,
                                                                background: bg,
                                                                color: fg,
                                                                fontSize: '.72rem',
                                                                fontWeight: 500,
                                                                cursor: 'pointer',
                                                                minHeight: rowSpan > 1 ? 110 : 52,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '.4rem',
                                                                border: isLab ? `1.5px solid ${fg}40` : 'none',
                                                                transition: 'transform .12s'
                                                            }}>

                                                            {slot.batches ? (
                                                                // Multi-batch Lab View
                                                                <>
                                                                    <div style={{ fontWeight: 700, borderBottom: `1px solid ${fg}20`, paddingBottom: '.2rem', marginBottom: '.1rem' }}>
                                                                        {slot.subject} (LAB)
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                                                                        {slot.batches.map(b => (
                                                                            <div key={b.name} style={{ textAlign: 'left', lineHeight: 1.2, paddingLeft: '.2rem', borderLeft: `2px solid ${fg}40` }}>
                                                                                <div style={{ fontWeight: 600 }}>{b.faculty || 'TBD'}</div>
                                                                                <div style={{ opacity: 0.8, fontSize: '.65rem' }}>{ttData.divName}-{b.name}</div>
                                                                                <div style={{ opacity: 0.8, fontSize: '.65rem', fontWeight: 600 }}>{b.room}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                // Theory View
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '.25rem' }}>
                                                                    <div style={{ fontWeight: 700 }}>{slot.subject || <span style={{ color: '#8a8fa8', fontStyle: 'italic' }}>— empty —</span>}</div>
                                                                    {slot.faculty && <div style={{ fontWeight: 600 }}>{slot.faculty}</div>}
                                                                    <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.8, fontSize: '.65rem' }}>
                                                                        {slot.isWholeClass && <span>{ttData.divName}</span>}
                                                                        {slot.room && <span>{slot.room}</span>}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* Color legend */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                        {Object.entries(subjectColorMap).map(([subj, colors]) => {
                            const [bg, fg] = colors.split('|')
                            return <span key={subj} style={{ background: bg, color: fg, padding: '.25rem .65rem', borderRadius: 99, fontSize: '.78rem', fontWeight: 500 }}>{subj}</span>
                        })}
                    </div>
                </>
            )}

            {/* Edit Slot Modal */}
            <Modal open={!!editSlot} title={`Edit Slot — ${editSlot?.day} ${editSlot?.period}`} onClose={() => setEditSlot(null)} maxWidth={420}>
                <form onSubmit={saveSlot}>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: '#4a4e6a' }}>Pick Subject</label>
                        <select style={{ ...inp, marginBottom: '.5rem' }} value={slotForm.subject} onChange={e => setSlotForm(f => ({ ...f, subject: e.target.value }))}>
                            <option value="">— Empty —</option>
                            {allSubjectNames.map((s, i) => <option key={i} value={s}>{s}</option>)}
                        </select>
                        <label style={{ display: 'block', fontSize: '.78rem', color: '#8a8fa8', marginBottom: '.25rem' }}>Or type custom:</label>
                        <input style={inp} placeholder="Custom subject name…" value={slotForm.subject} onChange={e => setSlotForm(f => ({ ...f, subject: e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: '#4a4e6a' }}>Type</label>
                        <select style={inp} value={slotForm.type} onChange={e => setSlotForm(f => ({ ...f, type: e.target.value }))}>
                            <option value="theory">Theory</option>
                            <option value="lab">Lab / Practical</option>
                            <option value="empty">Empty</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #dce1ec', background: 'transparent', color: '#4a4e6a', fontFamily: 'inherit' }} onClick={() => setEditSlot(null)}>Cancel</button>
                        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #4361ee', background: '#4361ee', color: '#fff', fontFamily: 'inherit' }}>💾 Save Slot</button>
                    </div>
                </form>
            </Modal>

            {/* Edit Subjects Modal */}
            <Modal open={subModal} title={`Edit Core Subjects — Semester ${sem}`} onClose={() => setSubModal(false)}>
                <div style={{ marginBottom: '1rem', fontSize: '.85rem', color: '#4a4e6a' }}>Edit subjects for Sem {sem}. Changes persist and affect timetable generation.</div>
                {subForm.map((s, i) => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '.4rem', marginBottom: '.5rem', alignItems: 'center' }}>
                        <input style={{ ...inp, width: 90, fontSize: '.8rem', padding: '.45rem .6rem' }} placeholder="Code" value={s.code}
                            onChange={e => setSubForm(sf => sf.map((x, j) => j === i ? { ...x, code: e.target.value } : x))} />
                        <input style={{ ...inp, fontSize: '.88rem' }} placeholder="Subject name" value={s.name}
                            onChange={e => setSubForm(sf => sf.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                        <button style={{ display: 'inline-flex', alignItems: 'center', padding: '.4rem .6rem', borderRadius: 8, border: '2px solid #fde8e8', background: '#fde8e8', color: '#d62828', cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => setSubForm(sf => sf.filter((_, j) => j !== i))}>🗑️</button>
                    </div>
                ))}
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .85rem', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #4361ee', background: 'transparent', color: '#4361ee', fontFamily: 'inherit', marginTop: '.5rem' }}
                    onClick={() => setSubForm(sf => [...sf, { id: uid(), name: '', code: '' }])}>➕ Add Subject</button>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #dce1ec', background: 'transparent', color: '#4a4e6a', fontFamily: 'inherit' }} onClick={() => setSubModal(false)}>Cancel</button>
                    <button style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid #4361ee', background: '#4361ee', color: '#fff', fontFamily: 'inherit' }} onClick={saveSubjects}>💾 Save Subjects</button>
                </div>
            </Modal>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    )
}
