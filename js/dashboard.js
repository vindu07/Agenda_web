import * as db from "./db.js";
import * as Tasks from "./tasks.js";
import * as settings from "./settings.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const numGiorni = 4; //quanti giorni visualizza

const oggi = Timestamp.fromDate(new Date());
const termine = new Date(); termine.setDate(oggi.getdate() + 1 + numGiorni); termine = Timestamp.fromDate(termine);


Tasks.renderTasks(db.sortTasks(parametri)); //seleziona e visualizza i task
db.sortTasks(parametri)
  .then(sortedTasks => {
    // qui sortedTasks è l'array ordinato
    Tasks.renderTasks(sortedTasks);
  })
  .catch(err => {
    console.error("Errore nel caricamento/ordinamento dei task:", err);
  });
