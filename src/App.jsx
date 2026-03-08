import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Classrooms from './pages/Classrooms'
import Divisions from './pages/Divisions'
import Timetable from './pages/Timetable'
import Faculty from './pages/Faculty'
import Subjects from './pages/Subjects'
import { init } from './data'
import { useEffect, useState } from 'react'

export default function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

    useEffect(() => { init(); }, [])

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

    return (
        <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'background .2s, color .2s' }}>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/classrooms" element={<Classrooms />} />
                <Route path="/divisions" element={<Divisions />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/subjects" element={<Subjects />} />
            </Routes>
            <Footer />
        </div>
    )
}
