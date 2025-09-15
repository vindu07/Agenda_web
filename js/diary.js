// diary.js
let currentDate = new Date();
const el = {
    dayNumber: document.getElementById("day-number"),
    weekdayName: document.getElementById("weekday-name"),
    monthName: document.getElementById("month-name"),
    prevBtn: document.getElementById("prev-day"),
    nextBtn: document.getElementById("next-day"),
    taskList: document.getElementById("task-list"),
    newTaskBtn: document.getElementById("new-task-btn"),
    taskModal: document.getElementById("task-modal"),
    taskSubject: document.getElementById("task-subject"),
    taskDesc: document.getElementById("task-desc"),
    taskPriority: document.getElementById("task-priority"),
    taskIsTest: document.getElementById("task-isTest"),
    saveTaskBtn: document.getElementById("save-task-btn"),
    cancelTaskBtn: document.getElementById("cancel-task-btn"),
};

const WEEKDAYS = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

function pad2(n){return String(n).padStart(2,"0");}
function toDateKey(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}

function renderHeader(){
    const day = currentDate.getDate();
    const wday = currentDate.getDay();
    const weekday = WEEKDAYS[wday];
    const month = MONTHS[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    el.dayNumber.textContent = day;
    el.weekdayName.textContent = weekday;
    el.monthName.textContent = `${month} ${year}`;
    const isHoliday = wday===0 || checkIfHoliday(currentDate);
    const color = isHoliday? getComputedStyle(document.documentElement).getPropertyValue('--holiday-color') :
        getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
    el.dayNumber.style.color=color;
    el.weekdayName.style.color=color;
}

function checkIfHoliday(date){
    const d=date.getDate(),m=date.getMonth()+1;
    const holidays=["01-01","06-01","25-04","01-05","02-06","15-08","01-11","08-12","25-12","26-12"];
    return holidays.includes(`${pad2(d)}-${pad2(m)}`);
}

function renderTasks(){
    el.taskList.innerHTML="";
    let tasks=DB.getTasks().filter(t=>t.date===toDateKey(currentDate));
    if(!tasks.length)return;

    tasks.sort((a,b)=>{
        if(a.isTest && !b.isTest) return -1;
        if(!a.isTest && b.isTest) return 1;
        return b.priority - a.priority;
    });

    tasks.forEach(t=>{
        const li=document.createElement("li");
        li.className="diary-task-item"+(t.completed?" completed":"");
        li.setAttribute("data-task-id",t.id);
        const cb=document.createElement("input");
        cb.type="checkbox"; cb.checked=t.completed;
        cb.addEventListener("change",()=>{t.completed=cb.checked; DB.saveTasks(DB.getTasks()); renderTasks();});
        li.appendChild(cb);

        if(t.isTest){
            const badge=document.createElement("span");
            badge.className="verifica-badge";
            badge.textContent="Verifica";
            li.appendChild(badge);
            t.priority=3;
        }

        const subj=document.createElement("span");
        subj.className="task-subject";
        subj.textContent=t.subject;
        subj.style.color=getPriorityColor(t.priority);
        li.appendChild(subj);

        if(t.descr){
            const desc=document.createElement("span");
            desc.className="task-desc";
            desc.textContent=t.descr;
            li.appendChild(desc);
        }

        el.taskList.appendChild(li);
    });
}

function getPriorityColor(p){
    if(p==1) return "gray";
    if(p==2) return "orange";
    return "red";
}

function prevDay(){currentDate.setDate(currentDate.getDate()-1); renderHeader(); renderTasks();}
function nextDay(){currentDate.setDate(currentDate.getDate()+1); renderHeader(); renderTasks();}

function openModal(){el.taskModal.classList.remove("hidden");}
function closeModal(){el.taskModal.classList.add("hidden"); el.taskSubject.value=""; el.taskDesc.value=""; el.taskPriority.value="1"; el.taskIsTest.checked=false;}

function saveTask(){
    const subj=el.taskSubject.value.trim();
    if(!subj)return;
    const tasks=DB.getTasks();
    const newTask={
        id:Date.now().toString(),
        date:toDateKey(currentDate),
        subject:subj,
        descr:el.taskDesc.value.trim(),
        priority:Number(el.taskPriority.value),
        isTest:el.taskIsTest.checked,
        completed:false
    };
    if(newTask.isTest)newTask.priority=3;
    tasks.push(newTask);
    DB.saveTasks(tasks);
    closeModal();
    renderTasks();
}

el.prevBtn.addEventListener("click",prevDay);
el.nextBtn.addEventListener("click",nextDay);
el.newTaskBtn.addEventListener("click",openModal);
el.cancelTaskBtn.addEventListener("click",closeModal);
el.saveTaskBtn.addEventListener("click",saveTask);

document.addEventListener("DOMContentLoaded",()=>{
    renderHeader();
    renderTasks();
});
