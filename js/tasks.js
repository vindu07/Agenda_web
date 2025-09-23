function renderTasks(tasksArray) {
  const container = document.getElementById("task-container");
  container.innerHTML = ""; // pulisco prima

  tasksArray.slice(0, -1).forEach((task, index) => { //crea un array senza l'ultimo elemento(last_ID)
    // contenitore principale
    const div = document.createElement("div");
    div.className = task.isTest === 1 ? "verifica" : "compito"; //1 verifica, 0 compito
    div.id = task.ID;

    // sezione tag
    const tagDiv = document.createElement("div");
    tagDiv.className = "tag";

    if (task.type === "verifica") {
      const p = document.createElement("p");
      p.textContent = "VERIFICA";
      tagDiv.appendChild(p);
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "isCompleted";
      checkbox.checked = task.isCompleted || false;
      checkbox.addEventListener("change", () => {
        task.isCompleted = checkbox.checked; // aggiorna array
        console.log("Task aggiornata:", task);
      });
      tagDiv.appendChild(checkbox);
    }

    // sezione contenuto
    const bo1Div = document.createElement("div");
    bo1Div.className = "bo1";

    const h3 = document.createElement("h3");
    h3.textContent = task.materia;
    const pDescr = document.createElement("p");
    pDescr.textContent = task.desc;

    bo1Div.appendChild(h3);
    bo1Div.appendChild(pDescr);

    // bottone cestino
    const btn = document.createElement("button");
    btn.className = "cestino";
    btn.dataset.id = index;
    const img = document.createElement("img");
    img.src = "assets/icons/canc.png";
    img.alt = "Elimina";
    btn.appendChild(img);

    btn.addEventListener("click", () => {
      tasksArray.splice(index, 1); // elimina dall’array
      renderTasks(tasksArray);     // ricarica la lista
    });

    // assemblo tutto
    div.appendChild(tagDiv);
    div.appendChild(bo1Div);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

