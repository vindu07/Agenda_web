/* diary.js
   Gestione pagina Diario:
   - mostra numero del giorno, nome del giorno, mese+anno
   - navigazione avanti/indietro e date-picker
   - mostra i compiti del giorno (se esistono) o il messaggio "niente da fare"
   - area note con salvataggio automatico in localStorage
   - integrazione minima con storage dei task (localStorage key: "tasks")
*/

/* ===========================
   CONFIG E KEY STORAGE
   =========================== */
const DIARY_NOTES_KEY = "diary_notes";   // oggetto { "YYYY-MM-DD": "testo..." }
const TASKS_KEY = "tasks";               // array di task {id, date: "YYYY-MM-DD", subject, descr, completed}
const ACCENT_COLOR_KEY = "diary_accent_color"; // opzionale: colore accento salvato
const NOTE_SAVE_DEBOUNCE_MS = 600;       // debounce per salvataggio note

/* ===========================
   UTILS
   =========================== */

// Aggiunge zero se necessario: 5 -> "05"
function pad2(n) {
    return String(n).padStart(2, "0");
}

// Converte Date -> YYYY-MM-DD (key coerente)
function toDateKey(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Crea un nuovo Date a mezzanotte per sicurezza (locale)
function normalizeToDate(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ===========================
   VARIABILI DI STATO
   =========================== */
let currentDate = normalizeToDate(new Date()); // data corrente visualizzata
let noteSaveTimer = null;

/* ===========================
   SELEZIONE ELEMENTI DOM (robusta)
   =========================== */
const el = {
    dayNumber: document.getElementById("day-number"),
    weekdayName: document.getElementById("weekday-name"),
    monthName: document.getElementById("month-name"),
    prevBtn: document.getElementById("prev-day"),
    nextBtn: document.getElementById("next-day"),
    datePicker: document.getElementById("date-picker"), // opzionale
    taskList: document.getElementById("task-list"),
    emptyMessage: document.getElementById("empty-message"),
    notesArea: document.getElementById("notes"),
    root: document.documentElement
};

// Safe guard: alcuni elementi potrebbero mancare in pagine di test
function ensureEl(name) {
    if (!el[name]) {
        // niente crash: console.warn per debug
        console.warn(`Diary: elemento DOM "${name}" non trovato.`);
    }
}

/* ===========================
   TESTI (italiano)
   =========================== */
const WEEKDAYS = [
    "Domenica", "Lunedì", "Martedì", "Mercoledì",
    "Giovedì", "Venerdì", "Sabato"
];

const MONTHS = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

/* ===========================
   ACCENT COLOR (opzionale)
   - imposta CSS variable --accent-color se salvata
   =========================== */
function loadAccentColor() {
    try {
        const col = localStorage.getItem(ACCENT_COLOR_KEY);
        if (col && el.root) {
            el.root.style.setProperty("--accent-color", col);
        }
    } catch (e) {
        console.warn("Diary: impossibile caricare accent color", e);
    }
}

/* ===========================
   TASKS STORAGE HELPERS
   - getTasks(): ritorna array (anche vuoto)
   - saveTasks(tasks): salva l'array
   =========================== */
function getTasks() {
    try {
        const raw = localStorage.getItem(TASKS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.warn("Diary: errore parsing tasks", e);
        return [];
    }
}

function saveTasks(tasksArray) {
    try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasksArray));
    } catch (e) {
        console.warn("Diary: errore salvataggio tasks", e);
    }
}

/* ===========================
   DIARY NOTES HELPERS
   - notes are stored as an object keyed by date string
   =========================== */
