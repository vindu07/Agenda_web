const scheduleBody = document.getElementById("schedule-body");
const modal = document.getElementById("subject-modal");
const subjectInput = document.getElementById("subject-input");
const subjectColor = document.getElementById("subject-color");
const saveBtn = document.getElementById("save-subject");
const closeBtn = document.getElementById("close-modal");

let editingCell = null;
let schedule = JSON.parse(localStorage.getItem("schedule")) || {};

const hours = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª"];
const days = ["lun", "mar", "mer", "gio", "ven", "sab"];

function buildTable() {
    scheduleBody.innerHTML = "";
    hours.forEach((hour, hourIndex) => {
        const tr = document.createElement("tr");

        const hourCell = document.createElement("td");
        hourCell.textContent = hour;
        tr.appendChild(hourCell);

        days.forEach((day) => {
            const key = `${day}-${hourIndex}`;
            const td = document.createElement("td");

            if(schedule[key]){
                td.textContent = schedule[key].subject;
                td.style.backgroundColor = schedule[key].color;
            } else {
                td.textContent = "+";
                td.classList.add("empty");
            }

            td.addEventListener("click", () => openModal(td, key));
            tr.appendChild(td);
        });

        scheduleBody.appendChild(tr);
    });
}

function openModal(cell, key){
    editingCell = key;
    subjectInput.value = schedule[key]?.subject || "";
    subjectColor.value = schedule[key]?.color || "#ffffff";
    modal.classList.remove("hidden");
}

function saveSubject(){
    if(subjectInput.value.trim() !== ""){
        schedule[editingCell] = {
            subject: subjectInput.value.trim(),
            color: subjectColor.value
        };
    } else {
        delete schedule[editingCell]; // cancella la materia se vuota
    }

    localStorage.setItem("schedule", JSON.stringify(schedule));
    modal.classList.add("hidden");
    buildTable();
}

closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
saveBtn.addEventListener("click", saveSubject);

buildTable();


/*EVIDENZIA ORA CORRENTE*/
function highlightCurrentSlot() {
    const now = new Date();
    let dayIndex = now.getDay(); // 0=Dom, 1=Lun ... 5=Ven
    let currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Orari personalizzabili (inizio di ogni ora in minuti da mezzanotte)
    const lessonTimes = [
        7 * 60 + 45,   // 1ª ora -> 08:00
        8 * 60 + 35,   // 2ª ora -> 09:00
        9 * 60 + 25,  // 3ª ora -> 10:00
        10 * 60 + 15,  // 4ª ora -> 11:00
        11 * 60 + 15,  // 5ª ora -> 12:00
        12 * 60 + 5,  // 6ª ora -> 13:00 (se serve)
        12 * 60 + 55
    ];

    // Se oggi è sabato o domenica → non evidenziare
    if (dayIndex === 0) return;

    // Determina a che ora siamo
    let hourIndex = -1;
    for (let i = 0; i < lessonTimes.length; i++) {
        let start = lessonTimes[i];
        let end = (lessonTimes[i + 1] || start + 60); // fino alla prossima ora o 60 min
        if (currentMinutes >= start && currentMinutes < end) {
            hourIndex = i;
            break;
        }
    }

    const table = document.querySelector(".schedule-table");
    if (!table) return;

    const rows = table.rows;

    // Evidenzia colonna giorno
    for (let i = 1; i < rows.length; i++) {
        rows[i].cells[dayIndex].classList.add("highlight-day");
    }

    // Evidenzia la cella dell'ora attuale se siamo in orario scolastico
    if (hourIndex >= 0 && hourIndex < rows.length - 1) {
        let cell = rows[hourIndex + 1].cells[dayIndex];
        cell.classList.add("highlight-cell");
    }
}

document.addEventListener("DOMContentLoaded", highlightCurrentSlot);
