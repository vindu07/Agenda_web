function renderTasksFor(dateKey) {
    const listEl = el.taskList;
    const emptyEl = el.emptyMessage;
    if (!listEl) return;

    listEl.innerHTML = "";
    const tasksForDay = getTasks().filter(t => t?.date === dateKey);

    if (!tasksForDay.length) {
        emptyEl?.classList.remove("hidden");
        return;
    } else { emptyEl?.classList.add("hidden"); }

    // Ordina: isTest → priority (1-3) → incompleti → completati
    tasksForDay.sort((a, b) => {
        const isTestDiff = (a.isTest?0:1) - (b.isTest?0:1);
        if (isTestDiff !== 0) return isTestDiff;

        const priorityA = Math.min(Math.max(a.priority ?? 3, 1), 3);
        const priorityB = Math.min(Math.max(b.priority ?? 3, 1), 3);
        if (priorityA !== priorityB) return priorityA - priorityB; // 1 = più urgente

        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
    });

    tasksForDay.forEach(task => {
        const li = document.createElement("li");
        li.className = "diary-task-item" + (task.completed?" completed":"");
        li.dataset.taskId = task.id ?? "";

        // checkbox
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!task.completed;
        cb.className = "task-complete-checkbox";
        cb.setAttribute("aria-label","Segna come completato");

        // testo
        const textWrap = document.createElement("div");
        textWrap.className = "task-text";

        const subj = document.createElement("strong");
        subj.textContent = task.subject || "Compito";

        const desc = document.createElement("div");
        desc.className = "task-desc";
        desc.textContent = task.descr || "";

        // Mostra priorità come ⚡ (1-3)
        const prio = document.createElement("span");
        prio.className = "task-priority";
        const p = Math.min(Math.max(task.priority ?? 3, 1), 3);
        prio.textContent = "⚡".repeat(p);

        textWrap.appendChild(subj);
        textWrap.appendChild(prio);
        if (task.descr) textWrap.appendChild(desc);

        // bottone delete
        const del = document.createElement("button");
        del.className = "task-delete-btn";
        del.setAttribute("aria-label","Elimina compito");
        del.textContent = "🗑";

        li.append(cb, textWrap, del);
        listEl.appendChild(li);
    });
}
