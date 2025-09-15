/* db.js - gestione centralizzata tasks e note */

// ========================
// CONSTANTS
// ========================
const TASKS_KEY = "tasks";
const DIARY_NOTES_KEY = "diary_notes";

// ========================
// UTILS
// ========================
function pad2(n) { return String(n).padStart(2, "0"); }
function toDateKey(d) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function generateId() { return Math.random().toString(36).substr(2, 9); }

// ========================
// TASKS
// ========================
function getAllTasks() {
    try {
        const raw = localStorage.getItem(TASKS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch(e) { console.warn("Errore parsing tasks", e); return []; }
}

function saveAllTasks(tasks) {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
    catch(e){ console.warn("Errore salvataggio tasks", e); }
}

// Crea un task e ritorna l’oggetto salvato
function createTask({date, subject, descr="", completed=false, isTest=false, priority=2}) {
    const tasks = getAllTasks();
    const newTask = { id: generateId(), date, subject, descr, completed, isTest, priority };
    tasks.push(newTask);
    saveAllTasks(tasks);
    return newTask;
}

// Modifica task esistente
function updateTask(taskId, newData) {
    const tasks = getAllTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...newData };
    saveAllTasks(tasks);
    return tasks[idx];
}

// Elimina task
function deleteTask(taskId) {
    let tasks = getAllTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    saveAllTasks(tasks);
}

// Toggle completamento
function toggleTaskComplete(taskId, completed) {
    return updateTask(taskId, { completed });
}

// Filtra task per data e ordina
function getTasksByDate(dateKey) {
    const tasks = getAllTasks();
    const filtered = tasks.filter(t => t.date === dateKey);
    // Ordinamento: priorità → isTest → completati
    filtered.sort((a,b) => {
        if(a.priority !== b.priority) return a.priority - b.priority;
        if(a.isTest !== b.isTest) return (a.isTest ? -1 : 1);
        if(a.completed !== b.completed) return (a.completed ? 1 : -1);
        return 0;
    });
    return filtered;
}

// ========================
// NOTE
// ========================
function loadAllNotes() {
    try { return JSON.parse(localStorage.getItem(DIARY_NOTES_KEY)) || {}; }
    catch(e){ console.warn("Errore parsing diary notes", e); return {}; }
}

function saveAllNotes(notesObj) {
    try { localStorage.setItem(DIARY_NOTES_KEY, JSON.stringify(notesObj)); }
    catch(e){ console.warn("Errore salvataggio diary notes", e); }
}

function loadNoteFor(dateKey) {
    const notes = loadAllNotes();
    return notes[dateKey] || "";
}

function saveNoteFor(dateKey, text) {
    const notes = loadAllNotes();
    if(text && text.trim()) notes[dateKey] = text;
    else delete notes[dateKey];
    saveAllNotes(notes);
}

// ========================
// EXPORTS GLOBALI
// ========================
window.DB = {
    getAllTasks,
    saveAllTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getTasksByDate,
    loadAllNotes,
    saveAllNotes,
    loadNoteFor,
    saveNoteFor
};

