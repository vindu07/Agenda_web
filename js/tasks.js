export function renderTasks(tasksArray) {
  const container = document.getElementById("task-container");
  container.innerHTML = ""; // pulisco prima

  tasksArray.forEach((task, index) => { 
    // contenitore principale
    const div = document.createElement("div");
    div.classList.add(task.isTest === true ? "verifica" : "compito"); //true verifica, false compito
    div.id = task.id;

    

    if (task.isTest === true) {
      // sezione tag
      const tagDiv = document.createElement("div");
      tagDiv.classList.add("tag");
      const p = document.createElement("p");
      p.textContent = "VERIFICA";
      div.appendChild(tagDiv);
      tagDiv.appendChild(p);
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("isCompleted");
      checkbox.id = task.id;
      checkbox.checked = task.isCompleted || false;
      checkbox.addEventListener("change", () => {
        task.isCompleted = checkbox.checked; // aggiorna array
        console.log("Task aggiornata:", task);
      });
      div.appendChild(checkbox);
    }

    // sezione contenuto
    const bo1Div = document.createElement("div");
    bo1Div.classList.add("bo1");

    const h3 = document.createElement("h3");
    h3.textContent = task.materia;
    const pDescr = document.createElement("p");
    pDescr.textContent = task.desc;

    bo1Div.appendChild(h3);
    bo1Div.appendChild(pDescr);

    // bottone cestino
    const btn = document.createElement("button");
    btn.classList.add("cestino");
    btn.id = task.id;
    const img = document.createElement("img");
    img.src = "assets/icons/canc.png";
    img.alt = "Elimina";
    btn.appendChild(img);

    btn.addEventListener("click", () => {
      tasksArray.splice(index, 1);  // elimina dall’array
      /*deleteTask(btn.id);*/  // elimina dal DB
      renderTasks(tasksArray);     // ricarica la lista
    });

    // assemblo tutto
    
    div.appendChild(bo1Div);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

