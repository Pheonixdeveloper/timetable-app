import React from 'react';
import { Link } from 'react-router-dom';

const S = {
    footer: {
        marginTop: 'auto',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        transition: 'background .2s, border-color .2s',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
    },
    top: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: '.6rem',
        fontWeight: 700,
        fontSize: '1.2rem',
        color: 'var(--primary)',
        textDecoration: 'none',
    },
    logoIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
        objectFit: 'contain',
    },
    links: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    link: {
        fontSize: '.9rem',
        fontWeight: 500,
        color: 'var(--text-2)',
        textDecoration: 'none',
        transition: 'color .2s',
    },
    bottom: {
        width: '100%',
        maxWidth: 1200,
        borderTop: '1px solid var(--border)',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '.85rem',
        color: 'var(--text-3)',
    },
    copyright: {
        textAlign: 'center',
        flex: 1,
    }
};

export default function Footer() {
    return (
        <footer style={S.footer} className="no-print">
            <div style={S.top}>
                <Link to="/" style={S.brand}>
                    <img src="/company-logo.png" alt="Company Logo" style={S.logoIcon} />
                    SMART TIMETABLE
                </Link>
                <div style={S.links}>
                    <Link to="/" style={S.link}>Dashboard</Link>
                    <Link to="/classrooms" style={S.link}>Classrooms</Link>
                    <Link to="/divisions" style={S.link}>Divisions</Link>
                    <Link to="/timetable" style={S.link}>Timetable Generator</Link>
                </div>
            </div>
            <div style={S.bottom}>
                <div style={S.copyright}>
                    &copy; {new Date().getFullYear()} Phoenix Developer . All rights reserved.
                </div>
            </div>
        </footer>
    );
}
