import { NavLink } from 'react-router-dom'

const links = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/classrooms', icon: '🏫', label: 'Classrooms' },
    { to: '/divisions', icon: '👥', label: 'Divisions' },
    { to: '/faculty', icon: '👨‍🏫', label: 'Faculty' },
    { to: '/subjects', icon: '📚', label: 'Subjects' },
    { to: '/timetable', icon: '📅', label: 'Timetable' },
]

const S = {
    nav: {
        position: 'sticky', top: 0, zIndex: 100, height: 64, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '1rem', transition: 'background .2s, border-color .2s'
    },
    brand: { display: 'flex', alignItems: 'center', gap: '.6rem', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', marginRight: 'auto', textDecoration: 'none' },
    logoIcon: {
        width: 38, height: 38, objectFit: 'contain', borderRadius: 4
    },
    links: {
        display: 'flex',
        gap: '.25rem',
        alignItems: 'center',
        overflowX: 'auto',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
    },
    link: {
        display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.45rem .85rem', borderRadius: 10,
        fontSize: '.88rem', fontWeight: 500, color: 'var(--text-2)', transition: 'all .18s', textDecoration: 'none'
    },
    activeLink: { background: 'var(--primary)', color: '#fff' },
}

export default function Navbar({ theme, toggleTheme }) {
    return (
        <nav style={S.nav} className="navbar">
            <NavLink to="/" style={S.brand}>
                <img src="/company-logo.png" alt="Company Logo" style={S.logoIcon} />
                SMART TIMETABLE
            </NavLink>
            <div style={S.links}>
                {links.map(l => (
                    <NavLink key={l.to} to={l.to} end={l.to === '/'} style={({ isActive }) => ({ ...S.link, ...(isActive ? S.activeLink : {}) })}>
                        <span>{l.icon}</span>
                        <span className="nav-label">{l.label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={toggleTheme}
                    style={{
                        marginLeft: '.5rem', padding: '.4rem', borderRadius: '50%', border: 'none', background: 'var(--surface2)',
                        color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', transition: 'all .2s'
                    }}
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>
        </nav>
    )
}
