import { useState, useCallback } from 'react'
import {
    getDivisionsBySem, getSubjectsBySem, getTimetables, setTimetables,
    generateTimetable, getSubjects, setSubjects, uid,
    subjectName, subjectDisplay, subjectFullCode,
    getClassrooms, getFaculty
} from '../data'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

const SLOT_COLORS = [
    'var(--info-l)|var(--info)', 'var(--danger-l)|var(--danger)', 'var(--success-l)|var(--success)',
    'var(--warning-l)|var(--warning)', 'var(--primary-l)|var(--primary)', 'var(--accent-l, #fdf2f8)|var(--accent, #be185d)',
    'var(--primary-l)|var(--info)', 'var(--warning-l)|var(--danger)',
]

// Normalize subject to plain string name for timetable generation
const sName = (s) => subjectName(s)

export default function Timetable() {
    const [sem, setSem] = useState(() => Number(sessionStorage.getItem('tt_draft_sem')) || 4)
    const [divId, setDivId] = useState(() => sessionStorage.getItem('tt_draft_div') || '')
    const [ttData, setTtData] = useState(() => {
        const saved = sessionStorage.getItem('tt_draft_data')
        return saved ? JSON.parse(saved) : null
    })
    const [toast, setToast] = useState(null)
    const [editSlot, setEditSlot] = useState(null)
    const [slotForm, setSlotForm] = useState({ subject: '', type: 'theory', room: '', faculty: '', batches: [] })
    const [draggedSlot, setDraggedSlot] = useState(null)
    const [subModal, setSubModal] = useState(false)
    const [subForm, setSubForm] = useState([])
    const [customDate, setCustomDate] = useState('')

    const showToast = (msg, type = 'info') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }

    const divs = getDivisionsBySem(sem)

    const updateTtData = (data) => {
        setTtData(data)
        if (data) sessionStorage.setItem('tt_draft_data', JSON.stringify(data))
        else sessionStorage.removeItem('tt_draft_data')
    }

    const handleSemChange = e => {
        const s = Number(e.target.value)
        setSem(s)
        sessionStorage.setItem('tt_draft_sem', s)
        setDivId('')
        sessionStorage.removeItem('tt_draft_div')
        updateTtData(null)
    }

    const handleDivChange = e => {
        const d = e.target.value
        setDivId(d)
        sessionStorage.setItem('tt_draft_div', d)
    }

    const generate = useCallback(() => {
        const d = divs.find(x => x.id === divId)
        if (!d) { showToast('Select a division first.', 'error'); return }
        const tt = generateTimetable(sem, d.name, d.strength, d.shift)

        // Add timestamp and effective date
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        tt.generatedAt = `${days[now.getDay()]}, ${now.toLocaleString()}`;
        tt.effectiveDate = customDate;

        updateTtData(tt)
        showToast('Timetable preview generated! Remember to save.', 'info')
    }, [sem, divId, divs, customDate])

    const loadSaved = useCallback(() => {
        const d = divs.find(x => x.id === divId)
        if (!d) return
        const key = `${sem}_${d.name}`
        const tt = getTimetables()[key]
        if (tt) { updateTtData(tt); showToast('Loaded saved timetable.', 'info') }
        else showToast('No saved timetable. Click Generate.', 'error')
    }, [sem, divId, divs])

    const openSubjectEditor = () => {
        const s = getSubjectsBySem(sem)
        // For editor, flatten to name strings for editing simplicity
        setSubForm(s.core.map(c => ({ id: uid(), name: sName(c), code: subjectFullCode(c) || '', credits: c.credits || 0 })))
        setSubModal(true)
    }

    const saveSubjects = () => {
        const all = getSubjects()
        const existing = all[sem] || { core: [], electives: [] }
        // Save back — if code present keep as object else as string
        existing.core = subForm.map(s => s.code ? { code: s.code, shortCode: s.code.split(/[()]/).pop() || s.code, name: s.name, credits: Number(s.credits) || 0 } : s.name).filter(x => typeof x === 'string' ? x : x.name)
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

        let newSlotData = { ...updated.grid[editSlot.day][editSlot.period], subject: slotForm.subject, type: slotForm.type }
        if (slotForm.type === 'theory') {
            newSlotData.room = slotForm.room
            newSlotData.faculty = slotForm.faculty
        } else if (slotForm.type === 'lab') {
            newSlotData.batches = slotForm.batches
        } else if (slotForm.type === 'empty') {
            newSlotData.room = ''
            newSlotData.faculty = ''
            newSlotData.batches = undefined
        }
        updated.grid[editSlot.day][editSlot.period] = newSlotData
        updateTtData(updated)
        setEditSlot(null); showToast('Slot updated in preview.', 'info')
    }

    const saveTimetable = () => {
        if (!ttData) return
        const key = `${sem}_${ttData.divName}`
        const all = getTimetables()
        all[key] = ttData
        setTimetables(all)
        showToast('Timetable saved globally!', 'success')
    }

    const openEdit = (day, period) => {
        if (!ttData) return
        const slot = ttData.grid[day]?.[period]
        if (slot?.type === 'break') return
        setSlotForm({
            subject: slot?.subject || '',
            type: slot?.type || 'theory',
            room: slot?.room || '',
            faculty: slot?.faculty || '',
            batches: slot?.batches ? JSON.parse(JSON.stringify(slot.batches)) : []
        })
        setEditSlot({ day, period })
    }

    const handleDragStart = (e, day, period) => {
        setDraggedSlot({ day, period });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDay, targetPeriod) => {
        e.preventDefault();
        if (!draggedSlot) return;
        const { day: sourceDay, period: sourcePeriod } = draggedSlot;
        if (sourceDay === targetDay && sourcePeriod === targetPeriod) {
            setDraggedSlot(null);
            return;
        }

        const updated = { ...ttData, grid: { ...ttData.grid } };
        updated.grid[sourceDay] = { ...updated.grid[sourceDay] };
        updated.grid[targetDay] = { ...updated.grid[targetDay] };

        const temp = updated.grid[sourceDay][sourcePeriod];
        updated.grid[sourceDay][sourcePeriod] = updated.grid[targetDay][targetPeriod];
        updated.grid[targetDay][targetPeriod] = temp;

        updateTtData(updated);
        setDraggedSlot(null);
        showToast('Slots swapped.', 'info');
    };

    const subjects = getSubjectsBySem(sem)
    const classroomsList = getClassrooms()
    const facultyList = getFaculty()
    // Flat subject name list for slot dropdown in edit modal
    const allSubjectNames = [
        ...subjects.core.map(sName),
        ...subjects.electives.flatMap(g => g.options.map(sName)),
    ]

    const inp = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: '.92rem', fontFamily: 'inherit', color: 'var(--text)', background: 'var(--surface2)', outline: 'none', transition: 'var(--transition)' }

    const btn = (bg, color, border) => ({
        display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: `2px solid ${border}`, background: bg, color: color, fontFamily: 'inherit'
    })

    return (
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem 4rem' }} className="page-wrapper">

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'var(--accent-l, #f3e8ff)', color: 'var(--accent, #7209b7)', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .7rem', borderRadius: 99, marginBottom: '.4rem' }}>📅 STEP 3</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>Timetable Generator</h1>
                    <p style={{ color: 'var(--text-2)', fontSize: '.93rem', marginTop: '.2rem' }}>Auto-generate weekly timetables. Click any slot to edit. Sem 1–4: core only; 5–8: core + electives.</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    <button onClick={openSubjectEditor} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'inherit' }}>✏️ Edit Subjects</button>
                    <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'inherit' }}>🖨️ Print</button>
                </div>
            </div>

            {/* Controls */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem', transition: 'var(--transition)' }}>
                <div style={{ flex: '1', minWidth: 160 }}>
                    <label style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '.3rem' }}>Semester</label>
                    <select style={inp} value={sem} onChange={handleSemChange}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div style={{ flex: '1', minWidth: 160 }}>
                    <label style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '.3rem' }}>Division</label>
                    <select style={inp} value={divId} onChange={handleDivChange}>
                        <option value="">— Select Division —</option>
                        {divs.map(d => <option key={d.id} value={d.id}>{d.name} ({d.strength} students)</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '.3rem' }}>Effective Date</label>
                    <input type="date" style={inp} value={customDate} onChange={e => setCustomDate(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button style={btn('var(--primary)', '#fff', 'var(--primary)')} onClick={generate}>⚡ Generate</button>
                    <button style={btn('transparent', 'var(--text-2)', 'var(--border)')} onClick={loadSaved}>📂 Load Saved</button>
                </div>
                {ttData && (
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--success)', background: 'var(--success)', color: '#fff', fontFamily: 'inherit' }} onClick={saveTimetable}>💾 Save Timetable</button>
                )}
            </div>

            {/* Subject preview — shows course code chips for object-type subjects */}
            {subjects.core.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem', transition: 'var(--transition)' }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: '.6rem' }}>
                        Subjects — Sem {sem}
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                        {subjects.core.map((s, i) => {
                            const isObj = typeof s === 'object' && s !== null
                            return (
                                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', background: 'var(--primary-l)', borderRadius: 8, padding: '.3rem .65rem' }}>
                                    {isObj && (
                                        <code style={{ background: 'var(--primary)', color: '#fff', borderRadius: 4, padding: '.1rem .4rem', fontSize: '.72rem', fontWeight: 700 }}>{s.shortCode}</code>
                                    )}
                                    <span style={{ color: 'var(--primary)', fontSize: '.8rem', fontWeight: 500 }}>
                                        {isObj ? s.name : s}
                                    </span>
                                    {isObj && s.code && (
                                        <span style={{ color: 'var(--text-3)', fontSize: '.7rem' }}>({s.code})</span>
                                    )}
                                </div>
                            )
                        })}
                        {subjects.electives.flatMap(g => g.options.slice(0, 1)).map((e, i) => (
                            <span key={i} style={{ background: 'var(--accent-l, #f3e8ff)', color: 'var(--accent, #7209b7)', padding: '.25rem .65rem', borderRadius: 99, fontSize: '.8rem', fontWeight: 500 }}>🎯 {sName(e)}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Timetable Grid */}
            {!ttData ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-3)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <p>Select a semester &amp; division, then click <strong>Generate</strong>.</p>
                </div>
            ) : (
                <>
                    <div style={{ fontSize: '.85rem', color: 'var(--text-2)', marginBottom: '.75rem' }}>
                        📌 <strong>{ttData.divName}</strong> · Semester {ttData.sem} · Click any slot to edit
                    </div>
                    <div className="table-container" style={{ borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                            <thead>
                                <tr>
                                    <th style={{ background: 'var(--surface2)', padding: '.65rem .75rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 600, color: 'var(--text-2)', borderBottom: '2px solid var(--border)', width: 90 }}>Period</th>
                                    {ttData.days.map(day => (
                                        <th key={day} style={{ background: 'var(--primary)', color: '#fff', padding: '.65rem .5rem', textAlign: 'center', fontSize: '.8rem', borderBottom: 'none', minWidth: 120 }}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const skippedCells = new Set();
                                    return allPeriods.map((period, pIdx) => (
                                        <tr key={period} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '.5rem .75rem', fontWeight: 600, fontSize: '.78rem', color: 'var(--text-2)', background: 'var(--surface2)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{period}</td>
                                            {ttData.days.map(day => {
                                                const slotKey = `${day}-${period}`;
                                                if (skippedCells.has(slotKey)) return null;

                                                const slot = ttData.grid[day]?.[period]
                                                if (!slot) return <td key={day} style={{ padding: '.4rem .3rem', borderRight: '1px solid var(--border)' }} />
                                                if (slot.type === 'break') {
                                                    return (
                                                        <td key={day} colSpan={ttData.days.length} style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--text-3)', fontStyle: 'italic', background: 'var(--bg)', padding: '.4rem', borderRight: '1px solid var(--border)' }}>
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

                                                const colors = subjectColorMap[slot.subject] || 'var(--surface2)|var(--text-2)';
                                                const [bg, fg] = colors.split('|');

                                                return (
                                                    <td key={day} rowSpan={rowSpan} style={{ padding: '.4rem .3rem', borderRight: '1px solid var(--border)', verticalAlign: 'top' }}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, day, period)}>
                                                        <div onClick={() => openEdit(day, period)}
                                                            className="slot-card"
                                                            draggable={slot.type !== 'break'}
                                                            onDragStart={(e) => handleDragStart(e, day, period)}
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
                                                                border: isLab ? `1.5px solid ${fg}` : 'none',
                                                                transition: 'transform .12s',
                                                                opacity: isLab ? 0.9 : 1
                                                            }}>

                                                            {slot.batches ? (
                                                                // Multi-batch Lab View
                                                                <>
                                                                    <div style={{ fontWeight: 800, borderBottom: `1px solid var(--border)`, paddingBottom: '.2rem', marginBottom: '.1rem' }}>
                                                                        {slot.subject} (LAB)
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                                                                        {slot.batches.map(b => (
                                                                            <div key={b.name} style={{ textAlign: 'left', lineHeight: 1.2, paddingLeft: '.2rem', borderLeft: `2px solid var(--border)` }}>
                                                                                <div style={{ fontSize: '.68rem', fontWeight: 600 }}>{ttData.divName}-{b.name}</div>
                                                                                <div style={{ fontSize: '.68rem', fontWeight: 600 }}>📍 {b.room}</div>
                                                                                <div style={{ opacity: 0.8, fontSize: '.65rem', marginTop: '.1rem' }}>👨‍🏫 {b.faculty || 'TBD'}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                // Theory View
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '.25rem' }}>
                                                                    <div style={{ fontWeight: 800 }}>{slot.subject || <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>— empty —</span>}</div>
                                                                    <div style={{ fontSize: '.68rem', fontWeight: 600 }}>{ttData.divName}</div>
                                                                    {slot.room && <div style={{ fontSize: '.68rem', fontWeight: 600 }}>📍 {slot.room}</div>}
                                                                    {slot.faculty && <div style={{ fontSize: '.65rem', marginTop: '.1rem', opacity: 0.8 }}>👨‍🏫 {slot.faculty}</div>}
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

                    {/* Color legend & Timestamp */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                            {Object.entries(subjectColorMap).map(([subj, colors]) => {
                                const [bg, fg] = colors.split('|')
                                return <span key={subj} style={{ background: bg, color: fg, padding: '.25rem .65rem', borderRadius: 99, fontSize: '.78rem', fontWeight: 500 }}>{subj}</span>
                            })}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {ttData.effectiveDate && (
                                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '.15rem' }}>
                                    📅 Effective from: {new Date(ttData.effectiveDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </div>
                            )}
                            <div style={{ fontSize: '.7rem', color: 'var(--text-3)', fontStyle: 'italic' }}>
                                🕒 Generated on {ttData.generatedAt}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Edit Slot Modal */}
            <Modal open={!!editSlot} title={`Edit Slot — ${editSlot?.day} ${editSlot?.period}`} onClose={() => setEditSlot(null)} maxWidth={420}>
                <form onSubmit={saveSlot}>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Pick Subject</label>
                        <select style={{ ...inp, marginBottom: '.5rem' }} value={slotForm.subject} onChange={e => setSlotForm(f => ({ ...f, subject: e.target.value }))}>
                            <option value="">— Empty —</option>
                            {allSubjectNames.map((s, i) => <option key={i} value={s}>{s}</option>)}
                        </select>
                        <label style={{ display: 'block', fontSize: '.78rem', color: 'var(--text-3)', marginBottom: '.25rem' }}>Or type custom:</label>
                        <input style={inp} placeholder="Custom subject name…" value={slotForm.subject} onChange={e => setSlotForm(f => ({ ...f, subject: e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: '1.1rem' }}>
                        <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Type</label>
                        <select style={inp} value={slotForm.type} onChange={e => setSlotForm(f => ({ ...f, type: e.target.value }))}>
                            <option value="theory">Theory</option>
                            <option value="lab">Lab / Practical</option>
                            <option value="empty">Empty</option>
                        </select>
                    </div>
                    {slotForm.type === 'theory' && (
                        <>
                            <div style={{ marginBottom: '1.1rem' }}>
                                <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Classroom</label>
                                <select style={inp} value={slotForm.room} onChange={e => setSlotForm(f => ({ ...f, room: e.target.value }))}>
                                    <option value="">— Select Room —</option>
                                    {classroomsList.map(r => <option key={r.id} value={r.name}>{r.name} (cap: {r.capacity})</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.1rem' }}>
                                <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.35rem', color: 'var(--text-2)' }}>Faculty</label>
                                <select style={inp} value={slotForm.faculty} onChange={e => setSlotForm(f => ({ ...f, faculty: e.target.value }))}>
                                    <option value="">— Select Faculty —</option>
                                    <option value="TBD">TBD</option>
                                    {facultyList.map(f => <option key={f.id} value={f.code}>{f.name} ({f.code})</option>)}
                                </select>
                            </div>
                        </>
                    )}
                    {slotForm.type === 'lab' && slotForm.batches.length > 0 && (
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontSize: '.85rem', fontWeight: 600, marginBottom: '.5rem', color: 'var(--text-2)' }}>Lab Batches</label>
                            {slotForm.batches.map((b, i) => (
                                <div key={i} style={{ background: 'var(--surface2)', padding: '.75rem', borderRadius: 8, marginBottom: '.5rem' }}>
                                    <div style={{ fontSize: '.8rem', fontWeight: 600, marginBottom: '.4rem' }}>Batch {b.name}</div>
                                    <select style={{ ...inp, marginBottom: '.4rem', padding: '.4rem .6rem', fontSize: '.8rem' }} value={b.room} onChange={e => {
                                        const newBatches = [...slotForm.batches];
                                        newBatches[i].room = e.target.value;
                                        setSlotForm(f => ({ ...f, batches: newBatches }));
                                    }}>
                                        <option value="">— Room —</option>
                                        {classroomsList.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                    </select>
                                    <select style={{ ...inp, padding: '.4rem .6rem', fontSize: '.8rem' }} value={b.faculty} onChange={e => {
                                        const newBatches = [...slotForm.batches];
                                        newBatches[i].faculty = e.target.value;
                                        setSlotForm(f => ({ ...f, batches: newBatches }));
                                    }}>
                                        <option value="">— Faculty —</option>
                                        <option value="TBD">TBD</option>
                                        {facultyList.map(f => <option key={f.id} value={f.code}>{f.name} ({f.code})</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'inherit' }} onClick={() => setEditSlot(null)}>Cancel</button>
                        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }}>💾 Save Slot</button>
                    </div>
                </form>
            </Modal>

            <Modal open={subModal} title={`Edit Core Subjects — Semester ${sem}`} onClose={() => setSubModal(false)}>
                <div style={{ marginBottom: '1rem', fontSize: '.85rem', color: 'var(--text-2)' }}>Edit subjects for Sem {sem}. Changes persist and affect timetable generation.</div>
                <div key="header" style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px auto', gap: '.4rem', marginBottom: '.5rem', alignItems: 'center', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                    <div>Code</div>
                    <div>Name</div>
                    <div>Cr</div>
                    <div></div>
                </div>
                {subForm.map((s, i) => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px auto', gap: '.4rem', marginBottom: '.5rem', alignItems: 'center' }}>
                        <input style={{ ...inp, width: 90, fontSize: '.8rem', padding: '.45rem .6rem' }} placeholder="Code" value={s.code}
                            onChange={e => setSubForm(sf => sf.map((x, j) => j === i ? { ...x, code: e.target.value } : x))} />
                        <input style={{ ...inp, fontSize: '.88rem' }} placeholder="Subject name" value={s.name}
                            onChange={e => setSubForm(sf => sf.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                        <input style={{ ...inp, width: 50, fontSize: '.8rem', padding: '.45rem .6rem' }} type="number" placeholder="Cr" value={s.credits}
                            onChange={e => setSubForm(sf => sf.map((x, j) => j === i ? { ...x, credits: e.target.value } : x))} />
                        <button style={{ display: 'inline-flex', alignItems: 'center', padding: '.4rem .6rem', borderRadius: 8, border: '2px solid var(--danger-l)', background: 'var(--danger-l)', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit' }}
                            onClick={() => setSubForm(sf => sf.filter((_, j) => j !== i))}>🗑️</button>
                    </div>
                ))}
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.4rem .85rem', borderRadius: 10, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontFamily: 'inherit', marginTop: '.5rem' }}
                    onClick={() => setSubForm(sf => [...sf, { id: uid(), name: '', code: '' }])}>➕ Add Subject</button>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontFamily: 'inherit' }} onClick={() => setSubModal(false)}>Cancel</button>
                    <button style={{ display: 'inline-flex', alignItems: 'center', padding: '.5rem 1.1rem', borderRadius: 10, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', border: '2px solid var(--primary)', background: 'var(--primary)', color: '#fff', fontFamily: 'inherit' }} onClick={saveSubjects}>💾 Save Subjects</button>
                </div>
            </Modal>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    )
}
