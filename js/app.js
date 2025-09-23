/*CAMBIA TEMA*/
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-theme");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
});

/*IMPOSTAZIONI*/
document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settings");
  settingsBtn.addEventListener("click", () => {
    alert("Funzione in fase di sviluppo");
  });
});

/*MOSTRA/NASCONDE HUD*/
document.addEventListener("DOMContentLoaded", () => {
  const newTask = document.getElementById("new-task");
  newTask.addEventListener("click", () => {
    const hud = document.getElementById("hud"); 
    hud.classList.toggle("invisible");
  });

  const annulla = document.getElementById("annulla-task");
  annulla.addEventListener("click", () => {
    const hud = document.getElementById("hud"); 
    hud.classList.toggle("invisible");
  });
});

// registra il service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registrato"))
    .catch(err => console.error("Errore Service Worker:", err));
}

/*SALVA TASK TEMPORANEO*/
// Array globale o gestito in altro file
let taskArray = [0];

document.getElementById("save-task").addEventListener("click", () => {
  //leggo l'ultimo ID e lo cancello
  const lastID = taskArray[taskArray.length - 1];
  taskArray.pop();
  // raccogli valori dall'HUD
  const ID = lastID + 1;
  const scadenza = currentDate;
  const isCompleted = false;
  const desc = document.getElementById("task-desc").value.trim();
  const materia = document.getElementById("task-subject").value;
  const isTest = document.getElementById("isTest").value;
  const priority = document.getElementById("task-priority").value;
  
  //chiudi hud
  const hud = document.getElementById("hud"); 
    hud.classList.toggle("invisible");

  // costruisci un oggetto task
  const newTask = { ID, scadenza, materia, isTest, priority, desc, isCompleted  };

  // salvalo in array
  taskArray.push(newTask);
  //salva l'ultimo ID usato
  taskArray.push(ID);
  
  //render 
  renderTasks(taskArray);

  const salva = document.getElementById("save-task");
  salva.addEventListener("click", () => {
    const hud = document.getElementById("hud"); 
    hud.classList.toggle("invisible");
  });
});

//render 
  renderTasks(taskArray);

