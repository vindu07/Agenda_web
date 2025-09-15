/* db.js - Gestione centralizzata dei task/verifiche */

const DB_TASKS_KEY = "tasks";

/* ===========================
   UTILS
=========================== */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/* ===========================
   TASK CRUD
=========================== */

// Ritorna tutti i task (array)
function getTasks() {
    try {
        const raw = localStorage.getItem(DB_TASKS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        console.warn("DB: errore parsing tasks", e);
        return [];
    }
}

// Salva array di task
function saveTasks(tasks) {
    try {
        localStorage.setItem(DB_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.warn("DB: errore salvataggio tasks", e);
    }
}

// Aggiunge un nuovo task e ritorna l'oggetto creato
function addTask({date, subject, descr="", isTest=false, priority=1, completed=false}) {
    const tasks = getTasks();
    const id = generateId();
    if(isTest) priority = 3; // Priorità massima automatica per le verifiche
    const task = {id, date, subject, descr, isTest, priority, completed};
    tasks.push(task);
    saveTasks(tasks);
    return task;
}

// Aggiorna un task esistente
function updateTask(id, fields) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if(idx === -1) return null;
    const task = tasks[idx];

    // Se la verifica, forza priorità max
    if(fields.isTest) fields.priority = 3;

    tasks[idx] = {...task, ...fields};
    saveTasks(tasks);
    return tasks[idx];
}

// Elimina un task per ID
function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    return tasks;
}

// Toggle completato
function toggleTaskCompleted(id) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if(idx === -1) return null;
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks(tasks);
    return tasks[idx];
}

/* ===========================
   FILTRI / QUERY
=========================== */

// Ritorna task per data, ordinati per priorità e verifiche
function getTasksForDate(dateKey) {
    let tasks = getTasks().filter(t => t.date === dateKey);
    tasks.sort((a, b) => {
        if(a.isTest !== b.isTest) return b.isTest - a.isTest; // verifiche prima
        return b.priority - a.priority; // priorità discendente
    });
    return tasks;
}


function getTasksForDate(dateKey) {
    return getTasks().filter(t => t.date === dateKey);
}

function addTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
    window.dispatchEvent(new CustomEvent("tasksUpdated"));
}

function updateTask(updatedTask) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === updatedTask.id);
    if (idx >= 0) {
        tasks[idx] = updatedTask;
        saveTasks(tasks);
        window.dispatchEvent(new CustomEvent("tasksUpdated"));
    }
}

function deleteTaskById(taskId) {
    const tasks = getTasks().filter(t => t.id !== taskId);
    saveTasks(tasks);
    window.dispatchEvent(new CustomEvent("tasksUpdated"));
}

function toggleTaskCompletedById(taskId, completed) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx >= 0) {
        tasks[idx].completed = completed;
        saveTasks(tasks);
        window.dispatchEvent(new CustomEvent("tasksUpdated"));
    }
}


// db.js - gestione unica tasks e notes

const DB = {
    TASKS_KEY: "tasks",
    NOTES_KEY: "diary_notes",

    getTasks() {
        try {
            const raw = localStorage.getItem(this.TASKS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    },

    saveTasks(tasks) {
        localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    },

    getNotes() {
        try {
            const raw = localStorage.getItem(this.NOTES_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    },

    saveNotes(notes) {
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
    }
};
