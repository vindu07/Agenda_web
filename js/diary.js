import * as db from "./db.js";
import * as Tasks from "./tasks.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";



const weekdays = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];
let currentDate = new Date();
export var pagDiario; //data della pagina corrente

const today = new Date();

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

/*COLORI DIVERSI IN BASE A FESTIVO/OGGI/PASSATO*/

const national_holidays = [  "1-1", "1-6", "4-25", "5-1", "6-2", "8-15", "11-1", "12-8", "12-25", "12-26" ]; // formato: mese-giorno
const year_2025_holidays = ["10-31", "11-1", "11-3", "11-4", "12-22","12-23","12-24","12-27","12-28","12-29","12-30", "12-31", "1-2", "1-3", "1-4", "1-5", "2-16", "2-17", "2-18", "4-2","4-3","4-4","4-5","4-6","4-7","4-8" ];

const dayKey = `${currentDate.getMonth() + 1}-${currentDate.getDate()}`; // mese e giorno per confronto
  
  
weekdayEl.classList.remove("sunday", "today", "past", "holiday");
dayNumberEl.classList.remove("sunday", "today", "past", "holiday");

// Normalizza le date (solo anno, mese, giorno) per confronto senza ore/minuti
const currentTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

// Controllo domenica
if(currentDate.getDay() === 0){
  weekdayEl.classList.add("sunday");
  dayNumberEl.classList.add("sunday");
  console.log("Giorno classificato come sunday");
}
  //controllo festa nazionale
else if (national_holidays.includes(dayKey) ) {
  weekdayEl.classList.add("sunday");
  dayNumberEl.classList.add("sunday");
  console.log("Giorno classificato come sunday(festa nazionale)");
}
  //controllo vacanza
else if(year_2025_holidays.includes(dayKey) ){
  weekdayEl.classList.add("holiday");
  dayNumberEl.classList.add("holiday");
  console.log("Giorno classificato come holiday");
}
// Controllo giorno corrente
else if(currentTime === todayTime){
  weekdayEl.classList.add("today");
  dayNumberEl.classList.add("today");
  console.log("Giorno classificato come today");
}
// Controllo giorni passati
else if(currentTime < todayTime){
  weekdayEl.classList.add("past");
  dayNumberEl.classList.add("past");
  console.log("Giorno classificato come past");
}

  /*chiama sortTasks*/
  
  const ts = Timestamp.fromDate(currentDate);
  const ts1 = ts.toDate();

// 2️⃣ aggiungo 1 giorno (24 ore)
ts1.setDate(ts1.getDate() - 1);

// 3️⃣ converto di nuovo in Timestamp
const TS = Timestamp.fromDate(ts1);

  db.sortTasks({ dataInizio: TS,
  dataFine: ts /*,materia: "Italiano"*/ })
  .then(sortedTasks => {
    // qui sortedTasks è l'array ordinato
    Tasks.renderTasks(sortedTasks);
  })
  .catch(err => {
    console.error("Errore nel caricamento/ordinamento dei task:", err);
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


/* CAMBIA GIORNO TOUCH */
let touchstartX = 0;
let touchendX = 0;
const swipeThreshold = 100; // distanza minima in px per considerarlo swipe

const gestureZone = document.querySelector('.diary-container');

gestureZone.addEventListener('touchstart', (e) => {
  touchstartX = e.changedTouches[0].screenX;
});

gestureZone.addEventListener('touchend', (e) => {
  touchendX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const diffX = touchendX - touchstartX;

  if (Math.abs(diffX) < swipeThreshold) {
    console.log("Swipe troppo corto, ignorato");
    return; // non fare niente
  }

  if (diffX < 0) {
    // Swipe a sinistra → pagina successiva
    console.log("Pagina successiva");
    currentDate.setDate(currentDate.getDate() + 1);
    updateDiary();
  } else {
    // Swipe a destra → pagina precedente
    console.log("Pagina precedente");
    currentDate.setDate(currentDate.getDate() - 1);
    updateDiary();
  }
}




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

/*SALVA TASK*/

document.getElementById("save-task").addEventListener("click", () => {
  
  // raccogli valori dall'HUD
  const scadenza = new Date(pagDiario);
  const isCompleted = false;
  const desc = document.getElementById("task-desc").value.trim();
  const materia = document.getElementById("task-subject").value;
  const isTest = document.getElementById("isTest").value === "0" ? false : true;
  const priority = parseInt(document.getElementById("task-priority").value);
  
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
