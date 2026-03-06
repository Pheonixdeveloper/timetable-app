import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getClassrooms, getDivisions } from '../data'

const steps = [
    { step: 'STEP 0', icon: '🏫', title: 'Classroom Management', desc: 'Define room locations and max seating capacity. Add, edit or delete any classroom.', to: '/classrooms', color: '#4361ee', bg: '#eef0fd' },
    { step: 'STEP 1', icon: '👥', title: 'Class Divisions', desc: 'Create semester-wise CE divisions (e.g. 4CE-A…4CE-E) with student strength.', to: '/divisions', color: '#2b9348', bg: '#d8f3dc' },
    { step: 'STEP 2', icon: '📐', title: 'Smart Allocation', desc: 'Auto-match divisions to rooms. See combine suggestions when strength exceeds capacity.', to: '/allocation', color: '#e76f51', bg: '#fde8e2' },
    { step: 'STEP 3', icon: '📅', title: 'Timetable Generator', desc: 'Auto-generate weekly timetables with core subjects (sem 1–4) + electives (sem 5–8).', to: '/timetable', color: '#7209b7', bg: '#f3e8ff' },
]

const S = {
    wrap: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' },
    hero: {
        background: 'linear-gradient(135deg,#4361ee 0%,#7209b7 100%)',
        borderRadius: 16, color: '#fff', padding: '2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden',
    },
    h1: { fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' },
    heroPara: { opacity: .85, fontSize: '1rem', maxWidth: 520 },
    metaRow: { display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' },
    metaPill: { background: 'rgba(255,255,255,.15)', padding: '.35rem .9rem', borderRadius: 99, fontSize: '.85rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: '#fff', border: '1px solid #dce1ec', borderRadius: 16, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' },
    statIcon: { fontSize: '1.6rem' },
    statVal: { fontSize: '1.5rem', fontWeight: 800, color: '#4361ee' },
    statLabel: { fontSize: '.78rem', color: '#8a8fa8', marginTop: '.1rem' },
    sectionLabel: { fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8a8fa8', marginBottom: '1rem' },
    stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' },
    stepCard: {
        background: '#fff', border: '1.5px solid #dce1ec', borderRadius: 16, padding: '1.5rem',
        display: 'block', transition: 'all .18s', textDecoration: 'none', color: 'inherit',
        cursor: 'pointer',
    },
    stepIcon: { width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' },
    stepNum: { display: 'inline-block', fontSize: '.72rem', fontWeight: 700, padding: '.15rem .55rem', borderRadius: 99, marginBottom: '.6rem', letterSpacing: '.04em' },
    stepTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '.3rem' },
    stepDesc: { fontSize: '.85rem', color: '#4a4e6a', lineHeight: 1.5 },
}

export default function Dashboard() {
    const [stats, setStats] = useState({ rooms: 0, divs: 0, sems: 0 })
    useEffect(() => {
        const rooms = getClassrooms()
        const divs = getDivisions()
        const sems = new Set(divs.map(d => d.semester)).size
        setStats({ rooms: rooms.length, divs: divs.length, sems })
    }, [])

    return (
        <div style={S.wrap}>
            {/* Hero */}
            <div style={S.hero}>
                <div style={S.h1}>📅 CE Timetable System</div>
                <p style={S.heroPara}>Manage classrooms, divisions, smart allocation and generate timetables — all in one place for Computer Engineering.</p>
                <div style={S.metaRow}>
                    <span style={S.metaPill}>🎓 Branch: Computer Engineering</span>
                    <span style={S.metaPill}>📚 Sem 1–8</span>
                    <span style={S.metaPill}>💡 Light Theme</span>
                </div>
            </div>

            {/* Stats */}
            <div style={S.statsGrid}>
                {[
                    { icon: '🏫', val: stats.rooms, label: 'Classroom Locations' },
                    { icon: '👥', val: stats.divs, label: 'Total Divisions' },
                    { icon: '📚', val: stats.sems, label: 'Semesters Configured' },
                    { icon: '🎓', val: 'CE', label: 'Branch' },
                ].map((st, i) => (
                    <div key={i} style={S.statCard}>
                        <div style={S.statIcon}>{st.icon}</div>
                        <div><div style={S.statVal}>{st.val}</div><div style={S.statLabel}>{st.label}</div></div>
                    </div>
                ))}
            </div>

            {/* Steps */}
            <div style={S.sectionLabel}>Workflow Steps</div>
            <div style={S.stepsGrid}>
                {steps.map(st => (
                    <Link key={st.to} to={st.to} style={S.stepCard}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = st.color; e.currentTarget.style.boxShadow = '0 8px 32px rgba(67,97,238,.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#dce1ec'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                        <span style={{ ...S.stepNum, background: st.bg, color: st.color }}>{st.step}</span>
                        <div style={{ ...S.stepIcon, background: st.bg }}>{st.icon}</div>
                        <div style={S.stepTitle}>{st.title}</div>
                        <p style={S.stepDesc}>{st.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
