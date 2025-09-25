import * as db from "./db.js";

export function renderTasks(tasksArray) {
  const container = document.getElementById("task-container");
  container.innerHTML = ""; // pulisco prima

  tasksArray.forEach((task, index) => { 
    // contenitore principale
    const div = document.createElement("div");
    div.classList.add(task.isTest ? "verifica" : "compito"); //true verifica, false compito
    div.id = task.id;

    

    if (task.isTest) {
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
      checkbox.classList.add("checkbox");
      checkbox.id = task.id;
      checkbox.checked = task.isCompleted || false;
      checkbox.addEventListener("change", async () => {
        task.isCompleted = checkbox.checked; // aggiorna array
       
        
        await db.completeTask(task.id); //aggiorna db

        div.classList.toggle("isCompleted");//aggiunge .isCompleted alla classe

         console.log("Task aggiornata:", thisTask.className);
         renderTasks(tasksArray);       // ricarica la lista
      });
      div.appendChild(checkbox);
      div.classList.add("priority-" + task.priority.toString());
      console.log("Task salvato con classe= ", div.className);
    }

    if (task.isCompleted) { div.classList.add("isCompleted"); }

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

    btn.addEventListener("click", async () => {
    
    const conferma = confirm("Vuoi davvero eliminare il compito?");
    if (!conferma) return; // se annulla, stoppa
      
    await db.deleteTask(btn.id);      // cancella da Firestore
    tasksArray.splice(index, 1);   // cancella dall’array locale
    renderTasks(tasksArray);       // ricarica la lista
    });


    // assemblo tutto
    
    div.appendChild(bo1Div);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

