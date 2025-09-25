import * as db from "./db.js";
import * as Tasks from "./tasks.js";
import * as settings from "./settings.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const numGiorni = 3; //quanti giorni visualizza

let oggi = Timestamp.fromDate(new Date());
let termine = new Date(); termine.setDate(termine.getDate() + numGiorni); termine = Timestamp.fromDate(termine);

const parametri = { isCompleted: false /*,dataInizio: oggi, dataFine: termine*/}


db.sortTasks(parametri)
  .then(sortedTasks => {
    // qui sortedTasks è l'array ordinato
    Tasks.renderTasks(sortedTasks);
  })
  .catch(err => {
    console.error("Errore nel caricamento/ordinamento dei task:", err);
  });
