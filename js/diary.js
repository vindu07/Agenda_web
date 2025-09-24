const weekdays = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];
let currentDate = new Date();
export var pagDiario; //data della pagina corrente

const weekdayEl = document.getElementById("weekday-name");
const dayNumberEl = document.getElementById("day-number");
const monthYearEl = document.getElementById("month-year");
const prevBtn = document.getElementById("prev-day");
const nextBtn = document.getElementById("next-day");

console.log(`Mese = ${currentDate.getMonth()}`);

function updateDiary() {
  weekdayEl.textContent = weekdays[currentDate.getDay()];
  dayNumberEl.textContent = currentDate.getDate();
  monthYearEl.textContent = months[currentDate.getMonth()] + " " + currentDate.getFullYear();
  //el aggiorna la variabile co la data del la pagina corrente
  pagDiario = currentDate.toISOString().slice(0,10);
  console.log(`Diario aggiornato → pagDiario = ${pagDiario}`);

  const tasks = await loadTasks({
  dataInizio: pagDiario,
  dataFine:  pagDiario,
  isTest: true,
  isCompleted: false,
  priority: "asc"
});


}

// Eventi per cambiare giorno
prevBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDiary();
});

nextBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDiary();
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

/*SALVA TASK TEMPORANEO*/
import * as db from "./db.js";


document.getElementById("save-task").addEventListener("click", () => {
  
  // raccogli valori dall'HUD
  const scadenza = pagDiario;
  const isCompleted = false;
  const desc = document.getElementById("task-desc").value.trim();
  const materia = document.getElementById("task-subject").value;
  const isTest = document.getElementById("isTest").value === "0" ? false : true;
  const priority = int(document.getElementById("task-priority").value);
  
  //chiudi hud
  const hud = document.getElementById("hud"); 
    hud.classList.toggle("invisible");

  // costruisci un array task
  const newTask = [ scadenza, materia, isTest, priority, desc, isCompleted  ];

  //salva in firestore
  db.createTask(newTask);

  const salva = document.getElementById("save-task");
  salva.addEventListener("click", () => {
    const hud = document.getElementById("hud"); 
    hud.classList.toggle("invisible");
  });
});

// inizializzazione
updateDiary();
