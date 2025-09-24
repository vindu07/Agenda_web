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

// inizializzazione
updateDiary();