function loadAllNotes() {
    try {
        const raw = localStorage.getItem(DIARY_NOTES_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn("Diary: errore parsing diary notes", e);
        return {};
    }
}

function saveAllNotes(obj) {
    try {
        localStorage.setItem(DIARY_NOTES_KEY, JSON.stringify(obj));
    } catch (e) {
        console.warn("Diary: errore salvataggio diary notes", e);
    }
}

function loadNoteFor(dateKey) {
    const all = loadAllNotes();
    return all[dateKey] || "";
}

function saveNoteFor(dateKey, text) {
    const all = loadAllNotes();
    if (text && text.trim().length > 0) {
        all[dateKey] = text;
    } else {
        // elimina se vuoto per non inquinare storage
        delete all[dateKey];
    }
    saveAllNotes(all);
}

/* ===========================
   RENDER HEADER (numero, weekday, month+anno)
   - aggiorna testo e stile
   =========================== */
function renderHeaderFor(dateObj) {
    if (!el.dayNumber || !el.weekdayName || !el.monthName) return;

    const day = dateObj.getDate();
    const weekday = WEEKDAYS[dateObj.getDay()];
    const month = MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    el.dayNumber.textContent = day;
    el.weekdayName.textContent = weekday;
    el.monthName.textContent = `${month} ${year}`;

    // Applichiamo colore d'accento (via CSS variable) alle parti testuali grandi
    // Assicurati in CSS: #day-number, #weekday-name leggano --accent-color
}

/* ===========================
   RENDER TASKS PER DATA
   - cerca tasks in localStorage key TASKS_KEY
   - format expected: array di oggetti con campo .date = "YYYY-MM-DD"
   - se non ci sono task mostra empty message
   =========================== */
function renderTasksFor(dateKey) {
    // elementi UI
    const listEl = el.taskList;
    const emptyEl = el.emptyMessage;
    if (!listEl) return;

    // pulisci lista
    listEl.innerHTML = "";

    // prendi tasks e filtra per data
    const tasks = getTasks();
    const tasksForDay = tasks.filter(t => t && t.date === dateKey);

    if (!tasksForDay || tasksForDay.length === 0) {
        // mostra messaggio empty (se presente)
        if (emptyEl) {
            emptyEl.classList.remove("hidden");
        }
        return;
    } else {
        if (emptyEl) emptyEl.classList.add("hidden");
    }

    // ordina: verifiche (isTest true) prima, poi incompleti, poi completati
    tasksForDay.sort((a, b) => {
        const aTest = a.isTest ? 0 : 1;
        const bTest = b.isTest ? 0 : 1;
        if (aTest !== bTest) return aTest - bTest;
        const aCompleted = a.completed ? 1 : 0;
        const bCompleted = b.completed ? 1 : 0;
        return aCompleted - bCompleted;
    });

    // crea elementi DOM per ogni task
    tasksForDay.forEach(task => {
        const li = document.createElement("li");
        li.className = "diary-task-item";
        // data-task-id per event delegation
        li.setAttribute("data-task-id", task.id ?? "");

        // checkbox
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!task.completed;
        cb.className = "task-complete-checkbox";
        cb.setAttribute("aria-label", "Segna come completato");

        // subject / descrizione
        const textWrap = document.createElement("div");
        textWrap.className = "task-text";
        const subj = document.createElement("strong");
        subj.textContent = task.subject || "Compito";
        const desc = document.createElement("div");
        desc.textContent = task.descr || "";
        desc.className = "task-desc";

        textWrap.appendChild(subj);
        if (task.descr) textWrap.appendChild(desc);

        // delete button
        const del = document.createElement("button");
        del.className = "task-delete-btn";
        del.setAttribute("aria-label", "Elimina compito");
        del.textContent = "🗑";

        // se completato, aggiungi classe
        if (task.completed) {
            li.classList.add("completed");
        }

        // append al li
        li.appendChild(cb);
        li.appendChild(textWrap);
        li.appendChild(del);
        listEl.appendChild(li);
    });
}

/* ===========================
   EVENT HANDLERS TASKS (delegation)
   - ascolta i click nella lista task per checkbox e delete
   =========================== */
function onTaskListClick(e) {
    const elTarget = e.target;
    const li = elTarget.closest && elTarget.closest(".diary-task-item");
    if (!li) return;

    const taskId = li.getAttribute("data-task-id");
    // checkbox click
    if (elTarget.classList.contains("task-complete-checkbox")) {
        toggleTaskComplete(taskId, elTarget.checked);
        return;
    }
    // delete click
    if (elTarget.classList.contains("task-delete-btn")) {
        deleteTask(taskId);
        return;
    }
}

// Segna/completa il task e salva
function toggleTaskComplete(taskId, completed) {
    const tasks = getTasks();
    const idx = tasks.findIndex(t => String(t.id) === String(taskId));
    if (idx === -1) return;
    tasks[idx].completed = !!completed;
    saveTasks(tasks);
    // re-render per aggiornare aspetto
    renderTasksFor(toDateKey(currentDate));
    // segnala ad altre parti dell'app che i tasks sono cambiati
    window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: { taskId, action: "toggleComplete" } }));
}

