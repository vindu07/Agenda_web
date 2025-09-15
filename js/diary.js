let currentDate = new Date();
const el = {
    dayNumber: document.getElementById("day-number"),
    weekdayName: document.getElementById("weekday-name"),
    monthName: document.getElementById("month-name"),
    prevBtn: document.getElementById("prev-day"),
    nextBtn: document.getElementById("next-day"),
    taskList: document.getElementById("task-list"),
    newTaskBtn: document.getElementById("new-task-btn"),
    modal: document.getElementById("task-modal"),
    modalClose: document.getElementById("close-modal"),
    taskSubject: document.getElementById("task-subject"),
    taskDescr: document.getElementById("task-descr"),
    taskPriority: document.getElementById("task-priority"),
    taskIsTest: document.getElementById("task-isTest"),
    saveTaskBtn: document.getElementById("save-task-btn")
};

function pad2(n){return String(n).padStart(2,"0");}
function dateKey(d){return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}

function renderHeader(){
    const day=currentDate.getDate();
    const weekday=["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"][currentDate.getDay()];
    const month=["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"][currentDate.getMonth()];
    el.dayNumber.textContent=day;
    el.weekdayName.textContent=weekday;
    el.monthName.textContent=month+" "+currentDate.getFullYear();
}

function renderTasks(){
    const key = dateKey(currentDate);
    const tasks = getTasks().filter(t=>t.date===key);
    el.taskList.innerHTML="";
    tasks.sort((a,b)=>{
        if(a.isTest&&!b.isTest) return -1;
        if(!a.isTest&&b.isTest) return 1;
        if(a.completed&&!b.completed) return 1;
        if(!a.completed&&b.completed) return -1;
        return (b.priority||0)-(a.priority||0);
    });
    tasks.forEach(t=>{
        const li = document.createElement("li");
        li.className="diary-task-item"+(t.completed?" completed":"");
        li.dataset.id=t.id;
        const cb = document.createElement("input"); cb.type="checkbox"; cb.checked=t.completed;
        cb.addEventListener("change",()=>{t.completed=cb.checked; addOrUpdateTask(t); renderTasks();});
        const div = document.createElement("div"); div.className="task-text";
        if(t.isTest){const v=document.createElement("span"); v.className="task-verifica-label"; v.textContent="Verifica"; div.appendChild(v); t.priority=3;}
        const subj = document.createElement("strong"); subj.textContent=t.subject; subj.className=`task-priority-${t.priority||1}`;
        div.appendChild(subj);
        if(t.descr){const d=document.createElement("div"); d.textContent=t.descr; div.appendChild(d);}
        const del=document.createElement("button"); del.textContent="🗑"; del.addEventListener("click",()=>{deleteTask(t.id); renderTasks();});
        li.appendChild(cb); li.appendChild(div); li.appendChild(del);
        el.taskList.appendChild(li);
    });
}

// NAVIGAZIONE
el.prevBtn.addEventListener("click",()=>{currentDate.setDate(currentDate.getDate()-1); renderHeader(); renderTasks();});
el.nextBtn.addEventListener("click",()=>{currentDate.setDate(currentDate.getDate()+1); renderHeader(); renderTasks();});

// MODALE
el.newTaskBtn.addEventListener("click",()=>{el.modal.classList.remove("hidden");});
el.modalClose.addEventListener("click",()=>{el.modal.classList.add("hidden");});

el.saveTaskBtn.addEventListener("click",()=>{
    let subj = el.taskSubject.value.trim();
    if(!subj) return alert("Inserisci materia");
    let task = {
        id: Date.now().toString(),
        date: dateKey(currentDate),
        subject: subj,
        descr: el.taskDescr.value,
        completed:false,
        priority: parseInt(el.taskPriority.value),
        isTest: el.taskIsTest.checked
    };
    if(task.isTest) task.priority=3;
    addOrUpdateTask(task);
    el.modal.classList.add("hidden");
    el.taskSubject.value=""; el.taskDescr.value=""; el.taskPriority.value="1"; el.taskIsTest.checked=false;
    renderTasks();
});

document.addEventListener("DOMContentLoaded",()=>{renderHeader(); renderTasks();});
