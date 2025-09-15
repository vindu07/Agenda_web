/* db.js - gestione unica database (tasks + notes) */

/* ===========================
   CONFIG
=========================== */
const TASKS_KEY = "tasks";            // array task
const DIARY_NOTES_KEY = "diary_notes"; // oggetto note { "YYYY-MM-DD": "testo" }

/* ===========================
   TASKS
=========================== */
function getTasks() {
    try {
        const raw = localStorage.getItem(TASKS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(e) { return []; }
}

function saveTasks(tasks) {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch(e){}
}

function addTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
}

/* ===========================
   NOTES
=========================== */
function getAllNotes() {
    try {
        const raw = localStorage.getItem(DIARY_NOTES_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch(e){ return {}; }
}

function saveAllNotes(notes) {
    try { localStorage.setItem(DIARY_NOTES_KEY, JSON.stringify(notes)); } catch(e){}
}

function getNote(dateKey) {
    const notes = getAllNotes();
    return notes[dateKey] || "";
}

function saveNote(dateKey, text) {
    const notes = getAllNotes();
    if(text && text.trim() !== "") notes[dateKey] = text;
    else delete notes[dateKey];
    saveAllNotes(notes);
}
