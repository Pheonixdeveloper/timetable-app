// ============================================================
//  CE Timetable — Shared Data Store (localStorage)
// ============================================================

const DB = {
    // ---- keys ----
    KEYS: {
        classrooms: 'tt_classrooms',
        divisions: 'tt_divisions',
        subjects: 'tt_subjects',
        allocation: 'tt_allocation',
        timetables: 'tt_timetables',
    },

    // ---- seed defaults ----
    DEFAULTS: {
        classrooms: [
            { id: 'r1', name: '1NB210', capacity: 120 },
            { id: 'r2', name: '1NB002', capacity: 80 },
            { id: 'r3', name: '1NB108', capacity: 100 },
        ],

        divisions: [
            // Sem 1
            { id: 'd1_a', semester: 1, name: '1CE-A', strength: 65 },
            { id: 'd1_b', semester: 1, name: '1CE-B', strength: 70 },
            // Sem 2
            { id: 'd2_a', semester: 2, name: '2CE-A', strength: 60 },
            { id: 'd2_b', semester: 2, name: '2CE-B', strength: 72 },
            // Sem 3
            { id: 'd3_a', semester: 3, name: '3CE-A', strength: 58 },
            { id: 'd3_b', semester: 3, name: '3CE-B', strength: 80 },
            // Sem 4
            { id: 'd4_a', semester: 4, name: '4CE-A', strength: 60 },
            { id: 'd4_b', semester: 4, name: '4CE-B', strength: 75 },
            { id: 'd4_c', semester: 4, name: '4CE-C', strength: 35 },
            { id: 'd4_d', semester: 4, name: '4CE-D', strength: 90 },
            { id: 'd4_e', semester: 4, name: '4CE-E', strength: 58 },
            // Sem 5
            { id: 'd5_a', semester: 5, name: '5CE-A', strength: 55 },
            { id: 'd5_b', semester: 5, name: '5CE-B', strength: 60 },
            // Sem 6
            { id: 'd6_a', semester: 6, name: '6CE-A', strength: 52 },
            { id: 'd6_b', semester: 6, name: '6CE-B', strength: 58 },
            // Sem 7
            { id: 'd7_a', semester: 7, name: '7CE-A', strength: 50 },
            { id: 'd7_b', semester: 7, name: '7CE-B', strength: 55 },
            // Sem 8
            { id: 'd8_a', semester: 8, name: '8CE-A', strength: 48 },
            { id: 'd8_b', semester: 8, name: '8CE-B', strength: 52 },
        ],

        subjects: {
            1: {
                core: ['Mathematics-I', 'Engineering Physics', 'Programming Fundamentals (C)', 'English Communication', 'Workshop Practice', 'Physics Lab', 'Programming Lab'],
                electives: []
            },
            2: {
                core: ['Mathematics-II', 'Engineering Chemistry', 'Data Structures', 'Digital Logic Design', 'Environmental Science', 'Chemistry Lab', 'DS Lab'],
                electives: []
            },
            3: {
                core: ['Mathematics-III', 'Database Management System', 'Operating Systems', 'Object Oriented Programming', 'Discrete Mathematics', 'DBMS Lab', 'OOP Lab'],
                electives: []
            },
            4: {
                core: ['Theory of Computation', 'Computer Networks', 'Software Engineering', 'Design & Analysis of Algorithms', 'Mathematics-IV', 'Networks Lab', 'SE Lab'],
                electives: []
            },
            5: {
                core: ['Compiler Design', 'Computer Networks-II', 'Microprocessor & Embedded Systems', 'Professional Ethics'],
                electives: [
                    { group: 'E1', options: ['Machine Learning', 'Big Data Analytics', 'IoT Systems'] },
                ]
            },
            6: {
                core: ['Information & Network Security', 'Cloud Computing', 'Software Testing'],
                electives: [
                    { group: 'E1', options: ['Deep Learning', 'Blockchain Technology', 'Mobile Application Development'] },
                    { group: 'E2', options: ['Image Processing', 'Natural Language Processing', 'Distributed Systems'] },
                ]
            },
            7: {
                core: ['Project Management', 'Entrepreneurship'],
                electives: [
                    { group: 'E1', options: ['Data Science', 'Cyber Security', 'AR/VR Technology'] },
                    { group: 'E2', options: ['Quantum Computing', 'Robotics', 'DevOps Engineering'] },
                ]
            },
            8: {
                core: ['Major Project', 'Industrial Training Report'],
                electives: [
                    { group: 'E1', options: ['Advanced AI', 'Digital Forensics', 'Edge Computing'] },
                ]
            },
        },
    },

    // ---- helpers ----
    get(key) {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // ---- initialise (call once on each page) ----
    init() {
        for (const [name, key] of Object.entries(this.KEYS)) {
            if (name === 'subjects') {
                if (!this.get(key)) this.set(key, this.DEFAULTS[name]);
            } else if (this.DEFAULTS[name] && !this.get(key)) {
                this.set(key, this.DEFAULTS[name]);
            }
        }
    },

    // ---- classrooms ----
    getClassrooms() { return this.get(this.KEYS.classrooms) || []; },
    setClassrooms(data) { this.set(this.KEYS.classrooms, data); },

    // ---- divisions ----
    getDivisions() { return this.get(this.KEYS.divisions) || []; },
    setDivisions(data) { this.set(this.KEYS.divisions, data); },
    getDivisionsBySem(sem) { return this.getDivisions().filter(d => d.semester === Number(sem)); },

    // ---- subjects ----
    getSubjects() { return this.get(this.KEYS.subjects) || {}; },
    setSubjects(data) { this.set(this.KEYS.subjects, data); },
    getSubjectsBySem(sem) { const s = this.getSubjects(); return s[sem] || { core: [], electives: [] }; },

    // ---- allocation ----
    getAllocation() { return this.get(this.KEYS.allocation) || {}; },
    setAllocation(data) { this.set(this.KEYS.allocation, data); },

    // ---- timetables ----
    getTimetables() { return this.get(this.KEYS.timetables) || {}; },
    setTimetables(data) { this.set(this.KEYS.timetables, data); },
    getTimetableKey(sem, div) { return `${sem}_${div}`; },

    // ---- uid ----
    uid() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },

    // ---- allocation engine ----
    runAllocationForSem(sem) {
        const divisions = this.getDivisionsBySem(sem);
        const classrooms = this.getClassrooms().slice().sort((a, b) => a.capacity - b.capacity);
        const results = {};

        divisions.forEach(div => {
            const fit = classrooms.find(r => r.capacity >= div.strength);
            if (fit) {
                results[div.id] = {
                    type: 'individual',
                    divisions: [div.id],
                    classroom: fit.id,
                    note: `${div.name} (${div.strength} students) → ${fit.name} (cap: ${fit.capacity})`
                };
            } else {
                // Try to find largest room and suggest combining
                const largest = classrooms[classrooms.length - 1];
                results[div.id] = {
                    type: 'overflow',
                    divisions: [div.id],
                    classroom: largest ? largest.id : null,
                    note: `${div.name} (${div.strength} students) exceeds all rooms. Largest: ${largest ? largest.name + ' (cap: ' + largest.capacity + ')' : 'None'}`
                };
            }
        });

        // Check for combine opportunities (small classes)
        const sorted = [...divisions].sort((a, b) => a.strength - b.strength);
        for (let i = 0; i < sorted.length - 1; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                const combined = sorted[i].strength + sorted[j].strength;
                const fit = classrooms.find(r => r.capacity >= combined);
                if (fit) {
                    const both = [sorted[i], sorted[j]];
                    both.forEach(d => {
                        if (!results[d.id] || results[d.id].type === 'individual') {
                            results[d.id].combineSuggestion = {
                                partner: d.id === sorted[i].id ? sorted[j].id : sorted[i].id,
                                partnerName: d.id === sorted[i].id ? sorted[j].name : sorted[i].name,
                                combined,
                                classroom: fit.id,
                                classroomName: fit.name,
                                note: `Can combine ${sorted[i].name}+${sorted[j].name} (${combined} students) → ${fit.name} (cap: ${fit.capacity})`
                            };
                        }
                    });
                }
            }
        }

        return results;
    }
};
