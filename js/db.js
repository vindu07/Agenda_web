const TASKS_KEY = "tasks";


function createTask(task){}
function editTask(ID, task){}
function deleteTask(ID){}
function sortTaskByDate(first_date, last_date){}
function sortTaskBySubject(subject){}


function saveTasks(){}
function getTasks(){}



function getTasks(){
    try{ return JSON.parse(localStorage.getItem(TASKS_KEY)||"[]"); }
    catch(e){ console.warn("Errore parsing tasks", e); return []; }
}

function saveTasks(tasks){
    try{ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
    catch(e){ console.warn("Errore salvataggio tasks", e); }
}

function addOrUpdateTask(task){
    let tasks = getTasks();
    if(!task.id) task.id = Date.now().toString();
    const idx = tasks.findIndex(t=>t.id===task.id);
    if(idx>=0) tasks[idx]=task; else tasks.push(task);
    saveTasks(tasks);
}

function deleteTask(id){
    saveTasks(getTasks().filter(t=>t.id!==id));
}
