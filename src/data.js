// ============================================================
//  CE Timetable — localStorage data store
// ============================================================

const KEYS = {
    classrooms: 'tt_classrooms_v3',
    divisions: 'tt_divisions',
    subjects: 'tt_subjects_v3',
    allocation: 'tt_allocation',
    timetables: 'tt_timetables',
    faculty: 'tt_faculty',
};


const DEFAULTS = {
    classrooms: [
        // Classrooms (lectures) — edit capacity as needed
        { id: 'r1', name: '1NB210', capacity: 120, type: 'classroom' },
        { id: 'rc1', name: '1NB011', capacity: 60, type: 'classroom' },
        { id: 'rc2', name: '1NB012', capacity: 60, type: 'classroom' },
        { id: 'rc3', name: '1NB013', capacity: 60, type: 'classroom' },
        { id: 'rc4', name: '1NB014', capacity: 60, type: 'classroom' },
        { id: 'rc5', name: '1NB015', capacity: 60, type: 'classroom' },
        { id: 'rc6', name: '1NB016', capacity: 60, type: 'classroom' },
        { id: 'rc7', name: '1NB201A', capacity: 60, type: 'classroom' },
        { id: 'rc8', name: '1NB201B', capacity: 60, type: 'classroom' },
        { id: 'rc9', name: '1NB201C', capacity: 60, type: 'classroom' },
        { id: 'rc10', name: '1NB004A', capacity: 60, type: 'classroom' },
        { id: 'rc11', name: '1NB004B', capacity: 60, type: 'classroom' },
        { id: 'rc12', name: '1NB004C', capacity: 60, type: 'classroom' },
        { id: 'rc13', name: '1NB005A', capacity: 60, type: 'classroom' },
        { id: 'rc14', name: '1NB005B', capacity: 60, type: 'classroom' },
        // Labs — capacity 80
        { id: 'r2', name: '1NB002', capacity: 80, type: 'lab' },
        { id: 'r3', name: '1NB003', capacity: 80, type: 'lab' },
        { id: 'r4', name: '1NB102', capacity: 80, type: 'lab' },
        { id: 'r5', name: '1NB103', capacity: 80, type: 'lab' },
        { id: 'r6', name: '1NB108', capacity: 80, type: 'lab' },
        { id: 'r7', name: '1NB109', capacity: 80, type: 'lab' },
        { id: 'r8', name: '1NB110A', capacity: 80, type: 'lab' },
        { id: 'r9', name: '1NB110B', capacity: 80, type: 'lab' },
        { id: 'r10', name: '1NB110C', capacity: 80, type: 'lab' },
        { id: 'r11', name: '1NB111A', capacity: 80, type: 'lab' },
        { id: 'r12', name: '1NB111B', capacity: 80, type: 'lab' },
        { id: 'r13', name: '1NB111C', capacity: 80, type: 'lab' },
        { id: 'r14', name: '1NB112A', capacity: 80, type: 'lab' },
        { id: 'r15', name: '1NB112B', capacity: 80, type: 'lab' },
        { id: 'r16', name: '1NB112C', capacity: 80, type: 'lab' },
        // Labs — capacity 130
        { id: 'r17', name: '2NB004', capacity: 130, type: 'lab' },
        { id: 'r18', name: '2NB209', capacity: 130, type: 'lab' },
    ],
    divisions: [
        { id: 'd1a', semester: 1, name: '1CE-A', strength: 65 },
        { id: 'd1b', semester: 1, name: '1CE-B', strength: 70 },
        { id: 'd2a', semester: 2, name: '2CE-A', strength: 60 },
        { id: 'd2b', semester: 2, name: '2CE-B', strength: 72 },
        { id: 'd3a', semester: 3, name: '3CE-A', strength: 58 },
        { id: 'd3b', semester: 3, name: '3CE-B', strength: 80 },
        { id: 'd4a', semester: 4, name: '4CE-A', strength: 60 },
        { id: 'd4b', semester: 4, name: '4CE-B', strength: 75 },
        { id: 'd4c', semester: 4, name: '4CE-C', strength: 35 },
        { id: 'd4d', semester: 4, name: '4CE-D', strength: 90 },
        { id: 'd4e', semester: 4, name: '4CE-E', strength: 58 },
        { id: 'd5a', semester: 5, name: '5CE-A', strength: 55 },
        { id: 'd5b', semester: 5, name: '5CE-B', strength: 60 },
        { id: 'd6a', semester: 6, name: '6CE-A', strength: 52 },
        { id: 'd6b', semester: 6, name: '6CE-B', strength: 58 },
        { id: 'd7a', semester: 7, name: '7CE-A', strength: 50 },
        { id: 'd7b', semester: 7, name: '7CE-B', strength: 55 },
        { id: 'd8a', semester: 8, name: '8CE-A', strength: 48 },
        { id: 'd8b', semester: 8, name: '8CE-B', strength: 52 },
    ],
    subjects: {
        1: { core: ['Mathematics-I', 'Engineering Physics', 'Programming (C)', 'English Communication', 'Workshop Practice', 'Physics Lab', 'Programming Lab'], electives: [] },
        2: { core: ['Mathematics-II', 'Engineering Chemistry', 'Data Structures', 'Digital Logic Design', 'Environmental Science', 'Chemistry Lab', 'DS Lab'], electives: [] },
        3: { core: ['Mathematics-III', 'Database Management System', 'Operating Systems', 'Object Oriented Programming', 'Discrete Mathematics', 'DBMS Lab', 'OOP Lab'], electives: [] },
        4: {
            core: [
                { code: '2BS4101', shortCode: 'MATHS', name: 'Mathematics', hasLab: false, labOnly: false },
                { code: '2CEIT401', shortCode: 'OS', name: 'Operating Systems', hasLab: true, labOnly: false },
                { code: '2CEIT402', shortCode: 'DAA', name: 'Design and Analysis of Algorithms', hasLab: true, labOnly: false },
                { code: '2CEIT404', shortCode: 'P-PY', name: 'Programming with Python', hasLab: true, labOnly: false },
                { code: '2CEIT405', shortCode: 'NOSQL', name: 'NoSQL Databases', hasLab: true, labOnly: true },
                { code: '2CEIT406', shortCode: 'SEPM', name: 'Software Engineering & Project Mgmt', hasLab: true, labOnly: false },
                { code: '2CEIT407', shortCode: 'DT', name: 'Design Thinking', hasLab: true, labOnly: true },
            ], electives: []
        },
        5: { core: ['Compiler Design', 'Computer Networks-II', 'Microprocessor & Embedded Systems', 'Professional Ethics'], electives: [{ group: 'E1', options: ['Machine Learning', 'Big Data Analytics', 'IoT Systems'] }] },
        6: { core: ['Information & Network Security', 'Cloud Computing', 'Software Testing'], electives: [{ group: 'E1', options: ['Deep Learning', 'Blockchain Technology', 'Mobile App Development'] }, { group: 'E2', options: ['Image Processing', 'Natural Language Processing', 'Distributed Systems'] }] },
        7: { core: ['Project Management', 'Entrepreneurship'], electives: [{ group: 'E1', options: ['Data Science', 'Cyber Security', 'AR/VR Technology'] }, { group: 'E2', options: ['Quantum Computing', 'Robotics', 'DevOps Engineering'] }] },
        8: { core: ['Major Project', 'Industrial Training Report'], electives: [{ group: 'E1', options: ['Advanced AI', 'Digital Forensics', 'Edge Computing'] }] },
    },
    faculty: [
        { id: 'f001', name: 'Prof. Hiten Sadani', code: 'HMS', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f002', name: 'Prof. Prachi Shah', code: 'PDS', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f003', name: 'Dr. Manan Thakkar', code: 'MDT', dept: 'Computer Engineering/IT', role: 'Doctor' },
        { id: 'f004', name: 'Prof. Nilesh Parmar', code: 'NAP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f005', name: 'Prof. Yogesh Prajapati', code: 'YJP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f006', name: 'Prof. Venus Patel', code: 'VRP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f007', name: 'Prof. Amit Solanki', code: 'ADS', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f008', name: 'Prof. Nishi Patva', code: 'NPP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f009', name: 'Prof. Dhiren Prajapati', code: 'DTP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f010', name: 'Prof. Megha Patel', code: 'MBP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f011', name: 'Prof. Chirag Patel', code: 'CNP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f012', name: 'Prof. Kavindra Patel', code: 'KMP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f013', name: 'Prof. Sheetal Dixit', code: 'SKD', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f014', name: 'Prof. Akshita Patel', code: 'AAP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f015', name: 'Prof. Karan Modh', code: 'KDM', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f016', name: 'Prof. Hitesh Patel', code: 'HKP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f017', name: 'Prof. Palak Rathod', code: 'PVR', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f018', name: 'Prof. Janki Shah', code: 'JDS', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f019', name: 'Prof. Sonal Parmar', code: 'SHP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f020', name: 'Prof. Rahul Yadav', code: 'RHY', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f021', name: 'Prof. Divya Rami', code: 'DHR', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f022', name: 'Prof. Shreedhar Visalpara', code: 'SVV', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f023', name: 'Prof. Rahul Kushwaha', code: 'RK', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f024', name: 'Prof. Urmila Patel', code: 'UCP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f025', name: 'Prof. Arpita Modi', code: 'ADM', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f026', name: 'V-Dolly', code: 'V-DOLLY', dept: 'Computer Engineering/IT', role: 'Visiting' },
        { id: 'f027', name: 'V-Janvi Patel', code: 'V-JP', dept: 'Computer Engineering/IT', role: 'Visiting' },
        { id: 'f028', name: 'TA-Vidhi Patel', code: 'TA-VIDHI', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f029', name: 'TA-Rutvi Patel', code: 'TA-RUTVI', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f030', name: 'TA-Riya Patel', code: 'TA-RIYA', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f031', name: 'TA-Khushi Modi', code: 'TA-KHUSHI', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f032', name: 'TA-Moxi Patel', code: 'TA-MOXI', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f033', name: 'TA-Jeel Patel', code: 'TA-JEEL', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f034', name: 'TA-Vedanshee Patel', code: 'TA-VEDANSHEE', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f035', name: 'TA-Smit Patel', code: 'TA-SMIT', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f036', name: 'TA-Meshwa Patel', code: 'TA-MESHWA', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f037', name: 'TA-Utsav Raval', code: 'TA-UTSAV', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f038', name: 'TA-Ayushi Patel', code: 'TA-AYUSHI', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f039', name: 'TA-Mayan Patel', code: 'TA-MAYAN', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f040', name: 'TA-Ved Acharya', code: 'TA-VED', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f041', name: 'TA-Pratham Patel', code: 'TA-PRATHAM', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f042', name: 'TA-Krina Patel', code: 'TA-KRINA', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f043', name: 'TA-Mansi Vasava', code: 'TA-MANSI', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f044', name: 'TA-Nayan Suthar', code: 'TA-NAYAN', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f045', name: 'TA-Divyanshu Rai', code: 'TA-DIVYANSHU', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f046', name: 'TA-Zen Patel', code: 'TA-ZEN', dept: 'Computer Engineering/IT', role: 'TA' },
        { id: 'f047', name: 'Maths-Hetal Patel', code: 'HRP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f048', name: 'Maths-Rakesh Darji', code: 'RRD', dept: 'Mathematics', role: 'Professor' },
        { id: 'f049', name: 'Maths-Snehal Patel', code: 'SDP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f050', name: 'Maths-Shailesh Patel', code: 'SAP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f051', name: 'Maths-Honey Patel', code: 'HJP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f052', name: 'Maths-Rajeshri Prajapati', code: 'MATHS-RKP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f053', name: 'Maths-Hitesh Patel', code: 'HAP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f054', name: 'Maths-Harshad Patel', code: 'HP', dept: 'Mathematics', role: 'Professor' },
        { id: 'f055', name: 'EC-Dr. Vijay Patel', code: 'VKP', dept: 'Electronics/Physics', role: 'Doctor' },
        { id: 'f056', name: 'EC-Dr. Dilip Kothari', code: 'DKK', dept: 'Electronics/Physics', role: 'Doctor' },
        { id: 'f057', name: 'EC-Dr. Amrut Patel', code: 'ANP', dept: 'Electronics/Physics', role: 'Doctor' },
        { id: 'f058', name: 'EC-Prof. Ketan Patel', code: 'KJP', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f059', name: 'EC-Prof. Bhavesh Soni', code: 'BHS', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f060', name: 'EC-Prof. Samir Joshi', code: 'SBJ', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f061', name: 'EC-Prof. Bhumit Patel', code: 'BPP', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f062', name: 'EC-Prof. Priyanka Patel', code: 'PKP', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f063', name: 'EC-Prof. Darshan Desai', code: 'DBD', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f064', name: 'EC-Prof. Mohit Bhavsar', code: 'MAB', dept: 'Electronics/Physics', role: 'Professor' },
        { id: 'f065', name: 'ICT-Prof. Umesh Lakhtariya', code: 'UPL', dept: 'ICT', role: 'Professor' },
        { id: 'f066', name: 'ENG-Abhishek Raval', code: 'AAR', dept: 'English', role: 'Professor' },
        { id: 'f067', name: 'ENG-Dr. Kashyap Gajjar', code: 'ENG-KG', dept: 'English', role: 'Doctor' },
        { id: 'f068', name: 'ENG-Vinay Patel', code: 'VNP', dept: 'English', role: 'Professor' },
        { id: 'f069', name: 'ENG-Dr. Mirav Patel', code: 'ENG-MBP', dept: 'English', role: 'Doctor' },
        { id: 'f070', name: 'Ashish Shah (Expert)', code: 'AS-EXP', dept: 'Expert', role: 'Expert' },
        { id: 'f071', name: 'Dr. Paresh Solanki', code: 'PMS', dept: 'Computer Engineering/IT', role: 'Doctor' },
        { id: 'f072', name: 'Dr. Devang Pandya', code: 'DSP', dept: 'Computer Engineering/IT', role: 'Doctor' },
        { id: 'f073', name: 'Dr. Pravesh Patel', code: 'PSP', dept: 'Computer Engineering/IT', role: 'Doctor' },
        { id: 'f074', name: 'Prof. Ketan Sarvakar', code: 'KJS', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f075', name: 'Prof. Rachna Modi', code: 'RVM', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f076', name: 'Prof. Bhavisha Suthar', code: 'BRS', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f077', name: 'Prof. Chirag Gami', code: 'CCG', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f078', name: 'Prof. Himanshu Patel', code: 'HHP', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f079', name: 'Prof. Hiteshri Modi', code: 'HNM', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f080', name: 'Prof. Ravi Raval', code: 'RFR', dept: 'Computer Engineering/IT', role: 'Professor' },
        { id: 'f081', name: 'Hetal Patel', code: 'HRP', dept: 'Computer Engineering', role: 'Professor' },
    ],
};

