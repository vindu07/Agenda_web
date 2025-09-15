/* diary.js - Gestione pagina Diario con integrazione db.js */

/* ===========================
   CONFIG
=========================== */
const DIARY_NOTES_KEY = "diary_notes";
const NOTE_SAVE_DEBOUNCE_MS = 600;

/* ===========================
   UTILS
=========================== */
function pad2(n) { return String(n).padStart(2, "0"); }
function toDateKey(d) { return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function normalizeToDate(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

/* ===========================
   STATO
=========================== */
let currentDate = normalizeToDate(new Date());
let noteSaveTimer = null;

/* ===========================
   ELEMENTI DOM
=========================== */
const el = {
    dayNumber: document.getElementById("day-number"),
    weekdayName: document.getElementById("weekday-name"),
    monthName: document.getElementById("month-name"),
    prevBtn: document.getElementById("prev-day"),
    nextBtn: document.getElementById("next-day"),
    datePicker: document.getElementById("date-picker"),
    taskList: document.getElementById("task-list"),
    emptyMessage: document.getElementById("empty-message"),
    notesArea: document.getElementById("notes"),
    root: document.documentElement
};

/* ===========================
   NOTES
=========================== */
function loadAllNotes() {
    try { return JSON.parse(localStorage.getItem(DIARY_NOTES_KEY) || "{}"); }
    catch(e){ return {}; }
}
function saveAllNotes(obj) { localStorage.setItem(DIARY_NOTES_KEY, JSON.stringify(obj)); }
function loadNoteFor(key) { return loadAllNotes()[key] || ""; }
function saveNoteFor(key, text){
    const notes = loadAllNotes();
    if(text.trim()) notes[key] = text;
    else delete notes[key];
    saveAllNotes(notes);
}

/* ===========================
   HEADER
=========================== */
const WEEKDAYS = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

function checkIfHoliday(d){
    const m = pad2(d.getMonth()+1);
    const day = pad2(d.getDate());
    const holidays = ["01-01","06-01","25-04","01-05","02-06","15-08","01-11","08-12","25-12","26-12"];
    return holidays.includes(`${day}-${m}`);
}

function renderHeaderFor(dateObj){
    const day = dateObj.getDate();
    const weekday = WEEKDAYS[dateObj.getDay()];
    const monthYear = `${MONTHS[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    const isHoliday = dateObj.getDay()===0 || checkIfHoliday(dateObj);
    const color = isHoliday ? getComputedStyle(document.documentElement).getPropertyValue('--holiday-color') 
                            : getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    if(el.dayNumber) el.dayNumber.textContent = day; el.dayNumber.style.color=color;
    if(el.weekdayName) el.weekdayName.textContent = weekday; el.weekdayName.style.color=color;
    if(el.monthName) el.monthName.textContent = monthYear;
}

/* ===========================
   TASKS RENDER
=========================== */
function renderTasksFor(dateKey){
    if(!el.taskList) return;
    el.taskList.innerHTML = "";
    const tasks = getTasksForDate(dateKey);
    if(!tasks.length){
        if(el.emptyMessage) el.emptyMessage.classList.remove("hidden");
        return;
    } else { if(el.emptyMessage) el.emptyMessage.classList.add("hidden"); }

    tasks.forEach(task=>{
        const li = document.createElement("li");
        li.className="diary-task-item";
        li.setAttribute("data-task-id",task.id);

        // checkbox completato
        const cb = document.createElement("input");
        cb.type="checkbox"; cb.checked=!!task.completed;
        cb.className="task-complete-checkbox"; cb.setAttribute("aria-label","Segna come completato");

        // testo
        const textWrap = document.createElement("div"); textWrap.className="task-text";
        const subj = document.createElement("strong"); subj.textContent=task.subject;
        subj.style.color = getPriorityColor(task.priority); // colore priorità solo sul nome
        if(task.isTest){
            const redBox = document.createElement("span");
            redBox.textContent="Verifica"; redBox.style.backgroundColor="red";
            redBox.style.color="#fff"; redBox.style.padding="0 4px"; redBox.style.marginRight="6px";
            redBox.style.borderRadius="3px";
            textWrap.appendChild(redBox);
        }
        const desc = document.createElement("div"); desc.textContent=task.descr; desc.className="task-desc";
        textWrap.appendChild(subj); if(task.descr) textWrap.appendChild(desc);

        // delete
        const del = document.createElement("button"); del.className="task-delete-btn"; del.textContent="🗑";

        if(task.completed) li.classList.add("completed");

        li.appendChild(cb); li.appendChild(textWrap); li.appendChild(del);
        el.taskList.appendChild(li);
    });
}

// ritorna colore priorità
function getPriorityColor(priority){
    switch(priority){
        case 3: return "#e74c3c"; // alta
        case 2: return "#f1c40f"; // media
        default: return "#2ecc71"; // bassa
    }
}

/* ===========================
   TASK EVENTS
=========================== */
function onTaskListClick(e){
    const li = e.target.closest(".diary-task-item"); if(!li) return;
    const id = li.getAttribute("data-task-id");
    if(e.target.classList.contains("task-complete-checkbox")){
        toggleTaskCompleted(id); renderTasksFor(toDateKey(currentDate));
        window.dispatchEvent(new CustomEvent("tasksUpdated",{detail:{taskId:id,action:"toggleComplete"}}));
    }
    if(e.target.classList.contains("task-delete-btn")){
        deleteTask(id); renderTasksFor(toDateKey(currentDate));
        window.dispatchEvent(new CustomEvent("tasksUpdated",{detail:{taskId:id,action:"delete"}}));
    }
}

/* ===========================
   NOTES EVENTS
=========================== */
function loadNoteToUI(dateKey){
    if(el.notesArea) el.notesArea.value = loadNoteFor(dateKey);
}
function scheduleNoteSave(dateKey){
    if(!el.notesArea) return;
    if(noteSaveTimer) clearTimeout(noteSaveTimer);
    noteSaveTimer = setTimeout(()=>{
        saveNoteFor(dateKey, el.notesArea.value);
        window.dispatchEvent(new CustomEvent("diaryNoteSaved",{detail:{dateKey}}));
    },NOTE_SAVE_DEBOUNCE_MS);
}

/* ===========================
   NAVIGAZIONE
=========================== */
function goToDate(d){
    currentDate = normalizeToDate(d);
    const key = toDateKey(currentDate);
    renderHeaderFor(currentDate);
    renderTasksFor(key);
    loadNoteToUI(key);
    if(el.datePicker) el.datePicker.value = key;
}
function nextDay(){ const d = new Date(currentDate); d.setDate(d.getDate()+1); goToDate(d);}
function prevDay(){ const d = new Date(currentDate); d.setDate(d.getDate()-1); goToDate(d);}

/* ===========================
   EVENT BINDING
=========================== */
function attachEventListeners(){
    if(el.prevBtn) el.prevBtn.addEventListener("click",prevDay);
    if(el.nextBtn) el.nextBtn.addEventListener("click",nextDay);
    if(el.datePicker) el.datePicker.addEventListener("change",ev=>{
        const [y,m,d]=ev.target.value.split("-"); goToDate(new Date(Number(y),Number(m)-1,Number(d)));
    });
    if(el.taskList) el.taskList.addEventListener("click",onTaskListClick);
    if(el.notesArea) el.notesArea.addEventListener("input",()=>scheduleNoteSave(toDateKey(currentDate)));
    document.addEventListener("keydown",ev=>{
        if(ev.key==="ArrowLeft") prevDay();
        else if(ev.key==="ArrowRight") nextDay();
    });
    window.addEventListener("tasksUpdated",()=>renderTasksFor(toDateKey(currentDate)));
}

/* ===========================
   INIT
=========================== */
function initDiary(){
    attachEventListeners();
    goToDate(currentDate);
}

document.addEventListener("DOMContentLoaded",initDiary);
