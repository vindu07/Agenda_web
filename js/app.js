// app.js - gestione generale dell'app

// Funzione toggle dark/light
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
    }
}

// Inizializzazione tema dal localStorage
function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
    }
}

// Aggiunge evento al pulsante toggle
function initThemeToggle() {
    const toggleBtn = document.getElementById("toggle-theme");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleTheme);
    }
}

// Eseguito al DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initThemeToggle();
});
