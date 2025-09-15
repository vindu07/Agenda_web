const DB = (function(){
    const TASKS_KEY = "tasks";

    function getTasks(){
        try{
            const raw = localStorage.getItem(TASKS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        }catch(e){ return []; }
    }

    function saveTasks(tasks){
        try{ localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
        catch(e){ console.warn("Errore salvataggio tasks",e); }
    }

    function addTask(task){
        const tasks = getTasks();
        tasks.push(task);
        saveTasks(tasks);
    }

    function updateTask(task){
        const tasks = getTasks();
        const idx = tasks.findIndex(t=>t.id===task.id);
        if(idx!==-1) tasks[idx] = task;
        saveTasks(tasks);
    }

    function deleteTask(taskId){
        let tasks = getTasks();
        tasks = tasks.filter(t=>t.id!==taskId);
        saveTasks(tasks);
    }

    return { getTasks, saveTasks, addTask, updateTask, deleteTask };
})();
