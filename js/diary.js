/* diary.js */

const DIARY_NOTES_KEY = "diary_notes";
const TASKS_KEY = "tasks";
const NOTE_SAVE_DEBOUNCE_MS = 600;

function pad2(n){return String(n).padStart(2,"0");}
function toDateKey(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function normalizeToDate(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate());}

let currentDate = normalizeToDate(new Date());
let noteSaveTimer = null;

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

/* Tasks storage */
function getTasks(){try{const t=localStorage.getItem(TASKS_KEY);return t?JSON.parse(t):[]}catch(e){return[];}}
function saveTasks(a){try{localStorage.setItem(TASKS_KEY,JSON.stringify(a));}catch(e){}}

/* Notes storage */
function loadAllNotes(){try{const n=localStorage.getItem(DIARY_NOTES_KEY);return n?JSON.parse(n):{}}catch(e){return{}}}
function saveAllNotes(o){try{localStorage.setItem(DIARY_NOTES_KEY,JSON.stringify(o));}catch(e){}}
function loadNoteFor(dk){return loadAllNotes()[dk]||"";}
function saveNoteFor(dk,text){const all=loadAllNotes();text&&text.trim().length>0?all[dk]=text:delete all[dk];saveAllNotes(all);}

/* Render header */
const WEEKDAYS=["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
const MONTHS=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
function renderHeaderFor(d){
    const day=d.getDate(),w=d.getDay(),weekday=WEEKDAYS[w],month=MONTHS[d.getMonth()],year=d.getFullYear();
    el.dayNumber.textContent=day;
    el.weekdayName.textContent=weekday;
    el.monthName.textContent=`${month} ${year}`;
    const color=(w===0)?getComputedStyle(document.documentElement).getPropertyValue('--holiday-color')||"#e53935":getComputedStyle(document.documentElement).getPropertyValue('--accent-color')||"#2196f3";
    el.dayNumber.style.color=color; el.weekdayName.style.color=color;
}

/* Render tasks */
function renderTasksFor(dateKey){
    const listEl=el.taskList,emptyEl=el.emptyMessage; if(!listEl)return;
    listEl.innerHTML="";
    const tasks=getTasks().filter(t=>t.date===dateKey);
    if(!tasks.length){emptyEl?.classList.remove("hidden");return;} else emptyEl?.classList.add("hidden");
    tasks.sort((a,b)=>{
        if(a.isTest!==b.isTest)return a.isTest? -1:1;
        return b.priority - a.priority;
    });
    tasks.forEach(task=>{
        const li=document.createElement("li"); li.className="diary-task-item"; li.setAttribute("data-task-id",task.id||"");
        const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!task.completed; cb.className="task-complete-checkbox";
        cb.addEventListener("change",()=>{toggleTaskComplete(task.id,cb.checked);});
        const textWrap=document.createElement("div");
        const subjSpan=document.createElement("strong"); subjSpan.textContent=task.subject||"Compito"; subjSpan.className="task-subject-priority priority-"+task.priority;
        if(task.isTest){const testLabel=document.createElement("span");testLabel.textContent="VERIFICA";testLabel.className="verifica-label";textWrap.appendChild(testLabel); subjSpan.style.color="white";}
        textWrap.appendChild(subjSpan);
        if(task.descr){const d=document.createElement("div");d.textContent=task.descr; textWrap.appendChild(d);}
        const del=document.createElement("button"); del.textContent="🗑"; del.addEventListener("click",()=>{deleteTask(task.id);});
        if(task.completed) li.classList.add("completed");
        li.appendChild(cb); li.appendChild(textWrap); li.appendChild(del); listEl.appendChild(li);
    });
}

/* Task handlers */
function toggleTaskComplete(id,completed){let t=getTasks(),i=t.findIndex(x=>x.id===id);if(i!==-1){t[i].completed=completed; saveTasks(t); renderTasksFor(toDateKey(currentDate));}}
function deleteTask(id){let t=getTasks();t=t.filter(x=>x.id!==id);saveTasks(t);renderTasksFor(toDateKey(currentDate));}

/* Notes */
function loadNoteToUI(dk){el.notesArea.value=loadNoteFor(dk);}
function scheduleNoteSave(dk){if(noteSaveTimer)clearTimeout(noteSaveTimer);noteSaveTimer=setTimeout(()=>{saveNoteFor(dk,el.notesArea.value);},NOTE_SAVE_DEBOUNCE_MS);}

/* Navigation */
function goToDate(d){currentDate=normalizeToDate(d);const k=toDateKey(currentDate); renderHeaderFor(currentDate); renderTasksFor(k); loadNoteToUI(k);}
function nextDay(){const d=new Date(currentDate);d.setDate(d.getDate()+1);goToDate(d);}
function prevDay(){const d=new Date(currentDate);d.setDate(d.getDate()-1);goToDate(d);}

/* Init */
document.addEventListener("DOMContentLoaded",()=>{
    el.prevBtn?.addEventListener("click",prevDay);
    el.nextBtn?.addEventListener("click",nextDay);
    el.notesArea?.addEventListener("input",()=>{scheduleNoteSave(toDateKey(currentDate));});
    document.getElementById("add-task-btn")?.addEventListener("click",()=>openTaskModal());
    goToDate(currentDate);
});