// Elimina task by id
function deleteTask(taskId) {
    let tasks = getTasks();
    tasks = tasks.filter(t => String(t.id) !== String(taskId));
    saveTasks(tasks);
    renderTasksFor(toDateKey(currentDate));
    window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: { taskId, action: "delete" } }));
}

/* ===========================
   NOTES HANDLING
   - caricamento al cambio data
   - salvataggio debounced durante la digitazione
   =========================== */
function loadNoteToUI(dateKey) {
    if (!el.notesArea) return;
    const text = loadNoteFor(dateKey);
    el.notesArea.value = text;
}

function scheduleNoteSave(dateKey) {
    if (!el.notesArea) return;
    if (noteSaveTimer) clearTimeout(noteSaveTimer);
    noteSaveTimer = setTimeout(() => {
        saveNoteFor(dateKey, el.notesArea.value);
        // segnala che le note sono cambiate (utile per backup UI)
        window.dispatchEvent(new CustomEvent("diaryNoteSaved", { detail: { dateKey } }));
    }, NOTE_SAVE_DEBOUNCE_MS);
}

/* ===========================
   NAVIGAZIONE DATA
   - prev / next / gotoDate
   =========================== */
function goToDate(newDate) {
    currentDate = normalizeToDate(newDate);
    const key = toDateKey(currentDate);
    renderHeaderFor(currentDate);
    renderTasksFor(key);
    loadNoteToUI(key);
    // aggiorna date picker se presente
    if (el.datePicker) el.datePicker.value = key;
}

function nextDay() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    goToDate(d);
}

function prevDay() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    goToDate(d);
}

/* ===========================
   EVENT BINDING E INIZIALIZZAZIONE
   =========================== */
function attachEventListeners() {
    // prev / next buttons
    if (el.prevBtn) el.prevBtn.addEventListener("click", prevDay);
    if (el.nextBtn) el.nextBtn.addEventListener("click", nextDay);

    // date picker change
    if (el.datePicker) {
        el.datePicker.addEventListener("change", (ev) => {
            if (!ev.target.value) return;
            const parts = ev.target.value.split("-");
            // value expected YYYY-MM-DD
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            goToDate(d);
        });
    }

    // task list delegation
    if (el.taskList) el.taskList.addEventListener("click", onTaskListClick);

    // notes autosave (debounced)
    if (el.notesArea) {
        el.notesArea.addEventListener("input", () => {
            const key = toDateKey(currentDate);
            scheduleNoteSave(key);
        });
    }

    // tastiere: sinistra/destra per cambiare giorno
    document.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowLeft") {
            prevDay();
        } else if (ev.key === "ArrowRight") {
            nextDay();
        }
    });

    // se altri script aggiornano i tasks possiamo ricaricare la vista
    window.addEventListener("tasksUpdated", () => {
        renderTasksFor(toDateKey(currentDate));
    });
}

/* ===========================
   INIT
   =========================== */
function initDiary() {
    // safe-check elementi
    ensureEl("dayNumber");
    ensureEl("weekdayName");
    ensureEl("monthName");
    ensureEl("taskList");
    ensureEl("emptyMessage");
    ensureEl("notesArea");

    loadAccentColor();
    attachEventListeners();
    // avvia sulla data corrente (o su quella eventualmente impostata dal datePicker)
    if (el.datePicker && el.datePicker.value) {
        const parts = el.datePicker.value.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        currentDate = normalizeToDate(d);
    }
    goToDate(currentDate);
}

// Avvia quando il DOM è pronto
document.addEventListener("DOMContentLoaded", initDiary);

/* ===========================
   NOTE:
   - Formato consigliato per tasks (localStorage "tasks"):
     [
       { id: "123", date: "2025-09-15", subject: "Matematica", descr: "Esercizi", completed: false, isTest: false },
       ...
     ]
   - Se vuoi sincronizzare Dash <-> Diario: assicurati che la lista "tasks" sia aggiornata da entrambi gli script
     e che emettano l'evento window.dispatchEvent(new CustomEvent("tasksUpdated", ...))
   - Per backup manuale: puoi esportare localStorage["diary_notes"] e localStorage["tasks"] come JSON.
   - Se vuoi che il numero del giorno abbia lo stesso colore accentuale del tema, nel CSS imposta:
       #day-number, #weekday-name { color: var(--accent-color); }
     e salva il valore in localStorage sotto ACCENT_COLOR_KEY oppure gestiscilo tramite UI settings.
*/

