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
    cancelTaskBtn: document.getElementById("cancel-task-btn")
};

let currentDate = new Date();
let editingTaskId = null;

function pad2(n){ return String(n).padStart(2,"0"); }
function toDateKey(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }

function renderHeader(){
    const d = currentDate;
    el.dayNumber.textContent = d.getDate();
    el.weekdayName.textContent = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"][d.getDay()];
    el.monthName.textContent = `${["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"][d.getMonth()]} ${d.getFullYear()}`;
}

function renderTasks(){
    const key = toDateKey(currentDate);
    const tasks = DB.getTasks().filter(t=>t.date===key);
    tasks.sort((a,b)=>{
        if(a.isTest && !b.isTest) return -1;
        if(!a.isTest && b.isTest) return 1;
        return b.priority - a.priority;
    });

    el.taskList.innerHTML = "";
    tasks.forEach(t=>{
        const li = document.createElement("li");
        if(t.completed) li.classList.add("completed");

        const cb = document.createElement("input");
        cb.type="checkbox";
        cb.checked = t.completed;
        cb.addEventListener("change",()=>{ t.completed=cb.checked; DB.updateTask(t); renderTasks(); });

        const textDiv = document.createElement("div");
        textDiv.className="task-text";

        const strong = document.createElement("strong");
        if(t.isTest){
            const badge = document.createElement("span");
            badge.className="verifica-badge";
            badge.textContent="Verifica";
            strong.appendChild(badge);
        }
        strong.appendChild(document.createTextNode(t.subject));
        strong.style.color = ["#fff","#ff0","#f80","#f00"][t.priority]; // colore priorità
        textDiv.appendChild(strong);

        if(t.descr){
            const descr = document.createElement("div");
            descr.textContent=t.descr;
            textDiv.appendChild(descr);
        }

        const delBtn = document.createElement("button");
        delBtn.textContent="🗑";
        delBtn.addEventListener("click",()=>{ DB.deleteTask(t.id); renderTasks(); });

        li.appendChild(cb);
        li.appendChild(textDiv);
        li.appendChild(delBtn);
        el.taskList.appendChild(li);
    });
}

// NAVIGATION
el.prevBtn.addEventListener("click",()=>{ currentDate.setDate(currentDate.getDate()-1); renderHeader(); renderTasks(); });
el.nextBtn.addEventListener("click",()=>{ currentDate.setDate(currentDate.getDate()+1); renderHeader(); renderTasks(); });

// MODAL
function openModal(task=null){
    el.taskModal.classList.remove("hidden");
    if(task){
        editingTaskId = task.id;
        el.taskSubject.value = task.subject;
        el.taskDesc.value = task.descr;
        el.taskPriority.value = task.priority;
        el.taskIsTest.checked = task.isTest;
        document.getElementById("modal-title").textContent="Modifica Task";
    }else{
        editingTaskId=null;
        el.taskSubject.value="";
        el.taskDesc.value="";
        el.taskPriority.value=1;
        el.taskIsTest.checked=false;
        document.getElementById("modal-title").textContent="Nuovo Task";
    }
}

function closeModal(){ el.taskModal.classList.add("hidden"); }

el.newTaskBtn.addEventListener("click",()=>{ openModal(); });
el.cancelTaskBtn.addEventListener("click", closeModal);

el.saveTaskBtn.addEventListener("click",()=>{
    const subject = el.taskSubject.value.trim();
    if(!subject) return alert("Inserisci materia");
    const task = {
        id: editingTaskId || Date.now().toString(),
        date: toDateKey(currentDate),
        subject,
        descr: el.taskDesc.value.trim(),
        priority: Number(el.taskPriority.value),
        isTest: el.taskIsTest.checked,
        completed:false
    };
    if(editingTaskId) DB.updateTask(task);
    else DB.addTask(task);
    closeModal();
    renderTasks();
});

document.addEventListener("DOMContentLoaded",()=>{
    renderHeader();
    renderTasks();
});
