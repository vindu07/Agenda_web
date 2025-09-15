// diary.js - Gestione Diario

document.addEventListener("DOMContentLoaded", () => {
    const dayNumber = document.getElementById("day-number");
    const weekdayName = document.getElementById("weekday-name");
    const monthName = document.getElementById("month-name");
    const taskList = document.getElementById("task-list");

    const prevDayBtn = document.getElementById("prev-day");
    const nextDayBtn = document.getElementById("next-day");
    const newTaskBtn = document.getElementById("new-task-btn");

    const modal = document.getElementById("task-modal");
    const closeModal = document.getElementById("close-modal");
    const saveTaskBtn = document.getElementById("save-task-btn");

    // Campi modale
    const subjectInput = document.getElementById("task-subject");
    const descrInput = document.getElementById("task-descr");
    const priorityInput = document.getElementById("task-priority");
    const isTestInput = document.getElementById("task-isTest");

    let currentDate = new Date();
    let editingTaskId = null;

    // ---------- GESTIONE DATE ----------
    function updateDayDisplay() {
        const options = { weekday: "long", month: "long", year: "numeric" };
        dayNumber.textContent = currentDate.getDate();
        weekdayName.textContent = currentDate.toLocaleDateString("it-IT", { weekday: "long" });
        monthName.textContent = currentDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
        loadTasks();
    }

    prevDayBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDayDisplay();
    });

    nextDayBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDayDisplay();
    });

    // ---------- GESTIONE TASK ----------
    function loadTasks() {
        taskList.innerHTML = "";
        const dateKey = currentDate.toISOString().split("T")[0];
        let tasks = getTasksForDate(dateKey);

        // Ordina: verifiche prima, poi per priorità decrescente
        tasks.sort((a, b) => {
            if (a.isTest && !b.isTest) return -1;
            if (!a.isTest && b.isTest) return 1;
            return b.priority - a.priority;
        });

        if (tasks.length === 0) return;

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.classList.add("diary-task-item", `task-priority-${task.priority}`);
            if (task.isCompleted) li.classList.add("completed");

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.isCompleted;
            checkbox.addEventListener("change", () => toggleTaskCompleted(task.id, checkbox.checked));

            // Testo del task
            const textDiv = document.createElement("div");
            textDiv.classList.add("task-text");
            textDiv.innerHTML = `
                ${task.isTest ? `<span class="task-verifica-label">Verifica</span>` : ""}
                <strong>${task.subject}</strong> - ${task.description}
            `;

            // Bottone modifica
            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";
            editBtn.addEventListener("click", () => openTaskModal(task));

            li.appendChild(checkbox);
            li.appendChild(textDiv);
            li.appendChild(editBtn);
            taskList.appendChild(li);
        });
    }

    function toggleTaskCompleted(id, isCompleted) {
        const dateKey = currentDate.toISOString().split("T")[0];
        let tasks = getTasksForDate(dateKey);
        tasks = tasks.map(task => task.id === id ? { ...task, isCompleted } : task);
        saveTasksForDate(dateKey, tasks);
        loadTasks();
    }

    // ---------- CREAZIONE / MODIFICA ----------
    function openTaskModal(task = null) {
        modal.classList.remove("hidden");
        if (task) {
            editingTaskId = task.id;
            subjectInput.value = task.subject;
            descrInput.value = task.description;
            priorityInput.value = task.priority;
            isTestInput.checked = task.isTest;
        } else {
            editingTaskId = null;
            subjectInput.value = "";
            descrInput.value = "";
            priorityInput.value = "1";
            isTestInput.checked = false;
        }
    }

    function closeTaskModal() {
        modal.classList.add("hidden");
    }

    saveTaskBtn.addEventListener("click", () => {
        const dateKey = currentDate.toISOString().split("T")[0];
        let tasks = getTasksForDate(dateKey);

        if (editingTaskId) {
            tasks = tasks.map(task =>
                task.id === editingTaskId
                    ? { ...task, subject: subjectInput.value, description: descrInput.value, priority: parseInt(priorityInput.value), isTest: isTestInput.checked }
                    : task
            );
        } else {
            tasks.push({
                id: Date.now(),
                subject: subjectInput.value,
                description: descrInput.value,
                priority: isTestInput.checked ? 3 : parseInt(priorityInput.value),
                isTest: isTestInput.checked,
                isCompleted: false
            });
        }

        saveTasksForDate(dateKey, tasks);
        closeTaskModal();
        loadTasks();
    });

    closeModal.addEventListener("click", closeTaskModal);
    newTaskBtn.addEventListener("click", () => openTaskModal());

    updateDayDisplay();
});
