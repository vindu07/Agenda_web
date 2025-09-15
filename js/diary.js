/* diary.js - gestione pagina Diario */

// key
const ACCENT_COLOR_KEY = "diary_accent_color";
const NOTE_SAVE_DEBOUNCE_MS = 600;

// stato
let currentDate = new Date();
let noteSaveTimer = null;

// elementi DOM
const el = {
    dayNumber: document.getElementById("day-number"),
    weekdayName: document.getElementById("weekday-name"),
    monthName: document.getElementById("month-name"),
    prevBtn: document.getElementById("prev-day"),
    nextBtn: document.getElementById("next-day"),
    taskList: document.getElementById("task-list"),
    emptyMessage: document.getElementById("empty-message"),
    notesArea: document.getElementById("notes"),
    root: document.documentElement
};

// utils
function pad2(n){return String(n).padStart(2,"0");}
function toDateKey(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function normalizeDate(d){return new Date(d.getFullYear(), d.getMonth(), d.getDate());}

// festivi
function checkIfHoliday(dateObj){
    const month = pad2(dateObj.getMonth()+1);
    const day = pad2(dateObj.getDate());
    const fixedHolidays=["01-01","06-01","25-04","01-05","02-06","15-08","01-11","08-12","25-12","26-12"];
    return fixedHolidays.includes(`${day}-${month}`);
}

// accent color
function loadAccentColor(){
    const col = localStorage.getItem(ACCENT_COLOR_KEY);
    if(col) el.root.style.setProperty("--accent-color", col);
}

// header
function renderHeader(dateObj){
    const day = dateObj.getDate();
    const weekdayIndex = dateObj.getDay();
    const weekday=["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"][weekdayIndex];
    const month=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"][dateObj.getMonth()];
    const year = dateObj.getFullYear();
    el.dayNumber.textContent=day;
    el.weekdayName.textContent=weekday;
    el.monthName.textContent=`${month} ${year}`;
    if(weekdayIndex===0 || checkIfHoliday(dateObj)){
        el.dayNumber.style.color=getComputedStyle(el.root).getPropertyValue("--holiday-color");
        el.weekdayName.style.color=getComputedStyle(el.root).getPropertyValue("--holiday-color");
    }else{
        el.dayNumber.style.color=getComputedStyle(el.root).getPropertyValue("--accent-color");
        el.weekdayName.style.color=getComputedStyle(el.root).getPropertyValue("--accent-color");
    }
}

// render tasks
function renderTasks(){
    const key = toDateKey(currentDate);
    const listEl = el.taskList;
    const emptyEl = el.emptyMessage;
    if(!listEl) return;
    listEl.innerHTML="";
    let tasks = getTasks();
    let todayTasks = tasks.filter(t=>t.date===key);
    if(todayTasks.length===0){
        if(emptyEl) emptyEl.classList.remove("hidden");
        return;
    }else if(emptyEl) emptyEl.classList.add("hidden");

    todayTasks.sort((a,b)=>{
        const aTest = a.isTest?0:1; const bTest = b.isTest?0:1;
        if(aTest!==bTest) return aTest-bTest;
        const aComp = a.completed?1:0; const bComp = b.completed?1:0;
        return aComp-bComp;
    });

    todayTasks.forEach(t=>{
        const li=document.createElement("li");
        li.className="diary-task-item";
        li.setAttribute("data-task-id",t.id||"");

        const cb=document.createElement("input");
        cb.type="checkbox"; cb.checked=!!t.completed; cb.className="task-complete-checkbox";

        const textWrap=document.createElement("div");
        textWrap.className="task-text";
        const subj=document.createElement("strong"); subj.textContent=t.subject||"Compito";
        const desc=document.createElement("div"); desc.textContent=t.descr||""; desc.className="task-desc";
        textWrap.appendChild(subj); if(t.descr) textWrap.appendChild(desc);

        const del=document.createElement("button"); del.className="task-delete-btn"; del.textContent="🗑";

        if(t.completed) li.classList.add("completed");

        li.appendChild(cb); li.appendChild(textWrap); li.appendChild(del);
        listEl.appendChild(li);
    });
}

// task events
function onTaskClick(e){
    const li = e.target.closest(".diary-task-item"); if(!li) return;
    const id = li.getAttribute("data-task-id");
    if(e.target.classList.contains("task-complete-checkbox")){
        let tasks = getTasks(); let idx = tasks.findIndex(t=>t.id===id);
        if(idx>=0){ tasks[idx].completed=e.target.checked; saveTasks(tasks); renderTasks(); }
    }
    if(e.target.classList.contains("task-delete-btn")){
        let tasks = getTasks(); tasks = tasks.filter(t=>t.id!==id); saveTasks(tasks); renderTasks();
    }
}

// notes
function loadNote(){
    if(!el.notesArea) return;
    el.notesArea.value = getAllNotes()[toDateKey(currentDate)] || "";
}
function saveNoteDebounced(){
    if(!el.notesArea) return;
    if(noteSaveTimer) clearTimeout(noteSaveTimer);
    noteSaveTimer = setTimeout(()=>{ saveNote(toDateKey(currentDate), el.notesArea.value); }, NOTE_SAVE_DEBOUNCE_MS);
}

// navigation
function goToDate(d){ currentDate=normalizeDate(d); renderHeader(currentDate); renderTasks(); loadNote(); }
function nextDay(){ const d = new Date(currentDate); d.setDate(d.getDate()+1); goToDate(d);}
function prevDay(){ const d = new Date(currentDate); d.setDate(d.getDate()-1); goToDate(d);}

// events
function attachEvents(){
    if(el.prevBtn) el.prevBtn.addEventListener("click",prevDay);
    if(el.nextBtn) el.nextBtn.addEventListener("click",nextDay);
    if(el.taskList) el.taskList.addEventListener("click",onTaskClick);
    if(el.notesArea) el.notesArea.addEventListener("input",saveNoteDebounced);
    document.addEventListener("keydown", ev=>{ if(ev.key==="ArrowLeft") prevDay(); else if(ev.key==="ArrowRight") nextDay();});
}

// init
document.addEventListener("DOMContentLoaded",()=>{
    loadAccentColor(); attachEvents(); goToDate(currentDate);
});
