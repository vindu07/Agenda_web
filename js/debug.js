// debug.js - dati finti per sviluppo

// -----------------------------
// TASKS (Dashboard)
// -----------------------------
const fakeTasks = [
    { id: 1, materia: "Matematica", descrizione: "Esercizi pag. 42-45", completato: false },
    { id: 2, materia: "Italiano", descrizione: "Leggere capitolo 5", completato: true },
    { id: 3, materia: "Inglese", descrizione: "Scrivere tema su hobbies", completato: false },
    { id: 4, materia: "Scienze", descrizione: "Studiare sistema solare", completato: false }
];

// Funzione per renderizzare i task nella Dashboard
function renderTasks() {
    const taskList = document.getElementById("task-list");
    if (!taskList) return;

    taskList.innerHTML = "";
    fakeTasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${task.materia}</strong>: ${task.descrizione}`;
        if (task.completato) li.style.cssText = "color: gray; font-style: italic;";
        taskList.appendChild(li);
    });
}

// -----------------------------
// CALENDARIO (Calendario)
// -----------------------------
const fakeEvents = [
    { date: "2025-09-15", evento: "Verifica Matematica" },
    { date: "2025-09-17", evento: "Compito Inglese" },
    { date: "2025-09-20", evento: "Gita scolastica" }
];

function renderCalendar() {
    const grid = document.getElementById("calendar-grid");
    if (!grid) return;

    grid.innerHTML = "";
    fakeEvents.forEach(event => {
        const div = document.createElement("div");
        div.textContent = `${event.date}: ${event.evento}`;
        grid.appendChild(div);
    });
}

// -----------------------------
// DIARIO (Diario)
// -----------------------------
const fakeDiaryPages = [
    { date: "2025-09-15", note: "Inizio lezione di Matematica, argomento frazioni." },
    { date: "2025-09-16", note: "Lezione di Italiano, lettura capitolo 5." },
    { date: "2025-09-17", note: "Lezione di Scienze, laboratorio cellule." }
];

function renderDiary() {
    const container = document.getElementById("diary-pages");
    if (!container) return;

    container.innerHTML = "";
    fakeDiaryPages.forEach(page => {
        const div = document.createElement("div");
        div.style.borderBottom = "1px solid #555";
        div.style.padding = "5px 0";
        div.innerHTML = `<strong>${page.date}</strong>: ${page.note}`;
        container.appendChild(div);
    });
}

// -----------------------------
// ORARIO (Timetable)
// -----------------------------
const fakeTimetable = [
    { giorno: "Lunedì", ora: "08:00-09:00", materia: "Matematica" },
    { giorno: "Lunedì", ora: "09:00-10:00", materia: "Italiano" },
    { giorno: "Martedì", ora: "08:00-09:00", materia: "Inglese" },
    { giorno: "Martedì", ora: "09:00-10:00", materia: "Scienze" }
];

function renderTimetable() {
    const grid = document.getElementById("timetable-grid");
    if (!grid) return;

    grid.innerHTML = "";
    fakeTimetable.forEach(slot => {
        const div = document.createElement("div");
        div.textContent = `${slot.giorno} ${slot.ora}: ${slot.materia}`;
        grid.appendChild(div);
    });
}

// -----------------------------
// INIT DEBUG RENDER
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
    renderCalendar();
    renderDiary();
    renderTimetable();
});

