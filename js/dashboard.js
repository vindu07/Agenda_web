import * as db from "./db.js";
import * as Tasks from "./tasks.js";
import * as settings from "./settings.js";

const numGiorni = 4; //quanti giorni visualizza

const oggi = new Date();
const termine = oggi; termine.setDate(oggi.getdate() + 1 + numGiorni);

const parametri = { isCompleted: false, startDate: oggi, endDate: termine }

Tasks.renderTasks(db.sortTasks(parametri)); //seleziona e visualizza i task
