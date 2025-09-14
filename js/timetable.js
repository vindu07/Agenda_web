const scheduleBody = document.getElementById("schedule-body");
const modal = document.getElementById("subject-modal");
const subjectInput = document.getElementById("subject-input");
const subjectColor = document.getElementById("subject-color");
const saveBtn = document.getElementById("save-subject");
const closeBtn = document.getElementById("close-modal");

let editingCell = null;
let schedule = JSON.parse(localStorage.getItem("schedule")) || {};

const hours = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª"];
const days = ["lun", "mar", "mer", "gio", "ven"];

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

