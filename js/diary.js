/* diary.js - gestione Diario completo */

const DIARY_NOTES_KEY = "diary_notes";
const TASKS_KEY = "tasks";
const NOTE_SAVE_DEBOUNCE_MS = 600;

function pad2(n){return String(n).padStart(2,"0");}
function toDateKey(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function normalizeToDate(d){return new Date(d.getFullYear(), d.getMonth(), d.getDate());}

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
    root: document.documentElement,
    taskModal: document.getElementById("task-modal"),
    taskSubject: document.getElementById("task-subject"),
    taskDesc: document.getElementById("task-desc"),
    taskPriority: document.getElementById("task-priority"),
    taskIsTest: document.getElementById("task-isTest"),
    saveTaskBtn: document.getElementById("save-task-btn"),
    closeTaskBtn: document.getElementById("close-task-btn")
};

const WEEKDAYS = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

/* =========================
   TASK STORAGE
========================= */
function getTasks(){return DB.getTasks();}
function saveTasks(tasks){DB.saveTasks(tasks);}

/* =========================
   NOTE STORAGE
========================= */
function loadNoteFor(dateKey){return DB.loadNoteFor(dateKey);}
function saveNoteFor(dateKey,text){DB.saveNoteFor(dateKey,text);}

/* =========================
   HEADER
========================= */
function renderHeaderFor(dateObj){
    const day = dateObj.getDate();
    const weekday = WEEKDAYS[dateObj.getDay()];
    const month = MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    el.dayNumber.textContent = day;
    el.weekdayName.textContent = weekday;
    el.monthName.textContent = `${month} ${year}`;
}

/* =========================
   TASKS
========================= */
function renderTasksFor(dateKey){
    el.taskList.innerHTML = "";
    const tasks = getTasks().filter(t=>t.date===dateKey);
    if(!tasks.length){el.emptyMessage?.classList.remove("hidden"); return;}
    el.emptyMessage?.classList.add("hidden");
    tasks.sort((a,b)=>{
        const aTest=a.isTest?0:1, bTest=b.isTest?0:1;
        if(aTest!==bTest) return aTest-bTest;
        const aComp=a.completed?1:0, bComp=b.completed?1:0;
        return aComp-bComp;
    });
    tasks.forEach(t=>{
        const li=document.createElement("li");
        li.className="diary-task-item"+(t.completed?" completed":"");
        li.setAttribute("data-task-id",t.id);
        const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=t.completed; cb.className="task-complete-checkbox";
        const textWrap=document.createElement("div"); textWrap.className="task-text";
        const subj=document.createElement("strong"); subj.textContent=t.subject;
        const desc=document.createElement("div"); desc.textContent=t.descr||""; desc.className="task-desc";
        const priority=document.createElement("span"); priority.className="task-priority"; priority.textContent="⚡".repeat(t.priority||3);
        textWrap.appendChild(subj); textWrap.appendChild(priority); if(t.descr) textWrap.appendChild(desc);
        const del=document.createElement("button"); del.className="task-delete-btn"; del.textContent="🗑";
        li.appendChild(cb); li.appendChild(textWrap); li.appendChild(del);
        el.taskList.appendChild(li);
    });
}

function toggleTaskComplete(taskId,completed){
    const tasks=getTasks();
    const idx=tasks.findIndex(t=>String(t.id)===String(taskId));
    if(idx===-1) return;
    tasks[idx].completed=!!completed;
    saveTasks(tasks);
    renderTasksFor(toDateKey(currentDate));
    window.dispatchEvent(new CustomEvent("tasksUpdated",{detail:{taskId,action:"toggleComplete"}}));
}

function deleteTask(taskId){
    const tasks=getTasks().filter(t=>String(t.id)!==String(taskId));
    saveTasks(tasks);
    renderTasksFor(toDateKey(currentDate));
    window.dispatchEvent(new CustomEvent("tasksUpdated",{detail:{taskId,action:"delete"}}));
}

/* =========================
   MODAL TASK
========================= */
let editingTaskId=null;
function openTaskModal(task=null){
    if(!el.taskModal) return;
    el.taskModal.classList.remove("hidden");
    if(task){
        editingTaskId=task.id;
        el.taskSubject.value=task.subject;
        el.taskDesc.value=task.descr;
        el.taskPriority.value=task.priority||3;
        el.taskIsTest.checked=!!task.isTest;
    }else{
        editingTaskId=null;
        el.taskSubject.value=""; el.taskDesc.value="";
        el.taskPriority.value=3; el.taskIsTest.checked=false;
    }
}
function closeTaskModal(){el.taskModal?.classList.add("hidden");}
el.closeTaskBtn?.addEventListener("click",closeTaskModal);
el.saveTaskBtn?.addEventListener("click",()=>{
    const tasks=getTasks();
    const dateKey=toDateKey(currentDate);
    const newTask={id:editingTaskId??String
