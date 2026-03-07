import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Classrooms from './pages/Classrooms'
import Divisions from './pages/Divisions'
import Timetable from './pages/Timetable'
import Faculty from './pages/Faculty'
import Subjects from './pages/Subjects'
import { init } from './data'
import { useEffect } from 'react'

export default function App() {
    useEffect(() => { init(); }, [])
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/classrooms" element={<Classrooms />} />
                <Route path="/divisions" element={<Divisions />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/faculty" element={<Faculty />} />
                <Route path="/subjects" element={<Subjects />} />
            </Routes>
        </>
    )
}
