import { NavLink } from 'react-router-dom'

const links = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/classrooms', icon: '🏫', label: 'Classrooms' },
    { to: '/divisions', icon: '👥', label: 'Divisions' },
    { to: '/timetable', icon: '📅', label: 'Timetable' },
    { to: '/faculty', icon: '👨‍🏫', label: 'Faculty' },
    { to: '/subjects', icon: '📚', label: 'Subjects' },
]

const S = {
    nav: {
        position: 'sticky', top: 0, zIndex: 100, height: 64, background: '#fff', borderBottom: '1px solid #dce1ec',
        boxShadow: '0 2px 12px rgba(67,97,238,.1)', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '1rem'
    },
    brand: { display: 'flex', alignItems: 'center', gap: '.6rem', fontWeight: 700, fontSize: '1.1rem', color: '#4361ee', marginRight: 'auto', textDecoration: 'none' },
    logoIcon: {
        width: 36, height: 36, borderRadius: 8, background: '#4361ee', color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1rem', fontWeight: 800
    },
    links: { display: 'flex', gap: '.25rem' },
    link: {
        display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem .85rem', borderRadius: 10,
        fontSize: '.88rem', fontWeight: 500, color: '#4a4e6a', transition: 'all .18s', textDecoration: 'none'
    },
    activeLink: { background: '#4361ee', color: '#fff' },
}

export default function Navbar() {
    return (
        <nav style={S.nav}>
            <NavLink to="/" style={S.brand}>
                <div style={S.logoIcon}>CE</div>
                CE Timetable
            </NavLink>
            <div style={S.links}>
                {links.map(l => (
                    <NavLink key={l.to} to={l.to} end={l.to === '/'} style={({ isActive }) => ({ ...S.link, ...(isActive ? S.activeLink : {}) })}>
                        <span>{l.icon}</span>
                        <span className="nav-label">{l.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}