function get(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
    catch { return null; }
}
function set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

export function init() {
    if (!get(KEYS.classrooms)) set(KEYS.classrooms, DEFAULTS.classrooms);
    if (!get(KEYS.divisions)) set(KEYS.divisions, DEFAULTS.divisions);
    if (!get(KEYS.subjects)) set(KEYS.subjects, DEFAULTS.subjects);
    if (!get(KEYS.faculty)) set(KEYS.faculty, DEFAULTS.faculty);
}

export function uid() { return 'id_' + Math.random().toString(36).substr(2, 9); }

// Classrooms
export const getClassrooms = () => get(KEYS.classrooms) ?? [];
export const setClassrooms = (d) => set(KEYS.classrooms, d);

// Divisions
export const getDivisions = () => get(KEYS.divisions) ?? [];
export const setDivisions = (d) => set(KEYS.divisions, d);
export const getDivisionsBySem = (s) => getDivisions().filter(d => d.semester === Number(s));

// Subjects
export const getSubjects = () => get(KEYS.subjects) ?? {};
export const setSubjects = (d) => set(KEYS.subjects, d);
export const getSubjectsBySem = (s) => { const sb = getSubjects(); return sb[s] ?? { core: [], electives: [] }; };
export const getAllUniqueSubjects = () => {
    const all = getSubjects();
    const unique = new Map();
    const norm = (s) => (typeof s === 'object' && s !== null) ? s : { name: s, shortCode: s, code: '' };

    Object.values(all).forEach(sem => {
        [...(sem.core || []), ...(sem.electives || []).flatMap(g => g.options || [])].forEach(s => {
            const n = norm(s);
            const id = n.code || n.name;
            if (!unique.has(id)) unique.set(id, n);
        });
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
};


// Subject helpers — handle both plain string ("OS") and object ({code, shortCode, name})
export const subjectName = (s) => (typeof s === 'object' && s !== null) ? s.name : s;
export const subjectShortCode = (s) => (typeof s === 'object' && s !== null) ? s.shortCode : s;
export const subjectFullCode = (s) => (typeof s === 'object' && s !== null) ? s.code : '';
// Display: "OS — Operating Systems" for objects, plain string otherwise
export const subjectDisplay = (s) => (typeof s === 'object' && s !== null) ? `${s.shortCode} — ${s.name}` : s;
// Flatten core subjects to plain names (for timetable generator compatibility)
export const coreNames = (semSubjects) => (semSubjects.core || []).map(subjectName);


// Allocation
export const getAllocation = () => get(KEYS.allocation) ?? {};
export const setAllocation = (d) => set(KEYS.allocation, d);

// Timetables
export const getTimetables = () => get(KEYS.timetables) ?? {};
export const setTimetables = (d) => set(KEYS.timetables, d);

// Faculty
export const getFaculty = () => get(KEYS.faculty) ?? [];
export const setFaculty = (d) => set(KEYS.faculty, d);
export const FACULTY_ROLES = ['Professor', 'Doctor', 'TA', 'Visiting', 'Expert'];
export const FACULTY_DEPTS = ['Computer Engineering/IT', 'Computer Engineering', 'Mathematics', 'Electronics/Physics', 'ICT', 'English', 'Expert'];

// ---- Allocation Engine ----
export function runAllocationForSem(sem) {
    const divisions = getDivisionsBySem(sem);
    const classrooms = getClassrooms().slice().sort((a, b) => a.capacity - b.capacity);
    const results = {};

    divisions.forEach(div => {
        const fit = classrooms.find(r => r.capacity >= div.strength);
        results[div.id] = fit
            ? { type: 'individual', classroom: fit.id }
            : { type: 'overflow', classroom: classrooms.length ? classrooms[classrooms.length - 1].id : null };
    });

    // Combine suggestions
    const sorted = [...divisions].sort((a, b) => a.strength - b.strength);
    for (let i = 0; i < sorted.length - 1; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            const combined = sorted[i].strength + sorted[j].strength;
            const fit = classrooms.find(r => r.capacity >= combined);
            if (fit) {
                [sorted[i], sorted[j]].forEach(d => {
                    if (results[d.id]) {
                        results[d.id].combineSuggestion = {
                            partner: d.id === sorted[i].id ? sorted[j].id : sorted[i].id,
                            partnerName: d.id === sorted[i].id ? sorted[j].name : sorted[i].name,
                            combined,
                            classroomId: fit.id,
                            classroomName: fit.name,
                        };
                    }
                });
            }
        }
    }
    return results;
}

// ---- Timetable Generator ----
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Actual college time slots - Evening
const EVENING_THEORY_PERIODS = ['11:40-12:30', '12:30-1:20', '2:10-2:55', '2:55-3:40', '3:50-4:35', '4:35-5:20'];
const EVENING_LAB_BLOCKS = [
    { label: 'Lab A', periods: ['11:40-12:30', '12:30-1:20'] },
    { label: 'Lab B', periods: ['2:10-2:55', '2:55-3:40'] },
    { label: 'Lab C', periods: ['3:50-4:35', '4:35-5:20'] },
];
const EVENING_ALL_SLOTS = [
    '11:40-12:30', '12:30-1:20', '1:20-2:10', // 1:20-2:10 Lunch
    '2:10-2:55', '2:55-3:40', '3:40-3:50',   // 3:40-3:50 Short break
    '3:50-4:35', '4:35-5:20',
];

// Actual college time slots - Morning
const MORNING_THEORY_PERIODS = ['8:30-9:20', '9:20-10:10', '11:00-11:45', '11:45-12:30', '12:40-1:25', '1:25-2:10'];
const MORNING_LAB_BLOCKS = [
    { label: 'Lab A', periods: ['8:30-9:20', '9:20-10:10'] },
    { label: 'Lab B', periods: ['11:00-11:45', '11:45-12:30'] },
    { label: 'Lab C', periods: ['12:40-1:25', '1:25-2:10'] },
];
const MORNING_ALL_SLOTS = [
    '8:30-9:20', '9:20-10:10', '10:10-11:00', // 10:10-11:00 Lunch equivalent
    '11:00-11:45', '11:45-12:30', '12:30-12:40', // 12:30-12:40 Short break equivalent
    '12:40-1:25', '1:25-2:10',
];

const COMBINED_SLOTS = [...MORNING_ALL_SLOTS, ...EVENING_ALL_SLOTS];

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function generateTimetable(sem, divName, divStrength = 60, shift = 'evening') {
    const { core, electives } = getSubjectsBySem(sem);
    const THEORY_PERIODS = shift === 'morning' ? MORNING_THEORY_PERIODS : EVENING_THEORY_PERIODS;
    const LAB_BLOCKS = shift === 'morning' ? MORNING_LAB_BLOCKS : EVENING_LAB_BLOCKS;
    const ALL_SLOTS = shift === 'morning' ? MORNING_ALL_SLOTS : EVENING_ALL_SLOTS;

    // Normalize subject entries
    const norm = (s) => (typeof s === 'object' && s !== null) ? s : { name: s, hasLab: false, labOnly: false };
    const subjects = core.map(norm);
    if (electives.length) {
        const firstOpt = electives[0]?.options?.[0];
        if (firstOpt) subjects.push({ ...norm(firstOpt), hasLab: false, labOnly: false });
    }

    // Categorise subjects
    let labSubjects = subjects.filter(s => s.hasLab || s.labOnly);
    let theorySubjects = subjects.filter(s => !s.labOnly);

    // Helper for display name
    const getDispName = (s) => s.shortCode || s.name || s;

    // Randomize subject order
    labSubjects = shuffleArray(labSubjects);
    theorySubjects = shuffleArray(theorySubjects);

    // ---- Room selection ----
    const allRooms = getClassrooms();
    // For theory: pick smallest classroom that fits divStrength (prefer classroom type)
    const classroomRooms = allRooms
        .filter(r => (r.type || 'classroom') === 'classroom' && r.capacity >= divStrength)
        .sort((a, b) => a.capacity - b.capacity);
    const theoryRoom = classroomRooms[0] || allRooms.filter(r => (r.type || 'classroom') === 'classroom').sort((a, b) => b.capacity - a.capacity)[0] || null;

    // For labs: get all lab rooms, rotate one per lab subject
    const labRooms = allRooms
        .filter(r => r.type === 'lab')
        .sort((a, b) => a.name.localeCompare(b.name));

    // Build empty grid
    const grid = {};
    DAYS.forEach(day => {
        grid[day] = {};
        ALL_SLOTS.forEach(slot => {
            if (slot === '1:20-2:10' || slot === '10:10-11:00') grid[day][slot] = { subject: 'Lunch Break', type: 'break', room: '' };
            else if (slot === '3:40-3:50' || slot === '12:30-12:40') grid[day][slot] = { subject: 'Short Break', type: 'break', room: '' };
            else grid[day][slot] = { subject: '', type: 'empty', room: '' };
        });
    });

    // ---- Faculty assignment helper ----
    const allFaculty = getFaculty();
    const allUniqueSubs = getAllUniqueSubjects(); // Get normalized version of all subjects

    const findFaculties = (subjName, count = 1) => {
        const baseName = subjName.replace(' Lab', '');

        const subObj = allUniqueSubs.find(s => s.name === baseName || s.shortCode === baseName);
        const nameToMatch = subObj ? subObj.name : baseName;
        const codeToMatch = subObj ? subObj.shortCode : baseName;

        // 1. Get faculties explicitly assigned to this subject
        let matches = allFaculty.filter(f =>
            (f.assignedSubjects || []).some(s => s === nameToMatch || s === codeToMatch)
        );
        let codes = matches.map(m => m.code);

        // 2. If we need more faculties (e.g. 3 for concurrent lab batches), pick random unassigned ones
        if (codes.length < count) {
            const assignedSet = new Set(codes);
            const others = allFaculty.filter(f => !assignedSet.has(f.code));
            const shuffledOthers = shuffleArray(others);

            while (codes.length < count && shuffledOthers.length > 0) {
                codes.push(shuffledOthers.pop().code);
            }
        }

        // 3. Ensure we have EXACTLY 'count' unique faculties to avoid duplicate assignments at the same time
        const finalCodes = Array.from(new Set(codes)).slice(0, count);

        // Pad with 'TBD' only if we literally run out of faculty in the system (unlikely)
        while (finalCodes.length < count) finalCodes.push('TBD');

        return shuffleArray(finalCodes);
    };

    const findFaculty = (subjName) => findFaculties(subjName, 1)[0] || '';

    // ---- Assign 2-hour lab blocks ----
    let dayIdx = Math.floor(Math.random() * DAYS.length);
    let blockIdx = Math.floor(Math.random() * LAB_BLOCKS.length);
    const labDaysCount = {}; // { Monday: 1, Tuesday: 2, ... }

    labSubjects.forEach((subj, si) => {
        // We need 3 faculties for 3 batches
        const facCodes = findFaculties(subj.name, 3);
        let assigned = false;
        let tries = 0;

        while (!assigned && tries < DAYS.length * LAB_BLOCKS.length) {
            const day = DAYS[dayIdx % DAYS.length];
            const block = LAB_BLOCKS[blockIdx % LAB_BLOCKS.length];

            // Check if day already has 2 labs AND if periods are empty
            const dayLabCount = labDaysCount[day] || 0;
            const canFit = block.periods.every(p => grid[day][p].type === 'empty');

            if (dayLabCount < 2 && canFit) {
                // Pick 3 unique lab rooms for this slot
                const shuffledLabs = shuffleArray(labRooms);
                const assignedLabs = shuffledLabs.slice(0, 3);

                block.periods.forEach(p => {
                    grid[day][p] = {
                        subject: getDispName(subj),
                        type: 'lab',
                        isLab: true, // Marker for UI
                        batches: [
                            { name: '1', room: assignedLabs[0]?.name || 'TBD', faculty: facCodes[0] },
                            { name: '2', room: assignedLabs[1]?.name || 'TBD', faculty: facCodes[1] },
                            { name: '3', room: assignedLabs[2]?.name || 'TBD', faculty: facCodes[2] },
                        ]
                    };
                });
                labDaysCount[day] = (labDaysCount[day] || 0) + 1;
                assigned = true;
            }
            blockIdx++;
            if (blockIdx % LAB_BLOCKS.length === 0) dayIdx++;
            tries++;
        }
    });

    // ---- Assign theory to remaining empty slots ----
    let tIdx = Math.floor(Math.random() * theorySubjects.length);
    const usedPerDay = {};
    DAYS.forEach(day => {
        usedPerDay[day] = new Set();
        ALL_SLOTS.forEach(slot => {
            if (grid[day][slot]?.type === 'lab') {
                const base = grid[day][slot].subject;
                usedPerDay[day].add(base);
            }
        });
    });

    DAYS.forEach(day => {
        const emptySlots = THEORY_PERIODS.filter(p => grid[day][p].type === 'empty');
        emptySlots.forEach(() => {
            let attempts = 0;
            while (attempts < theorySubjects.length) {
                const subj = theorySubjects[tIdx % theorySubjects.length];
                tIdx++; attempts++;
                const subName = getDispName(subj);
                const emptyP = THEORY_PERIODS.find(p => grid[day][p].type === 'empty');
                if (!emptyP) break;
                if (!usedPerDay[day].has(subName)) {
                    grid[day][emptyP] = {
                        subject: subName,
                        type: 'theory',
                        room: theoryRoom ? theoryRoom.name : '',
                        faculty: findFaculty(subj.name || subj),
                        isWholeClass: true // Marker for UI
                    };
                    usedPerDay[day].add(subName);
                    break;
                }
            }
        });
    });

    return { days: DAYS, periods: ALL_SLOTS, grid, sem, divName, divStrength, theoryRoom: theoryRoom?.name || '', shift };
}

/**
 * Aggregates a personal timetable for a specific faculty member across all divisions.
 */
function getFacultyTimetable(facultyCode) {
    if (!facultyCode) return null;
    const allTT = getTimetables();
    const resultGrid = {};

    // Initialize empty grid
    DAYS.forEach(d => {
        resultGrid[d] = {};
        COMBINED_SLOTS.forEach(p => { resultGrid[d][p] = null; });
    });

    Object.values(allTT).forEach(tt => {
        Object.keys(tt.grid || {}).forEach(day => {
            Object.keys(tt.grid[day] || {}).forEach(period => {
                const slot = tt.grid[day][period];
                if (!slot) return;

                if (slot.type === 'theory' && slot.faculty === facultyCode) {
                    resultGrid[day][period] = {
                        subject: slot.subject,
                        type: 'theory',
                        division: tt.divName,
                        room: slot.room
                    };
                } else if (slot.type === 'lab' && slot.batches) {
                    const myBatch = slot.batches.find(b => b.faculty === facultyCode);
                    if (myBatch) {
                        resultGrid[day][period] = {
                            subject: slot.subject,
                            type: 'lab',
                            division: tt.divName,
                            semester: tt.sem,
                            batch: myBatch.name,
                            room: myBatch.room
                        };
                    }
                }
            });
        });
    });

    return { days: DAYS, periods: COMBINED_SLOTS, grid: resultGrid };
}

/**
 * Aggregates a personal timetable for a specific classroom across all divisions.
 */
function getClassroomTimetable(roomName) {
    if (!roomName) return null;
    const allTT = getTimetables();
    const resultGrid = {};

    // Initialize empty grid
    DAYS.forEach(d => {
        resultGrid[d] = {};
        COMBINED_SLOTS.forEach(p => { resultGrid[d][p] = null; });
    });

    Object.values(allTT).forEach(tt => {
        Object.keys(tt.grid || {}).forEach(day => {
            Object.keys(tt.grid[day] || {}).forEach(period => {
                const slot = tt.grid[day][period];
                if (!slot) return;

                if (slot.type === 'theory' && slot.room === roomName) {
                    resultGrid[day][period] = {
                        subject: slot.subject,
                        type: 'theory',
                        division: tt.divName,
                        faculty: slot.faculty
                    };
                } else if (slot.type === 'lab' && slot.batches) {
                    const myBatches = slot.batches.filter(b => b.room === roomName);
                    if (myBatches.length > 0) {
                        resultGrid[day][period] = {
                            subject: slot.subject,
                            type: 'lab',
                            division: tt.divName,
                            semester: tt.sem,
                            batches: myBatches.map(b => ({ name: b.name, faculty: b.faculty }))
                        };
                    }
                }
            });
        });
    });

    return { days: DAYS, periods: COMBINED_SLOTS, grid: resultGrid };
}

/**
 * Aggregates a personal timetable for a specific subject across all divisions.
 */
function getSubjectTimetable(subjectId) {
    if (!subjectId) return null;
    const allTT = getTimetables();
    const allSubs = getAllUniqueSubjects();
    const target = allSubs.find(s => (s.code || s.name) === subjectId) || { name: subjectId, shortCode: subjectId, code: subjectId };

    const resultGrid = {};

    // Initialize empty grid
    DAYS.forEach(d => {
        resultGrid[d] = {};
        COMBINED_SLOTS.forEach(p => { resultGrid[d][p] = null; });
    });

    const isMatch = (val) => {
        if (!val) return false;
        const s = typeof val === 'object' ? (val.shortCode || val.code || val.name) : val;
        return s === target.shortCode || s === target.name || s === target.code;
    };

    Object.values(allTT).forEach(tt => {
        Object.keys(tt.grid || {}).forEach(day => {
            Object.keys(tt.grid[day] || {}).forEach(period => {
                const slot = tt.grid[day][period];
                if (!slot) return;

                if (slot.type === 'theory' && isMatch(slot.subject)) {
                    resultGrid[day][period] = {
                        type: 'theory',
                        division: tt.divName,
                        faculty: slot.faculty,
                        room: slot.room
                    };
                } else if (slot.type === 'lab' && isMatch(slot.subject)) {
                    if (slot.batches) {
                        resultGrid[day][period] = {
                            type: 'lab',
                            division: tt.divName,
                            semester: tt.sem,
                            batches: slot.batches.map(b => ({ name: b.name, faculty: b.faculty, room: b.room }))
                        };
                    }
                }
            });
        });
    });

    return { days: DAYS, periods: COMBINED_SLOTS, grid: resultGrid };
}

// Extracted update individual slot across the timetables (for user manual edit on aggregates)
export function updateTimetableSlotGlobal(divName, semester, day, period, updatedSlotData) {
    const allTT = getTimetables();
    const key = `${semester}_${divName}`;
    const tt = allTT[key];
    if (tt && tt.grid[day] && tt.grid[day][period]) {
        if (updatedSlotData.isBatchEdit) {
            // Updated a specific lab batch
            tt.grid[day][period].batches[updatedSlotData.batchIndex] = {
                ...tt.grid[day][period].batches[updatedSlotData.batchIndex],
                ...updatedSlotData.data
            };
        } else {
            // Updated a theory slot
            tt.grid[day][period] = { ...tt.grid[day][period], ...updatedSlotData.data };
        }
        setTimetables(allTT);
        return true;
    }
    return false;
}

export { DAYS, COMBINED_SLOTS as PERIODS, getFacultyTimetable, getClassroomTimetable, getSubjectTimetable };


